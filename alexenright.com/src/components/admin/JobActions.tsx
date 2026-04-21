'use client'

import { approveJob, rejectJob } from '@/app/actions/admin'

export function ApproveButton({ jobId }: { jobId: string }) {
  return (
    <form action={approveJob}>
      <input type="hidden" name="id" value={jobId} />
      <button
        type="submit"
        className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full hover:bg-green-200"
      >
        Approve
      </button>
    </form>
  )
}

export function RejectButton({ jobId }: { jobId: string }) {
  return (
    <form action={rejectJob}>
      <input type="hidden" name="id" value={jobId} />
      <button
        type="submit"
        className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full hover:bg-red-200"
      >
        Reject
      </button>
    </form>
  )
}
