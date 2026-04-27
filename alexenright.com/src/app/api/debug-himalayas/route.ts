import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://himalayas.app/jobs/api')
    const data = await response.json()
    
    // Return first job with full details
    return NextResponse.json({
      total: data.jobs?.length || 0,
      sampleJob: data.jobs?.[0] || null,
      availableFields: data.jobs?.[0] ? Object.keys(data.jobs[0]) : []
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message })
  }
}
