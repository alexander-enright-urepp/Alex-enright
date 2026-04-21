'use client'

import { useState } from 'react'
import { Game, GameType } from '@/types'
import { Button } from '@/components/ui/Button'
import { CoinFlipGame } from '@/components/games/CoinFlipGame'
import { DiceRollGame } from '@/components/games/DiceRollGame'
import { RPSGame } from '@/components/games/RPSGame'
import { TicTacToeGame } from '@/components/games/TicTacToeGame'
import { SnakeGame } from '@/components/games/SnakeGame'
import { PremiumModal } from '@/components/games/PremiumModal'

const games: Game[] = [
  { id: 'coin-flip', name: 'Coin Flip', description: 'Heads or tails?', icon: '🪙', locked: false },
  { id: 'dice-roll', name: 'Dice Roll', description: 'Roll the dice', icon: '🎲', locked: false },
  { id: 'rps', name: 'Rock Paper Scissors', description: 'Classic game', icon: '✊', locked: false },
  { id: 'tic-tac-toe', name: 'Tic Tac Toe', description: 'Beat the AI', icon: '⭕', locked: true },
  { id: 'snake', name: 'Snake', description: 'Classic arcade', icon: '🐍', locked: true },
]

export function PlayTab() {
  const [activeGame, setActiveGame] = useState<GameType | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [selectedPremiumGame, setSelectedPremiumGame] = useState<Game | null>(null)

  const handleGameClick = (game: Game) => {
    if (game.locked) {
      setSelectedPremiumGame(game)
      setShowPremiumModal(true)
    } else {
      setActiveGame(game.id)
    }
  }

  const handlePremiumUnlock = () => {
    // Stub for IAP - will integrate with Capacitor later
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
      </header>

      <div className="grid grid-cols-2 gap-4">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => handleGameClick(game)}
            className={`relative p-4 rounded-xl border-2 text-left transition-all active:scale-95 ${
              game.locked
                ? 'border-gray-200 bg-gray-50 opacity-70'
                : 'border-gray-200 bg-white hover:border-accent hover:shadow-md'
            }`}
          >
            <div className="text-4xl mb-2">{game.icon}</div>
            <h3 className="font-semibold text-gray-900">{game.name}</h3>
            <p className="text-sm text-gray-500">{game.description}</p>
            {game.locked && (
              <div className="absolute top-2 right-2 text-lg">🔒</div>
            )}
          </button>
        ))}
      </div>

      {showPremiumModal && selectedPremiumGame && (
        <PremiumModal
          game={selectedPremiumGame}
          onClose={() => setShowPremiumModal(false)}
          onUnlock={handlePremiumUnlock}
        />
      )}
    </div>
  )
}
