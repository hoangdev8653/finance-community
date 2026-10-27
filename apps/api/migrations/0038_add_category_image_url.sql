ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS image_url varchar(2048);
