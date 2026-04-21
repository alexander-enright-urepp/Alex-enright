-- ============================================
-- JOB DURATION FIELDS
-- ============================================

-- Add duration fields to job_listings table
ALTER TABLE job_listings 
ADD COLUMN IF NOT EXISTS duration_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS duration_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS listing_date TIMESTAMPTZ DEFAULT NOW();

-- Update existing jobs to have a listing_date
UPDATE job_listings 
SET listing_date = created_at 
WHERE listing_date IS NULL;

-- Update submitJobListing action
-- Update CommunityTab component
-- Update types if needed
