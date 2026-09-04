-- Store the Google profile image URL and refresh it on each Google sign-in.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(2048);
