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

// Get user's own posts for blog admin (iz baze)
export async function getUserBlogPostsAction() {
  const userId = await getUserId()
  return await queries.getUserBlogPosts(userId)
}

// Get single post by slug (iz baze - samo ako je korisnik kreiram)
export async function getBlogPostAction(slug: string) {
  return await queries.getBlogPost(slug)
}

// Get single post by ID (iz Contentfula)
export async function getBlogPostByIdAction(id: string) {
  const posts = await getContentfulBlogPosts()
  return posts.find(post => post.id === id) || null
}

// Create new blog post (u bazu)
export async function createBlogPostAction(data: {
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  category?: string
  author?: string
  isPublished?: boolean
}) {
  const userId = await getUserId()
  const post = await queries.createBlogPost(userId, data)
  revalidatePath('/blog')
  revalidatePath('/dev/blog')
  return post
}

// Update blog post (samo own posts iz baze)
export async function updateBlogPostAction(id: string, data: {
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  coverImage?: string
  category?: string
  author?: string
  isPublished?: boolean
}) {
  const userId = await getUserId()
  const post = await queries.updateBlogPost(id, userId, data)
  revalidatePath('/blog')
  revalidatePath('/dev/blog')
  if (post?.slug) {
    revalidatePath(`/blog/${post.slug}`)
  }
  return post
}

// Delete blog post (samo own posts iz baze)
export async function deleteBlogPostAction(id: string) {
  const userId = await getUserId()
  await queries.deleteBlogPost(id, userId)
  revalidatePath('/blog')
  revalidatePath('/dev/blog')
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
