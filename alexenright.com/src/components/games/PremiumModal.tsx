'use client'

import { Game } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface PremiumModalProps {
  game: Game
  onClose: () => void
  onUnlock: () => void
  premiumGames?: string[]
}

export function PremiumModal({ game, onClose, onUnlock, premiumGames = [] }: PremiumModalProps) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="⭐ Premium Games"
    >
      <div className="text-center">
        <div className="text-6xl mb-4">{game.icon}</div>
        <h3 className="text-xl font-semibold mb-2">Unlock All Premium Games</h3>
        <p className="text-gray-600 mb-4">
          Get instant access to all premium games:
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">Tic Tac Toe</span>
          <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">Snake</span>
          <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">Fortune Cookie</span>
          <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">Slot Machine</span>
          <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">Hangman</span>
        </div>

        <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-4 mb-6">
          <p className="text-3xl font-bold text-accent">$2.99</p>
          <p className="text-xs text-gray-500 mt-1">One-time purchase • No subscriptions</p>
        </div>

        <div className="space-y-2">
          <Button onClick={onUnlock} size="lg" className="w-full">
            Unlock All Games
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full">
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Secure payment via Apple App Store.
        </p>
      </div>
    </Modal>
  )
}
