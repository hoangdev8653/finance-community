ALTER TABLE raw_news_items ADD COLUMN IF NOT EXISTS full_content text;
ALTER TABLE raw_news_items ADD COLUMN IF NOT EXISTS content_html text;
ALTER TABLE raw_news_items ADD COLUMN IF NOT EXISTS image_urls jsonb;
