// @ts-nocheck
'use client'

import { createClient } from '@/lib/supabase/client'

export async function getRecruiterSubmissions() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('recruiter_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching submissions:', error)
    return []
  }

  return data || []
}

export async function getPendingJobs() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('job_listings')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending jobs:', error)
    return []
  }

  return data || []
}

export async function approveJob(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string
  if (!id) return
  
  const { error } = await supabase
    .from('job_listings')
    .update({ approved: true })
    .eq('id', id)

  if (error) {
    console.error('Approve job error:', error)
  }
}

export async function rejectJob(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string
  if (!id) return
  
  const { error } = await supabase
    .from('job_listings')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Reject job error:', error)
  }
}

export async function getAnalytics() {
  const supabase = createClient()
  
  const { data: submissions } = await supabase
    .from('recruiter_submissions')
    .select('id', { count: 'exact' })
  
  const { data: posts } = await supabase
    .from('daily_posts')
    .select('id', { count: 'exact' })
  
  const { data: jobs } = await supabase
    .from('job_listings')
    .select('id', { count: 'exact' })
  
  const { data: approvedJobs } = await supabase
    .from('job_listings')
    .select('id', { count: 'exact' })
    .eq('approved', true)
  
  const { data: community } = await supabase
    .from('community_posts')
    .select('id', { count: 'exact' })

  return {
    submissions: (submissions)?.length || 0,
    posts: (posts)?.length || 0,
    jobs: (jobs)?.length || 0,
    approvedJobs: (approvedJobs)?.length || 0,
    community: (community)?.length || 0,
  }
}
