-- Keep the posts table contract aligned with the moderation services.
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS moderation_status varchar(20) NOT NULL DEFAULT 'UNREVIEWED',
  ADD COLUMN IF NOT EXISTS moderated_by uuid,
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz,
  ADD COLUMN IF NOT EXISTS moderation_reason text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_posts_moderated_by'
      AND conrelid = 'posts'::regclass
  ) THEN
    ALTER TABLE posts
      ADD CONSTRAINT fk_posts_moderated_by
      FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_moderation_status ON posts(moderation_status);
