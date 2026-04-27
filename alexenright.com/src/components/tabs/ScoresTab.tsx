'use client'

import { useState, useEffect } from 'react'
import { getScores } from '@/app/actions/scores'
import { GameDetailModal } from './GameDetailModal'
import type { SportsScore } from '@/types'

interface GroupedScores {
  [sport: string]: SportsScore[]
}

export function ScoresTab() {
  const [scores, setScores] = useState<SportsScore[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSport, setSelectedSport] = useState('All')
  const [selectedGame, setSelectedGame] = useState<SportsScore | null>(null)

  useEffect(() => {
    loadScores()
  }, [])

  async function loadScores() {
    setLoading(true)
    const data = await getScores()
    setScores(data)
    setLoading(false)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'Live': return 'bg-green-500 text-white'
      case 'Finished': return 'bg-gray-500 text-white'
      default: return 'bg-accent text-white'
    }
  }

  const filteredScores = selectedSport === 'All' 
    ? scores 
    : scores.filter(s => s.sport === selectedSport)

  const sports = ['All', ...Array.from(new Set(scores.map(s => s.sport)))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Logo Header */}
      <div className="flex justify-center py-4 bg-white">
        <img src="/LogoAEcircle.png" alt="AE Logo" className="w-12 h-12" />
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h1 className="text-xl font-bold">Scores</h1>
        </div>
        
        {/* Sport Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sports.map(sport => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedSport === sport
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sport === 'All' ? 'All' : sport.charAt(0).toUpperCase() + sport.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Scores Feed */}
      <div className="p-4 space-y-4">
        {filteredScores.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-gray-500">No upcoming games.</p>
            <p className="text-sm text-gray-400 mt-2">Check back soon!</p>
          </div>
        ) : (
          filteredScores.map(score => (
            <div 
              key={score.id} 
              onClick={() => setSelectedGame(score)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:border-accent transition-colors active:scale-[0.98]"
            >
              {/* Header */}
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">
                  {score.league}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(score.status)}`}>
                  {score.status}
                </span>
              </div>
              
              {/* Teams */}
              <div className="p-4">
                {/* Home Team */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {score.thumb_home && (
                      <img 
                        src={score.thumb_home} 
                        alt={score.home_team}
                        className="w-8 h-8 object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    <span className="font-medium">{score.home_team}</span>
                  </div>
                  <span className="text-xl font-bold">
                    {score.home_score !== null ? score.home_score : '-'}
                  </span>
                </div>
                
                {/* Away Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {score.thumb_away && (
                      <img 
                        src={score.thumb_away} 
                        alt={score.away_team}
                        className="w-8 h-8 object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    <span className="font-medium">{score.away_team}</span>
                  </div>
                  <span className="text-xl font-bold">
                    {score.away_score !== null ? score.away_score : '-'}
                  </span>
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                <span>{formatDate(score.date_event)}</span>
                <span>{formatTime(score.date_event)}</span>
              </div>
            </div>
          ))}
        )}
      </div>

      <GameDetailModal 
        game={selectedGame}
        isOpen={!!selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </div>
  )
}
