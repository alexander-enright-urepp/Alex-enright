'use client'

import { useState } from 'react'
import { BottomNav } from '@/components/navigation/BottomNav'
import { RecruiterTab } from '@/components/tabs/RecruiterTab'
import { PlayTab } from '@/components/tabs/PlayTab'
import { DailyTab } from '@/components/tabs/DailyTab'
import { CommunityTab } from '@/components/tabs/CommunityTab'
import { AboutTab } from '@/components/tabs/AboutTab'
import { NewsTab } from '@/components/tabs/NewsTab'
import { Modal } from '@/components/ui/Modal'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('agent')
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)

  const handleExploreApp = () => {
    setActiveTab('agent')
    setShowWelcomeModal(false)
  }

  const handleHireAlex = () => {
    setActiveTab('about')
    setShowWelcomeModal(false)
  }

  return (
    <main className="pb-20 min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'agent' && <RecruiterTab />}
          {activeTab === 'play' && <PlayTab />}
          {activeTab === 'daily' && <DailyTab />}
          {activeTab === 'community' && <CommunityTab />}
          {activeTab === 'about' && <AboutTab />}
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Welcome Modal */}
      <Modal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        title=""
      >
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Logo */}
          <img 
            src="/LogoAEcircle.png" 
            alt="AE Logo" 
            className="w-24 h-24"
          />
          
          {/* Subtitle */}
          <div className="text-center px-4">
            <p className="text-gray-700 text-base">
              Welcome to Alex Enright Inc, we strive to help our community grow and be a better place.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              We donate 10% of all revenue to help people experiencing homelessness.
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleExploreApp}
              className="w-full py-4 px-6 bg-accent text-white rounded-full font-semibold text-lg hover:bg-accent-dark transition-colors"
            >
              Explore App
            </button>
            
            <button
              onClick={handleHireAlex}
              className="w-full py-4 px-6 bg-accent text-white rounded-full font-semibold text-lg hover:bg-accent-dark transition-colors"
            >
              Hire Alex
            </button>
          </div>
        </div>
      </Modal>
    </main>
  )
}
