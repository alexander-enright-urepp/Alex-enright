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
  const [refreshing, setRefreshing] = useState(false)
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

      console.log('Admin check:', { 
        userEmail: user.email, 
        queryEmail: (user.email || '').trim(),
        adminUser, 
        adminError 
      })

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

  async function handleRefreshContent() {
    setRefreshing(true)
    try {
      // Fetch news
      await fetch('/api/news/fetch', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer f89949139a3bffa30c8f524e920eda657c406d965c89e3a478032f3968533bfd' }
      })
      
      // Fetch scores
      await fetch('/api/scores/fetch', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer f89949139a3bffa30c8f524e920eda657c406d965c89e3a478032f3968533bfd' }
      })
      
      alert('Content refreshed! Check News and Scores tabs.')
      window.location.reload()
    } catch (err) {
      alert('Error refreshing content: ' + err)
    }
    setRefreshing(false)
  }

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

        {/* Refresh Content Button */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Refresh Content</h2>
              <p className="text-sm text-gray-600">Manually fetch latest news and sports scores</p>
            </div>
            <button
              onClick={handleRefreshContent}
              disabled={refreshing}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>🔄 Refresh News & Scores</>
              )}
            </button>
          </div>
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
