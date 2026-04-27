-- News Stories Table
CREATE TABLE news_stories (
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
    api_source TEXT NOT NULL -- which API provided this (e.g., 'newsapi', 'gnews', 'nytimes')
);

-- News Likes Table (similar to post_likes)
CREATE TABLE news_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID REFERENCES news_stories(id) ON DELETE CASCADE NOT NULL,
    anon_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(news_id, anon_id)
);

-- News Share Tracking (optional - track shares)
CREATE TABLE news_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID REFERENCES news_stories(id) ON DELETE CASCADE NOT NULL,
    shared_to TEXT, -- e.g., 'twitter', 'facebook', 'copy'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching recent news
CREATE INDEX idx_news_stories_created_at ON news_stories(created_at DESC);
CREATE INDEX idx_news_stories_category ON news_stories(category);
CREATE INDEX idx_news_stories_api_source ON news_stories(api_source);

-- Index for likes
CREATE INDEX idx_news_likes_news_id ON news_likes(news_id);
CREATE INDEX idx_news_likes_anon_id ON news_likes(anon_id);

-- RLS Policies
ALTER TABLE news_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_shares ENABLE ROW LEVEL SECURITY;

-- Public can view news
CREATE POLICY "Public can view news stories"
ON news_stories FOR SELECT USING (true);

-- Public can view likes
CREATE POLICY "Public can view news likes"
ON news_likes FOR SELECT USING (true);

-- Anyone can like/unlike
CREATE POLICY "Public can insert news likes"
ON news_likes FOR INSERT WITH CHECK (true);

-- Anyone can delete their own likes
CREATE POLICY "Public can delete own news likes"
ON news_likes FOR DELETE USING (true);

-- Track shares
CREATE POLICY "Public can insert news shares"
ON news_shares FOR INSERT WITH CHECK (true);
