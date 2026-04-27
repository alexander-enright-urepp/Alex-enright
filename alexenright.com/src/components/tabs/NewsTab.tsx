'use client'

import { useState, useEffect } from 'react'
import { getNewsStoriesWithLikes, toggleLikeNews, trackNewsShare } from '@/app/actions/news'
import { Button } from '@/components/ui/Button'
import { getAnonId } from '@/lib/utils'
import type { NewsStory } from '@/types'
import { Share, Heart, ExternalLink, Clock, Newspaper } from 'lucide-react'

interface NewsWithLikes extends NewsStory {
  likes_count: number
  has_liked: boolean
}

export function NewsTab() {
  const [stories, setStories] = useState<NewsWithLikes[]>([])
  const [loading, setLoading] = useState(true)
  const [anonId, setAnonId] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-6 h-6 text-accent" />
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
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
                <a href={story.source_url} target="_blank" rel="noopener noreferrer">
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
                </a>
              )}
              
              <div className="p-4">
                {/* Meta */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="font-medium text-accent">{story.source}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
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
                  href={story.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
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
                      <Heart 
                        className={`w-5 h-5 ${story.has_liked ? 'fill-current' : ''}`} 
                      />
                      <span className="text-sm">{story.likes_count}</span>
                    </button>
                    
                    {/* Share Button */}
                    <button
                      onClick={() => handleShare(story, 'share')}
                      className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors"
                    >
                      <Share className="w-5 h-5" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                  
                  {/* Read More */}
                  <a
                    href={story.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-accent hover:underline"
                  >
                    Read
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
