"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Modal } from '@/components/modal'
import { 
  Target, Plus, ArrowLeft, Trash2, Edit, MoreVertical,
  Calendar, Flag, X, Check
} from "lucide-react"
import type { Goal } from "@/db/schema"
import { DashboardLayout } from "@/components/dashboard/layout"

const CATEGORIES = [
  { value: 'osobno', label: 'Osobno', color: '#3B82F6' },
  { value: 'zdravlje', label: 'Zdravlje', color: '#10B981' },
  { value: 'karijera', label: 'Karijera', color: '#8B5CF6' },
  { value: 'financije', label: 'Financije', color: '#F59E0B' },
  { value: 'edukacija', label: 'Edukacija', color: '#EC4899' },
  { value: 'ostalo', label: 'Ostalo', color: '#6B7280' },
]

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#EF4444', '#06B6D4', '#6B7280']

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'osobno',
    target_value: 100,
    unit: '%',
    end_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    color: '#3B82F6'
  })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadGoals()
  }, [])

  async function loadGoals() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('Loaded goals from Supabase:', data)
      console.log('First goal keys:', data?.[0] ? Object.keys(data[0]) : 'No goals')
      console.log('First goal targetValue:', data?.[0]?.targetValue)
      console.log('First goal target_value:', data?.[0]?.target_value)

      setGoals(data || [])
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const goalData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        target_value: formData.target_value,
        current_value: 0,
        unit: formData.unit,
        end_date: formData.end_date || null,
        priority: formData.priority,
        color: formData.color,
        status: 'active'
      }

      if (editingGoal) {
        // Update existing goal
        const { data, error } = await supabase
          .from('goals')
          .update({
            ...goalData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingGoal.id)
          .select()
          .single()

        if (error) throw error
        if (data) {
          setGoals(prev => prev.map(g => g.id === data.id ? data : g))
        }
      } else {
        // Create new goal
        const { data, error } = await supabase
          .from('goals')
          .insert({
            user_id: user.id,
            ...goalData
          })
          .select()
          .single()

        if (error) throw error
        if (data) {
          setGoals(prev => [data, ...prev])
        }
      }

      closeModal()
    } catch (error) {
      console.error('Error saving goal:', error)
      alert('Greška pri čuvanju cilja: ' + (error as any).message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteGoal(id: string) {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj cilj?')) return

    try {
      await supabase.from('goals').delete().eq('id', id)
      setGoals(prev => prev.filter(g => g.id !== id))
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  async function toggleGoalStatus(goal: Goal) {
    const newStatus = goal.status === 'completed' ? 'active' : 'completed'
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({ 
          status: newStatus,
          current_value: newStatus === 'completed' ? goal.target_value : 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', goal.id)
        .select()
        .single()

      if (error) throw error
      if (data) {
        setGoals(prev => prev.map(g => g.id === data.id ? data : g))
      }
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  function openModal(goal?: Goal) {
    if (goal) {
      setEditingGoal(goal)
      setFormData({
        title: goal.title,
        description: goal.description || '',
        category: goal.category,
        target_value: goal.target_value,
        unit: goal.unit,
        end_date: goal.end_date || '',
        priority: goal.priority as 'low' | 'medium' | 'high',
        color: goal.color
      })
    } else {
      setEditingGoal(null)
      setFormData({
        title: '',
        description: '',
        category: 'osobno',
        target_value: 100,
        unit: '%',
        end_date: '',
        priority: 'medium',
        color: '#3B82F6'
      })
    }
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingGoal(null)
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  return (
    <DashboardLayout currentPage="goals">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Moji ciljevi</h1>
            <p className="mt-1 text-gray-600">Definiraj i prati svoje ciljeve</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Dodaj cilj
          </button>
        </div>

        {/* Modal */}
        <Modal 
          isOpen={showModal} 
          onClose={closeModal}
          title={editingGoal ? 'Uredi cilj' : 'Dodaj novi cilj'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naslov
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="npr. Čitati 12 knjiga"
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
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Detaljniji opis vašeg cilja..."
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorija
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Target Value */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciljna vrijednost
                </label>
                <input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mjerna jedinica
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="npr. knjiga"
                  required
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rok (opcionalno)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
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
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors order-1 sm:order-2 disabled:opacity-50"
              >
                {editingGoal ? 'Spremi promjene' : 'Dodaj cilj'}
              </button>
            </div>
          </form>
        </Modal>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Nemate još ciljeva</h3>
            <p className="mb-6 text-gray-600">Kreirajte svoj prvi cilj i počnite pratiti napredak!</p>
            <Button onClick={() => openModal()} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Kreiraj prvi cilj
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Aktivni ciljevi ({activeGoals.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {activeGoals.map((goal) => (
                    <GoalCard 
                      key={goal.id} 
                      goal={goal} 
                      onEdit={() => openModal(goal)}
                      onDelete={() => deleteGoal(goal.id)}
                      onToggleStatus={() => toggleGoalStatus(goal)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Ostvareni ciljevi ({completedGoals.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {completedGoals.map((goal) => (
                    <GoalCard 
                      key={goal.id} 
                      goal={goal} 
                      onEdit={() => openModal(goal)}
                      onDelete={() => deleteGoal(goal.id)}
                      onToggleStatus={() => toggleGoalStatus(goal)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function GoalCard({ goal, onEdit, onDelete, onToggleStatus }: { 
  goal: Goal
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: () => void
}) {
  const progress = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
  const isCompleted = goal.status === 'completed'

  return (
    <div className={`rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md ${
      isCompleted ? 'opacity-75' : ''
    }`}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: goal.color }}
          />
          <span className="text-xs font-medium text-gray-500 uppercase">
            {CATEGORIES.find(c => c.value === goal.category)?.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleStatus}
            className={`rounded p-1 transition-colors ${
              isCompleted 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={isCompleted ? 'Označi kao aktivan' : 'Označi kao završen'}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className={`mb-2 font-semibold ${isCompleted ? 'line-through' : ''}`}>
        {goal.title}
      </h3>

      {goal.description && (
        <p className="mb-3 text-sm text-gray-600 line-clamp-2">{goal.description}</p>
      )}

      <div className="mb-2">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-gray-600">Napredak</span>
          <span className="font-semibold" style={{ color: goal.color }}>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: goal.color }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
        {goal.end_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(goal.end_date).toLocaleDateString('hr-HR')}
          </span>
        )}
      </div>
    </div>
  )
}
