-- Add unique constraint to source_url for ON CONFLICT to work
-- Only add if it doesn't exist
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
