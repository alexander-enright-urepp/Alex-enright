// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getPendingJobs } from '@/app/actions/admin'
import { AdminNav } from '@/components/admin/AdminNav'
import { Button } from '@/components/ui/Button'
import type { JobListing } from '@/types'

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/admin/login')
        return
      }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email || '')
        .single()

      if (!adminUser) {
        router.push('/')
        return
      }

      const data = await getPendingJobs()
      setJobs(data)
      setLoading(false)
    }

    checkAdminAndLoad()
  }, [router, supabase])

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('job_listings')
      .update({ approved: true })
      .eq('id', id)

    if (!error) {
      setJobs(jobs.filter(j => j.id !== id))
    }
  }

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('job_listings')
      .delete()
      .eq('id', id)

    if (!error) {
      setJobs(jobs.filter(j => j.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Job Approvals</h1>
        
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No pending jobs to approve</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <p className="text-accent font-medium">{job.company}</p>
                    <p className="text-gray-600">{job.location}</p>
                    <p className="text-gray-700 mt-2">{job.description}</p>
                    
                    {job.salary_range && (
                      <p className="text-green-600 mt-2">{job.salary_range}</p>
                    )}
                    
                    {job.apply_url && (
                      <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-sm mt-2 inline-block"
                      >
                        {job.apply_url}
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleApprove(job.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(job.id)}
                      variant="secondary"
                      className="text-red-600"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
