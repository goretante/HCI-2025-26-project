"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Target, Calendar, TrendingUp, Flame, Award, CheckCircle2
} from "lucide-react"
import type { Goal, Habit, HabitLog } from "@/db/schema"
import { DashboardLayout } from "@/components/dashboard/layout"

export default function ProgressPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [weekLogs, setWeekLogs] = useState<HabitLog[]>([])
  const [monthLogs, setMonthLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('hr-HR', { weekday: 'short' }),
    }
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Recalculate dailyCompletions kada se promijene habits ili weekLogs
    console.log('Habits updated:', habits)
    console.log('WeekLogs updated:', weekLogs)
  }, [habits, weekLogs])

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user:', user?.id)
      
      if (!user) {
        console.error('No user logged in')
        setLoading(false)
        return
      }

      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)

      if (goalsError) {
        console.error('Goals error:', goalsError)
        throw goalsError
      }
      console.log('Goals loaded:', goalsData)
      setGoals(goalsData || [])

      // Load habits - DEBUG
      console.log('Querying habits for user:', user.id)
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (habitsError) {
        console.error('Habits error:', habitsError)
        throw habitsError
      }
      
      console.log('Raw habits from DB:', habitsData)
      console.log('Habits count:', habitsData?.length)
      setHabits(habitsData || [])

      // Load week logs
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 6)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]

      console.log('Querying week logs from:', weekAgoStr)
      const { data: weekData, error: weekError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', weekAgoStr)

      if (weekError) {
        console.error('Week logs error:', weekError)
        throw weekError
      }
      console.log('Week logs loaded:', weekData)
      setWeekLogs(weekData || [])

      // Load month logs
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 29)
      const monthAgoStr = monthAgo.toISOString().split('T')[0]

      const { data: monthData, error: monthError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', monthAgoStr)

      if (monthError) {
        console.error('Month logs error:', monthError)
        throw monthError
      }
      console.log('Month logs loaded:', monthData)
      setMonthLogs(monthData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats - OVO se sada automatski ažurira kada se promijene habits/weekLogs
  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.status === 'completed').length
  const activeGoals = goals.filter(g => g.status === 'active').length
  
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak_best)) : 0
  const currentStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak_current)) : 0

  // Weekly completion rate
  const totalPossibleWeek = habits.length * 7
  const weeklyCompletionRate = totalPossibleWeek > 0 
    ? Math.round((weekLogs.length / totalPossibleWeek) * 100) 
    : 0

  // Monthly completion rate
  const totalPossibleMonth = habits.length * 30
  const monthlyCompletionRate = totalPossibleMonth > 0 
    ? Math.round((monthLogs.length / totalPossibleMonth) * 100) 
    : 0

  // Daily completions for chart - ovo će se automatski ažurirati
  const dailyCompletions = last7Days.map(day => ({
    day: day.dayName,
    completed: weekLogs.filter(log => log.completed_at === day.date).length,
    total: habits.length
  }))

  const maxCompleted = Math.max(...dailyCompletions.map(d => d.completed), 1)

  console.log('Current habits state:', habits)
  console.log('Current weekLogs state:', weekLogs)
  console.log('Current dailyCompletions:', dailyCompletions)

  if (loading) {
    return (
      <DashboardLayout currentPage="progress">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPage="progress">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Moj napredak</h1>
          <p className="mt-1 text-gray-600">Pregled vaših statistika i postignuća</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Target className="h-6 w-6 text-blue-600" />}
            iconBg="bg-blue-100"
            label="Ostvareni ciljevi"
            value={`${completedGoals}/${totalGoals}`}
          />
          <StatCard
            icon={<Flame className="h-6 w-6 text-orange-500" />}
            iconBg="bg-orange-100"
            label="Najbolji streak"
            value={`${bestStreak} dana`}
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
            iconBg="bg-green-100"
            label="Tjedna stopa"
            value={`${weeklyCompletionRate}%`}
          />
          <StatCard
            icon={<Award className="h-6 w-6 text-purple-600" />}
            iconBg="bg-purple-100"
            label="Mjesečna stopa"
            value={`${monthlyCompletionRate}%`}
          />
        </div>

        {/* Weekly Chart */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold">Tjedni pregled navika</h2>
          
          {habits.length === 0 ? (
            <div className="space-y-6">
              {/* Empty state chart */}
              <div className="flex h-80 items-end justify-between gap-2 bg-gray-50 p-4 rounded-lg">
                {last7Days.map((day, i) => {
                  const isToday = i === 6
                  
                  return (
                    <div key={`${day.dayName}-${i}`} className="flex flex-1 flex-col items-center justify-end gap-2">
                      <div className="h-full w-full flex items-end justify-center">
                        <div 
                          className={`w-3/4 rounded-t-lg ${
                            isToday 
                              ? 'bg-gray-300' 
                              : 'bg-gray-200'
                          }`}
                          style={{ height: '20%' }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-400">0/0</span>
                      <span className={`whitespace-nowrap text-xs font-bold ${isToday ? 'text-gray-600' : 'text-gray-500'}`}>
                        {day.dayName}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Summary */}
              <div className="flex flex-wrap items-center justify-center gap-6 border-t pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-400">0</p>
                  <p className="text-xs text-gray-500">Završeno ovaj tjedan</p>
                </div>
                <div className="hidden h-8 w-px bg-gray-200 sm:block" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500">Ukupno moguće</p>
                </div>
                <div className="hidden h-8 w-px bg-gray-200 sm:block" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">0%</p>
                  <p className="text-xs text-gray-500">Uspješnost</p>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 text-center text-sm text-blue-700">
                Kreiraj naviku da počneš vidjeti podatke. <a href="/dashboard/habits" className="font-semibold hover:underline">Kreiraj naviku</a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bar chart - ISPRAVLJENO */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex h-80 items-end justify-between gap-2">
                  {dailyCompletions.map((day, i) => {
                    const percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0
                    const isToday = i === 6
                    const minHeight = Math.max(percentage, 20)
                    
                    return (
                      <div key={`${day.day}-${i}`} className="flex flex-1 flex-col items-center group/bar cursor-pointer">
                        {/* STUPAC - NA VRHU */}
                        <div className="h-64 w-full flex items-end justify-center mb-3">
                          <div 
                            className={`w-8 rounded-t-lg transition-all duration-300 ${
                              isToday 
                                ? 'bg-purple-600 shadow-lg group-hover/bar:bg-purple-700 group-hover/bar:shadow-xl' 
                                : percentage > 0
                                ? 'bg-purple-400 group-hover/bar:bg-purple-500'
                                : 'bg-gray-300 group-hover/bar:bg-gray-400'
                            }`}
                            style={{ height: `${minHeight}%` }}
                          />
                        </div>

                        {/* BROJ ZADATAKA */}
                        <span className="text-sm font-bold text-gray-900 mb-2 group-hover/bar:text-purple-600 transition-colors">
                          {day.completed}/{day.total}
                        </span>
                        
                        {/* DAN */}
                        <span className={`text-xs font-bold ${isToday ? 'text-purple-600' : 'text-gray-600'} group-hover/bar:text-purple-600 transition-colors`}>
                          {day.day}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="flex flex-wrap items-center justify-center gap-6 border-t pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{weekLogs.length}</p>
                  <p className="text-xs text-gray-500">Završeno ovaj tjedan</p>
                </div>
                <div className="hidden h-8 w-px bg-gray-200 sm:block" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{totalPossibleWeek}</p>
                  <p className="text-xs text-gray-500">Ukupno moguće</p>
                </div>
                <div className="hidden h-8 w-px bg-gray-200 sm:block" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{weeklyCompletionRate}%</p>
                  <p className="text-xs text-gray-500">Uspješnost</p>
                </div>
              </div>

              {weekLogs.length === 0 && (
                <div className="rounded-lg bg-blue-50 p-4 text-center text-sm text-blue-700">
                  Označi navike kao dovršene da počneš vidjeti podatke
                </div>
              )}
            </div>
          )}
        </div>

        {/* Goals Progress */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold">Napredak ciljeva</h2>
          
          {goals.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Dodajte ciljeve za prikaz napretka
            </div>
          ) : (
            <div className="space-y-4">
              {goals.filter(g => g.status === 'active').map(goal => {
                const progress = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
                
                return (
                  <div key={goal.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                        <h3 className="font-medium">{goal.title}</h3>
                      </div>
                      <span className="font-semibold" style={{ color: goal.color }}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: goal.color }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </p>
                  </div>
                )
              })}

              {completedGoals > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="mb-3 text-sm font-medium text-gray-500">Ostvareni ciljevi</h3>
                  <div className="flex flex-wrap gap-2">
                    {goals.filter(g => g.status === 'completed').map(goal => (
                      <div 
                        key={goal.id}
                        className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {goal.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Habits Streaks */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold">Streakovi navika</h2>
          
          {habits.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Dodajte navike za prikaz streakova
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {habits.map(habit => (
                <div key={habit.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <span className="text-3xl">{habit.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-medium">{habit.title}</h3>
                    <div className="mt-1 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-4 w-4" />
                        Trenutni: {habit.streak_current}
                      </span>
                      <span className="text-gray-500">
                        Najbolji: {habit.streak_best}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon, iconBg, label, value }: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  )
}
