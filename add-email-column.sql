-- Add email column to rankings table
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/afmsegsxgvsqwdctasyl/sql)

ALTER TABLE rankings ADD COLUMN IF NOT EXISTS email TEXT NULL;

-- Verify the change
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'rankings';
