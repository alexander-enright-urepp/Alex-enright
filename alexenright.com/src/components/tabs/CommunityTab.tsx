'use client'

import { useState, useEffect, useRef } from 'react'
import { CommunityPost, JobListing } from '@/types'
import { getCommunityPosts, createCommunityPost, getJobListings, submitJobListing } from '@/app/actions/community'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatRelativeDate } from '@/lib/utils'
import Image from 'next/image'

type TabView = 'posts' | 'jobs' | 'submit-job'

export function CommunityTab() {
  const [activeView, setActiveView] = useState<TabView>('posts')
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
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
      setSubmitStatus({ type: 'success', message: 'Post published!' })
      e.currentTarget.reset()
      clearImage()
      await loadData() // Refresh posts
      setTimeout(() => setSubmitStatus(null), 3000)
    } else {
      setSubmitStatus({ type: 'error', message: result.error || 'Failed to post' })
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
      {/* Logo Header */}
      <div className="flex justify-center py-4">
        <img src="/LogoAEcircle.png" alt="AE Logo" className="w-12 h-12" />
      </div>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community</h1>
        <p className="text-gray-600 mt-1">Connect with others.</p>
      </header>

      {/* Sub-nav */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'posts', label: 'Posts' },
          { id: 'jobs', label: 'Jobs' },
          { id: 'submit-job', label: 'Post a Job' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as TabView)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeView === tab.id
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts View */}
      {activeView === 'posts' && (
        <div className="space-y-4">
          <form onSubmit={handlePostSubmit} className="mb-6">
            <Textarea
              name="content"
              placeholder="What's on your mind?"
              rows={3}
              maxLength={500}
            />
            
            {/* Image Upload */}
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
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Add Photo</span>
                </button>
              )}
            </div>
            
            {submitStatus && activeView === 'posts' && (
              <div
                className={`p-3 rounded-lg text-sm mt-2 ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {submitStatus.message}
              </div>
            )}
            
            <Button type="submit" className="mt-3 w-full">
              Post
            </Button>
          </form>

          {posts.map((post: any) => (
            <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-4">
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="w-full h-64 object-cover rounded-lg mb-3"
                />
              )}
              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
              <span className="text-sm text-gray-500 mt-2 block">
                {formatRelativeDate(post.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Jobs View */}
      {activeView === 'jobs' && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No jobs posted yet.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-accent font-medium">{job.company}</p>
                <p className="text-gray-600 text-sm">{job.location}</p>
                {job.salary_range && (
                  <p className="text-green-600 text-sm font-medium">{job.salary_range}</p>
                )}
                <p className="text-gray-700 mt-2 text-sm">{job.description}</p>
                {job.apply_url && (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-accent font-medium hover:underline"
                  >
                    Apply →
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Submit Job View */}
      {activeView === 'submit-job' && (
        <form onSubmit={handleJobSubmit} className="space-y-4">
          <Input name="title" label="Job Title *" placeholder="Senior Developer" required />
          <Input name="company" label="Company *" placeholder="Acme Inc" required />
          <Input name="location" label="Location *" placeholder="Remote / NYC" required />
          <Input name="salaryRange" label="Salary Range" placeholder="$100k - $150k" />
          <Textarea
            name="description"
            label="Description *"
            placeholder="Describe the role..."
            rows={4}
            required
          />
          <Input name="applyUrl" type="url" label="Application URL" placeholder="https://..." />

          {submitStatus && (
            <div
              className={`p-4 rounded-lg ${
                submitStatus.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full">
            Submit for Approval
          </Button>
        </form>
      )}
    </div>
  )
}
