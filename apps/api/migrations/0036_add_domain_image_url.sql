ALTER TABLE domains
  ADD COLUMN IF NOT EXISTS image_url varchar(2048);
