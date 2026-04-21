'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

const WORDS = [
  'JAVASCRIPT', 'PYTHON', 'CODING', 'COMPUTER', 'PROGRAM', 'WEBSITE',
  'DATABASE', 'NETWORK', 'SOFTWARE', 'HARDWARE', 'INTERNET', 'DIGITAL',
  'ALGORITHM', 'FUNCTION', 'VARIABLE', 'BOOLEAN', 'INTEGER', 'STRING',
  'ARRAY', 'OBJECT', 'REACT', 'NEXT', 'VERCEL', 'GITHUB',
  'MOBILE', 'DESKTOP', 'SERVER', 'CLIENT', 'BROWSER', 'DOMAIN',
]

const MAX_GUESSES = 6

interface HangmanGameProps {
  onBack: () => void
}

export function HangmanGame({ onBack }: HangmanGameProps) {
  const [word, setWord] = useState('')
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [wrongGuesses, setWrongGuesses] = useState(0)

  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)]
    setWord(randomWord)
    setGuessedLetters(new Set())
    setGameStatus('playing')
    setWrongGuesses(0)
  }

  const guessLetter = (letter: string) => {
    if (gameStatus !== 'playing' || guessedLetters.has(letter)) return

    const newGuessed = new Set(guessedLetters)
    newGuessed.add(letter)
    setGuessedLetters(newGuessed)

    if (!word.includes(letter)) {
      const newWrong = wrongGuesses + 1
      setWrongGuesses(newWrong)
      if (newWrong >= MAX_GUESSES) {
        setGameStatus('lost')
      }
    } else {
      // Check if won
      const allLettersGuessed = word.split('').every(l => newGuessed.has(l))
      if (allLettersGuessed) {
        setGameStatus('won')
      }
    }
  }

  const displayWord = word.split('').map(letter => 
    guessedLetters.has(letter) ? letter : '_'
  ).join(' ')

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  // Simple hangman drawing
  const getHangmanDrawing = () => {
    const stages = [
      '', // 0 wrong
      '|\n|', // 1
      'O\n|', // 2
      'O\n|\n|', // 3
      'O\n/|\\n|', // 4
      'O\n/|\\n|\n/', // 5
      'O\n/|\\n|\n/ \\\n☠️', // 6 (lost)
    ]
    return stages[wrongGuesses] || stages[6]
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          ← Back
        </button>
        <h2 className="text-xl font-bold">🎭 Hangman</h2>
      </div>

      <div className="max-w-md mx-auto">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Guesses: {wrongGuesses}/{MAX_GUESSES}</p>
        </div>

        {/* Hangman Drawing */}
        <div className="bg-gray-100 rounded-xl p-4 mb-6 text-center">
          <pre className="text-2xl font-mono whitespace-pre">
            {getHangmanDrawing()}
          </pre>
        </div>

        {/* Word Display */}
        <div className="text-center mb-6">
          <p className="text-4xl font-mono tracking-widest">{displayWord}</p>
        </div>

        {/* Game Status */}
        {gameStatus === 'won' && (
          <div className="text-center p-4 bg-green-100 rounded-xl mb-4">
            <p className="text-xl font-bold text-green-800">🎉 You Won!</p>
          </div>
        )}
        {gameStatus === 'lost' && (
          <div className="text-center p-4 bg-red-100 rounded-xl mb-4">
            <p className="text-xl font-bold text-red-800">☠️ Game Over!</p>
            <p className="text-gray-600">The word was: <span className="font-bold">{word}</span></p>
          </div>
        )}

        {/* Alphabet */}
        {gameStatus === 'playing' ? (
          <div className="grid grid-cols-7 gap-2 mb-6">
            {alphabet.map(letter => {
              const isGuessed = guessedLetters.has(letter)
              const isCorrect = isGuessed && word.includes(letter)
              const isWrong = isGuessed && !word.includes(letter)
              
              return (
                <button
                  key={letter}
                  onClick={() => guessLetter(letter)}
                  disabled={isGuessed}
                  className={`p-2 rounded-lg font-bold ${
                    isCorrect
                      ? 'bg-green-200 text-green-800'
                      : isWrong
                      ? 'bg-red-200 text-red-800'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {letter}
                </button>
              )
            })}
          </div>
        ) : (
          <Button onClick={startNewGame} className="w-full">
            Play Again
          </Button>
        )}
      </div>
    </div>
  )
}
