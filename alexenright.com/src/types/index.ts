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
export type TabType = 'agent' | 'play' | 'daily' | 'community' | 'about'

// Navigation item
export interface NavItem {
  id: TabType
  label: string
  icon: string
}
