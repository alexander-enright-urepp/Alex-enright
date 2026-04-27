'use server'

import { createClient } from '@/lib/supabase/server'
import type { SportsScore } from '@/types'

export async function getScores(): Promise<SportsScore[]> {
  const supabase = await createClient()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabase
    .from('sports_scores')
    .select('*')
    .gte('date_event', today.toISOString())
    .order('date_event', { ascending: true })
    .limit(50)

  if (error) {
    console.error('Error fetching scores:', error)
    return []
  }

  return (data as SportsScore[]) || []
}

export async function getLiveScores(): Promise<SportsScore[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sports_scores')
    .select('*')
    .eq('status', 'Live')
    .order('date_event', { ascending: true })

  if (error) {
    console.error('Error fetching live scores:', error)
    return []
  }

  return (data as SportsScore[]) || []
}
