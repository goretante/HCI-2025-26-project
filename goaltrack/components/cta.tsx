import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const benefits = ["Besplatno za uvijek", "Neograničen broj ciljeva", "Detaljna analitika", "Mobilna aplikacija"]

export function CTA() {
  return (
    <section className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 p-8 md:p-12 lg:p-16">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-white text-balance md:text-4xl lg:text-5xl">
              Spremni za promjenu?
            </h2>
            <p className="mb-8 text-lg text-purple-100 text-pretty">
              Započnite svoje putovanje prema uspjehu danas. Potpuno besplatno, bez obveza.
            </p>

            <div className="mb-8 flex flex-wrap justify-center gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm"
                >
                  <Check className="h-4 w-4" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100">
                Kreirajte besplatni račun
                <span className="ml-2">→</span>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white bg-transparent text-white hover:bg-white/10">
                Kontaktirajte nas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
