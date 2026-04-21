'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface DiceRollGameProps {
  onBack: () => void
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export function DiceRollGame({ onBack }: DiceRollGameProps) {
  const [dice, setDice] = useState<number[]>([1, 1])
  const [isRolling, setIsRolling] = useState(false)
  const [history, setHistory] = useState<number[][]>([])
  const [total, setTotal] = useState(2)

  const roll = () => {
    setIsRolling(true)
    
    const rollInterval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ])
    }, 100)

    setTimeout(() => {
      clearInterval(rollInterval)
      const finalDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]
      setDice(finalDice)
      setTotal(finalDice[0] + finalDice[1])
      setHistory(prev => [finalDice, ...prev].slice(0, 10))
      setIsRolling(false)
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

      <h1 className="text-2xl font-bold mb-6">Dice Roll</h1>

      <div className="flex flex-col items-center">
        <div className="flex gap-4 mb-6">
          {dice.map((die, i) => (
            <div
              key={i}
              className={`w-20 h-20 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center text-5xl ${
                isRolling ? 'animate-pulse' : ''
              }`}
            >
              {DICE_FACES[die - 1]}
            </div>
          ))}
        </div>

        {!isRolling && (
          <p className="text-2xl font-bold mb-4">Total: {total}</p>
        )}

        <Button
          onClick={roll}
          disabled={isRolling}
          size="lg"
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </Button>

        {history.length > 0 && (
          <div className="mt-8 w-full">
            <p className="text-sm text-gray-500 mb-2">History:</p>
            <div className="space-y-1">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span>{DICE_FACES[h[0] - 1]} {DICE_FACES[h[1] - 1]}</span>
                  <span className="text-gray-400">= {h[0] + h[1]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
