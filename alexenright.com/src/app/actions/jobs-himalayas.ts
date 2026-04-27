'use server'

import { createClient } from '@/lib/supabase/server'
import type { JobListing } from '@/types'

// Fetch jobs from Himalayas API and combine with AlexEnright approved jobs
export async function getAllJobs(): Promise<Array<JobListing & { source: 'alexenright' | 'himalayas' }>> {
  const supabase = await createClient()
  
  // Get AlexEnright approved jobs
  const { data: alexJobs, error: alexError } = await supabase
    .from('job_listings')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (alexError) {
    console.error('Error fetching AlexEnright jobs:', alexError)
  }

  // Get Himalayas jobs
  let himalayasJobs: any[] = []
  try {
    const response = await fetch('https://himalayas.app/jobs/api')
    if (response.ok) {
      const data = await response.json()
      // Transform Himalayas jobs to match your format
      himalayasJobs = data.jobs?.map((job: any) => ({
        id: `himalayas-${job.id}`,
        title: job.title,
        company: job.company?.name || 'Remote Company',
        location: job.location || 'Remote',
        description: job.excerpt || job.description?.substring(0, 200) + '...',
        salary_range: job.salary || null,
        apply_url: job.url,
        listing_date: job.published_at,
        duration_start: null,
        approved: true,
        source: 'himalayas' as const
      })) || []
    }
  } catch (err) {
    console.error('Himalayas API error:', err)
  }

  // Combine: AlexEnright jobs first
  const combined: Array<JobListing & { source: 'alexenright' | 'himalayas' }> = [
    ...(alexJobs || []).map((job: JobListing) => ({ ...job, source: 'alexenright' as const })),
    ...himalayasJobs
  ]

  return combined
}
