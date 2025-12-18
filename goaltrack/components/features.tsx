import { Target, Calendar, TrendingUp, Award, Users, Zap } from "lucide-react"

const features = [
  {
    icon: Target,
    title: "Osobni ciljevi",
    description: "Postavite, organizirajte i pratite svoje osobne i profesionalne ciljeve s lakoćom.",
    color: "bg-blue-500",
  },
  {
    icon: Calendar,
    title: "Praćenje navika",
    description: "Izgradite pozitivne navike i pratite svoj dnevni napredak prema boljoj verziji sebe.",
    color: "bg-purple-500",
  },
  {
    icon: TrendingUp,
    title: "Izvještaji napretka",
    description: "Detaljne analize i vizualizacije vašeg napretka kroz vrijeme s interaktivnim grafovima.",
    color: "bg-pink-500",
  },
  {
    icon: Award,
    title: "Motivacijski sistem",
    description: "Zarađujte bedževe i nagrade dok postižete svoje ciljeve i održavate navike.",
    color: "bg-green-500",
  },
  {
    icon: Users,
    title: "Timski ciljevi",
    description: "Surađujte s prijateljima ili kolegama na zajedničkim ciljevima i projektima.",
    color: "bg-orange-500",
  },
  {
    icon: Zap,
    title: "Pametna podsjećanja",
    description: "Prilagođena podsjećanja koja vas drže na pravom putu prema vašim ciljevima.",
    color: "bg-indigo-500",
  },
]

export function Features() {
  return (
    <section id="znacajke" className="bg-gray-50 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-center">
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-600">✨ Značajke</span>
        </div>

        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-balance md:text-4xl lg:text-5xl">Sve što trebate za uspjeh</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 text-pretty">
            Moćni alati dizajnirani da vam pomognu da ostvarite svoje snove i izgradite bolje navike
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="scroll-animate rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className={`mb-4 inline-flex rounded-xl ${feature.color} p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-gray-600 text-pretty">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
