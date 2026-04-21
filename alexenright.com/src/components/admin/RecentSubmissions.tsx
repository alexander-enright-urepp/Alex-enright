'use client'

import { RecruiterSubmission } from '@/types'
import Link from 'next/link'

interface RecentSubmissionsProps {
  submissions: RecruiterSubmission[]
}

export function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Submissions</h2>
        <Link
          href="/admin/submissions"
          className="text-sm text-accent hover:underline"
        >
          View all →
        </Link>
      </div>
      
      {submissions.length === 0 ? (
        <p className="text-gray-500 text-sm">No submissions yet</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">{sub.name}</p>
                <p className="text-sm text-gray-500">{sub.email}</p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(sub.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
