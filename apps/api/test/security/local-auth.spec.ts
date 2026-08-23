import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Native Local Authentication (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testSuffix = Math.random().toString(36).slice(2, 7);
  const testUser = {
    email: `local_user_${testSuffix}@finance.com`,
    password: 'SecureLocalPass123!',
    username: `user_${testSuffix}`,
  };

  let token = '';

  it('POST /api/v1/auth/register - should register a new user locally', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.tokenType).toBe('Bearer');
    expect(res.body.user).toMatchObject({
      email: testUser.email,
      username: testUser.username,
      status: 'ACTIVE',
    });

    token = res.body.accessToken;
  });

  it('POST /api/v1/auth/register - should reject duplicate email registration with 409', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testUser.email,
        password: 'AnotherPassword123!',
        username: 'different_user',
      })
      .expect(409);
  });

  it('POST /api/v1/auth/login - should authenticate valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('POST /api/v1/auth/login - should reject invalid password with 401', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      })
      .expect(401);
  });

  it('GET /api/v1/users/me - should access protected route using native local Bearer JWT token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.email).toBe(testUser.email);
    expect(res.body.id).toBeDefined();
  });

  it('POST /api/v1/auth/google - should authenticate Google ID token and provision user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/google')
      .send({ idToken: 'mock_google_id_token_john_google' })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.tokenType).toBe('Bearer');
    expect(res.body.user).toMatchObject({
      email: 'john_google@gmail.com',
      provider: 'GOOGLE',
    });

    // Verify token works on protected routes
    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${res.body.accessToken}`)
      .expect(200);
  });
});
