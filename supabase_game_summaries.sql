-- Create game summaries table to cache ESPN API data
CREATE TABLE IF NOT EXISTS game_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    sport TEXT NOT NULL,
    league TEXT NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    summary_data JSONB NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_game_summaries_event_id ON game_summaries(event_id);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_game_summaries_fetched_at ON game_summaries(fetched_at);

-- Enable RLS
ALTER TABLE game_summaries ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on game_summaries"
    ON game_summaries
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Auto-cleanup function for old summaries (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_game_summaries()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM game_summaries
    WHERE fetched_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Optional: Create a scheduled job to run cleanup daily
-- SELECT cron.schedule('cleanup-game-summaries', '0 0 * * *', 'SELECT cleanup_old_game_summaries()');
