import { db } from './index'
import { goals, habits, habitLogs, goalProgress } from './schema'
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm'
import type { Goal, Habit, HabitLog, GoalProgress, NewGoal, NewHabit } from './schema'

// Helper functions to convert between camelCase and snake_case
function mapGoalToSnakeCase(goal: any): Goal {
  return {
    id: goal.id,
    user_id: goal.userId,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    target_value: goal.targetValue,
    current_value: goal.currentValue,
    unit: goal.unit,
    start_date: goal.startDate,
    end_date: goal.endDate,
    status: goal.status,
    priority: goal.priority,
    color: goal.color,
    created_at: goal.createdAt,
    updated_at: goal.updatedAt,
  }
}

function mapHabitToSnakeCase(habit: any): Habit {
  return {
    id: habit.id,
    user_id: habit.userId,
    title: habit.title,
    description: habit.description,
    icon: habit.icon,
    color: habit.color,
    frequency: habit.frequency,
    target_days: habit.targetDays,
    reminder_time: habit.reminderTime,
    streak_current: habit.streakCurrent,
    streak_best: habit.streakBest,
    is_active: habit.isActive,
    created_at: habit.createdAt,
    updated_at: habit.updatedAt,
  }
}

function mapHabitLogToSnakeCase(log: any): HabitLog {
  return {
    id: log.id,
    habit_id: log.habitId,
    user_id: log.userId,
    completed_at: log.completedAt,
    notes: log.notes,
    created_at: log.createdAt,
  }
}

function mapGoalProgressToSnakeCase(progress: any): GoalProgress {
  return {
    id: progress.id,
    goal_id: progress.goalId,
    user_id: progress.userId,
    value: progress.value,
    notes: progress.notes,
    logged_at: progress.loggedAt,
    created_at: progress.createdAt,
  }
}

export async function getGoals(user_id: string): Promise<Goal[]> {
  const results = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, user_id))
    .orderBy(goals.createdAt)
  
  return results.map(mapGoalToSnakeCase)
}

export async function getGoal(id: string, user_id: string): Promise<Goal | undefined> {
  const result = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, user_id)))
    .limit(1)
  
  return result[0] ? mapGoalToSnakeCase(result[0]) : undefined
}

export async function getActiveGoals(user_id: string): Promise<Goal[]> {
  const results = await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, user_id), eq(goals.status, 'active')))
    .orderBy(goals.createdAt)
  
  return results.map(mapGoalToSnakeCase)
}

export async function createGoal(user_id: string, data: Omit<NewGoal, 'userId' | 'id'>): Promise<Goal> {
  const result = await db
    .insert(goals)
    .values({
      userId: user_id,
      ...data,
    })
    .returning()
  
  return mapGoalToSnakeCase(result[0])
}

export async function updateGoal(id: string, user_id: string, data: Partial<Goal>): Promise<Goal> {
  // Convert snake_case input to camelCase for database
  const updateData: any = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.category !== undefined) updateData.category = data.category
  if (data.target_value !== undefined) updateData.targetValue = data.target_value
  if (data.current_value !== undefined) updateData.currentValue = data.current_value
  if (data.unit !== undefined) updateData.unit = data.unit
  if (data.end_date !== undefined) updateData.endDate = data.end_date
  if (data.status !== undefined) updateData.status = data.status
  if (data.priority !== undefined) updateData.priority = data.priority
  if (data.color !== undefined) updateData.color = data.color

  const result = await db
    .update(goals)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(goals.id, id), eq(goals.userId, user_id)))
    .returning()
  
  return mapGoalToSnakeCase(result[0])
}

export async function deleteGoal(id: string, user_id: string): Promise<void> {
  await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, user_id)))
}

export async function getGoalProgress(goal_id: string): Promise<GoalProgress[]> {
  const results = await db
    .select()
    .from(goalProgress)
    .where(eq(goalProgress.goalId, goal_id))
    .orderBy(desc(goalProgress.loggedAt))
  
  return results.map(mapGoalProgressToSnakeCase)
}

export async function addGoalProgress(
  user_id: string, 
  goal_id: string, 
  value: number, 
  notes?: string
): Promise<GoalProgress> {
  const result = await db
    .insert(goalProgress)
    .values({
      goalId: goal_id,
      userId: user_id,
      value,
      notes,
      loggedAt: new Date().toISOString().split('T')[0],
    })
    .returning()

  // Update goal's current value
  await db
    .update(goals)
    .set({ 
      currentValue: sql`${goals.currentValue} + ${value}`,
      updatedAt: new Date() 
    })
    .where(eq(goals.id, goal_id))

  return mapGoalProgressToSnakeCase(result[0])
}

