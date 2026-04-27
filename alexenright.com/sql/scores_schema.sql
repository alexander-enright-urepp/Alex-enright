-- Sports Scores Table
CREATE TABLE sports_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    sport TEXT NOT NULL,
    league TEXT,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_score TEXT,
    away_score TEXT,
    status TEXT NOT NULL, -- 'Scheduled', 'Live', 'Finished'
    date_event TIMESTAMPTZ NOT NULL,
    time_event TEXT,
    venue TEXT,
    thumb_home TEXT,
    thumb_away TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching upcoming/live scores
CREATE INDEX idx_sports_scores_date ON sports_scores(date_event DESC);
CREATE INDEX idx_sports_scores_sport ON sports_scores(sport);
CREATE INDEX idx_sports_scores_status ON sports_scores(status);

-- RLS Policies
ALTER TABLE sports_scores ENABLE ROW LEVEL SECURITY;

-- Public can view scores
CREATE POLICY "Public can view sports scores"
ON sports_scores FOR SELECT USING (true);
