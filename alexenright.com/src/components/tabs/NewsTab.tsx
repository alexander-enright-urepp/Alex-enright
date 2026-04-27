'use client'

import { useState, useEffect } from 'react'
import { getNewsStoriesWithLikes, toggleLikeNews, trackNewsShare } from '@/app/actions/news'
import { Button } from '@/components/ui/Button'
import { getAnonId } from '@/lib/utils'
import { NewsStorySheet } from '@/components/NewsStorySheet'
import type { NewsStory } from '@/types'

// Local interface to ensure proper typing
interface NewsWithLikes {
  id: string
  title: string
  summary: string | null
  content: string | null
  source: string
  source_url: string
  image_url: string | null
  published_at: string
  category: string | null
  author: string | null
  created_at: string
  updated_at: string
  api_source: string
  likes_count: number
  has_liked: boolean
}

// Inline SVG Icons
const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
)

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg className={`w-5 h-5 ${filled ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const NewspaperIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
  </svg>
)

export function NewsTab() {
  const [stories, setStories] = useState<NewsWithLikes[]>([])
  const [loading, setLoading] = useState(true)
  const [anonId, setAnonId] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStory, setSelectedStory] = useState<NewsStory | null>(null)
  const [showStorySheet, setShowStorySheet] = useState(false)

  useEffect(() => {
    const id = getAnonId()
    setAnonId(id)
    loadNews()
  }, [])

  async function loadNews() {
    setLoading(true)
    const data = await getNewsStoriesWithLikes()
    // Update has_liked based on current anonId
    const storiesWithUserLikes = await Promise.all(
      data.map(async (story) => {
        const supabase = (await import('@/lib/supabase/client')).createClient()
        const { data: like } = await supabase
          .from('news_likes')
          .select('*')
          .eq('news_id', story.id)
          .eq('anon_id', getAnonId())
          .single()
        return { ...story, has_liked: !!like }
      })
    )
    setStories(storiesWithUserLikes)
    setLoading(false)
  }

  async function handleLike(story: NewsWithLikes) {
    const result = await toggleLikeNews(story.id, story.has_liked, anonId)
    if (result.success) {
      setStories(stories.map(s => 
        s.id === story.id 
          ? { 
              ...s, 
              has_liked: !s.has_liked,
              likes_count: s.has_liked ? s.likes_count - 1 : s.likes_count + 1
            }
          : s
      ))
    }
  }

  async function handleShare(story: NewsWithLikes, platform: string) {
    const shareData = {
      title: story.title,
      text: story.summary || story.title,
      url: story.source_url
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        await trackNewsShare(story.id, 'native')
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`)
      await trackNewsShare(story.id, 'clipboard')
      alert('Link copied to clipboard!')
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const categories = ['All', 'Tech', 'Business', 'Science', 'Sports', 'Entertainment']
  
  const filteredStories = selectedCategory === 'All' 
    ? stories 
    : stories.filter(s => s.category?.toLowerCase() === selectedCategory.toLowerCase())

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Logo Header */}
      <div className="flex justify-center py-4 bg-white">
        <img src="/LogoAEcircle.png" alt="AE Logo" className="w-12 h-12" />
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <NewspaperIcon className="w-6 h-6 text-accent" />
          <h1 className="text-xl font-bold">News</h1>
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Feed */}
      <div className="p-4 space-y-4">
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <NewspaperIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No news stories yet.</p>
            <p className="text-sm text-gray-400 mt-2">Check back soon!</p>
          </div>
        ) : (
          filteredStories.map(story => (
            <article 
              key={story.id} 
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              {story.image_url && (
                <button
                  onClick={() => {
                    setSelectedStory(story)
                    setShowStorySheet(true)
                  }}
                  className="w-full block"
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <img 
                      src={story.image_url} 
                      alt={story.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                </button>
              )}
              
              <div className="p-4">
                {/* Meta */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="font-medium text-accent">{story.source}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ClockIcon />
                    {formatDate(story.published_at)}
                  </span>
                  {story.category && (
                    <>
                      <span>•</span>
                      <span>{story.category}</span>
                    </>
                  )}
                </div>
                
                {/* Title */}
                <a 
                  href={`/news/${story.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    setSelectedStory(story)
                    setShowStorySheet(true)
                  }}
                  className="block group"
                >
                  <h2 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors mb-2">
                    {story.title}
                  </h2>
                </a>
                
                {/* Summary */}
                {story.summary && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{story.summary}</p>
                )}
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    {/* Like Button */}
                    <button
                      onClick={() => handleLike(story)}
                      className={`flex items-center gap-2 transition-colors ${
                        story.has_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <HeartIcon filled={story.has_liked} />
                      <span className="text-sm">{story.likes_count}</span>
                    </button>
                    
                    {/* Share Button */}
                    <button
                      onClick={() => handleShare(story, 'share')}
                      className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors"
                    >
                      <ShareIcon />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                  
                  {/* Read More - opens sheet */}
                  <button
                    onClick={() => {
                      setSelectedStory(story)
                      setShowStorySheet(true)
                    }}
                    className="flex items-center gap-1 text-sm text-accent hover:underline"
                  >
                    Read
                    <ExternalLinkIcon />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
      
      {/* News Story Sheet */}
      <NewsStorySheet 
        story={selectedStory}
        isOpen={showStorySheet}
        onClose={() => setShowStorySheet(false)}
      />
    </div>
  )
}
