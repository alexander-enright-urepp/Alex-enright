-- Add budget column to contact_submissions table

-- Add budget column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contact_submissions' AND column_name='budget') THEN
        ALTER TABLE contact_submissions ADD COLUMN budget TEXT;
    END IF;
END
$$;

-- Verify table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
ORDER BY ordinal_position;
