ALTER TABLE learning_series
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes integer,
  ADD COLUMN IF NOT EXISTS learning_outcomes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hero_media_id uuid REFERENCES media(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS hero_alt_text varchar(250),
  ADD COLUMN IF NOT EXISTS outcomes_media_id uuid REFERENCES media(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS outcomes_alt_text varchar(250),
  ADD COLUMN IF NOT EXISTS cta_media_id uuid REFERENCES media(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cta_alt_text varchar(250);

ALTER TABLE learning_series
  ADD CONSTRAINT learning_series_estimated_duration_positive
  CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0);
