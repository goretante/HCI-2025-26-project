import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowRight, Search } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-9xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 leading-none">
            404
          </h1>
        </div>

        {/* Emoji */}
        <div className="text-6xl mb-6 animate-bounce">
          🎯
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          Ups! Stranica nije pronađena
        </h2>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-600 mb-2">
          Izgleda da si zalutao sa puta prema uspjehu.
        </p>
        <p className="text-gray-500 mb-8">
          Ova stranica ne postoji, ali ne brini — tvoji ciljevi te čekaju!
        </p>

        {/* Quick Links */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200/50 shadow-xl">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
            Evo gdje možeš ići:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/">
              <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105">
                <Home className="h-5 w-5" />
                Početna
              </button>
            </Link>

            <Link href="/dashboard">
              <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105">
                <Search className="h-5 w-5" />
                Kontrolna ploča
              </button>
            </Link>

            <Link href="/dashboard/goals">
              <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105">
                <ArrowRight className="h-5 w-5" />
                Moji ciljevi
              </button>
            </Link>

            <Link href="/blog">
              <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105">
                <Search className="h-5 w-5" />
                Blog
              </button>
            </Link>
          </div>
        </div>

        {/* Fun message */}
        <div className="text-center mb-8">
          <p className="text-gray-600 italic">
            "Uspjeh nije odredište, to je putovanje. Vratimo se na pravi put! 🚀"
          </p>
        </div>

        {/* Back button */}
        <Link href="/">
          <button className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border-2 border-gray-200 transition-all duration-200 hover:border-gray-300 hover:shadow-lg">
            ← Nazad na početnu
          </button>
        </Link>
      </div>

      {/* Footer message */}
      <div className="absolute bottom-8 text-center text-gray-600 text-sm">
        <p>
          Trebaš pomoć?{" "}
          <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold underline">
            Kontaktiraj nas
          </Link>
        </p>
      </div>
    </main>
  )
}