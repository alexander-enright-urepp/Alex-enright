import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ESPN Sports/Leagues to fetch
const ESPN_LEAGUES = [
  { sport: 'football', league: 'nfl', name: 'NFL' },
  { sport: 'basketball', league: 'nba', name: 'NBA' },
  { sport: 'baseball', league: 'mlb', name: 'MLB' },
  { sport: 'hockey', league: 'nhl', name: 'NHL' },
  { sport: 'soccer', league: 'eng.1', name: 'Premier League' },
  { sport: 'soccer', league: 'usa.1', name: 'MLS' },
  { sport: 'soccer', league: 'esp.1', name: 'La Liga' },
]

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const events: any[] = []
  const errors: string[] = []

  // Fetch from ESPN for each league
  for (const league of ESPN_LEAGUES) {
    try {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${league.sport}/${league.league}/scoreboard`
      )
      
      if (!response.ok) {
        errors.push(`HTTP error for ${league.name}: ${response.status}`)
        continue
      }
      
      const data = await response.json()
      
      if (data.events) {
        data.events.forEach((event: any) => {
          const homeTeam = event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'home')
          const awayTeam = event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'away')
          
          if (!homeTeam || !awayTeam) return

          events.push({
            event_id: event.id,
            sport: league.sport,
            league: league.name,
            home_team: homeTeam.team?.displayName || homeTeam.team?.name || 'Unknown',
            away_team: awayTeam.team?.displayName || awayTeam.team?.name || 'Unknown',
            home_score: homeTeam.score || null,
            away_score: awayTeam.score || null,
            status: event.status?.type?.shortDetail || event.status?.type?.name || 'Scheduled',
            date_event: new Date(event.date).toISOString(),
            time_event: new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            venue: event.competitions?.[0]?.venue?.fullName || null,
            thumb_home: homeTeam.team?.logo || null,
            thumb_away: awayTeam.team?.logo || null,
            video_url: null
          })
        })
      }
    } catch (error) {
      errors.push(`Error fetching ${league.name}: ${error}`)
    }
  }

  // Sort by date
  events.sort((a, b) => new Date(a.date_event).getTime() - new Date(b.date_event).getTime())

  // Insert into database
  if (events.length > 0) {
    // Insert new events
    const { error: insertError } = await supabase
      .from('sports_scores')
      .upsert(events, { onConflict: 'event_id' })

    if (insertError) {
      errors.push(`Insert error: ${insertError.message}`)
    }
  }

  return NextResponse.json({
    success: true,
    fetched: events.length,
    errors: errors.length > 0 ? errors : undefined
  })
}
