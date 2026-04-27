// @ts-nocheck
'use client'

import { createClient } from '@/lib/supabase/client'
import type { DailyPost } from '@/types'

export async function getDailyPosts(): Promise<DailyPost[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('daily_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  return (data as DailyPost[]) || []
}

export async function getDailyPostsWithLikes(): Promise<Array<DailyPost & { likes_count: number; has_liked: boolean }>> {
  const supabase = createClient()
  const { getAnonId } = await import('@/lib/utils')
  const anonId = getAnonId()
  
  console.log('Fetching from daily_posts table...')
  
  const { data: posts, error: postsError } = await supabase
    .from('daily_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (postsError) {
    console.error('Error fetching posts:', postsError)
    return []
  }

  console.log('Raw posts from daily_posts:', posts)

  const postIds = (posts as DailyPost[])?.map(p => p.id) || []
  
  const { data: likes, error: likesError } = await supabase
    .from('post_likes')
    .select('post_id, anon_id')
    .in('post_id', postIds)

  if (likesError) {
    console.error('Error fetching likes:', likesError)
  }

  const likeCounts = new Map<string, number>()
  const userLikes = new Set<string>()

  likes?.forEach((like: any) => {
    likeCounts.set(like.post_id, (likeCounts.get(like.post_id) || 0) + 1)
    if (like.anon_id === anonId) {
      userLikes.add(like.post_id)
    }
  })

  const result = (posts as DailyPost[])?.map((post: DailyPost) => ({
    ...post,
    likes_count: likeCounts.get(post.id) || 0,
    has_liked: userLikes.has(post.id),
  })) || []
  
  console.log('Processed posts with likes:', result)
  
  return result
}

export async function toggleLikePost(postId: string, currentLiked: boolean) {
  const supabase = createClient()
  const { getAnonId } = await import('@/lib/utils')
  const anonId = getAnonId()

  if (!anonId) {
    return { success: false, error: 'Could not identify user' }
  }

  try {
    if (currentLiked) {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('anon_id', anonId)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, anon_id: anonId })

      if (error) throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Like error:', error)
    return { success: false, error: 'Failed to update like' }
  }
}
