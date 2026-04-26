'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getAnalytics, getRecruiterSubmissions, getPendingJobs } from '@/app/actions/admin'
import { AdminNav } from '@/components/admin/AdminNav'
import { StatsCard } from '@/components/admin/StatsCard'
import { RecentSubmissions } from '@/components/admin/RecentSubmissions'
import { PendingJobs } from '@/components/admin/PendingJobs'
import type { RecruiterSubmission, JobListing } from '@/types'

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    submissions: 0,
    posts: 0,
    jobs: 0,
    approvedJobs: 0,
    community: 0,
  })
  const [submissions, setSubmissions] = useState<RecruiterSubmission[]>([])
  const [pendingJobs, setPendingJobs] = useState<JobListing[]>([])

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      
      // Use getSession instead of getUser for client-side reliability
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      const user = session?.user
      
      console.log('Session check:', { session, user, sessionError })
      
      if (!user) {
        console.log('No session user found, redirecting to login')
        router.push('/admin/login')
        return
      }

      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .ilike('email', (user.email || '').trim())  // Case-insensitive + trim whitespace
        .single()

      console.log('Admin check:', { userEmail: user.email, adminUser, adminError })

      if (!adminUser) {
        console.log('User not in admin_users, redirecting to home')
        router.push('/')
        return
      }

      setIsAdmin(true)
      
      // Load data
      const [analyticsData, submissionsData, jobsData] = await Promise.all([
        getAnalytics(),
        getRecruiterSubmissions(),
        getPendingJobs(),
      ])
      
      setAnalytics(analyticsData)
      setSubmissions(submissionsData)
      setPendingJobs(jobsData)
      setLoading(false)
    }

    checkAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Recruiter Submissions"
            value={analytics.submissions}
            icon="💼"
          />
          <StatsCard
            title="Daily Posts"
            value={analytics.posts}
            icon="📝"
          />
          <StatsCard
            title="Job Listings"
            value={analytics.approvedJobs}
            icon="💼"
            subtitle={`${analytics.jobs - analytics.approvedJobs} pending`}
          />
          <StatsCard
            title="Community Posts"
            value={analytics.community}
            icon="👥"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <RecentSubmissions submissions={submissions.slice(0, 5)} />
          <PendingJobs jobs={pendingJobs.slice(0, 5)} onUpdate={() => window.location.reload()} />
        </div>
      </main>
    </div>
  )
}
