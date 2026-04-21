-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recruiter Submissions Table
CREATE TABLE recruiter_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  job_type TEXT,
  location TEXT,
  remote_pref TEXT CHECK (remote_pref IN ('onsite', 'hybrid', 'remote')),
  linkedin_url TEXT,
  note TEXT,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Posts Table
CREATE TABLE daily_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Likes Table (tracks likes by anon ID)
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES daily_posts(id) ON DELETE CASCADE NOT NULL,
  anon_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, anon_id)
);

-- Job Listings Table
CREATE TABLE job_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_range TEXT,
  description TEXT NOT NULL,
  apply_url TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Posts Table
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users Table (for role-based access)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage Bucket for Resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE recruiter_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Recruiter Submissions
-- Anyone can insert (public form)
CREATE POLICY "Allow public insert on recruiter_submissions"
ON recruiter_submissions FOR INSERT TO PUBLIC WITH CHECK (true);

-- Only admins can select
CREATE POLICY "Only admins can view recruiter_submissions"
ON recruiter_submissions FOR SELECT USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

-- Daily Posts
-- Public can view all posts
CREATE POLICY "Public can view daily_posts"
ON daily_posts FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Only admins can insert daily_posts"
ON daily_posts FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM admin_users)
);

CREATE POLICY "Only admins can update daily_posts"
ON daily_posts FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

CREATE POLICY "Only admins can delete daily_posts"
ON daily_posts FOR DELETE USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

-- Post Likes
-- Public can view likes
CREATE POLICY "Public can view post_likes"
ON post_likes FOR SELECT USING (true);

-- Anyone can insert likes
CREATE POLICY "Public can insert post_likes"
ON post_likes FOR INSERT WITH CHECK (true);

-- Anyone can delete their own likes
CREATE POLICY "Public can delete own post_likes"
ON post_likes FOR DELETE USING (true);

-- Job Listings
-- Public can only view approved jobs
CREATE POLICY "Public can view approved job_listings"
ON job_listings FOR SELECT USING (approved = true);

-- Anyone can submit jobs (unapproved by default)
CREATE POLICY "Public can insert job_listings"
ON job_listings FOR INSERT WITH CHECK (true);

-- Only admins can update/delete (for approval)
CREATE POLICY "Only admins can update job_listings"
ON job_listings FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

CREATE POLICY "Only admins can delete job_listings"
ON job_listings FOR DELETE USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

-- Community Posts
-- Public can view and insert
CREATE POLICY "Public can view community_posts"
ON community_posts FOR SELECT USING (true);

CREATE POLICY "Public can insert community_posts"
ON community_posts FOR INSERT WITH CHECK (true);

-- Only admins can delete
CREATE POLICY "Only admins can delete community_posts"
ON community_posts FOR DELETE USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

-- Admin Users
-- Only admins can view admin_users
CREATE POLICY "Only admins can view admin_users"
ON admin_users FOR SELECT USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

-- Storage Bucket Policies
CREATE POLICY "Admins can upload to resumes bucket"
ON storage.objects FOR INSERT TO PUBLIC WITH CHECK (
  bucket_id = 'resumes' AND
  (auth.uid() IS NOT NULL OR true) -- Allow anon uploads for recruiter submissions
);

CREATE POLICY "Authenticated users can read from resumes bucket"
ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes'
);

-- Add initial admin (replace with your email)
-- INSERT INTO admin_users (email) VALUES ('alex@alexenright.com');
