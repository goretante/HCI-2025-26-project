export function Stats() {
  const stats = [
    { value: "95%", label: "Stopa zadovoljstva korisnika" },
    { value: "2.5x", label: "Veća produktivnost" },
    { value: "50k+", label: "Postignuti ciljevi" },
    { value: "24/7", label: "Podrška i praćenje" },
  ]

  return (
    <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white text-balance md:text-4xl">Brojevi govore sami za sebe</h2>
          <p className="mx-auto max-w-2xl text-lg text-purple-100">
            Pridružite se tisućama korisnika koji već postiže svoje ciljeve
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-4xl font-bold text-white md:text-5xl">{stat.value}</div>
              <div className="text-purple-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
