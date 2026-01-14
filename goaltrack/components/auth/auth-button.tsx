"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <Button className="bg-blue-600 hover:bg-blue-700" disabled>
        <span className="h-4 w-4 animate-pulse rounded bg-white/30" />
      </Button>
    )
  }

  if (user) {
    return (
      <Link href="/dashboard">
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <User className="h-4 w-4" />
          Dashboard
        </Button>
      </Link>
    )
  }

  return (
    <Link href="/login">
      <Button className="bg-blue-600 hover:bg-blue-700">
        Prijava/Registracija
      </Button>
    </Link>
  )
}
