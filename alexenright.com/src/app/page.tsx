'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Only run on client side
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768

      if (isMobile) {
        router.push('/app')
      }
    }
  }, [router])

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <div className="animate-pulse text-white text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Red */}
      <section className="bg-red-600 min-h-screen flex items-center relative overflow-hidden">
        <div className="container mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 text-white z-10">
              <p className="text-2xl lg:text-3xl font-medium mb-2 text-red-100">
                Welcome to
              </p>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Alex Enright Inc
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-red-100 max-w-xl">
                "I believe that personal branding is the future, let's create and build together!"
              </p>
              <a
                href="https://apps.apple.com/us/app/alex-enright/id1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-white text-red-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-red-50 transition-colors shadow-lg"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Download in the App Store
              </a>
            </div>
            <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-end">
              <img
                src="/LogoAEcircle.png"
                alt="Alex Enright Logo"
                className="w-64 h-64 lg:w-96 lg:h-96 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500 rounded-full opacity-50 blur-xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-red-400 rounded-full opacity-30 blur-2xl" />
      </section>

      {/* Section 2: News - White */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="bg-gray-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
                    </svg>
                    <span className="font-bold">News</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span className="text-red-600 font-medium">TechCrunch</span>
                        <span>•</span>
                        <span>2h ago</span>
                      </div>
                      <h3 className="font-bold text-gray-900">Latest Tech Trends</h3>
                      <p className="text-gray-600 text-sm mt-1">AI continues to reshape the industry...</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span className="text-red-600 font-medium">BBC</span>
                        <span>•</span>
                        <span>4h ago</span>
                      </div>
                      <h3 className="font-bold text-gray-900">Breaking: Global Markets</h3>
                      <p className="text-gray-600 text-sm mt-1">Markets respond to new developments...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Stay Informed with Curated News</h2>
              <p className="text-xl text-gray-600 mb-6">
                Access the latest headlines from trusted sources like TechCrunch, BBC, and more. 
                Our News tab aggregates top stories so you never miss what matters.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Real-time updates from multiple sources
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Like and share stories you care about
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Category filtering for personalized feeds
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Scores - Red */}
      <section className="bg-red-600 py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="lg:w-1/2">
              <div className="bg-red-500 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold">Scores</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full" />
                        <span className="font-bold">LAL</span>
                      </div>
                      <span className="text-2xl font-bold">112</span>
                      <span className="text-red-600 font-bold">FINAL</span>
                      <span className="text-2xl font-bold">108</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">GSW</span>
                        <div className="w-8 h-8 bg-yellow-500 rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full" />
                        <span className="font-bold">NE</span>
                      </div>
                      <span className="text-2xl font-bold">24</span>
                      <span className="text-green-600 font-bold text-sm">Q3 8:45</span>
                      <span className="text-2xl font-bold">17</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">KC</span>
                        <div className="w-8 h-8 bg-red-700 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 text-white">
              <h2 className="text-4xl font-bold mb-6">Real-Time Sports Scores</h2>
              <p className="text-xl text-red-100 mb-6">
                Never miss a moment with live scores from ESPN. Track NFL, NBA, MLB, NHL, 
                and international leagues all in one place.
              </p>
              <ul className="space-y-3 text-red-100">
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Live updates from ESPN
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All major leagues covered
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Filter by your favorite sports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Community - White */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="bg-gray-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-bold">Community</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm">Jobs</span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">Post a Job</span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">Daily</span>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mb-2">Approved</span>
                      <h3 className="font-bold text-gray-900">Senior React Developer</h3>
                      <p className="text-red-600 font-medium">TechCorp Inc.</p>
                      <p className="text-gray-600 text-sm">Remote • Full Time</p>
                      <p className="text-green-600 font-medium mt-2">$120,000 - $160,000</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mb-2">From Himalayas.app</span>
                      <h3 className="font-bold text-gray-900">Product Designer</h3>
                      <p className="text-red-600 font-medium">StartupXYZ</p>
                      <p className="text-gray-600 text-sm">San Francisco • Full Time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Connect & Find Opportunities</h2>
              <p className="text-xl text-gray-600 mb-6">
                Join a thriving community of professionals. Browse curated job listings, 
                post opportunities, or hire Alex directly for your next project.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Vetted jobs + submit your own job for approval
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Apply directly with resume upload
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hire Alex for apps, logos, creative projects
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Daily Updates - Red */}
      <section className="bg-red-600 py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="lg:w-1/2">
              <div className="bg-red-500 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-red-600 text-white px-4 py-3">
                    <span className="font-bold">Updates</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        AE
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">Alex Enright</span>
                          <span className="text-xs text-gray-500">2h ago</span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          Just launched a new feature! Check out the latest updates in the app. 
                          Excited to share what's coming next 🚀
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            24
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        AE
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">Alex Enright</span>
                          <span className="text-xs text-gray-500">Yesterday</span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          New partnership announcement! Working with amazing teams to bring 
                          you even more features.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 text-white">
              <h2 className="text-4xl font-bold mb-6">Stay Connected with Daily Updates</h2>
              <p className="text-xl text-red-100 mb-6">
                Get exclusive behind-the-scenes content, product announcements, and 
                personal insights directly from Alex Enright.
              </p>
              <ul className="space-y-3 text-red-100">
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Direct updates from Alex
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Like and engage with posts
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Be the first to know about new features
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Play Games - White */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="bg-gray-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold">Play</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center cursor-pointer hover:scale-105 transition-transform">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                        </svg>
                        <span className="font-bold text-sm">Tic Tac Toe</span>
                      </div>
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white text-center cursor-pointer hover:scale-105 transition-transform">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <span className="font-bold text-sm">Snake</span>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white text-center cursor-pointer hover:scale-105 transition-transform">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-bold text-sm">Pong</span>
                      </div>
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white text-center cursor-pointer hover:scale-105 transition-transform">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span className="font-bold text-sm">More Soon</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Pass Time with Games</h2>
              <p className="text-xl text-gray-600 mb-6">
                Take a break and play classic arcade games right in the app. 
                Perfect for killing time during commutes or while waiting.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Classic games: Tic Tac Toe, Snake, Pong
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No downloads needed - play instantly
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  More games added regularly
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - White */}
      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-6 text-center">
          <a
            href="mailto:support@alexenright.com"
            className="inline-flex items-center bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Support
          </a>
          <p className="mt-6 text-gray-500 text-sm">
            © 2026 Alex Enright Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
