import { Database } from '@/lib/supabase/types'

// Database row types
export type RecruiterSubmission = Database['public']['Tables']['recruiter_submissions']['Row']
export type DailyPost = Database['public']['Tables']['daily_posts']['Row']
export type JobListing = Database['public']['Tables']['job_listings']['Row']
export type CommunityPost = Database['public']['Tables']['community_posts']['Row']
export type PostLike = Database['public']['Tables']['post_likes']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']

// Extended types with relations
export type DailyPostWithLikes = DailyPost & {
  likes_count: number
  has_liked: boolean
}

// News Story type (manual since it may not be in generated types)
export type NewsStory = {
  id: string
  title: string
  summary: string | null
  content: string | null
  source: string
  source_url: string
  image_url: string | null
  published_at: string
  category: string | null
  author: string | null
  created_at: string
  updated_at: string
  api_source: string
}

// Game types
export type GameType = 'coin-flip' | 'dice-roll' | 'rps' | 'tic-tac-toe' | 'snake' | 'magic8ball' | 'fortune-cookie' | 'slot-machine' | 'hangman'

export interface Game {
  id: GameType
  name: string
  description: string
  icon: string
  locked: boolean
}

// Tab types
export type TabType = 'news' | 'play' | 'scores' | 'community' | 'about'

// Sports Score type
export interface SportsScore {
  id: string
  event_id: string
  sport: string
  league: string
  home_team: string
  away_team: string
  home_score: string | null
  away_score: string | null
  status: string
  date_event: string
  time_event: string | null
  venue: string | null
  thumb_home: string | null
  thumb_away: string | null
  video_url: string | null
  created_at: string
  updated_at: string
}

// Navigation item
export interface NavItem {
  id: TabType
  label: string
  icon: string
}
