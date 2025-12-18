import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 px-4 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-lg font-bold text-white">GT</span>
          </div>
          <span className="text-lg md:text-xl font-bold">GoalTrack</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/#znacajke" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Značajke
          </Link>
          <Link href="/#kako-radi" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Kako radi
          </Link>
          <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Blog
          </Link>
        </nav>

        <div className="hidden md:block">
          <Button className="bg-blue-600 hover:bg-blue-700">Prijava/Registracija</Button>
        </div>

        <MobileNav />
      </div>
    </header>
  )
}
