"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function useScrollAnimation() {
  const pathname = usePathname()
  
  useEffect(() => {
    // Small delay to ensure DOM is ready after navigation
    const timer = setTimeout(() => {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view")
          }
        })
      }, observerOptions)

      const elements = document.querySelectorAll(".scroll-animate")
      
      // Reset animations on page change
      elements.forEach((el) => {
        el.classList.remove("in-view")
      })
      
      // Small delay then observe
      requestAnimationFrame(() => {
        elements.forEach((el) => observer.observe(el))
      })

      return () => {
        elements.forEach((el) => observer.unobserve(el))
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])
}

export function ScrollAnimationProvider({ children }: { children: React.ReactNode }) {
  useScrollAnimation()
  return <>{children}</>
}
