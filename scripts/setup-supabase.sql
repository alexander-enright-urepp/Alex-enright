-- Supabase SQL Setup for News Fetcher
-- Run this in your Supabase SQL Editor

-- Create the news_stories table
CREATE TABLE IF NOT EXISTS public.news_stories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    source TEXT NOT NULL,
    source_name TEXT,
    published_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ DEFAULT now(),
    image_url TEXT,
    author TEXT
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_news_stories_fetched_at 
    ON public.news_stories(fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_stories_source 
    ON public.news_stories(source);

CREATE INDEX IF NOT EXISTS idx_news_stories_published_at 
    ON public.news_stories(published_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.news_stories ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (adjust as needed)
CREATE POLICY "Allow all" ON public.news_stories
    FOR ALL USING (true) WITH CHECK (true);

-- Create a function to get the latest N stories
CREATE OR REPLACE FUNCTION get_latest_news(limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
    id TEXT,
    title TEXT,
    description TEXT,
    url TEXT,
    source TEXT,
    source_name TEXT,
    published_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ,
    image_url TEXT,
    author TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.news_stories
    ORDER BY fetched_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
