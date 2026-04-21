'use client'

import { Game } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface PremiumModalProps {
  game: Game
  onClose: () => void
  onUnlock: () => void
}

export function PremiumModal({ game, onClose, onUnlock }: PremiumModalProps) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Premium Game"
    >
      <div className="text-center">
        <div className="text-6xl mb-4">{game.icon}</div>
        <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
        <p className="text-gray-600 mb-6">
          This is a premium game. Unlock it to play!
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-2">Unlock Premium Games</p>
          <p className="text-3xl font-bold">$2.99</p>
          <p className="text-xs text-gray-400 mt-1">One-time purchase</p>
        </div>

        <div className="space-y-2">
          <Button onClick={onUnlock} size="lg" className="w-full">
            Unlock Now
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full">
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Note: IAP integration with Capacitor coming soon.
          This is a demo modal.
        </p>
      </div>
    </Modal>
  )
}
