import { registerAs } from '@nestjs/config';

export const securityConfig = registerAs('security', () => {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://mock-project.supabase.co';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '4000', 10);

  const jwtSecret = process.env.JWT_SECRET || (nodeEnv === 'production' ? '' : 'super-secret-local-jwt-key-finance-community-2026');
  const googleClientId = process.env.GOOGLE_CLIENT_ID || (nodeEnv === 'production' ? '' : 'mock-google-client-id.apps.googleusercontent.com');
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || (nodeEnv === 'production' ? '' : 'mock-google-client-secret');

  if (nodeEnv === 'production') {
    const required = { JWT_SECRET: jwtSecret, GOOGLE_CLIENT_ID: googleClientId, GOOGLE_CLIENT_SECRET: googleClientSecret, DATABASE_URL: process.env.DATABASE_URL };
    const missing = Object.entries(required).filter(([, value]) => !value).map(([key]) => key);
    if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
    if (jwtSecret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }

  return {
    supabaseUrl,
    jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
    issuer: `${supabaseUrl}/auth/v1`,
    audience: 'authenticated',
    algorithms: ['RS256', 'ES256'] as const,
    jwtSecret,
    googleClientId,
    googleClientSecret,
    frontendUrl,
    nodeEnv,
    port,
  };
});
