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
        {/* Social Icons - Top Right */}
        <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
          <a
            href="https://www.amazon.com/stores/Alexander-Enright/author/B0G3W49PNY"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition-colors"
            title="Amazon Books"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.582l.315-.158c.138-.06.234-.04.283.058.05.098.03.186-.058.256-.168.129-.46.285-.877.467-2.176 1.023-4.436 1.534-6.781 1.534-4.135 0-7.92-1.27-11.356-3.81-.078-.058-.137-.102-.18-.134-.04-.035-.043-.065-.01-.089l.01-.007zM.094 15.48c.067-.097.182-.11.343-.04 3.79 1.876 7.68 2.814 11.67 2.814 2.66 0 5.28-.494 7.86-1.48.124-.05.21-.03.255.056.046.086.03.17-.05.25-.166.13-.448.3-.844.51-2.33 1.21-4.79 1.81-7.39 1.81-4.19 0-7.96-1.26-11.33-3.78-.044-.033-.076-.06-.095-.08-.058-.063-.05-.097.024-.103l.024-.002zm.087-2.533c.058-.066.148-.066.27 0 3.96 2.37 8.05 3.56 12.27 3.56 2.64 0 5.19-.47 7.66-1.4.13-.053.21-.03.24.065.03.097.006.185-.07.264-.155.16-.42.36-.796.6-2.36 1.45-4.9 2.18-7.64 2.18-4.26 0-8.22-1.28-11.89-3.83-.08-.054-.126-.097-.138-.128-.033-.06-.02-.1.037-.12l.04-.002zm.11-2.535c.06-.06.15-.04.27.06 3.95 2.73 8.13 4.1 12.54 4.1 2.75 0 5.33-.56 7.73-1.68.14-.064.23-.04.27.07.04.11.02.21-.07.3-.14.15-.38.35-.74.6-2.39 1.68-5.04 2.52-7.95 2.52-4.31 0-8.29-1.4-11.96-4.2-.09-.063-.14-.115-.15-.155-.025-.07-.01-.114.046-.13l.03-.002zm13.27-2.83c-2.66 0-4.8-.89-6.42-2.68-1.62-1.79-2.43-4.22-2.43-7.29 0-3.34.95-6.05 2.86-8.13C9.02 1.95 11.22 1.16 13.8 1.16c2.53 0 4.6.78 6.23 2.35 1.62 1.57 2.44 3.57 2.44 6 0 3.47-.94 6.27-2.81 8.4-1.88 2.13-4.14 3.2-6.79 3.2zm.04-1.7c2.13 0 3.96-.88 5.5-2.63 1.53-1.76 2.3-3.97 2.3-6.64 0-2.02-.6-3.66-1.8-4.92-1.2-1.26-2.73-1.89-4.58-1.89-2.1 0-3.92.89-5.46 2.67-1.54 1.78-2.31 4.05-2.31 6.79 0 1.94.56 3.52 1.68 4.74 1.12 1.22 2.58 1.83 4.37 1.83l.2-.05z"/>
            </svg>
          </a>
          <a
            href="https://open.spotify.com/artist/65Ugrmba5ZkPNVxmHpnfFu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition-colors"
            title="Spotify"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </a>
          <a
            href="https://twitter.com/alexrossenright"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition-colors"
            title="X / Twitter"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a
            href="https://www.saatchiart.com/art/Painting-The-Bench-6/2905359/13416657/view"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white transition-colors"
            title="Saatchi Art"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </a>
        </div>
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

      {/* Homelessness Mission Statement */}
      <section className="bg-red-50 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-700 text-sm md:text-base italic">
            10% of all revenue goes towards helping people who are experiencing homelessness.
          </p>
        </div>
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
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-4 text-center hover:scale-105 transition-transform">
                        <span className="text-4xl">🪙</span>
                        <p className="font-bold text-sm mt-2 text-gray-800">Coin Flip</p>
                        <p className="text-xs text-gray-600">Heads or tails?</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-4 text-center hover:scale-105 transition-transform">
                        <span className="text-4xl">🎲</span>
                        <p className="font-bold text-sm mt-2 text-gray-800">Dice Roll</p>
                        <p className="text-xs text-gray-600">Roll the dice</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-xl p-4 text-center hover:scale-105 transition-transform">
                        <span className="text-4xl">✊</span>
                        <p className="font-bold text-sm mt-2 text-gray-800">Rock Paper Scissors</p>
                        <p className="text-xs text-gray-600">Classic game</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-4 text-center hover:scale-105 transition-transform">
                        <span className="text-4xl">🎱</span>
                        <p className="font-bold text-sm mt-2 text-gray-800">Magic 8-Ball</p>
                        <p className="text-xs text-gray-600">Ask a question</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-4 text-center hover:scale-105 transition-transform">
                        <span className="text-4xl">⭕</span>
                        <p className="font-bold text-sm mt-2 text-gray-800">Tic Tac Toe</p>
                        <p className="text-xs text-gray-600">Beat the AI</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl p-4 text-center hover:scale-105 transition-transform">
                        <span className="text-4xl">🐍</span>
                        <p className="font-bold text-sm mt-2 text-gray-800">Snake</p>
                        <p className="text-xs text-gray-600">Classic arcade</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-xl p-4 text-center hover:scale-105 transition-transform">
                        <span className="text-4xl">🥠</span>
                        <p className="font-bold text-sm mt-2 text-gray-800">Fortune Cookie</p>
                        <p className="text-xs text-gray-600">Daily fortune</p>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl p-4 text-center hover:scale-105 transition-transform">
                        <span className="text-4xl">🎭</span>
                        <p className="font-bold text-sm mt-2 text-gray-800">Hangman</p>
                        <p className="text-xs text-gray-600">Guess the word</p>
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
                  8 classic games: Coin Flip, Dice, Rock Paper Scissors, Magic 8-Ball, Tic Tac Toe, Snake, Fortune Cookie, Hangman
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
