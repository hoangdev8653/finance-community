-- Keep the runtime profiles schema aligned with JIT user provisioning.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS reputation_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge VARCHAR(50) NOT NULL DEFAULT 'MEMBER';
