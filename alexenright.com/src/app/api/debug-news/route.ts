import { NextResponse } from 'next/server'

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      NEWSAPI_KEY: process.env.NEWSAPI_KEY ? `Set (${process.env.NEWSAPI_KEY.substring(0, 5)}...)` : 'Missing',
      GNEWS_API_KEY: process.env.GNEWS_API_KEY ? `Set (${process.env.GNEWS_API_KEY.substring(0, 5)}...)` : 'Missing',
      GUARDIAN_API_KEY: process.env.GUARDIAN_API_KEY ? `Set (${process.env.GUARDIAN_API_KEY.substring(0, 5)}...)` : 'Missing',
      NYTIMES_API_KEY: process.env.NYTIMES_API_KEY ? 'Set' : 'Missing',
    },
    tests: {}
  }
  
  // Test Guardian (most likely to work)
  try {
    const response = await fetch(
      `https://content.guardianapis.com/search?order-by=newest&page-size=5&api-key=${process.env.GUARDIAN_API_KEY}`,
      { timeout: 10000 } as any
    )
    const data = await response.json()
    results.tests.guardian = {
      status: response.status,
      ok: response.ok,
      articles: data.response?.results?.length || 0,
      error: data.response?.status !== 'ok' ? data.response?.message : null
    }
  } catch (err: any) {
    results.tests.guardian = { error: err.message }
  }
  
  // Test NewsAPI
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${process.env.NEWSAPI_KEY}`,
      { timeout: 10000 } as any
    )
    const data = await response.json()
    results.tests.newsapi = {
      status: response.status,
      ok: response.ok,
      articles: data.articles?.length || 0,
      error: data.status === 'error' ? data.message : null
    }
  } catch (err: any) {
    results.tests.newsapi = { error: err.message }
  }
  
  return NextResponse.json(results)
}
