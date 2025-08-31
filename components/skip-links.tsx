"use client"

import { useAccessibility } from "@/contexts/accessibility-context"

export default function SkipLinks() {
  const { activeProfile } = useAccessibility()

  if (activeProfile !== "visual") return null

  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-6 focus:ring-yellow-400 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="absolute top-4 left-32 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-6 focus:ring-yellow-400 focus:ring-offset-2"
      >
        Skip to navigation
      </a>
      <a
        href="#footer"
        className="absolute top-4 left-60 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-6 focus:ring-yellow-400 focus:ring-offset-2"
      >
        Skip to footer
      </a>
    </div>
  )
}
