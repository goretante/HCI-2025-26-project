"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Target, Calendar, User, Menu, X, LogOut, FileText } from "lucide-react"
import { useState } from "react"

interface DevLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: '/dev', icon: Home, label: 'Dashboard', exact: true },
  { href: '/dev/goals', icon: Target, label: 'Ciljevi', exact: false },
  { href: '/dev/habits', icon: Calendar, label: 'Navike', exact: false },
  { href: '/dev/blog', icon: FileText, label: 'Blog', exact: false },
]

export function DevLayout({ children }: DevLayoutProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dev Warning Banner - Fixed at very top */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-400 px-4 py-1.5 text-center text-sm font-medium text-amber-900">
        ⚠️ DEV MODE - Testiranje bez autentifikacije
      </div>

      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-[36px] z-40 hidden h-[calc(100vh-36px)] w-64 border-r bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30">
              <span className="text-lg font-bold text-white">GT</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">GoalTrack</span>
              <p className="text-[10px] text-gray-400 -mt-1">Pratite svoje ciljeve</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? '' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">Test Korisnik</p>
                <p className="truncate text-xs text-gray-500">dev@goaltrack.local</p>
              </div>
            </div>
            <Link href="/" className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <LogOut className="h-4 w-4" />
              Povratak na početnu
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="fixed top-[36px] left-0 right-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 lg:hidden">
        <Link href="/dev" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-sm font-bold text-white">GT</span>
          </div>
          <span className="text-lg font-bold">GoalTrack</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ top: '86px' }}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <nav className="space-y-1 p-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
              <Link href="/" className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-gray-600 hover:bg-gray-50">
                <LogOut className="h-4 w-4" />
                Povratak na početnu
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="min-h-screen pt-[36px] lg:pl-64">
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white lg:hidden safe-area-bottom">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  active ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
