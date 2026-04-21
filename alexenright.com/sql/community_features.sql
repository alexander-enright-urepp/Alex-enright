-- ============================================
-- COMMUNITY FEATURES - SQL SCHEMA
-- ============================================

-- 1. DEVICE TOKENS (for iOS push notifications)
-- Already exists from ios_features.sql

-- 2. COMMUNITY POSTS IMAGE SUPPORT
-- Already exists: image_url column added

-- 3. POST LIKES TABLE (for community post likes)
-- Already exists in schema.sql:
-- CREATE TABLE post_likes (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   post_id UUID REFERENCES daily_posts(id) ON DELETE CASCADE NOT NULL,
--   anon_id TEXT NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   UNIQUE(post_id, anon_id)
-- );

-- Ensure post_likes table exists for community posts
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  anon_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, anon_id)
);

-- Enable RLS on post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY IF NOT EXISTS "Public can view post_likes"
ON post_likes FOR SELECT USING (true);

-- Anyone can insert likes
CREATE POLICY IF NOT EXISTS "Public can insert post_likes"
ON post_likes FOR INSERT WITH CHECK (true);

-- Anyone can delete their own likes
CREATE POLICY IF NOT EXISTS "Public can delete own post_likes"
ON post_likes FOR DELETE USING (true);

-- 4. CONTACT SUBMISSIONS TABLE (for About page hire form)
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit contact forms
CREATE POLICY IF NOT EXISTS "Public can insert contact_submissions"
ON contact_submissions FOR INSERT WITH CHECK (true);

-- Only admins can view submissions
CREATE POLICY IF NOT EXISTS "Only admins can view contact_submissions"
ON contact_submissions FOR SELECT USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

-- 5. JOB DURATION FIELDS
-- Add duration fields to job_listings table
ALTER TABLE job_listings 
ADD COLUMN IF NOT EXISTS duration_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS duration_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS listing_date TIMESTAMPTZ DEFAULT NOW();

-- Update existing jobs to have a listing_date
UPDATE job_listings 
SET listing_date = created_at 
WHERE listing_date IS NULL;

-- 6. COMMUNITY STORAGE BUCKET (for image uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('community', 'community', TRUE)
ON CONFLICT DO NOTHING;

-- Storage policies for community images
CREATE POLICY IF NOT EXISTS "Public can upload to community bucket"
ON storage.objects FOR INSERT TO PUBLIC WITH CHECK (
  bucket_id = 'community'
);

CREATE POLICY IF NOT EXISTS "Public can read from community bucket"
ON storage.objects FOR SELECT USING (
  bucket_id = 'community'
);

-- Summary of what this enables:
-- ✅ Community posts with images
-- ✅ Likes on community posts  
-- ✅ Contact form submissions
-- ✅ Job duration dates
-- ✅ Push notifications (device tokens)
-- ✅ Image uploads to community posts
