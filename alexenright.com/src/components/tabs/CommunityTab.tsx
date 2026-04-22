'use client'

import { useState, useEffect } from 'react'
import { JobListing } from '@/types'
import { getJobListings, submitJobListing } from '@/app/actions/community'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

type TabView = 'jobs' | 'submit-job'

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
    </div>
  )
}
