'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { NewsStory } from '@/types'

interface NewsStorySheetProps {
  story: NewsStory | null
  isOpen: boolean
  onClose: () => void
}

export function NewsStorySheet({ story, isOpen, onClose }: NewsStorySheetProps) {
  if (!story) return null

  const handleReadFullStory = () => {
    // Open original URL in new tab
    window.open(story.source_url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={story.source}
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Image */}
        {story.image_url && (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={story.image_url} 
              alt={story.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-medium text-accent">{story.source}</span>
          <span>•</span>
          <span>{new Date(story.published_at).toLocaleDateString()}</span>
          {story.category && (
            <>
              <span>•</span>
              <span>{story.category}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="font-bold text-xl">{story.title}</h2>

        {/* Full Content */}
        {story.content ? (
          <div 
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ 
              __html: story.content 
            }}
          />
        ) : story.summary ? (
          <p className="text-gray-700">{story.summary}</p>
        ) : (
          <p className="text-gray-500 italic">No preview available for this story.</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          
          <button
            onClick={handleReadFullStory}
            className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors"
          >
            Read Full Story →
          </button>
        </div>

        {/* Share URL */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Share this story:</p>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={`https://alexenright.com/news/${story.id}`}
              readOnly
              className="flex-1 text-xs bg-white border rounded px-2 py-1 text-gray-600"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://alexenright.com/news/${story.id}`)
                alert('Link copied!')
              }}
              className="px-3 py-1 bg-accent text-white text-xs rounded hover:bg-accent-dark transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
