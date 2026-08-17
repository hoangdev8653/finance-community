import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../../src/app.module';
import { JitProvisioningService } from '../../src/modules/users/services/jit-provisioning.service';
import { AuditLogService } from '../../src/modules/audit/services/audit-log.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest');

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SupabaseJwksStrategy } from '../../src/modules/auth/strategies/supabase-jwks.strategy';

const TEST_SECRET = 'phase2-security-test-secret-key-32chars!!';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
class TestJwksStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  constructor(private readonly jitService: JitProvisioningService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: TEST_SECRET,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: any): Promise<any> {
    if (
      !payload ||
      !payload.sub ||
      typeof payload.sub !== 'string' ||
      !UUID_REGEX.test(payload.sub)
    ) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid JWT subject.',
        code: 'INVALID_SUBJECT',
      });
    }

    const userRecord = await this.jitService.ensureUserProvisioned({
      sub: payload.sub,
      email: payload.email,
    });

    return {
      ...payload,
      app_user_id: userRecord.id,
      app_status: userRecord.status,
    };
  }
}

describe('Phase 2 Security Verification Suite (E2E)', () => {
  let app: INestApplication;
  let jitService: JitProvisioningService;
  let auditService: AuditLogService;

  beforeAll(async () => {
    process.env.SUPABASE_URL = 'https://mock-project.supabase.co';
    process.env.FRONTEND_URL = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseJwksStrategy)
      .useClass(TestJwksStrategy)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    jitService = app.get(JitProvisioningService);
    auditService = app.get(AuditLogService);

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  function createSignedJwt(payload: Record<string, any>): string {
    return jwt.sign(
      {
        iss: 'https://mock-project.supabase.co/auth/v1',
        aud: 'authenticated',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        ...payload,
      },
      TEST_SECRET,
      { algorithm: 'HS256' },
    );
  }

  it('1. Public endpoint should be accessible without Authorization token', async () => {
    const res = await request(app.getHttpServer()).get('/test/public').expect(200);
    expect(res.body.status).toBe('success');
  });

  it('2. Request with missing token to protected endpoint should return 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer()).get('/test/authenticated').expect(401);
    expect(res.body.statusCode).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('3. Request with malformed/invalid token signature should return 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .get('/test/authenticated')
      .set('Authorization', 'Bearer invalid-token-signature')
      .expect(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('3b. Request with non-UUID sub claim should return 401 Unauthorized with INVALID_SUBJECT', async () => {
    const invalidSubToken = createSignedJwt({
      sub: 'invalid-non-uuid-string',
      email: 'badsub@finance.com',
    });
    const res = await request(app.getHttpServer())
      .get('/test/authenticated')
      .set('Authorization', `Bearer ${invalidSubToken}`)
      .expect(401);
    expect(res.body.code).toBe('INVALID_SUBJECT');
  });

  it('4. First-time valid JWT should trigger JIT user provisioning and return 200 OK', async () => {
    const sub = '33333333-3333-3333-3333-333333333333';
    const token = createSignedJwt({
      sub,
      email: 'jit.user@finance.com',
      email_confirmed_at: '2026-08-13T12:00:00Z',
    });

    const res = await request(app.getHttpServer())
      .get('/test/authenticated')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.user.sub).toBe(sub);

    // Verify user & role state in PostgreSQL/service
    const roles = jitService.getUserRoles(sub);
    expect(roles).toContain('MEMBER');
  });

  it('5. Setting user status to SUSPENDED should block access with 403 Forbidden', async () => {
    const sub = '44444444-4444-4444-4444-444444444444';
    await jitService.ensureUserProvisioned({ sub, email: 'suspended@finance.com' });
    jitService.setUserStatus(sub, 'SUSPENDED');

    const token = createSignedJwt({
      sub,
      email: 'suspended@finance.com',
      email_confirmed_at: '2026-08-13T12:00:00Z',
    });

    const res = await request(app.getHttpServer())
      .get('/test/authenticated')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(res.body.code).toBe('ACCOUNT_SUSPENDED');
  });

  it('6. Setting user status to BANNED should block access with 403 Forbidden', async () => {
    const sub = '55555555-5555-5555-5555-555555555555';
    await jitService.ensureUserProvisioned({ sub, email: 'banned@finance.com' });
    jitService.setUserStatus(sub, 'BANNED');

    const token = createSignedJwt({
      sub,
      email: 'banned@finance.com',
      email_confirmed_at: '2026-08-13T12:00:00Z',
    });

    const res = await request(app.getHttpServer())
      .get('/test/authenticated')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(res.body.code).toBe('ACCOUNT_BANNED');
  });

  it('7. Unverified user (email_confirmed_at = null) attempting state-changing POST should return 403 Forbidden (EMAIL_NOT_VERIFIED)', async () => {
    const sub = '66666666-6666-6666-6666-666666666666';
    const token = createSignedJwt({
      sub,
      email: 'unverified@finance.com',
      email_confirmed_at: null,
    });

    const res = await request(app.getHttpServer())
      .post('/test/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Post Title', body: '<p>Test body</p>' })
      .expect(403);

    expect(res.body.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('8. Verified MEMBER user should create post successfully on state-changing endpoint', async () => {
    const sub = '77777777-7777-7777-7777-777777777777';
    const token = createSignedJwt({
      sub,
      email: 'verified.member@finance.com',
      email_confirmed_at: '2026-08-13T12:00:00Z',
    });

    const res = await request(app.getHttpServer())
      .post('/test/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Clean Title', body: 'Clean Body <script>alert(1)</script>' })
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.post.title).toBe('Clean Title');
    expect(res.body.post.body).not.toContain('<script>');
  });

  it('9. MEMBER attempting posts:delete:any permission route should return 403 Forbidden', async () => {
    const sub = '88888888-8888-8888-8888-888888888888';
    const token = createSignedJwt({
      sub,
      email: 'member.delete.fail@finance.com',
      email_confirmed_at: '2026-08-13T12:00:00Z',
    });

    const res = await request(app.getHttpServer())
      .post('/test/posts/post-999/delete-any')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(res.body.code).toBe('INSUFFICIENT_PERMISSIONS');
  });

  it('10. MODERATOR executing posts:delete:any should succeed and generate audit log entry', async () => {
    const sub = '99999999-9999-9999-9999-999999999999';
    await jitService.ensureUserProvisioned({ sub, email: 'mod.user@finance.com' });
    jitService.assignRoleToUser(sub, 'MODERATOR');

    const token = createSignedJwt({
      sub,
      email: 'mod.user@finance.com',
      email_confirmed_at: '2026-08-13T12:00:00Z',
    });

    const res = await request(app.getHttpServer())
      .post('/test/posts/post-999/delete-any')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.status).toBe('success');

    // Verify audit log entry written to public.audit_logs store
    const logs = auditService.getLogs();
    const auditEntry = logs.find((l) => l.action === 'POST_DELETE_OVERRIDE' && l.actor_id === sub);
    expect(auditEntry).toBeDefined();
    expect(auditEntry?.metadata).toHaveProperty('role', 'MODERATOR');
  });

  it('11. Sending non-whitelisted payload fields should trigger 400 Bad Request (Mass Assignment Protection)', async () => {
    const token = createSignedJwt({
      sub: '77777777-7777-7777-7777-777777777777',
      email: 'verified.member@finance.com',
      email_confirmed_at: '2026-08-13T12:00:00Z',
    });

    const res = await request(app.getHttpServer())
      .post('/test/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Valid Title',
        body: 'Valid Body',
        adminInject: true, // Non-whitelisted field!
      })
      .expect(400);

    expect(res.body.message).toContain('property adminInject should not exist');
  });
});
