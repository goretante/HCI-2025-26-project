"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { LogoutButton } from "@/components/auth/logout-button"
import { 
  Target, Calendar, TrendingUp, Plus, Flame, CheckCircle2, 
  Circle, BarChart3, Settings, Home, List, User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Goal, Habit, HabitLog } from "@/db/schema"
import type { DashboardStats } from "@/lib/types"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingHabit, setTogglingHabit] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      // Load goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5)

      setGoals(goalsData || [])

      // Load habits
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      setHabits(habitsData || [])

      // Load today's logs
      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_at', today)

      setTodayLogs(logsData || [])

      // Calculate stats
      const { data: allGoals } = await supabase
        .from('goals')
        .select('status')
        .eq('user_id', user.id)

      const { data: allHabits } = await supabase
        .from('habits')
        .select('streak_current, streak_best, is_active')
        .eq('user_id', user.id)

      const activeHabits = allHabits?.filter(h => h.is_active) || []
      
      setStats({
        totalGoals: allGoals?.length || 0,
        completedGoals: allGoals?.filter(g => g.status === 'completed').length || 0,
        activeGoals: allGoals?.filter(g => g.status === 'active').length || 0,
        totalHabits: allHabits?.length || 0,
        activeHabits: activeHabits.length,
        currentStreak: Math.max(...(allHabits?.map(h => h.streak_current) || [0]), 0),
        bestStreak: Math.max(...(allHabits?.map(h => h.streak_best) || [0]), 0),
        weeklyProgress: 0,
        todayHabitsCompleted: logsData?.length || 0,
        todayHabitsTotal: activeHabits.length
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleHabit(habitId: string) {
    setTogglingHabit(habitId)
    try {
      const existing = todayLogs.find(log => log.habit_id === habitId)

      if (existing) {
        await supabase.from('habit_logs').delete().eq('id', existing.id)
        setTodayLogs(prev => prev.filter(log => log.id !== existing.id))
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('habit_logs')
          .insert({ habit_id: habitId, user_id: user.id, completed_at: today })
          .select()
          .single()

        if (data) {
          setTodayLogs(prev => [...prev, data])
        }
      }

      // Refresh stats
      if (stats) {
        const newCompleted = todayLogs.find(log => log.habit_id === habitId)
          ? stats.todayHabitsCompleted - 1
          : stats.todayHabitsCompleted + 1
        setStats({ ...stats, todayHabitsCompleted: newCompleted })
      }
    } catch (error) {
      console.error('Error toggling habit:', error)
    } finally {
      setTogglingHabit(null)
    }
  }

  const isHabitCompleted = (habitId: string) => todayLogs.some(log => log.habit_id === habitId && log.completed_at === today)
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Korisnik'

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-600">Učitavanje...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <span className="text-base font-bold text-white">GT</span>
            </div>
            <span className="text-lg font-bold">GoalTrack</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-blue-600">
              <Home className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/dashboard/goals" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100">
              <Target className="h-5 w-5" />
              <span>Ciljevi</span>
            </Link>
            <Link href="/dashboard/habits" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100">
              <Calendar className="h-5 w-5" />
              <span>Navike</span>
            </Link>
            <Link href="/dashboard/progress" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100">
              <BarChart3 className="h-5 w-5" />
              <span>Napredak</span>
            </Link>
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <div className="mt-3">
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pb-20 lg:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Dobrodošli, {userName}! 👋
            </h1>
            <p className="mt-1 text-gray-600">
              {new Date().toLocaleDateString('hr-HR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.activeGoals || 0}</p>
                  <p className="text-sm text-gray-600">Aktivni ciljevi</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.todayHabitsCompleted || 0}/{stats?.todayHabitsTotal || 0}</p>
                  <p className="text-sm text-gray-600">Današnje navike</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.currentStreak || 0}</p>
                  <p className="text-sm text-gray-600">Trenutni streak</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.completedGoals || 0}</p>
                  <p className="text-sm text-gray-600">Ostvareni ciljevi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Today's Habits */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Današnje navike</h2>
                <Link href="/dashboard/habits">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova
                  </Button>
                </Link>
              </div>

              {habits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2 font-medium text-gray-900">Nemate još navika</h3>
                  <p className="mb-4 text-sm text-gray-600">Dodajte navike koje želite pratiti</p>
                  <Link href="/dashboard/habits">
                    <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4" />
                      Dodaj prvu naviku
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {habits.map((habit) => {
                    const completedToday = todayLogs.filter((log: HabitLog) => log.habit_id === habit.id && log.completed_at === today).length
                    const completed = isHabitCompleted(habit.id)
                    const isToggling = togglingHabit === habit.id
                    return (
                      <button
                        key={habit.id}
                        onClick={() => toggleHabit(habit.id)}
                        disabled={isToggling}
                        className={`flex w-full items-center gap-3 rounded-lg border p-3 transition-all ${
                          completed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${isToggling ? 'opacity-50' : ''}`}
                      >
                        {completed ? (
                          <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-500" />
                        ) : (
                          <Circle className="h-6 w-6 flex-shrink-0 text-gray-300" />
                        )}
                        <span className="text-2xl">{habit.icon}</span>
                        <span className={`flex-1 text-left font-medium ${completed ? 'text-green-700 line-through' : ''}`}>
                          {habit.title}
                        </span>
                        {habit.streak_current > 0 && (
                          <div className="rounded-lg bg-orange-50 px-3 py-1">
                            <p className="text-xs font-semibold text-orange-600">
                              🔥 Serija: {habit.streak_current}
                            </p>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Active Goals */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Aktivni ciljevi</h2>
                <Link href="/dashboard/goals">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novi
                  </Button>
                </Link>
              </div>

              {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Target className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2 font-medium text-gray-900">Nemate još ciljeva</h3>
                  <p className="mb-4 text-sm text-gray-600">Kreirajte svoj prvi cilj</p>
                  <Link href="/dashboard/goals">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                      Kreiraj prvi cilj
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal) => {
                    const progress = Math.round((goal.current_value / goal.target_value) * 100)
                    return (
                      <Link key={goal.id} href={`/dashboard/goals/${goal.id}`} className="block">
                        <div className="rounded-lg border p-4 transition-colors hover:border-gray-300 hover:bg-gray-50">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="font-medium">{goal.title}</h3>
                            <span className="text-sm font-semibold" style={{ color: goal.color }}>
                              {progress}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${progress}%`, backgroundColor: goal.color }}
                            />
                          </div>
                          <p className="text-sm text-gray-600">{goal.current_value}/{goal.target_value} {goal.unit}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white lg:hidden">
            <div className="flex justify-around py-2">
              <Link href="/dashboard" className="flex flex-col items-center gap-1 px-4 py-2 text-blue-600">
                <Home className="h-5 w-5" />
                <span className="text-xs">Početna</span>
              </Link>
              <Link href="/dashboard/goals" className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400">
                <Target className="h-5 w-5" />
                <span className="text-xs">Ciljevi</span>
              </Link>
              <Link href="/dashboard/habits" className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400">
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Navike</span>
              </Link>
              <Link href="/dashboard/progress" className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400">
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">Napredak</span>
              </Link>
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400"
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs">Profil</span>
                </button>
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute bottom-full right-0 mb-2 w-48 rounded-lg border bg-white shadow-lg z-40">
                      <div className="p-3 border-b">
                        <p className="text-sm font-medium truncate">{userName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <LogoutButton />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </nav>
        </div>
      </main>
    </div>
  )
}
