import { NextResponse } from 'next/server'

export async function GET() {
  const results: any = {
    env: {
      NEWSAPI_KEY: process.env.NEWSAPI_KEY ? 'Set' : 'Missing',
      GNEWS_API_KEY: process.env.GNEWS_API_KEY ? 'Set' : 'Missing',
      GUARDIAN_API_KEY: process.env.GUARDIAN_API_KEY ? 'Set' : 'Missing',
      NYTIMES_API_KEY: process.env.NYTIMES_API_KEY ? 'Set' : 'Missing',
    }
  }
  
  // Test NewsAPI
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${process.env.NEWSAPI_KEY}`
    )
    const data = await response.json()
    results.newsapi = {
      status: response.status,
      articles: data.articles?.length || 0,
      error: data.error?.message
    }
  } catch (err) {
    results.newsapi = { error: String(err) }
  }
  
  // Test Guardian
  try {
    const response = await fetch(
      `https://content.guardianapis.com/search?order-by=newest&page-size=5&api-key=${process.env.GUARDIAN_API_KEY}`
    )
    const data = await response.json()
    results.guardian = {
      status: response.status,
      articles: data.response?.results?.length || 0,
      error: data.response?.message
    }
  } catch (err) {
    results.guardian = { error: String(err) }
  }
  
  return NextResponse.json(results)
}
