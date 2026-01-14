import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-950 px-4 py-12 text-gray-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">GoalTrack</h3>
            <p className="mb-4 text-sm text-pretty">
              Aplikacija koja vam pomaže da postavite, pratite i ostvarite svoje ciljeve i navike.
            </p>
            <p className="text-sm">Gradite bolju verziju sebe svaki dan.</p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Linkovi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white">
                  Početna
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Prijava
                </Link>
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
                <span className="text-purple-400">📍</span>
                <span>Split, Hrvatska</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-sm text-center">
          <div>© 2025 GoalTrack. Sva prava pridržana.</div>
        </div>
      </div>
    </footer>
  )
}
