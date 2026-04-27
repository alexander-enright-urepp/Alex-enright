import { NextResponse } from 'next/server'

export async function GET() {
  const results: any = {
    tests: {}
  }
  
  // Test NFL
  try {
    const response = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'
    )
    const data = await response.json()
    results.tests.nfl = {
      status: response.status,
      hasEvents: !!data.events,
      eventCount: data.events?.length || 0,
      sampleEvent: data.events?.[0] ? {
        id: data.events[0].id,
        name: data.events[0].name,
        date: data.events[0].date,
        status: data.events[0].status?.type?.name
      } : null
    }
  } catch (err: any) {
    results.tests.nfl = { error: err.message }
  }
  
  // Test NBA
  try {
    const response = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
    )
    const data = await response.json()
    results.tests.nba = {
      status: response.status,
      hasEvents: !!data.events,
      eventCount: data.events?.length || 0
    }
  } catch (err: any) {
    results.tests.nba = { error: err.message }
  }
  
  return NextResponse.json(results)
}
