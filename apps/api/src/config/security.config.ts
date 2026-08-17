import { registerAs } from '@nestjs/config';

export const securityConfig = registerAs('security', () => {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://mock-project.supabase.co';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '4000', 10);

  const jwtSecret = process.env.JWT_SECRET || 'super-secret-local-jwt-key-finance-community-2026';
  const googleClientId = process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id.apps.googleusercontent.com';
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'mock-google-client-secret';

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
