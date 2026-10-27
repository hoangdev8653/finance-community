-- Domain names are entered in Vietnamese. Keep name_vi for compatibility with
-- existing consumers while removing the unused English translation field.
ALTER TABLE domains DROP COLUMN IF EXISTS name_en;
