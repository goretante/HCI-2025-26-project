"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const supabase = createClient()

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true)
    
    // Check for error in URL params
    const error = searchParams.get('error')
    if (error) {
      setMessage({ type: 'error', text: error })
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "Ime je obavezno"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email je obavezan"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Unesite valjanu email adresu"
    }

    if (!formData.password) {
      newErrors.password = "Lozinka je obavezna"
    } else if (formData.password.length < 8) {
      newErrors.password = "Lozinka mora imati najmanje 8 znakova"
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Lozinke se ne podudaraju"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setMessage(null)

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setMessage({ type: 'error', text: 'Pogrešan email ili lozinka' })
          } else if (error.message.includes('Email not confirmed')) {
            setMessage({ type: 'error', text: 'Molimo potvrdite email adresu prije prijave' })
          } else {
            setMessage({ type: 'error', text: error.message })
          }
          setIsLoading(false)
          return
        }

        if (data.user) {
          setMessage({ type: 'success', text: 'Uspješna prijava! Preusmjeravanje...' })
          router.push('/dashboard')
          router.refresh()
        }
      } else {
        // Register
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          if (error.message.includes('already registered')) {
            setMessage({ type: 'error', text: 'Korisnik s ovom email adresom već postoji' })
          } else {
            setMessage({ type: 'error', text: error.message })
          }
          setIsLoading(false)
          return
        }

        if (data.user) {
          if (data.user.identities?.length === 0) {
            setMessage({ type: 'error', text: 'Korisnik s ovom email adresom već postoji' })
          } else {
            setMessage({ 
              type: 'success', 
              text: 'Račun kreiran! Provjerite email za potvrdu.' 
            })
            setFormData({ name: "", email: "", password: "", confirmPassword: "" })
          }
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Došlo je do greške. Pokušajte ponovno.' })
    }

    setIsLoading(false)
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage({ type: 'error', text: 'Greška pri prijavi s Google-om' })
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const benefits = [
    "Pratite neograničen broj ciljeva",
    "Detaljni izvještaji napretka",
    "Personalizirana podsjećanja",
    "Sync na svim uređajima",
  ]

  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex h-full">
        {/* Left side - Form */}
        <div 
          className={`flex w-full flex-col justify-center px-4 sm:px-6 lg:w-1/2 lg:px-8 xl:px-12 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          <div className="mx-auto w-full max-w-sm">
            {/* Logo */}
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <span className="text-base font-bold text-white">GT</span>
              </div>
              <span className="text-lg font-bold">GoalTrack</span>
            </Link>

            {/* Header */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-gray-900">
                {isLogin ? "Dobrodošli natrag!" : "Kreirajte račun"}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {isLogin
                  ? "Prijavite se za nastavak praćenja ciljeva"
                  : "Započnite svoju putanju prema uspjehu"}
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {message.type === 'success' ? (
                  <Check className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name field (only for register) */}
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                    Ime i prezime
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      } py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Ivan Horvat"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
              )}

              {/* Email field */}
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email adresa
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="vas@email.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  Lozinka
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } py-2.5 pl-9 pr-10 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Confirm Password field (only for register) */}
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                    Potvrdite lozinku
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full rounded-lg border ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                      } py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Forgot password link (only for login) */}
              {isLogin && (
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700">
                    Zaboravili ste lozinku?
                  </Link>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 py-2.5 text-sm hover:bg-blue-700 disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Učitavanje...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {isLogin ? "Prijavite se" : "Kreirajte račun"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-4 flex items-center">
              <div className="flex-1 border-t border-gray-300" />
              <span className="px-3 text-xs text-gray-500">ili</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>

            {/* Google login button */}
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-70"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Nastavite s Google-om
            </button>

            {/* Toggle login/register */}
            <p className="mt-4 text-center text-sm text-gray-600">
              {isLogin ? "Nemate račun? " : "Već imate račun? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setErrors({})
                  setMessage(null)
                }}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                {isLogin ? "Registrirajte se" : "Prijavite se"}
              </button>
            </p>
          </div>
        </div>

        {/* Right side - Benefits (hidden on mobile) */}
        <div 
          className={`hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-blue-600 lg:to-purple-700 lg:p-8 transition-all duration-700 delay-200 ease-out ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          }`}
        >
          <div className="max-w-md text-white">
            <h2 className="mb-4 text-2xl font-bold">
              Počnite pratiti svoje ciljeve već danas
            </h2>
            <p className="mb-6 text-base text-blue-100">
              Pridružite se tisućama korisnika koji su već transformirali svoje navike i ostvarili svoje snove.
            </p>
            
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li 
                  key={index} 
                  className={`flex items-center gap-3 transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>

            <div 
              className={`mt-8 rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "800ms" }}
            >
              <p className="mb-3 text-sm italic">
                "GoalTrack mi je pomogao da izgradim rutinu koju sam godinama pokušavao uspostaviti!"
              </p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20" />
                <div>
                  <p className="text-sm font-semibold">Marko P.</p>
                  <p className="text-xs text-blue-200">Korisnik već 6 mjeseci</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
