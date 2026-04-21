'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

type Choice = 'rock' | 'paper' | 'scissors'
type Result = 'win' | 'lose' | 'tie'

interface RPSGameProps {
  onBack: () => void
}

const CHOICES: Choice[] = ['rock', 'paper', 'scissors']
const EMOJIS: Record<Choice, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
}

export function RPSGame({ onBack }: RPSGameProps) {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null)
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [score, setScore] = useState({ wins: 0, losses: 0, ties: 0 })

  const play = (choice: Choice) => {
    const computer = CHOICES[Math.floor(Math.random() * 3)]
    setPlayerChoice(choice)
    setComputerChoice(computer)

    if (choice === computer) {
      setResult('tie')
      setScore(s => ({ ...s, ties: s.ties + 1 }))
    } else if (
      (choice === 'rock' && computer === 'scissors') ||
      (choice === 'paper' && computer === 'rock') ||
      (choice === 'scissors' && computer === 'paper')
    ) {
      setResult('win')
      setScore(s => ({ ...s, wins: s.wins + 1 }))
    } else {
      setResult('lose')
      setScore(s => ({ ...s, losses: s.losses + 1 }))
    }
  }

  const reset = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult(null)
  }

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Rock Paper Scissors</h1>

      <div className="flex justify-center gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">You</p>
          <p className="text-3xl font-bold">{score.wins}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Ties</p>
          <p className="text-3xl font-bold">{score.ties}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Computer</p>
          <p className="text-3xl font-bold">{score.losses}</p>
        </div>
      </div>

      {result && (
        <div className="text-center mb-6">
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-center">
              <div className="text-6xl">{EMOJIS[playerChoice!]}</div>
            </div>
            <div className="text-center">
              <div className="text-6xl">{EMOJIS[computerChoice!]}</div>
            </div>
          </div>
          <p className={`text-xl font-bold ${
            result === 'win' ? 'text-green-600' :
            result === 'lose' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {result === 'win' ? 'You Win!' :
             result === 'lose' ? 'You Lose!' : "It's a Tie!"}
          </p>
          <button
            onClick={reset}
            className="mt-4 text-accent font-medium hover:underline"
          >
            Play Again
          </button>
        </div>
      )}

      {!result && (
        <div className="grid grid-cols-3 gap-3">
          {CHOICES.map((choice) => (
            <button
              key={choice}
              onClick={() => play(choice)}
              className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-accent active:scale-95 transition-all"
            >
              <div className="text-4xl mb-2">{EMOJIS[choice]}</div>
              <p className="text-sm font-medium capitalize">{choice}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
