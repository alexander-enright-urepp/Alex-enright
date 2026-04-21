'use client'

import { useEffect, useState, useOptimistic, startTransition } from 'react'
import { DailyPostWithLikes } from '@/types'
import { getDailyPostsWithLikes, toggleLikePost } from '@/app/actions/daily'
import { formatRelativeDate, getAnonId } from '@/lib/utils'
import { Heart } from '@/components/icons/Heart'

export function DailyTab() {
  const [posts, setPosts] = useState<DailyPostWithLikes[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [optimisticPosts, addOptimisticPost] = useOptimistic(
    posts,
    (state, postId: string) =>
      state.map(post =>
        post.id === postId
          ? { ...post, has_liked: !post.has_liked, likes_count: post.has_liked ? post.likes_count - 1 : post.likes_count + 1 }
          : post
      )
  )

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    const data = await getDailyPostsWithLikes()
    setPosts(data)
    setIsLoading(false)
  }

  const handleLike = async (postId: string, currentLiked: boolean) => {
    startTransition(() => {
      addOptimisticPost(postId)
    })

    await toggleLikePost(postId, currentLiked)
    // Refresh to get accurate state
    loadPosts()
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-40" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Logo Header */}
      <div className="flex justify-center py-4">
        <img src="/LogoAEcircle.png" alt="AE Logo" className="w-12 h-12" />
      </div>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daily</h1>
        <p className="text-gray-600 mt-1">Thoughts, updates, and what I'm working on.</p>
      </header>

      <div className="space-y-4">
        {optimisticPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No posts yet. Check back soon!</p>
          </div>
        ) : (
          optimisticPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="font-semibold text-lg text-gray-900">{post.title}</h2>
                <p className="text-gray-600 mt-2 whitespace-pre-wrap">{post.body}</p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    {formatRelativeDate(post.created_at)}
                  </span>
                  
                  <button
                    onClick={() => handleLike(post.id, post.has_liked)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                      post.has_liked
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Heart filled={post.has_liked} className="w-5 h-5" />
                    <span className="font-medium">{post.likes_count}</span>
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
