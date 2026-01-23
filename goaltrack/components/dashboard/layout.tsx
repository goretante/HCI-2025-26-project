"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LogoutButton } from "@/components/auth/logout-button"
import { 
  Home, Target, Calendar, BarChart3, User, Menu, X
} from "lucide-react"

type PageType = 'dashboard' | 'goals' | 'habits' | 'progress'

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage: PageType
}

const navItems = [
  { id: 'dashboard', href: '/dashboard', icon: Home, label: 'Dashboard' },
  { id: 'goals', href: '/dashboard/goals', icon: Target, label: 'Ciljevi' },
  { id: 'habits', href: '/dashboard/habits', icon: Calendar, label: 'Navike' },
  { id: 'progress', href: '/dashboard/progress', icon: BarChart3, label: 'Napredak' },
]

export function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    getUser()
  }, [router, supabase.auth])

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Korisnik'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <span className="text-base font-bold text-white">GT</span>
              </div>
              <span className="text-lg font-bold">GoalTrack</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
                </Link>
              )
            })}
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white p-4" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="mt-6 border-t pt-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium">{userName}</p>
                  <p className="truncate text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:ml-64 pb-20 lg:pb-0">
        {children}
        
        {/* Mobile bottom navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white lg:hidden">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
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
      </main>
    </div>
  )
}
