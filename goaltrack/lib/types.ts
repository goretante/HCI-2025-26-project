export type GoalProgress = {
  id: string
  goal_id: string
  user_id: string
  value: number
  notes?: string | null
  logged_at: string
  created_at: string
}

export type HabitLog = {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  notes?: string | null
  created_at: string
}

export type DashboardStats = {
  totalGoals: number
  completedGoals: number
  activeGoals: number
  totalHabits: number
  activeHabits: number
  currentStreak: number
  bestStreak: number
  weeklyProgress: number
  todayHabitsCompleted: number
  todayHabitsTotal: number
}
