import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 px-4 py-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-center md:justify-start">
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-600">🎯 Ostvarite svoje ciljeve</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <h1 className="mb-6 text-balance text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Pratite <span className="text-blue-600">ciljeve</span> i <span className="text-purple-600">navike</span>{" "}
              jednostavno
            </h1>

            <p className="mb-8 text-pretty text-lg text-gray-600 leading-relaxed">
              GoalTrack vam pomaže da ostanete fokusirani, organizirani i motivirani. Postavite ciljeve, pratite navike
              i praćajte svoj napredak u realnom vremenu.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  Počnite besplatno
                  <span className="ml-2">→</span>
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <div className="text-3xl font-bold">10k+</div>
                <div className="text-sm text-gray-600">Aktivnih korisnika</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50k+</div>
                <div className="text-sm text-gray-600">Ostvarenih ciljeva</div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative h-56 w-full overflow-hidden rounded-2xl shadow-2xl sm:h-72 md:h-[450px] lg:h-[500px]">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
                alt="Professional celebrating success"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
