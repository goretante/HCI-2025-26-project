import { db, goals, habits, habitLogs, goalProgress, blogPosts } from '@/db'
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm'
import type { Goal, Habit, HabitLog, GoalProgress, NewGoal, NewHabit, BlogPost } from '@/db/schema'

// ============================================
// GOALS
// ============================================

export async function getGoals(userId: string): Promise<Goal[]> {
  return await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(desc(goals.createdAt))
}

export async function getGoal(id: string, userId: string): Promise<Goal | undefined> {
  const result = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .limit(1)
  
  return result[0]
}

export async function getActiveGoals(userId: string): Promise<Goal[]> {
  return await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.status, 'active')))
    .orderBy(desc(goals.createdAt))
}

export async function createGoal(userId: string, data: Omit<NewGoal, 'userId' | 'id'>): Promise<Goal> {
  const result = await db
    .insert(goals)
    .values({ ...data, userId })
    .returning()
  
  return result[0]
}

export async function updateGoal(id: string, userId: string, data: Partial<Goal>): Promise<Goal> {
  const result = await db
    .update(goals)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .returning()
  
  return result[0]
}

export async function deleteGoal(id: string, userId: string): Promise<void> {
  await db
    .delete(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
}

// ============================================
// GOAL PROGRESS
// ============================================

export async function getGoalProgress(goalId: string): Promise<GoalProgress[]> {
  return await db
    .select()
    .from(goalProgress)
    .where(eq(goalProgress.goalId, goalId))
    .orderBy(desc(goalProgress.loggedAt))
}

export async function addGoalProgress(
  userId: string, 
  goalId: string, 
  value: number, 
  notes?: string
): Promise<GoalProgress> {
  const result = await db
    .insert(goalProgress)
    .values({ goalId, userId, value, notes })
    .returning()

  // Update goal current value
  const progress = await db
    .select({ total: sql<number>`COALESCE(SUM(${goalProgress.value}), 0)` })
    .from(goalProgress)
    .where(eq(goalProgress.goalId, goalId))

  // Ensure we don't go below 0
  const total = Math.max(0, progress[0]?.total || 0)
  
  // Get goal to check if completed
  const goal = await db
    .select()
    .from(goals)
    .where(eq(goals.id, goalId))
    .limit(1)

  if (goal[0]) {
    const newStatus = total >= goal[0].targetValue ? 'completed' : 'active'
    await db
      .update(goals)
      .set({ currentValue: total, status: newStatus, updatedAt: new Date() })
      .where(eq(goals.id, goalId))
  }

  return result[0]
}

export async function deleteGoalProgress(id: string, userId: string): Promise<void> {
  // Get the progress entry first
  const entry = await db
    .select()
    .from(goalProgress)
    .where(and(eq(goalProgress.id, id), eq(goalProgress.userId, userId)))
    .limit(1)

  if (entry[0]) {
    await db.delete(goalProgress).where(eq(goalProgress.id, id))

    // Recalculate goal current value
    const progress = await db
      .select({ total: sql<number>`COALESCE(SUM(${goalProgress.value}), 0)` })
      .from(goalProgress)
      .where(eq(goalProgress.goalId, entry[0].goalId))

    await db
      .update(goals)
      .set({ 
        currentValue: progress[0]?.total || 0, 
        status: 'active',
        updatedAt: new Date() 
      })
      .where(eq(goals.id, entry[0].goalId))
  }
}

// ============================================
// HABITS
// ============================================

export async function getHabits(userId: string): Promise<Habit[]> {
  return await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))
    .orderBy(desc(habits.createdAt))
}

export async function getHabit(id: string, userId: string): Promise<Habit | undefined> {
  const result = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
    .limit(1)
  
  return result[0]
}

export async function createHabit(userId: string, data: Omit<NewHabit, 'userId' | 'id'>): Promise<Habit> {
  const result = await db
    .insert(habits)
    .values({ ...data, userId })
    .returning()
  
  return result[0]
}

export async function updateHabit(id: string, userId: string, data: Partial<Habit>): Promise<Habit> {
  const result = await db
    .update(habits)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
    .returning()
  
  return result[0]
}

export async function deleteHabit(id: string, userId: string): Promise<void> {
  await db
    .update(habits)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
}

// ============================================
// HABIT LOGS
// ============================================

export async function getHabitLogs(userId: string, startDate: string, endDate: string): Promise<HabitLog[]> {
  return await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.userId, userId),
        gte(habitLogs.completedAt, startDate),
        lte(habitLogs.completedAt, endDate)
      )
    )
}

