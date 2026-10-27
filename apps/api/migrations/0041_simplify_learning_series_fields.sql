DROP INDEX IF EXISTS idx_learning_series_domain_category;

ALTER TABLE learning_series
  DROP COLUMN IF EXISTS estimated_duration_minutes,
  DROP COLUMN IF EXISTS hero_media_id,
  DROP COLUMN IF EXISTS hero_alt_text,
  DROP COLUMN IF EXISTS outcomes_media_id,
  DROP COLUMN IF EXISTS outcomes_alt_text,
  DROP COLUMN IF EXISTS cta_media_id,
  DROP COLUMN IF EXISTS cta_alt_text,
  DROP COLUMN IF EXISTS category_id;
