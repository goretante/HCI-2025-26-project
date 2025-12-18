import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ScrollAnimationProvider } from "@/components/scroll-animation"
import "./globals.css"
import { Header } from "@/components/header"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GoalTrack - Pratite ciljeve i navike jednostavno",
  description: "Moćni alati dizajnirani da vam pomognu da postavite, pratite i ostvarite svoje ciljeve i navike",
  generator: "v0.app",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ScrollAnimationProvider>
          <Header />
          {children}
          <Analytics />
        </ScrollAnimationProvider>
      </body>
    </html>
  )
}
