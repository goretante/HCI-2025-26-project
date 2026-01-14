"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { 
  Calendar, Plus, Trash2, Edit, X, CheckCircle2, Circle, Flame
} from "lucide-react"
import type { Habit, HabitLog } from "@/db/schema"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Modal } from '@/components/modal'

const ICONS = ['✓', '💪', '📚', '🏃', '💧', '🧘', '💤', '🥗', '💊', '🎯', '✍️', '🎨', '🎵', '💻', '🌱']
const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#EF4444', '#06B6D4', '#6B7280']

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([])
  const [weekLogs, setWeekLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '✓',
    color: '#8B5CF6',
    frequency: 'daily' as 'daily' | 'weekly' | 'custom',
  })
  const [saving, setSaving] = useState(false)
  const [togglingHabit, setTogglingHabit] = useState<string | null>(null)

  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('hr-HR', { weekday: 'short' }),
      dayNum: date.getDate(),
      isToday: date.toISOString().split('T')[0] === today
    }
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load habits
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      setHabits(habitsData || [])

      // Load today's logs
      const { data: todayData } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_at', today)

      setTodayLogs(todayData || [])

      // Load week logs
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 6)
      const { data: weekData } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', weekAgo.toISOString().split('T')[0])

      setWeekLogs(weekData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleHabit(habitId: string, date: string) {
    setTogglingHabit(`${habitId}-${date}`)
    try {
      const habit = habits.find(h => h.id === habitId)
      if (!habit) return

      const existing = weekLogs.find(log => log.habit_id === habitId && log.completed_at === date)

      if (existing) {
        // Ukloni log
        await supabase.from('habit_logs').delete().eq('id', existing.id)
        setWeekLogs(prev => prev.filter(log => log.id !== existing.id))
        
        // Resetuj streak ako je danas
        if (date === today) {
          await supabase
            .from('habits')
            .update({ streak_current: 0 })
            .eq('id', habitId)
          setHabits(prev => prev.map(h => h.id === habitId ? { ...h, streak_current: 0 } : h))
        }
      } else {
        // Dodaj log
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: newLog } = await supabase
          .from('habit_logs')
          .insert({ habit_id: habitId, user_id: user.id, completed_at: date })
          .select()
          .single()

        if (newLog) {
          setWeekLogs(prev => [...prev, newLog])

          // Ažuriraj streak ako je danas
          if (date === today) {
            const newStreak = habit.streak_current + 1
            await supabase
              .from('habits')
              .update({ 
                streak_current: newStreak,
                streak_best: Math.max(habit.streak_best, newStreak)
              })
              .eq('id', habitId)
            setHabits(prev => prev.map(h => h.id === habitId 
              ? { ...h, streak_current: newStreak, streak_best: Math.max(h.streak_best, newStreak) } 
              : h
            ))
          }
        }
      }
    } catch (error) {
      console.error('Error toggling habit:', error)
    } finally {
      setTogglingHabit(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (editingHabit) {
        const { data } = await supabase
          .from('habits')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingHabit.id)
          .select()
          .single()

        if (data) {
          setHabits(prev => prev.map(h => h.id === data.id ? data : h))
        }
      } else {
        const { data } = await supabase
          .from('habits')
          .insert({
            user_id: user.id,
            ...formData
          })
          .select()
          .single()

        if (data) {
          setHabits(prev => [data, ...prev])
        }
      }

      closeModal()
    } catch (error) {
      console.error('Error saving habit:', error)
    } finally {
      setSaving(false)
    }
  }

  async function deleteHabit(id: string) {
    if (!confirm('Jeste li sigurni da želite obrisati ovu naviku?')) return

    try {
      await supabase
        .from('habits')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      setHabits(prev => prev.filter(h => h.id !== id))
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  function openModal(habit?: Habit) {
    if (habit) {
      setEditingHabit(habit)
      setFormData({
        title: habit.title,
        description: habit.description || '',
        icon: habit.icon,
        color: habit.color,
        frequency: habit.frequency as 'daily' | 'weekly' | 'custom',
      })
    } else {
      setEditingHabit(null)
      setFormData({
        title: '',
        description: '',
        icon: '✓',
        color: '#8B5CF6',
        frequency: 'daily',
      })
    }
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingHabit(null)
  }

  const isCompleted = (habitId: string, date: string) => 
    weekLogs.some(log => log.habit_id === habitId && log.completed_at === date)

  const completedToday = todayLogs.length
  const totalHabits = habits.length

  return (
    <DashboardLayout currentPage="habits">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Moje navike</h1>
            <p className="mt-1 text-gray-600">Prati i unaprjeđuj svoje svakodnevne navike</p>
          </div>
          <button
            onClick={() => openModal()}
            className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 transition-colors"
          >
            Dodaj naviku
          </button>
        </div>

        {/* Modal */}
        <Modal 
          isOpen={showModal} 
          onClose={closeModal}
          title={editingHabit ? 'Uredi naviku' : 'Dodaj novu naviku'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naziv navike
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="npr. Čitanje 30 minuta"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Dodatne informacije o navici..."
                rows={3}
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Učestalost
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  frequency: e.target.value as 'daily' | 'weekly' | 'custom'
                })}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="daily">Dnevno</option>
                <option value="weekly">Tjedno</option>
                <option value="custom">Prilagođeno</option>
              </select>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ikona
              </label>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`rounded-lg p-3 text-xl transition-all ${
                      formData.icon === icon
                        ? 'bg-purple-600 ring-2 ring-purple-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Boja
              </label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      formData.color === color ? 'scale-110 ring-2 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-4 border-t">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 transition-colors order-2 sm:order-1"
              >
                Otkaži
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 transition-colors order-1 sm:order-2 disabled:opacity-50"
              >
                {editingHabit ? 'Spremi promjene' : 'Dodaj naviku'}
              </button>
            </div>
          </form>
        </Modal>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          </div>
        ) : habits.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Nemate još navika</h3>
            <p className="mb-6 text-gray-600">Dodajte navike koje želite pratiti svaki dan!</p>
            <Button onClick={() => openModal()} className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4" />
              Dodaj prvu naviku
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Habits list */}
            <div className="space-y-4">
              {/* Week header */}
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="grid grid-cols-8 gap-2 text-center text-sm">
                  <div className="py-2 font-medium text-gray-500">Navika</div>
                  {last7Days.map(day => (
                    <div 
                      key={day.date} 
                      className={`py-2 ${day.isToday ? 'rounded-lg bg-purple-100 font-bold text-purple-600' : 'text-gray-500'}`}
                    >
                      <div className="text-xs">{day.dayName}</div>
                      <div>{day.dayNum}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Habits */}
              {habits.map(habit => {
                const completedDays = last7Days.filter(day => isCompleted(habit.id, day.date)).length
                
                return (
                  <div key={habit.id} className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      {/* Habit info */}
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span className="mt-1 shrink-0 text-3xl">{habit.icon}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-base text-gray-900">{habit.title}</h3>
                          <p className="text-xs text-gray-500">{completedDays}/7 ovaj tjedan</p>
                          {habit.description && (
                            <p className="mt-1 line-clamp-1 text-xs text-gray-600">{habit.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Streak */}
                      <div className="shrink-0">
                        {habit.streak_current > 0 && (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600">
                            <Flame className="h-3 w-3" />
                            {habit.streak_current}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => openModal(habit)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Day checkboxes */}
                    <div className="grid grid-cols-7 gap-2">
                      {last7Days.map(day => {
                        const completed = isCompleted(habit.id, day.date)
                        const isToggling = togglingHabit === `${habit.id}-${day.date}`
                        
                        return (
                          <button
                            key={day.date}
                            onClick={() => toggleHabit(habit.id, day.date)}
                            disabled={isToggling}
                            className={`flex h-10 items-center justify-center rounded-lg transition-all ${
                              completed 
                                ? 'text-green-600' 
                                : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                            } ${isToggling ? 'opacity-50' : ''}`}
                            style={completed ? { backgroundColor: `${habit.color}20`, color: habit.color } : {}}
                            title={day.date}
                          >
                            {completed ? (
                              <CheckCircle2 className="h-6 w-6" />
                            ) : (
                              <Circle className="h-6 w-6" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
