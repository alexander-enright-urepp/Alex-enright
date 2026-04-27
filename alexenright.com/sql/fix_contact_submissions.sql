-- Fix contact_submissions table - add missing columns for job applications

-- First, check if table exists and create if not
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

-- Add job-related columns if they don't exist
DO $$
BEGIN
    -- Add job_title column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contact_submissions' AND column_name='job_title') THEN
        ALTER TABLE contact_submissions ADD COLUMN job_title TEXT;
    END IF;
    
    -- Add job_company column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contact_submissions' AND column_name='job_company') THEN
        ALTER TABLE contact_submissions ADD COLUMN job_company TEXT;
    END IF;
    
    -- Add resume_url column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contact_submissions' AND column_name='resume_url') THEN
        ALTER TABLE contact_submissions ADD COLUMN resume_url TEXT;
    END IF;
END
$$;

-- Enable RLS if not already enabled
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can submit forms" ON contact_submissions;
DROP POLICY IF EXISTS "Admin can read forms" ON contact_submissions;

-- Create policies
CREATE POLICY "Anyone can submit forms" 
  ON contact_submissions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admin can read forms" 
  ON contact_submissions FOR SELECT 
  TO authenticated 
  USING (true);
