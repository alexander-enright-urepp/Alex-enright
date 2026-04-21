'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getRecruiterSubmissions } from '@/app/actions/admin'
import { AdminNav } from '@/components/admin/AdminNav'
import type { RecruiterSubmission } from '@/types'

export default function SubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<RecruiterSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      const supabase = createClient()
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

      const data = await getRecruiterSubmissions()
      setSubmissions(data)
      setLoading(false)
    }

    checkAdminAndLoad()
  }, [router])

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
      
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Recruiter Submissions</h1>
        
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Job Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{sub.name}</td>
                    <td className="px-6 py-4 text-sm">{sub.email}</td>
                    <td className="px-6 py-4 text-sm">{sub.job_type || '-'}</td>
                    <td className="px-6 py-4 text-sm">{sub.location || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {sub.resume_url ? (
                        <a
                          href={sub.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          Download
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
