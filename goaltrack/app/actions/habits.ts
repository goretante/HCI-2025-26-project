'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import * as queries from '@/db/queries'

// Dev user ID for local testing without auth
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001'

async function getUserId() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return user.id
  } catch (error) {
    // Supabase not configured, use dev user
    console.log('Using dev user ID (Supabase not configured)')
  }
  return DEV_USER_ID
}

export async function getHabitsAction() {
  const userId = await getUserId()
  return await queries.getHabits(userId)
}

export async function getHabitAction(id: string) {
  const userId = await getUserId()
  return await queries.getHabit(id, userId)
}

export async function createHabitAction(data: {
  title: string
  description?: string
  icon?: string
  color?: string
  frequency?: string
}) {
  const userId = await getUserId()
  const habit = await queries.createHabit(userId, {
    title: data.title,
    description: data.description || null,
    icon: data.icon || '✓',
    color: data.color || '#8B5CF6',
    frequency: data.frequency as 'daily' | 'weekly' | 'custom' || 'daily',
  })
  revalidatePath('/dev')
  revalidatePath('/dev/habits')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/habits')
  return habit
}

export async function updateHabitAction(
  id: string,
  data: {
    title?: string
    description?: string
    icon?: string
    color?: string
    frequency?: 'daily' | 'weekly' | 'custom'
    isActive?: boolean
  }
) {
  const userId = await getUserId()
  
  // Validiraj frequency ako je proslijeđen
  if (data.frequency && !['daily', 'weekly', 'custom'].includes(data.frequency)) {
    throw new Error('Nevažeća učestalost')
  }

  const habit = await queries.updateHabit(id, userId, data)
  revalidatePath('/dev')
  revalidatePath('/dev/habits')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/habits')
  return habit
}

export async function deleteHabitAction(id: string) {
  const userId = await getUserId()
  await queries.deleteHabit(id, userId)
  revalidatePath('/dev')
  revalidatePath('/dev/habits')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/habits')
}

export async function getTodayHabitLogsAction() {
  const userId = await getUserId()
  return await queries.getTodayHabitLogs(userId)
}

export async function getHabitLogsAction(startDate: string, endDate: string) {
  const userId = await getUserId()
  return await queries.getHabitLogs(userId, startDate, endDate)
}

export async function toggleHabitLogAction(habitId: string, date: string) {
  const userId = await getUserId()
  const result = await queries.toggleHabitLog(userId, habitId, date)
  revalidatePath('/dev')
  revalidatePath('/dev/habits')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/habits')
  revalidatePath('/dashboard/progress')
  return result
}

export async function getDashboardStatsAction() {
  const userId = await getUserId()
  return await queries.getDashboardStats(userId)
}
