import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SecurityExceptionFilter } from './common/filters/security-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const port = parseInt(process.env.PORT || '4000', 10);

  // 1. Enable Helmet with Restrictive Backend CSP & Security Headers (configured to allow Swagger UI)
  app.use(
    helmet({
      frameguard: { action: 'deny' },
      noSniff: true,
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
          formAction: ["'none'"],
          baseUri: ["'self'"],
        },
      },
    }),
  );

  // 2. Configure Strict CORS Policy
  app.enableCors({
    origin: [frontendUrl],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'Content-Range'],
    credentials: true,
    maxAge: 86400,
  });

  // 3. API Versioning (/api/v1)
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 4. Global Input Validation Pipe (Mass Assignment Protection)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 5. Global Standardized Security Exception Filter
  app.useGlobalFilters(new SecurityExceptionFilter());

  // 6. Swagger / OpenAPI Documentation Initialization
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Finance Community Platform API')
    .setDescription('Production-ready REST API for Financial Community Platform (Phases 3.1 - 3.4)')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter Supabase Bearer JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Users', 'User management & JIT provisioning')
    .addTag('Media', 'Media upload & Cloudinary signatures')
    .addTag('Categories', 'Content categories management')
    .addTag('Tags', 'Content tags management')
    .addTag('Posts', 'Publishing & content engine')
    .addTag('Series', 'Article series management')
    .addTag('Comments', 'Threaded discussion engine')
    .addTag('Reactions', 'Atomic post & comment liking')
    .addTag('Follows', 'Social graph management')
    .addTag('Notifications', 'In-app notification feeds')
    .addTag('Reports', 'Content & user reporting')
    .addTag('Moderation', 'Moderator action queue & enforcement')
    .addTag('Admin', 'Platform governance & RBAC administration')
    .addTag('Feature Flags', 'Feature toggling & public configuration')
    .addTag('System Settings', 'System configuration key-value store')
    .addTag('Audit Logs', 'Security & governance audit trails')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    customSiteTitle: 'Finance Community API Docs',
  });

  await app.listen(port);
  console.log(`🚀 NestJS API running on http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger UI documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
