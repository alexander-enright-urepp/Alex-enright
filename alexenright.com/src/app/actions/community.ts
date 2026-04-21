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
  
  const { error } = await supabase
    .from('community_posts')
    .insert({
      content: formData.get('content'),
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
