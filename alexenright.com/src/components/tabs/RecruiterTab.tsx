'use client'

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { submitRecruiterForm } from '@/app/actions/recruiter'
import { isValidPDF } from '@/lib/utils'

const remoteOptions = [
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
]

export function RecruiterTab() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && !isValidPDF(file)) {
      setErrors(prev => ({ ...prev, resume: 'Please upload a PDF under 10MB' }))
      setResumeFile(null)
      return
    }
    setResumeFile(file || null)
    setErrors(prev => {
      const { resume, ...rest } = prev
      return rest
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await submitRecruiterForm(formData, resumeFile || undefined)
      
      if (result.success) {
        setShowSuccessModal(true)
        formRef.current?.reset()
        setResumeFile(null)
      } else {
        setStatus({ type: 'error', message: result.error || 'Something went wrong. Please try again.' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' })
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="p-4">
      {/* Logo Header */}
      <div className="flex justify-center py-4">
        <img src="/LogoAEcircle.png" alt="AE Logo" className="w-12 h-12" />
      </div>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Let's Get To Work</h1>
        <p className="text-gray-600 mt-1">Submit your information and a recruiter will help you find an opportunity best suited for you.</p>
      </header>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          label="Full Name *"
          placeholder="John Smith"
          required
          error={errors.name}
        />

        <Input
          name="email"
          type="email"
          label="Email *"
          placeholder="john@company.com"
          required
          error={errors.email}
        />

        <Input
          name="phone"
          type="tel"
          label="Phone"
          placeholder="+1 (555) 123-4567"
          error={errors.phone}
        />

        <Input
          name="jobType"
          label="Job Type / Role"
          placeholder="Senior Frontend Developer"
          error={errors.jobType}
        />

        <Input
          name="location"
          label="Location"
          placeholder="San Francisco, CA"
          error={errors.location}
        />

        <Select
          name="remotePref"
          label="Remote Work Preference"
          options={remoteOptions}
          error={errors.remotePref}
        />

        <Input
          name="linkedinUrl"
          type="url"
          label="LinkedIn Profile"
          placeholder="https://linkedin.com/in/..."
          error={errors.linkedinUrl}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Resume (PDF only, max 10MB)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent-dark"
          />
          {resumeFile && (
            <p className="mt-1 text-sm text-green-600">
              ✓ {resumeFile.name}
            </p>
          )}
          {errors.resume && (
            <p className="mt-1.5 text-sm text-red-600">{errors.resume}</p>
          )}
        </div>

        <Textarea
          name="note"
          label="Additional Notes"
          placeholder="Tell me more about the opportunity..."
          rows={4}
          error={errors.note}
        />

        {status?.type === 'error' && (
          <div className="p-4 rounded-lg bg-red-50 text-red-800">
            {status.message}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          Submit
        </Button>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
      >
        <div className="text-center py-4">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-lg text-gray-800 mb-2">
            Thank you for submitting!
          </p>
          <p className="text-gray-600">
            We will be in touch with you shortly.
          </p>
          <Button
            onClick={() => setShowSuccessModal(false)}
            className="mt-6 w-full"
          >
            Close
          </Button>
        </div>
      </Modal>

      {/* Privacy Policy Link */}
      <footer className="mt-8 pt-6 border-t border-gray-200 text-center">
        <a 
          href="/privacy-policy" 
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Privacy Policy
        </a>
      </footer>
    </div>
  )
}
