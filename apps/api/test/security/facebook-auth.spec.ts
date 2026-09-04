import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Facebook OAuth Authentication (E2E)', () => {
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

  it('POST /api/v1/auth/facebook - should authenticate mock Facebook access token and return JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/facebook')
      .send({ accessToken: 'mock_facebook_token_tester' })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.tokenType).toBe('Bearer');
    expect(res.body.user).toBeDefined();
    expect(res.body.user.provider).toBe('FACEBOOK');
  });

  it('POST /api/v1/auth/facebook - should reject empty accessToken with 400', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/facebook')
      .send({})
      .expect(400);
  });
});
