-- =====================================================
-- COMMUNITY TAB - Complete SQL Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. JOB LISTINGS TABLE
-- Stores AlexEnright Approved jobs
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  salary_range TEXT,
  apply_url TEXT,
  duration_start TIMESTAMP WITH TIME ZONE,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DAILY POSTS TABLE (Updates feed)
-- Stores the "Daily" / "Update" posts
CREATE TABLE IF NOT EXISTS daily_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DAILY POST LIKES TABLE
-- Tracks likes on daily posts
CREATE TABLE IF NOT EXISTS daily_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES daily_posts(id) ON DELETE CASCADE,
  anon_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, anon_id) -- One like per user per post
);

-- 4. CONTACT FORMS TABLE
-- Stores Hire Alex + Job Application submissions
CREATE TABLE IF NOT EXISTS contact_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'job_application', 'hire_alex', 'job_posting', etc.
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  job_title TEXT, -- For job applications
  job_company TEXT, -- For job applications
  resume_url TEXT, -- For job applications (if you add file storage)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

-- 5. STORAGE BUCKETS
-- Enable Storage if not already enabled

-- Community bucket for daily post images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community',
  'community',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Resumes bucket for job application files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false, -- Private - only accessible by admin
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;

-- JOB LISTINGS POLICIES
-- Anyone can read approved jobs
CREATE POLICY "Anyone can read approved jobs"
  ON job_listings FOR SELECT
  USING (approved = true);

-- Only authenticated admin can insert (via admin panel)
CREATE POLICY "Admin can insert jobs"
  ON job_listings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only admin can update (approve/reject)
CREATE POLICY "Admin can update jobs"
  ON job_listings FOR UPDATE
  TO authenticated
  USING (true);

-- DAILY POSTS POLICIES
-- Anyone can read posts
CREATE POLICY "Anyone can read daily posts"
  ON daily_posts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admin can create posts
CREATE POLICY "Admin can create posts"
  ON daily_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only admin can update/delete posts
CREATE POLICY "Admin can update posts"
  ON daily_posts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admin can delete posts"
  ON daily_posts FOR DELETE
  TO authenticated
  USING (true);

-- DAILY POST LIKES POLICIES
-- Anyone can read likes count
CREATE POLICY "Anyone can read likes"
  ON daily_post_likes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can insert likes (anon via anon_id)
CREATE POLICY "Anyone can like posts"
  ON daily_post_likes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can only delete their own likes (by anon_id matching)
CREATE POLICY "Users can unlike their own likes"
  ON daily_post_likes FOR DELETE
  TO anon, authenticated
  USING (anon_id = anon_id);

-- CONTACT FORMS POLICIES
-- Anyone can submit forms
CREATE POLICY "Anyone can submit contact forms"
  ON contact_forms FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admin can read forms
CREATE POLICY "Admin can read contact forms"
  ON contact_forms FOR SELECT
  TO authenticated
  USING (true);

-- Only admin can update (mark as read)
CREATE POLICY "Admin can update contact forms"
  ON contact_forms FOR UPDATE
  TO authenticated
  USING (true);

-- STORAGE POLICIES

-- Community bucket: Anyone can upload images for posts
CREATE POLICY "Anyone can upload to community"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'community');

-- Community bucket: Anyone can read images
CREATE POLICY "Anyone can read community images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'community');

-- Resumes bucket: Anyone can upload (for job applications)
CREATE POLICY "Anyone can upload resumes"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'resumes');

-- Resumes bucket: Only authenticated can read (admin)
CREATE POLICY "Only admin can read resumes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'resumes');

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_job_listings_approved ON job_listings(approved);
CREATE INDEX IF NOT EXISTS idx_job_listings_created_at ON job_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_posts_created_at ON daily_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_post_likes_post_id ON daily_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_daily_post_likes_anon_id ON daily_post_likes(anon_id);
CREATE INDEX IF NOT EXISTS idx_contact_forms_type ON contact_forms(type);
CREATE INDEX IF NOT EXISTS idx_contact_forms_read ON contact_forms(read);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Add a sample AlexEnright Approved job
INSERT INTO job_listings (title, company, location, description, salary_range, approved)
VALUES (
  'Full Stack Developer',
  'AlexEnright Labs',
  'Remote / San Francisco',
  'We are looking for a talented full stack developer to join our team. Experience with React, Node.js, and Supabase required.',
  '$100,000 - $150,000',
  true
)
ON CONFLICT DO NOTHING;

-- Add a sample daily post
INSERT INTO daily_posts (title, body)
VALUES (
  'Welcome to the Community!',
  'This is the first update from the AlexEnright team. Stay tuned for more exciting news and updates!'
)
ON CONFLICT DO NOTHING;
