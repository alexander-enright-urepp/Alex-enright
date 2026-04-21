'use client'

import { JobListing } from '@/types'
import Link from 'next/link'

interface PendingJobsProps {
  jobs: JobListing[]
  onUpdate?: () => void
}

export function PendingJobs({ jobs, onUpdate }: PendingJobsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Pending Jobs</h2>
        <Link
          href="/admin/jobs"
          className="text-sm text-accent hover:underline"
        >
          View all →
        </Link>
      </div>
      
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-sm">No pending jobs</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-gray-500">{job.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
