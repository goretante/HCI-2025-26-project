import Image from "next/image"

const steps = [
  {
    title: "Postavite ciljeve",
    description: "Odredite jasno i točno cilj svoje putanje. Kategorizirajte ih prema prioritetima.",
  },
  {
    title: "Pratite navike",
    description: "Kreirajte zdravu rutinu i pratite učestalost navika koje vas vode prema cilju.",
  },
  {
    title: "Analizirajte napredak",
    description: "Pregledajte detaljne analize i dobijte uvid u razmjene koje vođuju uspjehu.",
  },
  {
    title: "Ostvarite uspjeh",
    description: "Slavite male postignuća i ostvarujte gusti momentum na putanje svim ciljevima.",
  },
]

export function HowItWorks() {
  return (
    <section id="kako-radi" className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-center">
          <span className="rounded-full bg-purple-50 px-4 py-2 text-sm text-purple-600">✨ Rivalo</span>
        </div>

        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-balance md:text-4xl lg:text-5xl">Kako GoalTrack radi</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Jednostavan i učinkovit pristup postizanju vašim ciljevima
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="scroll-animate flex gap-4"
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <span className="text-sm font-bold text-purple-600">0{index + 1}</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                  <p className="text-gray-600 text-pretty">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative h-64 w-full overflow-hidden rounded-2xl md:h-[500px]">
              <Image src="/images/slika.png" alt="Team collaboration" fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
