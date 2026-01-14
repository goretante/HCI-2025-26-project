import { pgTable, uuid, text, timestamp, integer, boolean, date, time, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================
// PROFILES TABLE
// ============================================
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // References auth.users
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================
// GOALS TABLE
// ============================================
export const goals = pgTable('goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').default('osobno').notNull(),
  targetValue: integer('target_value').default(100).notNull(),
  currentValue: integer('current_value').default(0).notNull(),
  unit: text('unit').default('%').notNull(),
  startDate: date('start_date').defaultNow(),
  endDate: date('end_date'),
  status: text('status').default('active').notNull(), // 'active', 'completed', 'paused', 'cancelled'
  priority: text('priority').default('medium').notNull(), // 'low', 'medium', 'high'
  color: text('color').default('#3B82F6').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================
// HABITS TABLE
// ============================================
export const habits = pgTable('habits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon').default('✓').notNull(),
  color: text('color').default('#8B5CF6').notNull(),
  frequency: text('frequency').default('daily').notNull(), // 'daily', 'weekly', 'custom'
  targetDays: integer('target_days').array().default([1, 2, 3, 4, 5, 6, 7]),
  reminderTime: time('reminder_time'),
  streakCurrent: integer('streak_current').default(0).notNull(),
  streakBest: integer('streak_best').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================
// HABIT LOGS TABLE (daily tracking)
// ============================================
export const habitLogs = pgTable('habit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  completedAt: date('completed_at').defaultNow().notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================
// GOAL PROGRESS TABLE
// ============================================
export const goalProgress = pgTable('goal_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  goalId: uuid('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  value: integer('value').notNull(),
  notes: text('notes'),
  loggedAt: date('logged_at').defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================
// BLOG POSTS TABLE
// ============================================
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  coverImage: text('cover_image'),
  category: text('category').default('savjeti').notNull(),
  author: text('author').default('GoalTrack Tim').notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================
// RELATIONS
// ============================================
export const goalsRelations = relations(goals, ({ many }) => ({
  progress: many(goalProgress),
}))

export const habitsRelations = relations(habits, ({ many }) => ({
  logs: many(habitLogs),
}))

export const goalProgressRelations = relations(goalProgress, ({ one }) => ({
  goal: one(goals, {
    fields: [goalProgress.goalId],
    references: [goals.id],
  }),
}))

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, {
    fields: [habitLogs.habitId],
    references: [habits.id],
  }),
}))

// ============================================
// TYPES (inferred from schema)
// ============================================
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  target_value: number
  current_value: number
  unit: string
  start_date: string | null
  end_date: string | null
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  color: string
  created_at: Date
  updated_at: Date
}

export type NewGoal = typeof goals.$inferInsert

export interface Habit {
  id: string
  user_id: string
  title: string
  description: string | null
  icon: string
  color: string
  frequency: 'daily' | 'weekly' | 'custom'
  target_days: number[] | null
  reminder_time: string | null
  streak_current: number
  streak_best: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export type NewHabit = typeof habits.$inferInsert

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  notes: string | null
  created_at: Date
}

export type NewHabitLog = typeof habitLogs.$inferInsert

export interface GoalProgress {
  id: string
  goal_id: string
  user_id: string
  value: number
  notes: string | null
  logged_at: string
  created_at: Date
}

export type NewGoalProgress = typeof goalProgress.$inferInsert

export type BlogPost = typeof blogPosts.$inferSelect
export type NewBlogPost = typeof blogPosts.$inferInsert
