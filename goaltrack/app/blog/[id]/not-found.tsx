import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Članak nije pronađen</p>
        <p className="text-gray-500 mb-8">Članak koji tražiš nije dostupan ili je obrisan.</p>
        
        <Link href="/blog">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <ChevronLeft className="h-4 w-4" />
            Nazad na blog
          </Button>
        </Link>
      </div>
    </main>
  )
}