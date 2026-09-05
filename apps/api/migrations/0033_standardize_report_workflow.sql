-- Standardize moderation report lifecycle while preserving existing reports.
UPDATE reports SET status = 'PENDING' WHERE status = 'OPEN';
ALTER TABLE reports ALTER COLUMN status SET DEFAULT 'PENDING';