export async function getTodayHabitLogs(userId: string): Promise<HabitLog[]> {
  const today = new Date().toISOString().split('T')[0]
  return await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.userId, userId), eq(habitLogs.completedAt, today)))
}

export async function toggleHabitLog(
  userId: string, 
  habitId: string, 
  date: string
): Promise<{ completed: boolean }> {
  // Check if log exists
  const existing = await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.habitId, habitId),
        eq(habitLogs.userId, userId),
        eq(habitLogs.completedAt, date)
      )
    )
    .limit(1)

  if (existing[0]) {
    // Delete (uncheck)
    await db.delete(habitLogs).where(eq(habitLogs.id, existing[0].id))
    await updateHabitStreak(habitId)
    return { completed: false }
  } else {
    // Create (check)
    await db.insert(habitLogs).values({ habitId, userId, completedAt: date })
    await updateHabitStreak(habitId)
    return { completed: true }
  }
}

async function updateHabitStreak(habitId: string): Promise<void> {
  const today = new Date()
  let currentStreak = 0
  let checkDate = new Date(today)

  // Count consecutive days backwards
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    const log = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.completedAt, dateStr)))
      .limit(1)

    if (log[0]) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  // Get current best streak
  const habit = await db
    .select()
    .from(habits)
    .where(eq(habits.id, habitId))
    .limit(1)

  if (habit[0]) {
    const bestStreak = Math.max(habit[0].streakBest, currentStreak)
    await db
      .update(habits)
      .set({ streakCurrent: currentStreak, streakBest: bestStreak, updatedAt: new Date() })
      .where(eq(habits.id, habitId))
  }
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Get goals counts
  const allGoals = await db.select().from(goals).where(eq(goals.userId, userId))
  const totalGoals = allGoals.length
  const completedGoals = allGoals.filter(g => g.status === 'completed').length
  const activeGoals = allGoals.filter(g => g.status === 'active').length

  // Get habits
  const allHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))

  // Get today's logs
  const todayLogs = await getTodayHabitLogs(userId)

  // Get week logs
  const weekLogs = await getHabitLogs(userId, weekAgo, today)

  // Calculate streaks
  const currentStreak = Math.max(...allHabits.map(h => h.streakCurrent), 0)
  const bestStreak = Math.max(...allHabits.map(h => h.streakBest), 0)

  // Weekly progress
  const totalPossibleWeek = allHabits.length * 7
  const weeklyProgress = totalPossibleWeek > 0 
    ? Math.round((weekLogs.length / totalPossibleWeek) * 100) 
    : 0

  return {
    totalGoals,
    completedGoals,
    activeGoals,
    totalHabits: allHabits.length,
    activeHabits: allHabits.length,
    currentStreak,
    bestStreak,
    weeklyProgress,
    todayHabitsCompleted: todayLogs.length,
    todayHabitsTotal: allHabits.length,
  }
}

// ============================================
// BLOG POSTS
// ============================================

// Get all published posts (public blog)
export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  return await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt))
}

// Get user's own posts (for blog admin)
export async function getUserBlogPosts(userId: string): Promise<BlogPost[]> {
  return await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.userId, userId))
    .orderBy(desc(blogPosts.createdAt))
}

// Get all posts (admin only - for future use)
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return await db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt))
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1)
  return result[0]
}

export async function getBlogPostById(id: string): Promise<BlogPost | undefined> {
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1)
  return result[0]
}

export async function createBlogPost(userId: string, data: {
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  category?: string
  author?: string
  isPublished?: boolean
}): Promise<BlogPost> {
  const result = await db
    .insert(blogPosts)
    .values({
      ...data,
      userId,
      publishedAt: data.isPublished ? new Date() : null,
    })
    .returning()
  return result[0]
}

export async function updateBlogPost(id: string, userId: string, data: Partial<BlogPost>): Promise<BlogPost> {
  const updateData: any = { ...data, updatedAt: new Date() }
  if (data.isPublished && !data.publishedAt) {
    updateData.publishedAt = new Date()
  }
  
  const result = await db
    .update(blogPosts)
    .set(updateData)
    .where(and(eq(blogPosts.id, id), eq(blogPosts.userId, userId)))
    .returning()
  return result[0]
}

export async function deleteBlogPost(id: string, userId: string): Promise<void> {
  await db.delete(blogPosts).where(and(eq(blogPosts.id, id), eq(blogPosts.userId, userId)))
}
