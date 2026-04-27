import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const THESPORTSDB_KEY = process.env.THESPORTSDB_API_KEY || '123'

// Major leagues to fetch (free API supports these)
const LEAGUES = [
  { id: '4328', name: 'English Premier League', sport: 'Soccer' },
  { id: '4387', name: 'NBA', sport: 'Basketball' },
  { id: '4391', name: 'NFL', sport: 'American Football' },
  { id: '4424', name: 'MLB', sport: 'Baseball' },
  { id: '4401', name: 'NHL', sport: 'Ice Hockey' },
  { id: '4335', name: 'Spanish La Liga', sport: 'Soccer' },
  { id: '4332', name: 'Italian Serie A', sport: 'Soccer' },
  { id: '4334', name: 'French Ligue 1', sport: 'Soccer' },
  { id: '4331', name: 'German Bundesliga', sport: 'Soccer' },
  { id: '4481', name: 'MLS', sport: 'Soccer' },
]

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const events: any[] = []
  const errors: string[] = []

  // Get today's date and next 7 days
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  // Fetch events for each league
  for (const league of LEAGUES) {
    try {
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/eventsnext7.php?id=${league.id}`
      )
      
      if (!response.ok) {
        errors.push(`HTTP error for ${league.name}: ${response.status}`)
        continue
      }
      
      const data = await response.json()
      
      if (data.events) {
        data.events.forEach((event: any) => {
          events.push({
            event_id: event.idEvent,
            sport: league.sport,
            league: league.name,
            home_team: event.strHomeTeam,
            away_team: event.strAwayTeam,
            home_score: event.intHomeScore || null,
            away_score: event.intAwayScore || null,
            status: event.strStatus || 'Scheduled',
            date_event: `${event.dateEvent} ${event.strTime || '00:00:00'}`,
            time_event: event.strTime,
            venue: event.strVenue,
            thumb_home: event.strThumb || null,
            thumb_away: event.strThumb || null,
            video_url: event.strVideo || null
          })
        })
      }
    } catch (error) {
      errors.push(`Error fetching ${league.name}: ${error}`)
    }
  }

  // Also try to get live scores (may not work with free API)
  try {
    const liveResponse = await fetch(
      `https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/latestevent.php`
    )
    const liveData = await liveResponse.json()
    
    if (liveData.events) {
      liveData.events.forEach((event: any) => {
        // Check if event already exists
        const exists = events.some(e => e.event_id === event.idEvent)
        if (!exists) {
          events.push({
            event_id: event.idEvent,
            sport: event.strSport,
            league: event.strLeague,
            home_team: event.strHomeTeam,
            away_team: event.strAwayTeam,
            home_score: event.intHomeScore || null,
            away_score: event.intAwayScore || null,
            status: event.strStatus || 'Live',
            date_event: `${event.dateEvent} ${event.strTime || '00:00:00'}`,
            time_event: event.strTime,
            venue: event.strVenue,
            thumb_home: event.strThumb || null,
            thumb_away: event.strThumb || null,
            video_url: event.strVideo || null
          })
        }
      })
    }
  } catch (error) {
    errors.push(`Live scores error: ${error}`)
  }

  // Remove duplicates
  const uniqueEvents = events.filter((event, index, self) =>
    index === self.findIndex((e) => e.event_id === event.event_id)
  )

  // Sort by date
  uniqueEvents.sort((a, b) => 
    new Date(a.date_event).getTime() - new Date(b.date_event).getTime()
  )

  // Insert into database
  if (uniqueEvents.length > 0) {
    // Clear old future events
    await supabase
      .from('sports_scores')
      .delete()
      .gte('date_event', formatDate(today))

    // Insert new events
    const { error: insertError } = await supabase
      .from('sports_scores')
      .upsert(uniqueEvents, { onConflict: 'event_id' })

    if (insertError) {
      errors.push(`Insert error: ${insertError.message}`)
    }
  }

  return NextResponse.json({
    success: true,
    fetched: uniqueEvents.length,
    errors: errors.length > 0 ? errors : undefined
  })
}
