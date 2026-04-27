'use client'

import { useState, useEffect, useRef } from 'react'
import { JobListing, DailyPost } from '@/types'
import { getJobListings, submitJobListing } from '@/app/actions/community'
import { getDailyPosts, getDailyPostsWithLikes, toggleLikePost } from '@/app/actions/daily'
import { getAllJobs } from '@/app/actions/jobs-himalayas'
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
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [showJobDetailModal, setShowJobDetailModal] = useState(false)
  const [showJobApplyModal, setShowJobApplyModal] = useState(false)
  const [jobApplyStatus, setJobApplyStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    setIsLoading(true)
    try {
      const jobsData = await getAllJobs()
      console.log('Loaded jobs:', jobsData)
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
                {/* Source Badge */}
                {job.source === 'himalayas' && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mb-2">
                    From Himalayas.app
                  </span>
                )}
                {job.source === 'alexenright' && (
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mb-2">
                    Approved
                  </span>
                )}
                
                {/* Company Logo */}
                {job.company_logo && (
                  <img 
                    src={job.company_logo} 
                    alt={job.company}
                    className="w-12 h-12 object-contain mb-2 rounded"
                  />
                )}
                
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-accent font-medium">{job.company}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span>{job.location}</span>
                  {job.employment_type && <>
                    <span>•</span>
                    <span>{job.employment_type}</span>
                  </>}
                </div>
                
                {job.salary_range && <p className="text-green-600 text-sm font-medium mt-2">{job.salary_range}</p>}
                {job.seniority && <p className="text-blue-600 text-xs mt-1">{job.seniority}</p>}
                
                <p className="text-gray-700 mt-2 text-sm line-clamp-3">{job.description}</p>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setSelectedJob(job)
                      setShowJobDetailModal(true)
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                  
                  {job.source === 'alexenright' ? (
                    <button
                      onClick={() => {
                        setSelectedJob(job)
                        setShowJobApplyModal(true)
                      }}
                      className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors"
                    >
                      Apply
                    </button>
                  ) : job.apply_url ? (
                    <a 
                      href={job.apply_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      Apply →
                    </a>
                  ) : null}
                </div>
                
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

      {/* Job Detail Modal */}
      <JobDetailModal 
        job={selectedJob}
        isOpen={showJobDetailModal}
        onClose={() => setShowJobDetailModal(false)}
        onApply={() => setShowJobApplyModal(true)}
      />

      {/* Job Application Modal */}
      <JobApplicationModal
        job={selectedJob}
        isOpen={showJobApplyModal}
        onClose={() => setShowJobApplyModal(false)}
        onSubmit={() => {
          setShowJobApplyModal(false)
          setShowJobSuccessModal(true)
        }}
      />
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
      const result = await submitContactForm({
        type: serviceType,
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        budget: formData.get('budget') as string || '',
        message: formData.get('details') as string || ''
      })
      
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
  const [posts, setPosts] = useState<any[]>([])
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

// Job Detail Modal Component
function JobDetailModal({ job, isOpen, onClose, onApply }: { job: any; isOpen: boolean; onClose: () => void; onApply: () => void }) {
  if (!job) return null
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job.title}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Source Badge */}
        {job.source === 'himalayas' && (
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            From Himalayas.app
          </span>
        )}
        {job.source === 'alexenright' && (
          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            Approved
          </span>
        )}
        
        {/* Company Logo */}
        {job.company_logo && (
          <img 
            src={job.company_logo} 
            alt={job.company}
            className="w-16 h-16 object-contain rounded"
          />
        )}
        
        <div>
          <p className="text-accent font-medium">{job.company}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{job.location}</span>
            {job.employment_type && <>
              <span>•</span>
              <span>{job.employment_type}</span>
            </>}
          </div>
        </div>
        
        {job.salary_range && (
          <p className="text-green-600 font-medium">{job.salary_range}</p>
        )}
        
        {job.seniority && (
          <p className="text-blue-600 text-sm">{job.seniority}</p>
        )}
        
        <div className="prose prose-sm max-w-none">
          <h4 className="font-semibold text-sm">Description</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {job.description?.replace(/<[^>]*>/g, '') || 'No description available'}
          </p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          
          {job.source === 'alexenright' ? (
            <button
              onClick={() => {
                onClose()
                onApply() // Open apply modal
              }}
              className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors"
            >
              Apply
            </button>
          ) : job.apply_url ? (
            <a 
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Apply →
            </a>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}

// Job Application Modal Component
function JobApplicationModal({ 
  job, 
  isOpen, 
  onClose,
  onSubmit
}: { 
  job: any; 
  isOpen: boolean; 
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    const formData = new FormData(e.currentTarget)
    
    let resumeUrl = null
    
    // Upload resume file if selected
    if (resumeFile) {
      try {
        const supabase = (await import('@/lib/supabase/client')).createClient()
        const fileExt = resumeFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile)
        
        if (uploadError) {
          console.error('Resume upload error:', uploadError)
          setStatus({ type: 'error', message: 'Failed to upload resume. Please try again.' })
          setIsSubmitting(false)
          return
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName)
        
        resumeUrl = publicUrl
      } catch (err) {
        console.error('Resume upload exception:', err)
        setStatus({ type: 'error', message: 'Failed to upload resume. Please try again.' })
        setIsSubmitting(false)
        return
      }
    }
    
    // Add job details to the message
    const jobDetails = `\n\n---\nApplying for: ${job?.title} at ${job?.company}\nLocation: ${job?.location}`
    const message = (formData.get('message') as string) + jobDetails

    try {
      const result = await submitContactForm({
        type: 'job_application',
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        budget: '', // not used for job applications
        message: message,
        job_title: job?.title,
        job_company: job?.company,
        resume_url: resumeUrl || undefined
      })
      
      if (result.success) {
        setStatus({ type: 'success', message: 'Application submitted successfully!' })
        setTimeout(() => {
          onSubmit()
        }, 1500)
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to submit application' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' })
    }
    
    setIsSubmitting(false)
  }

  if (!job) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply: ${job.title}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Job Info */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-accent">{job.company}</p>
          <p className="text-xs text-gray-600">{job.title}</p>
          <p className="text-xs text-gray-500">{job.location}</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            name="name"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            placeholder="John Smith"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            placeholder="john@email.com"
          />
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter / Message</label>
          <textarea
            name="message"
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            placeholder="Tell us why you're a great fit for this role..."
          />
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF, DOC, DOCX)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-dark"
          />
          {resumeFile && (
            <p className="text-xs text-green-600 mt-1">Selected: {resumeFile.name}</p>
          )}
        </div>

        {/* Status */}
        {status && (
          <div className={`p-3 rounded-lg text-sm ${
            status.type === 'success' 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {status.message}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
