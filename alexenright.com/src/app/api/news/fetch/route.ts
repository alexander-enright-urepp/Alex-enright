import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// News API configurations
const NEWS_APIS = {
  newsapi: {
    url: 'https://newsapi.org/v2/top-headlines',
    key: process.env.NEWSAPI_KEY,
    params: { country: 'us', pageSize: 35 }
  },
  gnews: {
    url: 'https://gnews.io/api/v4/top-headlines',
    key: process.env.GNEWS_API_KEY,
    params: { country: 'us', max: 35 }
  },
  nytimes: {
    url: 'https://api.nytimes.com/svc/topstories/v2/home.json',
    key: process.env.NYTIMES_API_KEY,
    params: {}
  },
  guardian: {
    url: 'https://content.guardianapis.com/search',
    key: process.env.GUARDIAN_API_KEY,
    params: { 'order-by': 'newest', 'show-fields': 'thumbnail,trailText', pageSize: 35 }
  }
}

interface NewsStory {
  title: string
  description?: string
  content?: string
  url: string
  urlToImage?: string
  image?: string
  publishedAt: string
  source?: { name: string }
  author?: string
}

export async function POST(request: Request) {
  // Verify cron secret if provided
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stories: any[] = []
  const errors: string[] = []

  // Fetch from NewsAPI
  try {
    if (NEWS_APIS.newsapi.key) {
      const response = await fetch(
        `${NEWS_APIS.newsapi.url}?country=us&pageSize=35&apiKey=${NEWS_APIS.newsapi.key}`
      )
      const data = await response.json()
      
      if (data.articles) {
        data.articles.forEach((article: NewsStory) => {
          stories.push({
            title: article.title,
            summary: article.description,
            content: article.content,
            source: article.source?.name || 'Unknown',
            source_url: article.url,
            image_url: article.urlToImage,
            published_at: article.publishedAt,
            category: categorizeStory(article.title, article.description),
            author: article.author,
            api_source: 'newsapi'
          })
        })
      }
    }
  } catch (error) {
    errors.push(`NewsAPI error: ${error}`)
  }

  // Fetch from GNews
  try {
    if (NEWS_APIS.gnews.key) {
      const response = await fetch(
        `${NEWS_APIS.gnews.url}?country=us&max=35&apikey=${NEWS_APIS.gnews.key}`
      )
      const data = await response.json()
      
      if (data.articles) {
        data.articles.forEach((article: any) => {
          stories.push({
            title: article.title,
            summary: article.description,
            content: article.content,
            source: article.source?.name || 'Unknown',
            source_url: article.url,
            image_url: (article as any).image || article.urlToImage,
            published_at: article.publishedAt,
            category: categorizeStory(article.title, article.description),
            author: article.author,
            api_source: 'gnews'
          })
        })
      }
    }
  } catch (error) {
    errors.push(`GNews error: ${error}`)
  }

  // Fetch from NYTimes
  try {
    if (NEWS_APIS.nytimes.key) {
      const response = await fetch(
        `${NEWS_APIS.nytimes.url}?api-key=${NEWS_APIS.nytimes.key}`
      )
      const data = await response.json()
      
      if (data.results) {
        data.results.forEach((article: any) => {
          stories.push({
            title: article.title,
            summary: article.abstract,
            content: article.abstract,
            source: 'The New York Times',
            source_url: article.url,
            image_url: article.multimedia?.[0]?.url,
            published_at: article.published_date,
            category: article.section || categorizeStory(article.title, article.abstract),
            author: article.byline?.replace('By ', ''),
            api_source: 'nytimes'
          })
        })
      }
    }
  } catch (error) {
    errors.push(`NYTimes error: ${error}`)
  }

  // Fetch from The Guardian
  try {
    if (NEWS_APIS.guardian.key) {
      const response = await fetch(
        `${NEWS_APIS.guardian.url}?order-by=newest&show-fields=thumbnail,trailText,byline&page-size=35&api-key=${NEWS_APIS.guardian.key}`
      )
      const data = await response.json()
      
      if (data.response?.results) {
        data.response.results.forEach((article: any) => {
          stories.push({
            title: article.webTitle,
            summary: article.fields?.trailText,
            content: article.fields?.trailText,
            source: 'The Guardian',
            source_url: article.webUrl,
            image_url: article.fields?.thumbnail,
            published_at: article.webPublicationDate,
            category: article.sectionName || categorizeStory(article.webTitle, article.fields?.trailText),
            author: article.fields?.byline,
            api_source: 'guardian'
          })
        })
      }
    }
  } catch (error) {
    errors.push(`Guardian error: ${error}`)
  }

  // Remove duplicates based on URL
  const uniqueStories = stories.filter((story, index, self) =>
    index === self.findIndex((s) => s.source_url === story.source_url)
  )

  console.log(`Total stories before dedupe: ${stories.length}`)
  console.log(`Unique stories: ${uniqueStories.length}`)

  // Sort by published date
  uniqueStories.sort((a, b) => 
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  )

  // Keep only most recent 100
  const recentStories = uniqueStories.slice(0, 100)

  console.log(`Attempting to insert ${recentStories.length} stories`)

  // Insert into database
  if (recentStories.length > 0) {
    // Delete stories older than 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { error: deleteError } = await supabase
      .from('news_stories')
      .delete()
      .lt('created_at', sevenDaysAgo.toISOString())
    
    if (deleteError) {
      console.error('Delete error:', deleteError)
      errors.push(`Delete error: ${deleteError.message}`)
    }

    // Insert new stories - try upsert first, then regular insert
    const { error: upsertError } = await supabase
      .from('news_stories')
      .upsert(recentStories, { onConflict: 'source_url' })

    if (upsertError && upsertError.message.includes('no unique or exclusion constraint')) {
      // Fallback: delete existing and insert fresh
      console.log('Falling back to delete+insert...')
      await supabase.from('news_stories').delete().gte('id', '00000000-0000-0000-0000-000000000000')
      const { error: insertError } = await supabase.from('news_stories').insert(recentStories)
      if (insertError) {
        console.error('Insert error:', insertError)
        errors.push(`Insert error: ${insertError.message}`)
      }
    } else if (upsertError) {
      console.error('Upsert error:', upsertError)
      errors.push(`Upsert error: ${upsertError.message}`)
    } else {
      console.log('Insert successful!')
    }
  }

  return NextResponse.json({
    success: true,
    fetched: stories.length,
    unique: uniqueStories.length,
    inserted: recentStories.length,
    sampleStory: recentStories[0] || null,
    errors: errors.length > 0 ? errors : undefined
  })
}

// Simple categorization based on keywords
function categorizeStory(title: string = '', description: string = ''): string {
  const text = `${title} ${description}`.toLowerCase()
  
  if (text.match(/tech|ai|software|app|iphone|android|computer|internet/)) return 'Tech'
  if (text.match(/business|economy|market|stock|trade|company|startup/)) return 'Business'
  if (text.match(/science|space|research|study|discovery|nasa/)) return 'Science'
  if (text.match(/sport|game|team|player|nba|nfl|soccer|football/)) return 'Sports'
  if (text.match(/movie|film|music|celebrity|entertainment|tv|show/)) return 'Entertainment'
  if (text.match(/health|medical|doctor|hospital|covid|vaccine/)) return 'Health'
  if (text.match(/politic|election|government|president|congress/)) return 'Politics'
  
  return 'General'
}
