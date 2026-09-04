-- Keep the runtime users schema aligned with Google OAuth JIT provisioning.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS provider VARCHAR(30) NOT NULL DEFAULT 'LOCAL';
