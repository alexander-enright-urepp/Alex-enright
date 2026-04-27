'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase/client'
import type { SportsScore } from '@/types'

interface GameDetailModalProps {
  game: SportsScore | null
  isOpen: boolean
  onClose: () => void
}

interface GameSummary {
  boxscore?: {
    teams: Array<{
      team: {
        id: string
        displayName: string
        abbreviation: string
        color: string
        alternateColor: string
        logo: string
      }
      statistics: Array<{
        name: string
        displayValue: string
        label: string
      }>
    }>
  }
  scoringPlays?: Array<{
    type: {
      text: string
    }
    text: string
    team: {
      displayName: string
      abbreviation: string
    }
    scoreValue: number
    clock: {
      displayValue: string
    }
    period: {
      number: number
    }
  }>
  leaders?: Array<{
    team: {
      displayName: string
    }
    leaders: Array<{
      displayName: string
      position: string
      statistics: Array<{
        name: string
        displayValue: string
      }>
    }>
  }>
  header?: {
    status: {
      type: {
        shortDetail: string
      }
    }
    competitions: Array<{
      date: string
      venue: {
        fullName: string
        address: {
          city: string
          state: string
        }
      }
      broadcasts: Array<{
        names: string[]
      }>
    }>
  }
}

export function GameDetailModal({ game, isOpen, onClose }: GameDetailModalProps) {
  const [summary, setSummary] = useState<GameSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)

  useEffect(() => {
    if (isOpen && game?.event_id) {
      fetchGameSummary()
    }
  }, [isOpen, game?.event_id])

  // Cleanup summary when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSummary(null)
      setError(null)
      setIsCached(false)
    }
  }, [isOpen])

  async function fetchGameSummary() {
    if (!game?.event_id) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Step 1: Check Supabase cache first
      const { data: cachedData, error: cacheError } = await supabase
        .from('game_summaries')
        .select('summary_data, fetched_at')
        .eq('event_id', game.event_id)
        .single()
      
      if (cacheError && cacheError.code !== 'PGRST116') {
        console.error('Cache lookup error:', cacheError)
      }
      
      // Use cached data if it exists and is less than 2 hours old
      if (cachedData?.summary_data) {
        const fetchedAt = new Date(cachedData.fetched_at)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
        
        if (fetchedAt > twoHoursAgo) {
          setSummary(cachedData.summary_data as GameSummary)
          setIsCached(true)
          setLoading(false)
          return
        }
      }
      
      // Step 2: Fetch from ESPN API if not cached or cache is stale
      const leagueMap: { [key: string]: string } = {
        'NFL': 'nfl',
        'NBA': 'nba', 
        'MLB': 'mlb',
        'NHL': 'nhl',
        'Premier League': 'eng.1',
        'La Liga': 'esp.1',
        'MLS': 'usa.1',
        'Serie A': 'ita.1',
        'Bundesliga': 'ger.1',
        'Ligue 1': 'fra.1'
      }
      
      const league = leagueMap[game.league] || game.league.toLowerCase().replace(/\s+/g, '')
      const sport = game.sport.toLowerCase()
      
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/summary?event=${game.event_id}`
      )
      
      if (!response.ok) {
        // If API fails but we have stale cache, use it as fallback
        if (cachedData?.summary_data) {
          setSummary(cachedData.summary_data as GameSummary)
          setIsCached(true)
          setLoading(false)
          return
        }
        throw new Error('Failed to fetch game details')
      }
      
      const data = await response.json()
      setSummary(data)
      setIsCached(false)
      
      // Step 3: Save to Supabase cache (don't await, let it happen in background)
      saveToCache(game, data).catch(console.error)
      
    } catch (err) {
      console.error('Error fetching summary:', err)
      setError('Unable to load game details. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  async function saveToCache(game: SportsScore, data: GameSummary) {
    try {
      await supabase
        .from('game_summaries')
        .upsert({
          event_id: game.event_id,
          sport: game.sport,
          league: game.league,
          home_team: game.home_team,
          away_team: game.away_team,
          summary_data: data,
          fetched_at: new Date().toISOString()
        }, {
          onConflict: 'event_id'
        })
    } catch (err) {
      console.error('Failed to save to cache:', err)
    }
  }

  function handleRetry() {
    fetchGameSummary()
  }

  if (!game) return null

  const homeTeam = summary?.boxscore?.teams?.[0]
  const awayTeam = summary?.boxscore?.teams?.[1]
  const homeColor = homeTeam?.team?.color ? `#${homeTeam.team.color}` : '#ef4444'
  const awayColor = awayTeam?.team?.color ? `#${awayTeam.team.color}` : '#3b82f6'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" className="max-w-2xl">
      <div className="-mt-4">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mb-3" />
            <p className="text-sm text-gray-500">Loading game details...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-red-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Game Content */}
        {!loading && !error && (
          <>
            {/* Scoreboard Header */}
            <div className="relative overflow-hidden rounded-xl mb-6">
              {/* Background gradient with team colors */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: `linear-gradient(135deg, ${homeColor} 0%, ${awayColor} 100%)`
                }}
              />
              
              <div className="relative p-6">
                {/* Status with cache indicator */}
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-gray-700">
                    {game.status}
                  </span>
                  {isCached && (
                    <span className="block text-xs text-gray-400 mt-1">
                      From cache
                    </span>
                  )}
                </div>

                {/* Teams & Score */}
                <div className="flex items-center justify-between">
                  {/* Away Team */}
                  <div className="flex flex-col items-center flex-1">
                    {game.thumb_away ? (
                      <img 
                        src={game.thumb_away} 
                        alt={game.away_team}
                        className="w-16 h-16 object-contain mb-2"
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-full mb-2 flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: awayColor }}
                      >
                        {game.away_team.charAt(0)}
                      </div>
                    )}
                    <span className="font-bold text-sm text-center">{game.away_team}</span>
                    <span className="text-3xl font-bold mt-1">
                      {game.away_score !== null ? game.away_score : '-'}
                    </span>
                  </div>

                  {/* VS */}
                  <div className="px-4">
                    <span className="text-gray-400 font-medium">VS</span>
                  </div>

                  {/* Home Team */}
                  <div className="flex flex-col items-center flex-1">
                    {game.thumb_home ? (
                      <img 
                        src={game.thumb_home} 
                        alt={game.home_team}
                        className="w-16 h-16 object-contain mb-2"
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-full mb-2 flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: homeColor }}
                      >
                        {game.home_team.charAt(0)}
                      </div>
                    )}
                    <span className="font-bold text-sm text-center">{game.home_team}</span>
                    <span className="text-3xl font-bold mt-1">
                      {game.home_score !== null ? game.home_score : '-'}
                    </span>
                  </div>
                </div>

                {/* Venue Info */}
                {summary?.header?.competitions?.[0]?.venue && (
                  <div className="text-center mt-4 text-xs text-gray-500">
                    {summary.header.competitions[0].venue.fullName}
                    {summary.header.competitions[0].venue.address?.city && (
                      <span> • {summary.header.competitions[0].venue.address.city}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Box Score */}
            {summary?.boxscore?.teams && summary.boxscore.teams.length >= 2 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Team Stats
                </h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 px-3 text-left font-medium text-gray-600">Stat</th>
                        <th className="py-2 px-3 text-center font-medium text-gray-600">{game.away_team.slice(0, 3).toUpperCase()}</th>
                        <th className="py-2 px-3 text-center font-medium text-gray-600">{game.home_team.slice(0, 3).toUpperCase()}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.boxscore.teams[1]?.statistics?.slice(0, 6).map((stat, idx) => {
                        const awayStat = summary.boxscore.teams[1].statistics[idx]
                        const homeStat = summary.boxscore.teams[0].statistics[idx]
                        return (
                          <tr key={idx} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 px-3 text-gray-600">{stat.label}</td>
                            <td className="py-2 px-3 text-center font-medium">{awayStat?.displayValue || '-'}</td>
                            <td className="py-2 px-3 text-center font-medium">{homeStat?.displayValue || '-'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Scoring Plays */}
            {summary?.scoringPlays && summary.scoringPlays.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Scoring Plays
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {summary.scoringPlays.slice(0, 10).map((play, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-12 text-xs font-medium text-gray-500">
                        {play.clock?.displayValue}
                      </div>
                      <div className="flex-1 text-sm">
                        <span className="font-medium" style={{ color: play.team?.abbreviation === game.home_team.slice(0, 3).toUpperCase() ? homeColor : awayColor }}>
                          {play.team?.abbreviation}
                        </span>
                        <span className="text-gray-600 ml-1">{play.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leaders */}
            {summary?.leaders && summary.leaders.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Top Performers
                </h3>
                <div className="space-y-3">
                  {summary.leaders.map((teamLeader, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">{teamLeader.team.displayName}</p>
                      <div className="space-y-2">
                        {teamLeader.leaders.slice(0, 2).map((leader, lIdx) => (
                          <div key={lIdx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                                {leader.displayName.charAt(0)}
                              </div>
                              <span className="text-sm font-medium">{leader.displayName}</span>
                              <span className="text-xs text-gray-400">{leader.position}</span>
                            </div>
                            <span className="text-sm font-bold text-accent">
                              {leader.statistics?.[0]?.displayValue}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
