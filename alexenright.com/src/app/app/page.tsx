'use client'

import { useState } from 'react'
import type { TabType } from '@/types'
import { BottomNav } from '@/components/navigation/BottomNav'
import { PlayTab } from '@/components/tabs/PlayTab'
import { ScoresTab } from '@/components/tabs/ScoresTab'
import { CommunityTab } from '@/components/tabs/CommunityTab'
import { AboutTab } from '@/components/tabs/AboutTab'
import { NewsTab } from '@/components/tabs/NewsTab'

export default function AppPage() {
  const [activeTab, setActiveTab] = useState<TabType>('news')

  return (
    <main className="pb-20 min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'news' && <NewsTab />}
          {activeTab === 'play' && <PlayTab />}
          {activeTab === 'scores' && <ScoresTab />}
          {activeTab === 'community' && <CommunityTab />}
          {activeTab === 'about' && <AboutTab />}
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  )
}
