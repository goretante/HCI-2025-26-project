'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import * as queries from '@/db/queries'
import type { NewGoal } from '@/db/schema'

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

export async function getGoalsAction() {
  const userId = await getUserId()
  return await queries.getGoals(userId)
}

export async function getActiveGoalsAction() {
  const userId = await getUserId()
  return await queries.getActiveGoals(userId)
}

export async function getGoalAction(id: string) {
  const userId = await getUserId()
  return await queries.getGoal(id, userId)
}

export async function createGoalAction(data: {
  title: string
  description?: string
  category?: string
  targetValue?: number
  unit?: string
  endDate?: string
  priority?: string
  color?: string
}) {
  const userId = await getUserId()
  const goal = await queries.createGoal(userId, {
    title: data.title,
    description: data.description || null,
    category: data.category || 'osobno',
    targetValue: data.targetValue || 100,
    unit: data.unit || '%',
    endDate: data.endDate || null,
    priority: data.priority || 'medium',
    color: data.color || '#3B82F6',
  })
  revalidatePath('/dev')
  revalidatePath('/dev/goals')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/goals')
  return goal
}

export async function updateGoalAction(
  id: string,
  data: {
    title?: string
    description?: string
    category?: string
    targetValue?: number
    currentValue?: number
    unit?: string
    endDate?: string
    priority?: 'low' | 'medium' | 'high'
    color?: string
    status?: 'active' | 'completed' | 'paused' | 'cancelled'
  }
) {
  const userId = await getUserId()
  
  // Validiraj status ako je proslijeđen
  if (data.status && !['active', 'completed', 'paused', 'cancelled'].includes(data.status)) {
    throw new Error('Nevažeći status')
  }

  // Validiraj priority ako je proslijeđen
  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    throw new Error('Nevažeći prioritet')
  }

  const goal = await queries.updateGoal(id, userId, data)
  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return goal
}

export async function deleteGoalAction(id: string) {
  const userId = await getUserId()
  await queries.deleteGoal(id, userId)
  revalidatePath('/dev')
  revalidatePath('/dev/goals')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/goals')
}

export async function getGoalProgressAction(goalId: string) {
  return await queries.getGoalProgress(goalId)
}

export async function addGoalProgressAction(goalId: string, value: number, notes?: string) {
  const userId = await getUserId()
  const progress = await queries.addGoalProgress(userId, goalId, value, notes)
  revalidatePath('/dev')
  revalidatePath('/dev/goals')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/goals')
  revalidatePath(`/dashboard/goals/${goalId}`)
  return progress
}

export async function deleteGoalProgressAction(id: string) {
  const userId = await getUserId()
  await queries.deleteGoalProgress(id, userId)
  revalidatePath('/dev')
  revalidatePath('/dev/goals')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/goals')
}
