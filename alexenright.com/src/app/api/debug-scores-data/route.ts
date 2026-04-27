import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('sports_scores')
    .select('*')
    .order('date_event', { ascending: true })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message })
  }

  // Get unique sports
  const sports = Array.from(new Set(data?.map(s => s.sport) || []))

  return NextResponse.json({
    total: data?.length || 0,
    sports: sports,
    sample: data?.slice(0, 3) || []
  })
}
