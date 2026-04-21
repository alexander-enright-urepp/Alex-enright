import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate or retrieve anonymous ID for likes
export function getAnonId(): string {
  if (typeof window === 'undefined') return ''
  
  let anonId = localStorage.getItem('anon_id')
  if (!anonId) {
    anonId = crypto.randomUUID()
    localStorage.setItem('anon_id', anonId)
  }
  return anonId
}

// Format date relative
export function formatRelativeDate(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return then.toLocaleDateString()
}

// Validate file type
export function isValidPDF(file: File): boolean {
  return file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024 // 10MB
}
