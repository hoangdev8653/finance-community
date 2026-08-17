import { registerAs } from '@nestjs/config';

export const rateLimitConfig = registerAs('rateLimit', () => ({
  tier1PublicRead: {
    ttl: 60000,
    limit: parseInt(process.env.RATE_LIMIT_TIER1 || '120', 10),
  },
  tier2AuthRead: {
    ttl: 60000,
    limit: parseInt(process.env.RATE_LIMIT_TIER2 || '300', 10),
  },
  tier3AuthWrite: {
    ttl: 60000,
    limit: parseInt(process.env.RATE_LIMIT_TIER3 || '30', 10),
  },
  tier4SensitiveOps: {
    ttl: 60000,
    limit: parseInt(process.env.RATE_LIMIT_TIER4 || '10', 10),
  },
}));
