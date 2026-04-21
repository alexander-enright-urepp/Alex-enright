// @ts-nocheck
'use client'

import { createClient } from '@/lib/supabase/client'

export async function submitRecruiterForm(
  formData: FormData,
  resumeFile?: File
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    let resumeUrl: string | null = null
    
    // Upload resume if provided
    if (resumeFile) {
      const fileExt = resumeFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile, {
          contentType: 'application/pdf',
          upsert: false,
        })
      
      if (uploadError) {
        console.error('Upload error:', uploadError)
        return { success: false, error: 'Failed to upload resume: ' + uploadError.message }
      }
      
      // Get signed URL
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('resumes')
        .createSignedUrl(fileName, 60 * 60 * 24 * 7)
      
      if (signedUrlError) {
        console.error('Signed URL error:', signedUrlError)
      }
      
      resumeUrl = signedUrlData?.signedUrl || null
    }
    
    // Get form values and ensure they're strings
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = (formData.get('phone') as string) || null
    const jobType = (formData.get('jobType') as string) || null
    const location = (formData.get('location') as string) || null
    const remotePref = (formData.get('remotePref') as string) || null
    const linkedinUrl = (formData.get('linkedinUrl') as string) || null
    const note = (formData.get('note') as string) || null
    
    if (!name || !email) {
      return { success: false, error: 'Name and email are required' }
    }
    
    // Insert submission
    const { error } = await supabase
      .from('recruiter_submissions')
      .insert({
        name: name,
        email: email,
        phone: phone,
        job_type: jobType,
        location: location,
        remote_pref: remotePref,
        linkedin_url: linkedinUrl,
        note: note,
        resume_url: resumeUrl,
      })
    
    if (error) {
      console.error('Insert error:', error)
      return { success: false, error: 'Failed to submit form: ' + error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Submit error:', error)
    return { success: false, error: 'An unexpected error occurred: ' + (error.message || 'Unknown error') }
  }
}
