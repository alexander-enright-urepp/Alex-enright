import { readFileSync } from 'fs'
import { join } from 'path'

export default function PrivacyPolicy() {
  const htmlContent = readFileSync(
    join(process.cwd(), 'public', 'privacy-policy.html'), 
    'utf-8'
  )
  
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </main>
  )
}

// Use static generation for performance
export const dynamic = 'force-static'
export const revalidate = false
