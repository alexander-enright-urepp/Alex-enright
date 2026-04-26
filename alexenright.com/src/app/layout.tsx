import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { SessionProvider } from '@/components/SessionProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Alex Enright | Building, Sharing and Connecting',
  description: 'Explore Alex Enright Inc featuring recruitment opportunities, interactive games, daily posts, and a growing community. Connect, engage, or work together.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Alex Enright | Building, Sharing and Connecting',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon%2032.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon%20180.png" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-PVH7JECM17" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PVH7JECM17');
          `}
        </Script>
        {/* Google AdSense */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1262710570426029"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen bg-white">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
