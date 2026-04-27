'use client'

import { useState, useEffect, useRef } from 'react'
import { JobListing, DailyPost } from '@/types'
import { getJobListings, submitJobListing } from '@/app/actions/community'
import { getDailyPosts, getDailyPostsWithLikes, toggleLikePost } from '@/app/actions/daily'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { submitContactForm } from '@/app/actions/contact'
import { getAnonId } from '@/lib/utils'

type TabView = 'jobs' | 'submit-job' | 'hire-alex' | 'daily'

export function CommunityTab() {
  const [activeView, setActiveView] = useState<TabView>('jobs')
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showJobSuccessModal, setShowJobSuccessModal] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    setIsLoading(true)
    try {
      const jobsData = await getJobListings()
      console.log('Loaded jobs:', jobsData) // Debug log
      setJobs(jobsData || [])
    } catch (error) {
      console.error('Error loading jobs:', error)
      setJobs([])
    }
    setIsLoading(false)
  }

  const handleJobSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitStatus(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await submitJobListing(formData)
    
    if (result.success) {
      setShowJobSuccessModal(true)
      e.currentTarget.reset()
    } else {
      setSubmitStatus({ type: 'error', message: result.error || 'Failed to submit job' })
    }
  }

  return (
    <div className="p-4">
      {/* Job Success Modal */}
      <Modal
        isOpen={showJobSuccessModal}
        onClose={() => {
          setShowJobSuccessModal(false)
          setActiveView('jobs')
          loadJobs() // Refresh jobs list
        }}
        title="Success!"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">Job Submitted Successfully!</p>
          <p className="text-gray-600 mt-2">Your job listing has been submitted for approval.</p>
          <button 
            onClick={() => {
              setShowJobSuccessModal(false)
              setActiveView('jobs')
              loadJobs()
            }}
            className="mt-6 w-full py-3 px-4 bg-accent text-white rounded-lg font-medium"
          >
            View Jobs
          </button>
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
          { id: 'jobs', label: 'Jobs' },
          { id: 'submit-job', label: 'Post a Job' },
          { id: 'hire-alex', label: 'Hire Alex' },
          { id: 'daily', label: 'Update' },
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

      {activeView === 'jobs' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No jobs available yet.</p>
              <p className="text-sm text-gray-400 mt-2">Be the first to post a job!</p>
            </div>
          ) : (
            jobs.map((job: any) => (
              <div key={job.id} className="bg-white rounded-xl border p-4">
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-accent font-medium">{job.company}</p>
                <p className="text-sm text-gray-600">{job.location}</p>
                {job.salary_range && <p className="text-green-600 text-sm font-medium">{job.salary_range}</p>}
                <p className="text-gray-700 mt-2 text-sm">{job.description}</p>
                {job.apply_url && (
                  <a 
                    href={job.apply_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-accent hover:underline text-sm font-medium"
                  >
                    Apply Now →
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Listed: {job.listing_date ? new Date(job.listing_date).toLocaleDateString() : 'N/A'}
                  {job.duration_start && ` | Duration: ${new Date(job.duration_start).toLocaleDateString()}`}
                </p>
              </div>
            ))
          )}
          <div className="pt-4 pb-2 text-center">
            <a 
              href="mailto:support@alexenright.com?subject=Report%20a%20Post"
              className="text-red-600 text-sm hover:underline"
            >
              Report a Post
            </a>
          </div>
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
            <label className="text-sm font-medium">Duration Start Date</label>
            <input
              type="date"
              name="durationStart"
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          {submitStatus && (
            <div className={`p-3 rounded-lg text-sm ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {submitStatus.message}
            </div>
          )}
          
          <Button type="submit" className="w-full">Submit for Approval</Button>
        </form>
      )}

      {activeView === 'hire-alex' && <HireAlexForm />}

      {activeView === 'daily' && <DailyFeed />}
    </div>
  )
}

// Hire Alex Form Component
function HireAlexForm() {
  const [serviceType, setServiceType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const services = [
    { value: 'job', label: 'Job Opportunity', icon: '💼' },
    { value: 'app', label: 'Build an App', icon: '📱' },
    { value: 'logo', label: 'Logo Design', icon: '🎨' },
    { value: 'creative', label: 'Creative Project', icon: '✨' },
    { value: 'call', label: 'Schedule a Call', icon: '📞' },
    { value: 'donate', label: 'Donate', icon: '❤️' },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await submitContactForm(formData)
      
      if (result.success) {
        setShowSuccessModal(true)
        e.currentTarget.reset()
        setServiceType('')
      } else {
        setStatus({ type: 'error', message: result.error || 'Something went wrong. Please try again.' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' })
    }
    
    setIsSubmitting(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service Type Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">What do you need? *</label>
          <div className="grid grid-cols-2 gap-2">
            {services.map((service) => (
              <button
                key={service.value}
                type="button"
                onClick={() => setServiceType(service.value)}
                className={`p-3 rounded-xl border text-center transition-colors ${
                  serviceType === service.value
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-gray-200 hover:border-accent/50'
                }`}
              >
                <div className="text-2xl mb-1">{service.icon}</div>
                <div className="text-sm font-medium">{service.label}</div>
              </button>
            ))}
          </div>
          <input type="hidden" name="service" value={serviceType} required />
        </div>

        <Input
          name="name"
          label="Your Name *"
          placeholder="John Smith"
          required
        />

        <Input
          name="email"
          type="email"
          label="Email *"
          placeholder="john@company.com"
          required
        />

        <Input
          name="budget"
          label="Budget (optional)"
          placeholder="$5,000 - $10,000"
        />

        <Textarea
          name="details"
          label="Project Details *"
          placeholder="Tell me about your project..."
          rows={4}
          required
        />

        {status?.type === 'error' && (
          <div className="p-4 rounded-lg bg-red-50 text-red-800">
            {status.message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          disabled={!serviceType}
        >
          Submit Request
        </Button>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
      >
        <div className="text-center py-6">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Request Submitted!
          </p>
          <p className="text-gray-600">
            I'll get back to you within 24 hours.
          </p>
          <Button
            onClick={() => setShowSuccessModal(false)}
            className="mt-6 w-full"
          >
            Close
          </Button>
        </div>
      </Modal>
    </>
  )
}

// Daily Feed Component
function DailyFeed() {
  const [posts, setPosts] = useState<DailyPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    try {
      const data = await getDailyPostsWithLikes()
      console.log('Daily posts fetched:', data)
      setPosts(data || [])
    } catch (err) {
      console.error('Error loading daily posts:', err)
      setPosts([])
    }
    setLoading(false)
  }

  async function handleLike(postId: string, hasLiked: boolean) {
    const result = await toggleLikePost(postId, hasLiked)
    if (result.success) {
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, has_liked: !hasLiked, likes_count: hasLiked ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      ))
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No updates yet.</p>
          <p className="text-sm text-gray-400 mt-2">Check back later!</p>
        </div>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold">
                AE
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Alex Enright</p>
                <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
              </div>
            </div>
            
            {/* DEBUG: Show raw post data */}
            {console.log('Post data:', post)}
            
            <h3 className="font-bold text-lg mb-2">{post.title}</h3>
            <p className="text-gray-800 mb-3 whitespace-pre-wrap break-words">{post.body || 'No content'}</p>
            
            {post.image_url && (
              <img 
                src={post.image_url} 
                alt="Post image"
                className="rounded-lg w-full mb-3"
              />
            )}
            
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleLike(post.id, post.has_liked)}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  post.has_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <svg 
                  className={`w-5 h-5 ${post.has_liked ? 'fill-current' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{post.likes_count}</span>
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  )
}
