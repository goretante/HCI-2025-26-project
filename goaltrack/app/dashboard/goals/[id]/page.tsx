"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, Plus, Trash2, Calendar, Flag, Target
} from "lucide-react"
import type { Goal, GoalProgress } from "@/db/schema"
import { DashboardLayout } from "@/components/dashboard/layout"

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [progressLogs, setProgressLogs] = useState<GoalProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddProgress, setShowAddProgress] = useState(false)
  const [progressValue, setProgressValue] = useState('')
  const [progressNotes, setProgressNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadGoal()
  }, [params.id])

  async function loadGoal() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load goal
      const { data: goalData } = await supabase
        .from('goals')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (!goalData) {
        router.push('/dashboard/goals')
        return
      }

      setGoal(goalData)

      // Load progress logs
      const { data: logsData } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('goal_id', params.id)
        .order('logged_at', { ascending: false })

      setProgressLogs(logsData || [])
    } catch (error) {
      console.error('Error loading goal:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addProgress(e: React.FormEvent) {
    e.preventDefault()
    if (!progressValue || !goal) return
    
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const value = parseInt(progressValue)

      // Add progress log
      const { data: newLog } = await supabase
        .from('goal_progress')
        .insert({
          goal_id: goal.id,
          user_id: user.id,
          value,
          notes: progressNotes || null
        })
        .select()
        .single()

      if (newLog) {
        setProgressLogs(prev => [newLog, ...prev])
        
        // Update goal current value
        const newCurrentValue = goal.current_value + value
        const newStatus = newCurrentValue >= goal.target_value ? 'completed' : goal.status

        const { data: updatedGoal } = await supabase
          .from('goals')
          .update({ 
            current_value: newCurrentValue,
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', goal.id)
          .select()
          .single()

        if (updatedGoal) {
          setGoal(updatedGoal)
        }
      }

      setProgressValue('')
      setProgressNotes('')
      setShowAddProgress(false)
    } catch (error) {
      console.error('Error adding progress:', error)
    } finally {
      setSaving(false)
    }
  }

  async function deleteProgressLog(logId: string, value: number) {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj unos?')) return
    if (!goal) return

    try {
      await supabase.from('goal_progress').delete().eq('id', logId)
      setProgressLogs(prev => prev.filter(log => log.id !== logId))

      // Update goal current value
      const newCurrentValue = Math.max(0, goal.current_value - value)
      const { data: updatedGoal } = await supabase
        .from('goals')
        .update({ 
          current_value: newCurrentValue,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', goal.id)
        .select()
        .single()

      if (updatedGoal) {
        setGoal(updatedGoal)
      }
    } catch (error) {
      console.error('Error deleting progress:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout currentPage="goals">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  if (!goal) {
    return (
      <DashboardLayout currentPage="goals">
        <div className="flex h-96 flex-col items-center justify-center">
          <p className="text-gray-600">Cilj nije pronađen</p>
          <Link href="/dashboard/goals">
            <Button className="mt-4">Natrag na ciljeve</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const progress = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
  const remaining = goal.target_value - goal.current_value

  return (
    <DashboardLayout currentPage="goals">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Back button */}
        <Link 
          href="/dashboard/goals"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Natrag na ciljeve
        </Link>

        {/* Goal header */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: goal.color }}
                />
                <span className="text-sm font-medium text-gray-500 uppercase">
                  {goal.category}
                </span>
                {goal.status === 'completed' && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Ostvaren
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold">{goal.title}</h1>
              {goal.description && (
                <p className="mt-2 text-gray-600">{goal.description}</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Napredak</span>
              <span className="text-lg font-bold" style={{ color: goal.color }}>
                {progress}%
              </span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: goal.color }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{goal.current_value}</p>
              <p className="text-sm text-gray-500">Trenutno</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{goal.target_value}</p>
              <p className="text-sm text-gray-500">Cilj ({goal.unit})</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.max(0, remaining)}</p>
              <p className="text-sm text-gray-500">Preostalo</p>
            </div>
          </div>

          {/* Meta info */}
          <div className="mt-4 flex flex-wrap gap-4 border-t pt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Kreirano: {new Date(goal.created_at).toLocaleDateString('hr-HR')}
            </span>
            {goal.end_date ? (
              <span className="flex items-center gap-1">
                <Flag className="h-4 w-4" />
                Rok: {new Date(goal.end_date).toLocaleDateString('hr-HR')}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Flag className="h-4 w-4" />
                Rok: Nema roka
              </span>
            )}
          </div>
        </div>

        {/* Add progress */}
        <div className="mb-6">
          {!showAddProgress ? (
            <Button 
              onClick={() => setShowAddProgress(true)}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={goal.status === 'completed'}
            >
              <Plus className="h-4 w-4" />
              Dodaj napredak
            </Button>
          ) : (
            <form onSubmit={addProgress} className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold">Dodaj napredak</h3>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">
                  Vrijednost ({goal.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={progressValue}
                  onChange={(e) => setProgressValue(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder={`npr. 10 ${goal.unit}`}
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Bilješka (opcionalno)</label>
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:outline-none"
                  rows={2}
                  placeholder="Dodajte bilješku..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddProgress(false)}
                  className="flex-1"
                >
                  Odustani
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? 'Spremanje...' : 'Spremi'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Progress history */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold">Povijest napretka</h2>
          
          {progressLogs.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Još nema zabilježenog napretka
            </p>
          ) : (
            <div className="space-y-3">
              {progressLogs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-600">
                        +{log.value} {goal.unit}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(log.logged_at).toLocaleDateString('hr-HR')}
                      </span>
                    </div>
                    {log.notes && (
                      <p className="mt-1 text-sm text-gray-600">{log.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteProgressLog(log.id, log.value)}
                    className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
