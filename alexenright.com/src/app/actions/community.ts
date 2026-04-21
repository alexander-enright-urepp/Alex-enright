// @ts-nocheck
'use client'

import { createClient } from '@/lib/supabase/client'

export async function getCommunityPosts() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
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
  
  // Upload image if provided
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
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('community')
      .getPublicUrl(fileName)
    
    imageUrl = publicUrl
  }
  
  // Create post
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
  
  const { error } = await supabase
    .from('job_listings')
    .insert({
      title: formData.get('title'),
      company: formData.get('company'),
      location: formData.get('location'),
      description: formData.get('description'),
      salary_range: formData.get('salaryRange') || null,
      apply_url: formData.get('applyUrl') || null,
      approved: false,
    })

  if (error) {
    console.error('Submit job error:', error)
    return { success: false, error: 'Failed to submit job' }
  }

  return { success: true }
}
