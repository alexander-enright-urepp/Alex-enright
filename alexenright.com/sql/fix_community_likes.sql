-- Fix: Community post likes table (separate from daily_posts likes)
DROP TABLE IF EXISTS community_post_likes;

CREATE TABLE community_post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  anon_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, anon_id)
);

-- Enable RLS
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view community_post_likes" 
ON community_post_likes FOR SELECT USING (true);

CREATE POLICY "Public can insert community_post_likes" 
ON community_post_likes FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can delete own community_post_likes" 
ON community_post_likes FOR DELETE USING (true);
