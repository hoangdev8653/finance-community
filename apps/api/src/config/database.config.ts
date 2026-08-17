import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => {
  const url = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/finance_db';
  const maxConnections = parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10', 10);
  const idleTimeoutMs = parseInt(process.env.DATABASE_IDLE_TIMEOUT_MS || '30000', 10);
  const connectionTimeoutMs = parseInt(process.env.DATABASE_CONN_TIMEOUT_MS || '5000', 10);

  return {
    url,
    maxConnections,
    idleTimeoutMs,
    connectionTimeoutMs,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
});
