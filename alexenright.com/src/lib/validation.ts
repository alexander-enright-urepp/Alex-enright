import { z } from 'zod'

// Recruiter Submission Schema
export const recruiterSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  jobType: z.string().optional(),
  location: z.string().optional(),
  remotePref: z.enum(['onsite', 'hybrid', 'remote']).optional(),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  note: z.string().optional(),
})

export type RecruiterSubmissionInput = z.infer<typeof recruiterSubmissionSchema>

// Job Listing Schema
export const jobListingSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  company: z.string().min(2, 'Company name is required'),
  location: z.string().min(2, 'Location is required'),
  salaryRange: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  applyUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
})

export type JobListingInput = z.infer<typeof jobListingSchema>

// Daily Post Schema
export const dailyPostSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  body: z.string().min(10, 'Body must be at least 10 characters'),
  imageUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
})

export type DailyPostInput = z.infer<typeof dailyPostSchema>

// Community Post Schema
export const communityPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(500, 'Max 500 characters'),
})

export type CommunityPostInput = z.infer<typeof communityPostSchema>

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>
