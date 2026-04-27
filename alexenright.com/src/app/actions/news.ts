'use server'

import { createClient } from '@/lib/supabase/server'
import type { NewsStory } from '@/types'

// Fetch latest news stories
export async function getNewsStories(limit = 100): Promise<NewsStory[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('news_stories')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching news:', error)
    return []
  }

  return (data as NewsStory[]) || []
}

// Fetch news with likes count
export async function getNewsStoriesWithLikes(): Promise<Array<NewsStory & { likes_count: number; has_liked: boolean }>> {
  const supabase = await createClient()
  
  const { data: stories, error: storiesError } = await supabase
    .from('news_stories')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(100)

  if (storiesError) {
    console.error('Error fetching news:', storiesError)
    return []
  }

  const storyIds = (stories as NewsStory[])?.map(s => s.id) || []
  
  // Get likes counts
  const { data: likes } = await supabase
    .from('news_likes')
    .select('news_id')
    .in('news_id', storyIds)

  const likeCounts = new Map<string, number>()
  likes?.forEach((like: any) => {
    likeCounts.set(like.news_id, (likeCounts.get(like.news_id) || 0) + 1)
  })

  return (stories as NewsStory[])?.map((story: NewsStory) => ({
    ...story,
    likes_count: likeCounts.get(story.id) || 0,
    has_liked: false, // Will be set client-side
  })) || []
}

// Toggle like on news story
export async function toggleLikeNews(newsId: string, currentLiked: boolean, anonId: string) {
  const supabase = await createClient()

  try {
    if (currentLiked) {
      // Unlike
      const { error } = await supabase
        .from('news_likes')
        .delete()
        .eq('news_id', newsId)
        .eq('anon_id', anonId)

      if (error) throw error
    } else {
      // Like
      const { error } = await supabase
        .from('news_likes')
        .insert({ news_id: newsId, anon_id: anonId } as any)

      if (error) throw error
    }

    return { success: true }
  } catch (error) {
    console.error('News like error:', error)
    return { success: false, error: 'Failed to update like' }
  }
}

// Track share
export async function trackNewsShare(newsId: string, sharedTo: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('news_shares')
    .insert({ news_id: newsId, shared_to: sharedTo })

  if (error) {
    console.error('Track share error:', error)
  }
}
