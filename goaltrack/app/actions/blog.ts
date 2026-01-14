'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import * as queries from '@/db/queries'
import { getBlogPosts as getContentfulBlogPosts, type BlogPost } from '@/lib/contentful'

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001'

async function getUserId() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return user.id
  } catch (error) {
    console.log('Using dev user ID (Supabase not configured)')
  }
  return DEV_USER_ID
}

// Get published posts from Contentful for public blog
export async function getPublishedBlogPostsAction(): Promise<BlogPost[]> {
  return await getContentfulBlogPosts()
}

// Get all Contentful blog posts
export async function getBlogPosts(): Promise<BlogPost[]> {
  return getContentfulBlogPosts()
}

// Get single Contentful post by ID
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const posts = await getContentfulBlogPosts()
  return posts.find(post => post.id === id) || null
}
