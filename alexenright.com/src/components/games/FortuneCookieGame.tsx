'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

const FORTUNES = [
  { message: 'A journey of a thousand miles begins with a single step.', luckyNumbers: '4, 17, 28' },
  { message: 'Your creativity is your greatest asset.', luckyNumbers: '7, 19, 33' },
  { message: 'Good things come to those who wait.', luckyNumbers: '2, 11, 25' },
  { message: 'Your hard work will pay off soon.', luckyNumbers: '9, 21, 36' },
  { message: 'An unexpected opportunity is coming your way.', luckyNumbers: '5, 14, 29' },
  { message: 'Trust your intuition on an important decision.', luckyNumbers: '3, 16, 31' },
  { message: 'A pleasant surprise awaits you.', luckyNumbers: '8, 22, 37' },
  { message: 'Your kindness will be rewarded.', luckyNumbers: '6, 18, 27' },
  { message: 'Success is in your future.', luckyNumbers: '1, 13, 26' },
  { message: 'New friendships will bring joy.', luckyNumbers: '10, 24, 38' },
  { message: 'A dream you have will come true.', luckyNumbers: '12, 23, 35' },
  { message: 'Your patience will be rewarded.', luckyNumbers: '15, 30, 42' },
  { message: 'Adventure awaits around the corner.', luckyNumbers: '20, 32, 44' },
  { message: 'Your talents will be recognized.', luckyNumbers: '17, 28, 41' },
  { message: 'Love is in the air.', luckyNumbers: '14, 27, 39' },
]

interface FortuneCookieGameProps {
  onBack: () => void
}

export function FortuneCookieGame({ onBack }: FortuneCookieGameProps) {
  const [isOpening, setIsOpening] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [fortune, setFortune] = useState<(typeof FORTUNES)[0] | null>(null)

  const openCookie = () => {
    setIsOpening(true)
    setIsOpen(false)
    
    setTimeout(() => {
      const randomFortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]
      setFortune(randomFortune)
      setIsOpening(false)
      setIsOpen(true)
    }, 1500)
  }

  const reset = () => {
    setIsOpen(false)
    setFortune(null)
    setIsOpening(false)
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          ← Back
        </button>
        <h2 className="text-xl font-bold">🥠 Fortune Cookie</h2>
      </div>

      <div className="max-w-md mx-auto text-center">
        {!isOpen ? (
          <>
            <div className="mb-8">
              <div 
                className={`text-8xl inline-block transition-transform duration-300 ${
                  isOpening ? 'animate-bounce' : 'hover:scale-110 cursor-pointer'
                }`}
                onClick={!isOpening ? openCookie : undefined}
              >
                🥠
              </div>
              {isOpening && (
                <p className="mt-4 text-gray-600 animate-pulse">Opening...</p>
              )}
            </div>

            <Button
              onClick={openCookie}
              disabled={isOpening}
              className="w-full"
              size="lg"
            >
              {isOpening ? 'Opening...' : 'Crack Open Cookie'}
            </Button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-6xl">🥠</div>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <p className="text-gray-800 text-lg font-medium mb-4">
                "{fortune?.message}"
              </p>
              <div className="border-t border-yellow-200 pt-4">
                <p className="text-sm text-gray-500">
                  Lucky Numbers: <span className="font-semibold text-accent">{fortune?.luckyNumbers}</span>
                </p>
              </div>
            </div>

            <Button onClick={reset} className="w-full">
              Open Another Cookie
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
