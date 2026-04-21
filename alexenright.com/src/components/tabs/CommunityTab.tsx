'use client'

import { useState, useEffect, useRef } from 'react'
import { CommunityPost, JobListing } from '@/types'
import { getCommunityPosts, createCommunityPost, getJobListings, submitJobListing, likePost } from '@/app/actions/community'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatRelativeDate } from '@/lib/utils'
import { Heart } from '@/components/icons/Heart'

type TabView = 'posts' | 'jobs' | 'submit-job'

export function CommunityTab() {
  const [activeView, setActiveView] = useState<TabView>('posts')
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPostSuccessModal, setShowPostSuccessModal] = useState(false)
  const [anonId, setAnonId] = useState<string>('')
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const storedId = localStorage.getItem('anon_id')
    if (storedId) {
      setAnonId(storedId)
    } else {
      const newId = Math.random().toString(36).substring(2)
      localStorage.setItem('anon_id', newId)
      setAnonId(newId)
    }
    loadData()
  }, [])

  async function loadData() {
    const [postsData, jobsData] = await Promise.all([
      getCommunityPosts(),
      getJobListings(),
    ])
    setPosts(postsData)
    setJobs(jobsData)
    setIsLoading(false)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    if (selectedImage) {
      formData.append('image', selectedImage)
    }
    
    const result = await createCommunityPost(formData)
    
    if (result.success) {
      setShowPostSuccessModal(true)
      e.currentTarget.reset()
      clearImage()
      await loadData()
    } else {
      setSubmitStatus({ type: 'error', message: result.error || 'Failed to post' })
    }
  }

  const handleLike = async (postId: string, hasLiked: boolean) => {
    const result = await likePost(postId, anonId)
    if (result.success) {
      if (result.liked) {
        setLikedPosts(prev => new Set(prev).add(postId))
      } else {
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
      }
      await loadData()
    }
  }

  const handleJobSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const result = await submitJobListing(formData)
    
    if (result.success) {
      setSubmitStatus({ type: 'success', message: 'Job submitted for approval' })
      e.currentTarget.reset()
      setTimeout(() => setActiveView('jobs'), 2000)
    } else {
      setSubmitStatus({ type: 'error', message: result.error || 'Failed to submit job' })
    }
  }

  return (
    <div className="p-4">
      <Modal
        isOpen={showPostSuccessModal}
        onClose={() => setShowPostSuccessModal(false)}
        title="Success!"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">Your Post to the Community was Successful!</p>
          <Button onClick={() => setShowPostSuccessModal(false)} className="mt-6 w-full">
            Got it
          </Button>
        </div>
      </Modal>

      <div className="flex justify-center py-4">
        <img src="/LogoAEcircle.png" alt="AE Logo" className="w-12 h-12" />
      </div>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <p className="text-gray-600 mt-1">Connect with others.</p>
      </header>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'posts', label: 'Posts' },
          { id: 'jobs', label: 'Jobs' },
          { id: 'submit-job', label: 'Post a Job' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as TabView)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeView === tab.id
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeView === 'posts' && (
        <div className="space-y-4">
          <form onSubmit={handlePostSubmit} className="mb-6 space-y-3">
            <Textarea
              name="content"
              placeholder="What's on your mind?"
              rows={3}
              maxLength={500}
            />
            
            <div className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-gray-600"
                >
                  📷 Add Photo
                </button>
              )}
            </div>
            
            <Button type="submit" className="w-full">Post</Button>
          </form>

          {posts.map((post: any) => (
            <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {post.image_url && (
                <img src={post.image_url} className="w-full h-64 object-cover" />
              )}
              <div className="p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">{formatRelativeDate(post.created_at)}</span>
                  <button
                    onClick={() => handleLike(post.id, likedPosts.has(post.id))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                      likedPosts.has(post.id)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Heart filled={likedPosts.has(post.id)} className="w-5 h-5" />
                    <span className="font-medium">{post.likes_count || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'jobs' && (
        <div className="space-y-4">
          {jobs.map((job: any) => (
            <div key={job.id} className="bg-white rounded-xl border p-4">
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <p className="text-accent font-medium">{job.company}</p>
              <p className="text-sm text-gray-600">{job.location}</p>
              {job.salary_range && <p className="text-green-600 text-sm font-medium">{job.salary_range}</p>}
              <p className="text-gray-700 mt-2 text-sm">{job.description}</p>
              <p className="text-xs text-gray-400 mt-2">
                Listed: {new Date(job.listing_date).toLocaleDateString()} | Duration: {job.duration_start ? new Date(job.duration_start).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeView === 'submit-job' && (
        <form onSubmit={handleJobSubmit} className="space-y-4">
          <Input name="title" label="Job Title *" required />
          <Input name="company" label="Company *" required />
          <Input name="location" label="Location *" required />
          <Input name="salaryRange" label="Salary Range" />
          <Textarea name="description" label="Description *" rows={4} required />
          <Input name="applyUrl" type="url" label="Application URL" />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration Start Date *</label>
            <input
              type="date"
              name="durationStart"
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <Button type="submit" className="w-full">Submit for Approval</Button>
        </form>
      )}
    </div>
  )
}
