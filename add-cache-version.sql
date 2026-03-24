-- Add cache_version column to images table for cache busting
ALTER TABLE images ADD COLUMN IF NOT EXISTS cache_version INTEGER DEFAULT 1;

-- Create trigger to auto-increment cache_version on update
CREATE OR REPLACE FUNCTION increment_cache_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.cache_version = COALESCE(OLD.cache_version, 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS images_cache_version_trigger ON images;
CREATE TRIGGER images_cache_version_trigger
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION increment_cache_version();
