'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [story, setStory] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  
  const storyId = params?.id as string

  useEffect(() => {
    if (storyId) {
      fetchStory()
    }
  }, [storyId])

  async function fetchStory() {
    try {
      const response = await fetch(`/api/news/${storyId}`)
      if (response.ok) {
        const data = await response.json()
        setStory(data)
      }
    } catch (error) {
      console.error('Error fetching story:', error)
    }
    setLoading(false)
  }

  const handleClose = () => {
    // Navigate back to main app
    router.push('/')
  }

  const handleReadFull = () => {
    if (story?.source_url) {
      window.open(story.source_url, '_blank', 'noopener,noreferrer')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Story not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Modal
        isOpen={true}
        onClose={handleClose}
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
          </div>

          {/* Title */}
          <h2 className="font-bold text-xl">{story.title}</h2>

          {/* Summary */}
          {story.summary ? (
            <p className="text-gray-700">{story.summary}</p>
          ) : (
            <p className="text-gray-500 italic">No preview available for this story.</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back to News
            </button>
            
            <button
              onClick={handleReadFull}
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
    </div>
  )
}
