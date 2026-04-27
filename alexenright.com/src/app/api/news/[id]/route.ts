import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  const supabase = await createClient()
  
  const { data: story, error } = await supabase
    .from('news_stories')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }
  
  // Return the story data with the original URL for redirect
  return NextResponse.json({
    id: story.id,
    title: story.title,
    source: story.source,
    source_url: story.source_url,
    summary: story.summary,
    image_url: story.image_url,
    published_at: story.published_at
  })
}
