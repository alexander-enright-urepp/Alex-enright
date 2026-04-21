'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface TicTacToeGameProps {
  onBack: () => void
}

type Player = 'X' | 'O'
type Board = (Player | null)[]

export function TicTacToeGame({ onBack }: TicTacToeGameProps) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X')
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 })

  const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6], // diagonals
  ]

  const checkWinner = (board: Board): Player | 'draw' | null => {
    for (const [a, b, c] of winningLines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Player
      }
    }
    if (board.every(cell => cell !== null)) return 'draw'
    return null
  }

  const makeMove = (index: number) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      if (gameWinner === 'draw') {
        setScore(s => ({ ...s, draws: s.draws + 1 }))
      } else {
        setScore(s => ({ ...s, [gameWinner]: s[gameWinner as Player] + 1 }))
      }
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    }
  }

  const reset = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
  }

  // AI move
  useEffect(() => {
    if (currentPlayer === 'O' && !winner) {
      const timer = setTimeout(() => {
        const availableMoves = board
          .map((cell, i) => (cell === null ? i : null))
          .filter((i): i is number => i !== null)
        
        if (availableMoves.length > 0) {
          const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
          makeMove(randomMove)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, winner, board])

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Tic Tac Toe</h1>

      <div className="flex justify-center gap-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">You (X)</p>
          <p className="text-2xl font-bold">{score.X}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Draws</p>
          <p className="text-2xl font-bold">{score.draws}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">AI (O)</p>
          <p className="text-2xl font-bold">{score.O}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-4">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => makeMove(index)}
            disabled={!!cell || !!winner || currentPlayer === 'O'}
            className={`aspect-square bg-white border-2 rounded-xl text-4xl font-bold transition-all ${
              cell ? 'border-gray-300' : 'border-gray-200 hover:border-accent'
            } ${cell === 'X' ? 'text-accent' : 'text-blue-500'}`}
          >
            {cell}
          </button>
        ))}
      </div>

      {winner && (
        <div className="text-center mb-4">
          <p className="text-xl font-bold">
            {winner === 'draw' ? "It's a draw!" : winner === 'X' ? 'You win!' : 'AI wins!'}
          </p>
          <Button onClick={reset} variant="secondary" className="mt-2">New Game</Button>
        </div>
      )}

      {!winner && (
        <p className="text-center text-gray-600">
          {currentPlayer === 'X' ? 'Your turn' : "AI thinking..."}
        </p>
      )}
    </div>
  )
}
