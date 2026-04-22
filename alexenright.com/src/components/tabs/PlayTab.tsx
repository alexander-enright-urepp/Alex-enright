'use client'

import { useState } from 'react'
import { Game, GameType } from '@/types'
import { Button } from '@/components/ui/Button'
import { CoinFlipGame } from '@/components/games/CoinFlipGame'
import { DiceRollGame } from '@/components/games/DiceRollGame'
import { RPSGame } from '@/components/games/RPSGame'
import { TicTacToeGame } from '@/components/games/TicTacToeGame'
import { SnakeGame } from '@/components/games/SnakeGame'
import { Magic8BallGame } from '@/components/games/Magic8BallGame'
import { FortuneCookieGame } from '@/components/games/FortuneCookieGame'
import { HangmanGame } from '@/components/games/HangmanGame'
import { PremiumModal } from '@/components/games/PremiumModal'

const games: Game[] = [
  { id: 'coin-flip', name: 'Coin Flip', description: 'Heads or tails?', icon: '🪙', locked: false },
  { id: 'dice-roll', name: 'Dice Roll', description: 'Roll the dice', icon: '🎲', locked: false },
  { id: 'rps', name: 'Rock Paper Scissors', description: 'Classic game', icon: '✊', locked: false },
  { id: 'magic8ball', name: 'Magic 8-Ball', description: 'Ask a question', icon: '🎱', locked: false },
  { id: 'tic-tac-toe', name: 'Tic Tac Toe', description: 'Beat the AI', icon: '⭕', locked: true },
  { id: 'snake', name: 'Snake', description: 'Classic arcade', icon: '🐍', locked: true },
  { id: 'fortune-cookie', name: 'Fortune Cookie', description: 'Daily fortune', icon: '🥠', locked: true },
  { id: 'hangman', name: 'Hangman', description: 'Guess the word', icon: '🎭', locked: true },
]

// Premium games that share the same unlock
const PREMIUM_GAMES = ['tic-tac-toe', 'snake', 'fortune-cookie', 'hangman']

export function PlayTab() {
  const [activeGame, setActiveGame] = useState<GameType | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [selectedPremiumGame, setSelectedPremiumGame] = useState<Game | null>(null)
  const [unlockedGames, setUnlockedGames] = useState<Set<string>>(new Set())
  const [hasPremium, setHasPremium] = useState(false)

  const handleGameClick = (game: Game) => {
    // Check if premium is unlocked or if it's a free game
    const isPremiumGame = PREMIUM_GAMES.includes(game.id)
    
    if (isPremiumGame && !hasPremium) {
      setSelectedPremiumGame(game)
      setShowPremiumModal(true)
    } else {
      setActiveGame(game.id as GameType)
    }
  }

  const handlePremiumUnlock = () => {
    // Unlock all premium games at once
    setHasPremium(true)
    setUnlockedGames(new Set(PREMIUM_GAMES))
    setShowPremiumModal(false)
    setSelectedPremiumGame(null)
  }

  const renderGame = () => {
    switch (activeGame) {
      case 'coin-flip':
        return <CoinFlipGame onBack={() => setActiveGame(null)} />
      case 'dice-roll':
        return <DiceRollGame onBack={() => setActiveGame(null)} />
      case 'rps':
        return <RPSGame onBack={() => setActiveGame(null)} />
      case 'tic-tac-toe':
        return <TicTacToeGame onBack={() => setActiveGame(null)} />
      case 'snake':
        return <SnakeGame onBack={() => setActiveGame(null)} />
      case 'magic8ball':
        return <Magic8BallGame onBack={() => setActiveGame(null)} />
      case 'fortune-cookie':
        return <FortuneCookieGame onBack={() => setActiveGame(null)} />
      case 'hangman':
        return <HangmanGame onBack={() => setActiveGame(null)} />
      default:
        return null
    }
  }

  if (activeGame) {
    return (
      <>
        <div className="p-4">
          <div className="flex justify-center py-2">
            <img src="/LogoAEcircle.png" alt="AE Logo" className="w-10 h-10" />
          </div>
        </div>
        {renderGame()}
      </>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-center py-2">
        <img src="/LogoAEcircle.png" alt="AE Logo" className="w-10 h-10" />
      </div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Play</h1>
        <p className="text-gray-600 mt-1">Mini games to pass the time.</p>
        
        {/* Premium badge */}
        {hasPremium && (
          <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
            <span>⭐</span>
            <span>Premium Unlocked</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-2 gap-4">
        {games.map((game) => {
          const isPremium = PREMIUM_GAMES.includes(game.id)
          const isLocked = isPremium && !hasPremium
          
          return (
            <button
              key={game.id}
              onClick={() => handleGameClick(game)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all active:scale-95 ${
                isLocked
                  ? 'border-gray-200 bg-gray-50 opacity-70'
                  : 'border-gray-200 bg-white hover:border-accent hover:shadow-md'
              }`}
            >
              <div className="text-4xl mb-2">{game.icon}</div>
              <h3 className="font-semibold text-gray-900">{game.name}</h3>
              <p className="text-sm text-gray-500">{game.description}</p>
              {isPremium && !hasPremium && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full">⭐</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Premium info */}
      {!hasPremium && (
        <div className="mt-6 p-4 bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl">
          <h3 className="font-semibold text-gray-900 mb-1">⭐ Unlock Premium Games</h3>
          <p className="text-sm text-gray-600 mb-3">
            Get access to Tic Tac Toe, Snake, Fortune Cookie, Slot Machine, and Hangman!
          </p>
          <Button 
            onClick={() => {
              setSelectedPremiumGame(games.find(g => PREMIUM_GAMES.includes(g.id)) || null)
              setShowPremiumModal(true)
            }}
            className="w-full"
          >
            Unlock Premium - $2.99
          </Button>
        </div>
      )}

      {showPremiumModal && selectedPremiumGame && (
        <PremiumModal
          game={selectedPremiumGame}
          onClose={() => setShowPremiumModal(false)}
          onUnlock={handlePremiumUnlock}
          premiumGames={PREMIUM_GAMES}
        />
      )}
    </div>
  )
}
