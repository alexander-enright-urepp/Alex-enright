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
  
  // Type assertion since Supabase returns any
  const newsStory = story as any
  
  // Return the story data with the original URL for redirect
  return NextResponse.json({
    id: newsStory.id,
    title: newsStory.title,
    source: newsStory.source,
    source_url: newsStory.source_url,
    summary: newsStory.summary,
    image_url: newsStory.image_url,
    published_at: newsStory.published_at
  })
}
