'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface CoinFlipGameProps {
  onBack: () => void
}

export function CoinFlipGame({ onBack }: CoinFlipGameProps) {
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [history, setHistory] = useState<('heads' | 'tails')[]>([])

  const flip = () => {
    setIsFlipping(true)
    setResult(null)
    
    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? 'heads' : 'tails'
      setResult(outcome)
      setHistory((prev: ('heads' | 'tails')[]) => [outcome, ...prev].slice(0, 10) as ('heads' | 'tails')[])
      setIsFlipping(false)
    }, 1000)
  }

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Coin Flip</h1>

      <div className="flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-yellow-400 flex items-center justify-center text-6xl mb-6 transition-transform"
          style={{
            transform: isFlipping ? 'rotateY(720deg)' : 'rotateY(0deg)',
            transition: isFlipping ? 'transform 1s ease-out' : 'none',
          }}
        >
          {isFlipping ? '🪙' : result === 'heads' ? '👤' : result === 'tails' ? '🦅' : '🪙'}
        </div>

        {result && !isFlipping && (
          <p className="text-xl font-semibold capitalize mb-4">{result}!</p>
        )}

        <Button
          onClick={flip}
          disabled={isFlipping}
          size="lg"
        >
          {isFlipping ? 'Flipping...' : 'Flip Coin'}
        </Button>

        {history.length > 0 && (
          <div className="mt-8 w-full">
            <p className="text-sm text-gray-500 mb-2">History:</p>
            <div className="flex gap-2 flex-wrap">
              {history.map((h, i) => (
                <span key={i} className="text-2xl">
                  {h === 'heads' ? '👤' : '🦅'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
