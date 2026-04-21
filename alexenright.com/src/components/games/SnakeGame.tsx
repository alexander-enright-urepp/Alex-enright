'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'

interface SnakeGameProps {
  onBack: () => void
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
interface Position { x: number; y: number }

const GRID_SIZE = 15
const INITIAL_SPEED = 150

export function SnakeGame({ onBack }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }])
  const [food, setFood] = useState<Position>({ x: 5, y: 5 })
  const [direction, setDirection] = useState<Direction>('RIGHT')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  const reset = () => {
    const initialSnake = [{ x: 7, y: 7 }]
    setSnake(initialSnake)
    setFood(generateFood(initialSnake))
    setDirection('RIGHT')
    setIsPlaying(false)
    setIsGameOver(false)
    setScore(0)
  }

  const start = () => {
    setIsPlaying(true)
    setIsGameOver(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP')
          break
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN')
          break
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT')
          break
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, isGameOver, direction])

  useEffect(() => {
    if (!isPlaying || isGameOver) return

    const gameLoop = setInterval(() => {
      setSnake(currentSnake => {
        const head = currentSnake[0]
        let newHead: Position

        switch (direction) {
          case 'UP':
            newHead = { x: head.x, y: head.y - 1 }
            break
          case 'DOWN':
            newHead = { x: head.x, y: head.y + 1 }
            break
          case 'LEFT':
            newHead = { x: head.x - 1, y: head.y }
            break
          case 'RIGHT':
            newHead = { x: head.x + 1, y: head.y }
            break
        }

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setIsGameOver(true)
          setIsPlaying(false)
          setHighScore(s => Math.max(s, score))
          return currentSnake
        }

        const newSnake = [newHead, ...currentSnake]

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10)
          setFood(generateFood(newSnake))
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, INITIAL_SPEED - Math.min(score, 100))

    return () => clearInterval(gameLoop)
  }, [isPlaying, isGameOver, direction, food, score, generateFood])

  const handleSwipe = (dir: Direction) => {
    if (!isPlaying || isGameOver) return
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT'
    }
    if (direction !== opposites[dir]) {
      setDirection(dir)
    }
  }

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Snake</h1>

      <div className="flex justify-between mb-2">
        <span className="text-gray-600">Score: {score}</span>
        <span className="text-gray-600">Best: {highScore}</span>
      </div>

      <div className="relative">
        {/* Game Board */}
        <div
          className="grid gap-px bg-gray-300 border-2 border-gray-400 rounded-lg overflow-hidden touch-none"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            aspectRatio: '1',
          }}
          onTouchStart={(e) => {
            const touch = e.touches[0]
            const target = e.currentTarget
            const rect = target.getBoundingClientRect()
            const x = touch.clientX - rect.left
            const y = touch.clientY - rect.top
            const centerX = rect.width / 2
            const centerY = rect.height / 2
            
            if (Math.abs(x - centerX) > Math.abs(y - centerY)) {
              handleSwipe(x > centerX ? 'RIGHT' : 'LEFT')
            } else {
              handleSwipe(y > centerY ? 'DOWN' : 'UP')
            }
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE
            const y = Math.floor(i / GRID_SIZE)
            const isSnake = snake.some(s => s.x === x && s.y === y)
            const isHead = snake[0].x === x && snake[0].y === y
            const isFood = food.x === x && food.y === y

            return (
              <div
                key={i}
                className={`${
                  isHead
                    ? 'bg-green-600'
                    : isSnake
                    ? 'bg-green-500'
                    : isFood
                    ? 'bg-red-500'
                    : 'bg-gray-100'
                }`}
              />
            )
          })}
        </div>

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-6 rounded-xl text-center">
              <p className="text-xl font-bold mb-2">Game Over!</p>
              <p className="text-gray-600 mb-4">Score: {score}</p>
              <Button onClick={reset}>Play Again</Button>
            </div>
          </div>
        )}

        {/* Start Overlay */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
            <Button onClick={start} size="lg">Start Game</Button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-1 mt-4 max-w-xs mx-auto">
        <div />
        <button
          onClick={() => handleSwipe('UP')}
          className="p-4 bg-gray-100 rounded-lg active:bg-gray-200 text-2xl"
        >
          ↑
        </button>
        <div />
        <button
          onClick={() => handleSwipe('LEFT')}
          className="p-4 bg-gray-100 rounded-lg active:bg-gray-200 text-2xl"
        >
          ←
        </button>
        <div />
        <button
          onClick={() => handleSwipe('RIGHT')}
          className="p-4 bg-gray-100 rounded-lg active:bg-gray-200 text-2xl"
        >
          →
        </button>
        <div />
        <button
          onClick={() => handleSwipe('DOWN')}
          className="p-4 bg-gray-100 rounded-lg active:bg-gray-200 text-2xl"
        >
          ↓
        </button>
        <div />
      </div>
    </div>
  )
}
