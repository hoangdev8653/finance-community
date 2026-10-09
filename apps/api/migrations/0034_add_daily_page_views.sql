CREATE TABLE IF NOT EXISTS page_views_daily (
  day date PRIMARY KEY,
  views integer NOT NULL DEFAULT 0 CHECK (views >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
