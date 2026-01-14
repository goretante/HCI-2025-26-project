import { db, goals, habits, habitLogs, goalProgress, blogPosts } from '@/db'
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm'
import type { Goal, Habit, HabitLog, GoalProgress, NewGoal, NewHabit, BlogPost } from '@/db/schema'

// ============================================
// GOALS
// ============================================

export async function getGoals(user_id: string): Promise<Goal[]> {
  return await db
    .select()
    .from(goals)
    .where(eq(goals.userId, user_id))
    .orderBy(desc(goals.createdAt))
}

export async function getGoal(id: string, user_id: string): Promise<Goal | undefined> {
  const result = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, user_id)))
    .limit(1)
  
  return result[0]
}

export async function getActiveGoals(user_id: string): Promise<Goal[]> {
  return await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, user_id), eq(goals.status, 'active')))
    .orderBy(desc(goals.createdAt))
}

export async function createGoal(user_id: string, data: Omit<NewGoal, 'userId' | 'id'>): Promise<Goal> {
  const result = await db
    .insert(goals)
    .values({ ...data, userId: user_id })
    .returning()
  
  return result[0]
}

export async function updateGoal(id: string, user_id: string, data: Partial<Goal>): Promise<Goal> {
  const result = await db
    .update(goals)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(goals.id, id), eq(goals.userId, user_id)))
    .returning()
  
  return result[0]
}

export async function deleteGoal(id: string, user_id: string): Promise<void> {
  await db
    .delete(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, user_id)))
}

// ============================================
// GOAL PROGRESS
// ============================================

export async function getGoalProgress(goal_id: string): Promise<GoalProgress[]> {
  return await db
    .select()
    .from(goalProgress)
    .where(eq(goalProgress.goalId, goal_id))
    .orderBy(desc(goalProgress.loggedAt))
}

export async function addGoalProgress(
  user_id: string, 
  goal_id: string, 
  value: number, 
  notes?: string
): Promise<GoalProgress> {
  const result = await db
    .insert(goalProgress)
    .values({ goalId: goal_id, userId: user_id, value, notes })
    .returning()

  // Update goal current value
  const progress = await db
    .select({ total: sql<number>`COALESCE(SUM(${goalProgress.value}), 0)` })
    .from(goalProgress)
    .where(eq(goalProgress.goalId, goal_id))

  // Ensure we don't go below 0
  const total = Math.max(0, progress[0]?.total || 0)
  
  // Get goal to check if completed
  const goal = await db
    .select()
    .from(goals)
    .where(eq(goals.id, goal_id))
    .limit(1)

  if (goal[0]) {
    const new_status = total >= goal[0].targetValue ? 'completed' : 'active'
    await db
      .update(goals)
      .set({ currentValue: total, status: new_status, updatedAt: new Date() })
      .where(eq(goals.id, goal_id))
  }

  return result[0]
}

export async function deleteGoalProgress(id: string, user_id: string): Promise<void> {
  // Get the progress entry first
  const entry = await db
    .select()
    .from(goalProgress)
    .where(and(eq(goalProgress.id, id), eq(goalProgress.userId, user_id)))
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

export async function getHabits(user_id: string): Promise<Habit[]> {
  return await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, user_id), eq(habits.isActive, true)))
    .orderBy(desc(habits.createdAt))
}

export async function getHabit(id: string, user_id: string): Promise<Habit | undefined> {
  const result = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, user_id)))
    .limit(1)
  
  return result[0]
}

export async function createHabit(user_id: string, data: Omit<NewHabit, 'userId' | 'id'>): Promise<Habit> {
  const result = await db
    .insert(habits)
    .values({ ...data, userId: user_id })
    .returning()
  
  return result[0]
}

export async function updateHabit(id: string, user_id: string, data: Partial<Habit>): Promise<Habit> {
  const result = await db
    .update(habits)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(habits.id, id), eq(habits.userId, user_id)))
    .returning()
  
  return result[0]
}

export async function deleteHabit(id: string, user_id: string): Promise<void> {
  await db
    .update(habits)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(habits.id, id), eq(habits.userId, user_id)))
}

// ============================================
// HABIT LOGS
// ============================================

export async function getHabitLogs(user_id: string, start_date: string, end_date: string): Promise<HabitLog[]> {
  return await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.userId, user_id),
        gte(habitLogs.completedAt, start_date),
        lte(habitLogs.completedAt, end_date)
      )
    )
}

export async function getTodayHabitLogs(user_id: string): Promise<HabitLog[]> {
  const today = new Date().toISOString().split('T')[0]
  return await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.userId, user_id), eq(habitLogs.completedAt, today)))
}

