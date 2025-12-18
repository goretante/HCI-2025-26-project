import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-950 px-4 py-12 text-gray-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">O nama</h3>
            <p className="mb-4 text-sm text-pretty">
              GoalTrack je aplikacija koja vam pomomaže da postavite, pratite i ostvarite svoje ciljeve i navike.
            </p>
            <p className="text-sm">Gradite bolju verziju sebe svaki dan.</p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Brzi linkovi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Pregledaj ciljeve
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Postavi navike
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Politika privatnosti
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Podrška</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Centar za pomoć
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Sigurnost
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Uvjeti održavanja
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Uvjeti korištenja
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Kontakt</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">📧</span>
                <span>info@goaltrack.com</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">📱</span>
                <span>+385 12 345 6789</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">📍</span>
                <span>Split, Hrvatska</span>
              </li>
            </ul>

            <div className="mt-6 flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 text-sm md:flex-row">
          <div>© 2025 GoalTrack. Sva prava pridržana.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">
              Privatnost
            </a>
            <a href="#" className="hover:text-white">
              Uvjeti
            </a>
            <a href="#" className="hover:text-white">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
