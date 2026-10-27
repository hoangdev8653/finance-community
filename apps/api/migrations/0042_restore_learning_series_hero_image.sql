ALTER TABLE learning_series
  ADD COLUMN IF NOT EXISTS hero_media_id uuid REFERENCES media(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS hero_alt_text varchar(250);