export async function toggleHabitLog(
  user_id: string, 
  habit_id: string, 
  date: string
): Promise<{ completed: boolean }> {
  // Check if log exists
  const existing = await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.habitId, habit_id),
        eq(habitLogs.userId, user_id),
        eq(habitLogs.completedAt, date)
      )
    )
    .limit(1)

  if (existing[0]) {
    // Delete (uncheck)
    await db.delete(habitLogs).where(eq(habitLogs.id, existing[0].id))
    await updateHabitStreak(habit_id)
    return { completed: false }
  } else {
    // Create (check)
    await db.insert(habitLogs).values({ habitId: habit_id, userId: user_id, completedAt: date })
    await updateHabitStreak(habit_id)
    return { completed: true }
  }
}

async function updateHabitStreak(habit_id: string): Promise<void> {
  const today = new Date()
  let current_streak = 0
  let check_date = new Date(today)

  // Count consecutive days backwards
  while (true) {
    const date_str = check_date.toISOString().split('T')[0]
    const log = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, habit_id), eq(habitLogs.completedAt, date_str)))
      .limit(1)

    if (log[0]) {
      current_streak++
      check_date.setDate(check_date.getDate() - 1)
    } else {
      break
    }
  }

  // Get current best streak
  const habit = await db
    .select()
    .from(habits)
    .where(eq(habits.id, habit_id))
    .limit(1)

  if (habit[0]) {
    const best_streak = Math.max(habit[0].streakBest, current_streak)
    await db
      .update(habits)
      .set({ streakCurrent: current_streak, streakBest: best_streak, updatedAt: new Date() })
      .where(eq(habits.id, habit_id))
  }
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(user_id: string) {
  const today = new Date().toISOString().split('T')[0]
  const week_ago = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Get goals counts
  const all_goals = await db.select().from(goals).where(eq(goals.userId, user_id))
  const total_goals = all_goals.length
  const completed_goals = all_goals.filter(g => g.status === 'completed').length
  const active_goals = all_goals.filter(g => g.status === 'active').length

  // Get habits
  const all_habits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, user_id), eq(habits.isActive, true)))

  // Get today's logs
  const today_logs = await getTodayHabitLogs(user_id)

  // Get week logs
  const week_logs = await getHabitLogs(user_id, week_ago, today)

  // Calculate streaks
  const current_streak = Math.max(...all_habits.map(h => h.streakCurrent), 0)
  const best_streak = Math.max(...all_habits.map(h => h.streakBest), 0)

  // Weekly progress
  const total_possible_week = all_habits.length * 7
  const weekly_progress = total_possible_week > 0 
    ? Math.round((week_logs.length / total_possible_week) * 100) 
    : 0

  return {
    total_goals,
    completed_goals,
    active_goals,
    total_habits: all_habits.length,
    active_habits: all_habits.length,
    current_streak,
    best_streak,
    weekly_progress,
    today_habits_completed: today_logs.length,
    today_habits_total: all_habits.length,
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
export async function getUserBlogPosts(user_id: string): Promise<BlogPost[]> {
  return await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.userId, user_id))
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

export async function createBlogPost(user_id: string, data: {
  title: string
  slug: string
  excerpt?: string
  content: string
  cover_image?: string
  category?: string
  author?: string
  is_published?: boolean
}): Promise<BlogPost> {
  const result = await db
    .insert(blogPosts)
    .values({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.cover_image,
      category: data.category,
      author: data.author,
      userId: user_id,
      isPublished: data.is_published,
      publishedAt: data.is_published ? new Date() : null,
    })
    .returning()
  return result[0]
}

export async function updateBlogPost(id: string, user_id: string, data: Partial<{
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  category: string
  author: string
  is_published: boolean
}>): Promise<BlogPost> {
  const update_data: any = {
    ...(data.title && { title: data.title }),
    ...(data.slug && { slug: data.slug }),
    ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
    ...(data.content && { content: data.content }),
    ...(data.cover_image !== undefined && { coverImage: data.cover_image }),
    ...(data.category !== undefined && { category: data.category }),
    ...(data.author !== undefined && { author: data.author }),
    ...(data.is_published !== undefined && { isPublished: data.is_published }),
    updatedAt: new Date(),
  }

  if (data.is_published && !data.is_published) {
    update_data.publishedAt = new Date()
  }
  
  const result = await db
    .update(blogPosts)
    .set(update_data)
    .where(and(eq(blogPosts.id, id), eq(blogPosts.userId, user_id)))
    .returning()
  return result[0]
}

export async function deleteBlogPost(id: string, user_id: string): Promise<void> {
  await db.delete(blogPosts).where(and(eq(blogPosts.id, id), eq(blogPosts.userId, user_id)))
}
