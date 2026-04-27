-- COMPLETE SQL FOR SUPABASE - Run this in SQL Editor
-- Creates all tables for News, Scores, and Community tabs

-- ============================================
-- NEWS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS news_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    source TEXT NOT NULL,
    source_url TEXT NOT NULL,
    image_url TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    category TEXT,
    author TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    api_source TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS news_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID REFERENCES news_stories(id) ON DELETE CASCADE NOT NULL,
    anon_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(news_id, anon_id)
);

CREATE TABLE IF NOT EXISTS news_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID REFERENCES news_stories(id) ON DELETE CASCADE NOT NULL,
    shared_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_stories_created_at ON news_stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_likes_news_id ON news_likes(news_id);

ALTER TABLE news_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view news" ON news_stories FOR SELECT USING (true);
CREATE POLICY "Public can view likes" ON news_likes FOR SELECT USING (true);
CREATE POLICY "Public can insert likes" ON news_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete own likes" ON news_likes FOR DELETE USING (true);
CREATE POLICY "Public can insert shares" ON news_shares FOR INSERT WITH CHECK (true);

-- Add unique constraint for upsert
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'news_stories_source_url_key'
    ) THEN
        ALTER TABLE news_stories 
        ADD CONSTRAINT news_stories_source_url_key 
        UNIQUE (source_url);
    END IF;
END
$$;

-- ============================================
-- SCORES TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS sports_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    sport TEXT NOT NULL,
    league TEXT,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_score TEXT,
    away_score TEXT,
    status TEXT NOT NULL,
    date_event TIMESTAMPTZ NOT NULL,
    time_event TEXT,
    venue TEXT,
    thumb_home TEXT,
    thumb_away TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sports_scores_date ON sports_scores(date_event DESC);
CREATE INDEX IF NOT EXISTS idx_sports_scores_sport ON sports_scores(sport);

ALTER TABLE sports_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view scores" ON sports_scores FOR SELECT USING (true);

-- ============================================
-- COMMUNITY TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  salary_range TEXT,
  apply_url TEXT,
  duration_start TIMESTAMPTZ,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES daily_posts(id) ON DELETE CASCADE,
  anon_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, anon_id)
);

CREATE TABLE IF NOT EXISTS contact_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  job_title TEXT,
  job_company TEXT,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_job_listings_approved ON job_listings(approved);
CREATE INDEX IF NOT EXISTS idx_job_listings_created_at ON job_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_posts_created_at ON daily_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_post_likes_post_id ON daily_post_likes(post_id);

ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read approved jobs" ON job_listings FOR SELECT USING (approved = true);
CREATE POLICY "Admin can insert jobs" ON job_listings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update jobs" ON job_listings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Public can read daily posts" ON daily_posts FOR SELECT USING (true);
CREATE POLICY "Admin can create posts" ON daily_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update posts" ON daily_posts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Public can read likes" ON daily_post_likes FOR SELECT USING (true);
CREATE POLICY "Public can like posts" ON daily_post_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unlike" ON daily_post_likes FOR DELETE USING (true);

CREATE POLICY "Anyone can submit forms" ON contact_forms FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read forms" ON contact_forms FOR SELECT TO authenticated USING (true);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('community', 'community', true, 5242880, 
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resumes', 'resumes', false, 10485760,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload to community"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'community');

CREATE POLICY "Anyone can read community images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'community');

CREATE POLICY "Anyone can upload resumes"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Only admin can read resumes"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes');

-- ============================================
-- SAMPLE DATA
-- ============================================

INSERT INTO job_listings (title, company, location, description, salary_range, approved)
VALUES (
  'Full Stack Developer',
  'AlexEnright Labs',
  'Remote / San Francisco',
  'We are looking for a talented full stack developer to join our team.',
  '$100,000 - $150,000',
  true
)
ON CONFLICT DO NOTHING;

INSERT INTO daily_posts (title, body)
VALUES (
  'Welcome!',
  'This is the first update from the AlexEnright team. Stay tuned!'
)
ON CONFLICT DO NOTHING;
