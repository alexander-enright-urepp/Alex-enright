// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getDailyPosts } from '@/app/actions/daily'
import { AdminNav } from '@/components/admin/AdminNav'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { DailyPost } from '@/types'

export default function DailyPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<DailyPost[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/admin/login')
        return
      }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email || '')
        .single()

      if (!adminUser) {
        router.push('/')
        return
      }

      const data = await getDailyPosts()
      setPosts(data)
      setLoading(false)
    }

    checkAdminAndLoad()
  }, [router, supabase])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const form = e.currentTarget  // Save reference before async
    
    const title = formData.get('title') as string
    const body = formData.get('body') as string
    
    const { data: newPost, error } = await supabase
      .from('daily_posts')
      .insert({
        title,
        body,
        image_url: (formData.get('imageUrl') as string) || null,
      } as any)
      .select()
      .single()

    if (!error) {
      // Send push notification for new daily post
      try {
        console.log('Sending push notification...');
        const response = await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'New Daily Post',
            body: title,
            data: { tab: 'daily', post_id: newPost?.id }
          })
        });
        const result = await response.json();
        console.log('Push notification result:', result);
      } catch (pushError) {
        console.error('Push notification error:', pushError);
      }
      
      const data = await getDailyPosts()
      setPosts(data)
      form.reset()  // Use saved reference
    } else {
      console.error('Post creation error:', error);
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('daily_posts')
      .delete()
      .eq('id', id)

    if (!error) {
      setPosts(posts.filter(p => p.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Daily Posts</h1>
        
        {/* Create Post Form */}
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Post</h2>
          
          <div className="space-y-4">
            <Input name="title" label="Title" required />
            <Textarea
              name="body"
              label="Body"
              rows={4}
              required
            />
            
            <Input name="imageUrl" type="url" label="Image URL (optional)" />
            
            <Button type="submit">Create Post</Button>
          </div>
        </form>
        
        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <p className="text-gray-600 mt-2">{post.body}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                </div>
                
                <Button
                  onClick={() => handleDelete(post.id)}
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
