'use server'

import { createClient } from '@/lib/supabase/server'

interface ContactFormData {
  type: string
  name?: string
  email?: string
  phone?: string
  budget?: string
  message: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function submitContactForm(data: ContactFormData) {
  const supabase = await createClient()
  
  const insertData: any = {
    type: data.type,
    name: data.name || null,
    email: data.email || null,
    phone: data.phone || null,
    budget: data.budget || null,
    message: data.message,
  }
  
  const { error } = await supabase
    .from('contact_submissions')
    .insert(insertData)

  if (error) {
    console.error('Contact form error:', error)
    return { success: false, error: 'Failed to submit. Please try again.' }
  }

  return { success: true }
}