export async function deleteGoalProgress(id: string, user_id: string): Promise<void> {
  await db
    .delete(goalProgress)
    .where(and(eq(goalProgress.id, id), eq(goalProgress.userId, user_id)))
}

export async function getHabits(user_id: string): Promise<Habit[]> {
  const results = await db
    .select()
    .from(habits)
    .where(eq(habits.userId, user_id))
    .orderBy(habits.createdAt)
  
  return results.map(mapHabitToSnakeCase)
}

export async function getHabit(id: string, user_id: string): Promise<Habit | undefined> {
  const result = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, user_id)))
    .limit(1)
  
  return result[0] ? mapHabitToSnakeCase(result[0]) : undefined
}

export async function createHabit(user_id: string, data: Omit<NewHabit, 'userId' | 'id'>): Promise<Habit> {
  const result = await db
    .insert(habits)
    .values({
      userId: user_id,
      ...data,
    })
    .returning()
  
  return mapHabitToSnakeCase(result[0])
}

export async function updateHabit(id: string, user_id: string, data: Partial<Habit>): Promise<Habit> {
  // Convert snake_case input to camelCase for database
  const updateData: any = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.color !== undefined) updateData.color = data.color
  if (data.frequency !== undefined) updateData.frequency = data.frequency
  if (data.target_days !== undefined) updateData.targetDays = data.target_days
  if (data.reminder_time !== undefined) updateData.reminderTime = data.reminder_time
  if (data.streak_current !== undefined) updateData.streakCurrent = data.streak_current
  if (data.streak_best !== undefined) updateData.streakBest = data.streak_best
  if (data.is_active !== undefined) updateData.isActive = data.is_active

  const result = await db
    .update(habits)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(habits.id, id), eq(habits.userId, user_id)))
    .returning()
  
  return mapHabitToSnakeCase(result[0])
}

export async function deleteHabit(id: string, user_id: string): Promise<void> {
  await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, user_id)))
}

export async function getHabitLogs(user_id: string, start_date: string, end_date: string): Promise<HabitLog[]> {
  const results = await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.userId, user_id),
        gte(habitLogs.completedAt, start_date),
        lte(habitLogs.completedAt, end_date)
      )
    )
    .orderBy(desc(habitLogs.completedAt))
  
  return results.map(mapHabitLogToSnakeCase)
}

export async function getTodayHabitLogs(user_id: string): Promise<HabitLog[]> {
  const today = new Date().toISOString().split('T')[0]
  const results = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.userId, user_id), eq(habitLogs.completedAt, today)))
  
  return results.map(mapHabitLogToSnakeCase)
}

export async function toggleHabitLog(
  user_id: string, 
  habit_id: string, 
  date: string
): Promise<{ completed: boolean }> {
  const existing = await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.userId, user_id),
        eq(habitLogs.habitId, habit_id),
        eq(habitLogs.completedAt, date)
      )
    )
    .limit(1)

  if (existing.length > 0) {
    await db.delete(habitLogs).where(eq(habitLogs.id, existing[0].id))
    return { completed: false }
  } else {
    await db.insert(habitLogs).values({
      habitId: habit_id,
      userId: user_id,
      completedAt: date,
    })
    return { completed: true }
  }
}

export async function getDashboardStats(user_id: string) {
  const allGoals = await getGoals(user_id)
  const activeGoals = allGoals.filter((g) => g.status === 'active')
  const completedGoals = allGoals.filter((g) => g.status === 'completed')

  const allHabits = await getHabits(user_id)
  const activeHabits = allHabits.filter((h) => h.is_active)

  const today = new Date().toISOString().split('T')[0]
  const todayLogs = await getTodayHabitLogs(user_id)

  const totalProgress = activeGoals.reduce((sum, goal) => {
    const progress = (goal.current_value / goal.target_value) * 100
    return sum + Math.min(progress, 100)
  }, 0)
  const avgProgress = activeGoals.length > 0 ? totalProgress / activeGoals.length : 0

  return {
    activeGoals: activeGoals.length,
    completedGoals: completedGoals.length,
    activeHabits: activeHabits.length,
    todayHabits: todayLogs.length,
    avgProgress: Math.round(avgProgress),
  }
}
