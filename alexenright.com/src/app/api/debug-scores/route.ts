import { NextResponse } from 'next/server'

const THESPORTSDB_KEY = process.env.THESPORTSDB_API_KEY || '123'

export async function GET() {
  const results: any = {
    env: {
      THESPORTSDB_API_KEY: process.env.THESPORTSDB_API_KEY ? 'Set' : 'Using default 123',
    },
    tests: {}
  }
  
  // Try all endpoints
  const endpoints = [
    { name: 'eventsnext7', url: `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/eventsnext7.php?id=4387` },
    { name: 'eventsnext', url: `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/eventsnext.php?id=4387` },
    { name: 'searchteams', url: `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/searchteams.php?t=Arsenal` },
    { name: 'lookupleague', url: `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/lookupleague.php?id=4387` },
  ]
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, { timeout: 10000 } as any)
      const text = await response.text()
      
      // Check if it's JSON
      let data = null
      let isJson = false
      try {
        data = JSON.parse(text)
        isJson = true
      } catch {
        // Not JSON
      }
      
      results.tests[endpoint.name] = {
        status: response.status,
        isJson,
        preview: text.substring(0, 200),
        data: isJson ? data : null
      }
    } catch (err: any) {
      results.tests[endpoint.name] = { error: err.message }
    }
  }
  
  return NextResponse.json(results)
}
