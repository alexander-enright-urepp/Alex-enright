'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

const ANSWERS = [
  'It is certain',
  'It is decidedly so',
  'Without a doubt',
  'Yes definitely',
  'You may rely on it',
  'As I see it, yes',
  'Most likely',
  'Outlook good',
  'Yes',
  'Signs point to yes',
  'Reply hazy, try again',
  'Ask again later',
  'Better not tell you now',
  'Cannot predict now',
  'Concentrate and ask again',
  'Don\'t count on it',
  'My reply is no',
  'My sources say no',
  'Outlook not so good',
  'Very doubtful',
]

interface Magic8BallGameProps {
  onBack: () => void
}

export function Magic8BallGame({ onBack }: Magic8BallGameProps) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [hasAnswer, setHasAnswer] = useState(false)

  const shakeBall = () => {
    if (!question.trim()) return
    
    setIsShaking(true)
    setHasAnswer(false)
    
    setTimeout(() => {
      const randomAnswer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)]
      setAnswer(randomAnswer)
      setIsShaking(false)
      setHasAnswer(true)
    }, 1000)
  }

  const reset = () => {
    setQuestion('')
    setAnswer('')
    setHasAnswer(false)
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          ← Back
        </button>
        <h2 className="text-xl font-bold">🎱 Magic 8-Ball</h2>
      </div>

      <div className="max-w-md mx-auto">
        {!hasAnswer ? (
          <>
            <div className={`text-center mb-8 ${isShaking ? 'animate-pulse' : ''}`}>
              <div className="w-48 h-48 mx-auto bg-gray-900 rounded-full flex items-center justify-center shadow-2xl">
                <div className="w-32 h-32 bg-blue-900 rounded-full flex items-center justify-center border-4 border-blue-800">
                  {!isShaking ? (
                    <span className="text-4xl">8</span>
                  ) : (
                    <span className="text-2xl animate-bounce">🔮</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a yes/no question..."
                className="w-full p-4 border border-gray-300 rounded-xl text-center text-lg"
                disabled={isShaking}
              />
              <Button
                onClick={shakeBall}
                disabled={!question.trim() || isShaking}
                className="w-full"
                size="lg"
              >
                {isShaking ? 'Shaking...' : 'Shake the Ball'}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-48 h-48 mx-auto bg-gray-900 rounded-full flex items-center justify-center shadow-2xl mb-6">
              <div className="w-32 h-32 bg-blue-700 rounded-full flex items-center justify-center border-4 border-blue-600 p-4">
                <p className="text-white text-sm font-medium text-center">
                  {answer}
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 italic">"{question}"</p>
            
            <Button onClick={reset} className="w-full">
              Ask Another Question
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
