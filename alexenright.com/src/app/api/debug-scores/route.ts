import { NextResponse } from 'next/server'

const THESPORTSDB_KEY = process.env.THESPORTSDB_API_KEY || '123'

export async function GET() {
  const results: any = {
    env: {
      THESPORTSDB_API_KEY: process.env.THESPORTSDB_API_KEY ? 'Set' : 'Using default 123',
    },
    tests: {}
  }
  
  // Test NBA (league ID 4387)
  try {
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/eventsnext7.php?id=4387`,
      { timeout: 10000 } as any
    )
    const data = await response.json()
    results.tests.nba = {
      status: response.status,
      ok: response.ok,
      hasEvents: !!data.events,
      eventCount: data.events?.length || 0,
      sampleEvent: data.events?.[0] || null,
      error: data.error || null
    }
  } catch (err: any) {
    results.tests.nba = { error: err.message }
  }
  
  // Test Premier League (league ID 4328)
  try {
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/eventsnext7.php?id=4328`,
      { timeout: 10000 } as any
    )
    const data = await response.json()
    results.tests.epl = {
      status: response.status,
      ok: response.ok,
      hasEvents: !!data.events,
      eventCount: data.events?.length || 0,
      error: data.error || null
    }
  } catch (err: any) {
    results.tests.epl = { error: err.message }
  }
  
  return NextResponse.json(results)
}
