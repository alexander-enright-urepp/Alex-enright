'use client'

import { createClient } from '@/lib/supabase/client'

interface ContactFormData {
  type: string
  name?: string
  email?: string
  phone?: string
  message: string
}

export async function submitContactForm(data: ContactFormData) {
  const supabase = createClient()
  
  // @ts-ignore - Table exists in database but types not yet generated
  const { error } = await supabase
    .from('contact_submissions')
    .insert({
      type: data.type,
      name: data.name || null,
      email: data.email || null,
      phone: data.phone || null,
      message: data.message,
    })

  if (error) {
    console.error('Contact form error:', error)
    return { success: false, error: 'Failed to submit. Please try again.' }
  }

  return { success: true }
}
