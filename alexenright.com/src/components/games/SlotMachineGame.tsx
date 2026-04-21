'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

const SYMBOLS = ['🍒', '🍋', '💎', '7️⃣', '🎰', '⭐']

interface SlotMachineGameProps {
  onBack: () => void
}

export function SlotMachineGame({ onBack }: SlotMachineGameProps) {
  const [reels, setReels] = useState(['🎰', '🎰', '🎰'])
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState('')
  const [credits, setCredits] = useState(100)
  const [win, setWin] = useState(false)

  const spin = () => {
    if (credits < 10 || isSpinning) return
    
    setCredits(c => c - 10)
    setIsSpinning(true)
    setResult('')
    setWin(false)

    // Spin animation
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ])
    }, 100)

    // Stop after 2 seconds
    setTimeout(() => {
      clearInterval(interval)
      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]
      setReels(finalReels)
      setIsSpinning(false)
      checkWin(finalReels)
    }, 2000)
  }

  const checkWin = (finalReels: string[]) => {
    if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
      // Jackpot - all 3 match
      const payout = finalReels[0] === '7️⃣' ? 100 : 50
      setCredits(c => c + payout)
      setResult(`JACKPOT! +${payout} credits`)
      setWin(true)
    } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
      // 2 match
      setCredits(c => c + 20)
      setResult('Nice! +20 credits')
      setWin(true)
    } else {
      setResult('Try again!')
    }
  }

  const addCredits = () => {
    setCredits(100)
    setResult('')
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          ← Back
        </button>
        <h2 className="text-xl font-bold">🎰 Slot Machine</h2>
      </div>

      <div className="max-w-md mx-auto">
        <div className="text-center mb-4">
          <p className="text-lg font-semibold">
            Credits: <span className="text-accent">{credits}</span>
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex justify-center gap-2">
            {reels.map((symbol, i) => (
              <div
                key={i}
                className={`w-20 h-24 bg-white rounded-xl flex items-center justify-center text-4xl ${
                  isSpinning ? 'animate-pulse' : ''
                }`}
              >
                {symbol}
              </div>
            ))}
          </div>
        </div>

        {result && (
          <div className={`text-center p-4 rounded-xl mb-4 ${
            win ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
          }`}>
            <p className="text-xl font-bold">{result}</p>
          </div>
        )}

        <div className="flex gap-3"
003e
          <Button
            onClick={spin}
            disabled={isSpinning || credits < 10}
            className="flex-1"
            size="lg"
          >
            {isSpinning ? 'Spinning...' : 'SPIN (-10)'}
          </Button>
          
          <Button
            onClick={addCredits}
            variant="secondary"
            className="px-4"
          >
            +100
          </Button>
        </div>

        {credits < 10 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Not enough credits! Click +100 to add more.
          </p>
        )}
      </div>
    </div>
  )
}
