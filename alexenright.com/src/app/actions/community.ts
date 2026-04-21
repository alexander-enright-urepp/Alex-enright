// @ts-nocheck
'use client'

import { createClient } from '@/lib/supabase/client'

export async function getCommunityPosts() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('community_posts')
    .select('*, likes_count:post_likes(count)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching community posts:', error)
    return []
  }

  return data || []
}

export async function createCommunityPost(formData: FormData) {
  const supabase = createClient()
  
  const content = formData.get('content') as string
  const imageFile = formData.get('image') as File | null
  
  let imageUrl = null
  
  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('community')
      .upload(fileName, imageFile)
    
    if (uploadError) {
      console.error('Image upload error:', uploadError)
      return { success: false, error: 'Failed to upload image' }
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('community')
      .getPublicUrl(fileName)
    
    imageUrl = publicUrl
  }
  
  const { error } = await supabase
    .from('community_posts')
    .insert({
      content: content || '',
      image_url: imageUrl,
    })

  if (error) {
    console.error('Create community post error:', error)
    return { success: false, error: 'Failed to create post' }
  }

  return { success: true }
}

export async function likePost(postId: string, anonId: string) {
  const supabase = createClient()
  
  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('anon_id', anonId)
    .single()
  
  if (existing) {
    // Unlike
    await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('anon_id', anonId)
    return { success: true, liked: false }
  } else {
    // Like
    await supabase
      .from('post_likes')
      .insert({ post_id: postId, anon_id: anonId })
    return { success: true, liked: true }
  }
}

export async function getJobListings() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('job_listings')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
    return []
  }

  return data || []
}

export async function submitJobListing(formData: FormData) {
  const supabase = createClient()
  
  const durationStart = formData.get('durationStart') as string
  
  const { error } = await supabase
    .from('job_listings')
    .insert({
      title: formData.get('title'),
      company: formData.get('company'),
      location: formData.get('location'),
      description: formData.get('description'),
      salary_range: formData.get('salaryRange') || null,
      apply_url: formData.get('applyUrl') || null,
      duration_start: durationStart ? `${durationStart}T00:00:00Z` : null,
      approved: false,
    })

  if (error) {
    console.error('Submit job error:', error)
    return { success: false, error: 'Failed to submit job' }
  }

  return { success: true }
}
