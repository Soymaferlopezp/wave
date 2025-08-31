"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface DyslexiaSettings {
  openDyslexicFont: boolean
  sepiaTheme: boolean
  lineHighlight: boolean
  fontSize: number
  letterSpacing: number
  voiceSpeed: number
}

interface AutismSettings {
  reducedMotion: boolean
  softColors: boolean
  pictogramLabels: boolean
  highPredictability: boolean
  enhancedStructure: boolean
}

interface ADHDSettings {
  hideNonEssential: boolean
  pomodoroEnabled: boolean
  pomodoroTime: number
  pomodoroRunning: boolean
  pomodoroRemaining: number
  showProgress: boolean
  stepByStep: boolean
}

interface VisualSettings {
  ttsEnabled: boolean
  ttsRate: number
  ttsAutoStart: boolean
  voiceNavigationEnabled: boolean
  highContrastFocus: boolean
  skipLinksEnabled: boolean
}

interface AccessibilityContextType {
  activeProfile: string | null
  setActiveProfile: (profile: string | null) => void
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
  openModal: () => void
  dyslexiaSettings: DyslexiaSettings
  updateDyslexiaSettings: (settings: Partial<DyslexiaSettings>) => void
  autismSettings: AutismSettings
  updateAutismSettings: (settings: Partial<AutismSettings>) => void
  adhdSettings: ADHDSettings
  updateADHDSettings: (settings: Partial<ADHDSettings>) => void
  visualSettings: VisualSettings
  updateVisualSettings: (settings: Partial<VisualSettings>) => void
  currentReadingParagraph: string | null
  setCurrentReadingParagraph: (id: string | null) => void
  resetToDefaultProfile: () => void
  startTTS: (text: string) => void
  pauseTTS: () => void
  stopTTS: () => void
  isTTSPlaying: boolean
  setIsTTSPlaying: (playing: boolean) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentReadingParagraph, setCurrentReadingParagraph] = useState<string | null>(null)
  const [dyslexiaSettings, setDyslexiaSettings] = useState<DyslexiaSettings>({
    openDyslexicFont: true,
    sepiaTheme: false,
    lineHighlight: true,
    fontSize: 20,
    letterSpacing: 0.04,
    voiceSpeed: 1,
  })

  const [autismSettings, setAutismSettings] = useState<AutismSettings>({
    reducedMotion: true,
    softColors: true,
    pictogramLabels: true,
    highPredictability: true,
    enhancedStructure: true,
  })

  const [adhdSettings, setADHDSettings] = useState<ADHDSettings>({
    hideNonEssential: false,
    pomodoroEnabled: false,
    pomodoroTime: 25 * 60, // 25 minutes in seconds
    pomodoroRunning: false,
    pomodoroRemaining: 25 * 60,
    showProgress: true,
    stepByStep: true,
  })

  const [visualSettings, setVisualSettings] = useState<VisualSettings>({
    ttsEnabled: true,
    ttsRate: 1.0,
    ttsAutoStart: true,
    voiceNavigationEnabled: false,
    highContrastFocus: true,
    skipLinksEnabled: true,
  })

  const [isTTSPlaying, setIsTTSPlaying] = useState(false)

  useEffect(() => {
    const savedProfile = localStorage.getItem("wave_accessibility_choice")
    const dontAsk = localStorage.getItem("wave_dont_ask")

    if (savedProfile && dontAsk === "true") {
      const profile = savedProfile === "default" || savedProfile === "base" ? null : savedProfile
      setActiveProfile(profile)
      setIsModalOpen(false)

      if (profile) {
        applyProfileStyles(profile)
      }
    } else if (!savedProfile) {
      // First visit - show modal
      setIsModalOpen(true)
    }

    const savedSettings = localStorage.getItem("wave_dyslexia_settings")
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setDyslexiaSettings(parsed)
    }

    const savedAutismSettings = localStorage.getItem("wave_autism_settings")
    if (savedAutismSettings) {
      const parsed = JSON.parse(savedAutismSettings)
      setAutismSettings(parsed)
    }

    const savedADHDSettings = localStorage.getItem("wave_adhd_settings")
    if (savedADHDSettings) {
      const parsed = JSON.parse(savedADHDSettings)
      setADHDSettings(parsed)
    }

    const savedVisualSettings = localStorage.getItem("wave_visual_settings")
    if (savedVisualSettings) {
      const parsed = JSON.parse(savedVisualSettings)
      setVisualSettings(parsed)
    }

    const savedTTSRate = localStorage.getItem("wave_visual_tts_rate")
    if (savedTTSRate) {
      setVisualSettings((prev) => ({ ...prev, ttsRate: Number.parseFloat(savedTTSRate) }))
    }
  }, [])

  const applyProfileStyles = (profile: string) => {
    if (profile === "dyslexia") {
      const root = document.documentElement

      root.setAttribute("data-profile", "dyslexia")

      if (dyslexiaSettings.sepiaTheme) {
        root.setAttribute("data-sepia", "true")
        root.style.setProperty("--bg-primary", "#F5F5DC")
        root.style.setProperty("--text-primary", "#2F2F2F")
        root.style.setProperty("--card-bg", "#F0E68C")
      } else {
        root.removeAttribute("data-sepia")
        root.style.setProperty("--bg-primary", "#FAFAFA")
        root.style.setProperty("--text-primary", "#1C1C1C")
        root.style.setProperty("--card-bg", "#FFFFFF")
      }

      root.style.setProperty("--dyslexia-font-size-base", `${dyslexiaSettings.fontSize}px`)
      root.style.setProperty("--dyslexia-letter-spacing", `${dyslexiaSettings.letterSpacing}em`)

      document.body.classList.add("dyslexia-active")
    } else if (profile === "autism") {
      const root = document.documentElement
      root.setAttribute("data-profile", "autism")

      document.body.classList.add("autism-profile-active")

      if (autismSettings.softColors) {
        document.body.classList.add("soft-colors-active")
        root.style.setProperty("--primary-color", "#87CEEB")
        root.style.setProperty("--accent-color", "#E6E6FA")
        root.style.setProperty("--bg-primary", "#F0FFF0")
        root.style.setProperty("--text-primary", "#2F4F4F")
        root.style.setProperty("--card-bg", "#FEFEFE")
      } else {
        document.body.classList.remove("soft-colors-active")
        root.style.removeProperty("--primary-color")
        root.style.removeProperty("--accent-color")
        root.style.removeProperty("--bg-primary")
        root.style.removeProperty("--text-primary")
        root.style.removeProperty("--card-bg")
      }

      if (autismSettings.reducedMotion) {
        document.body.classList.add("reduced-motion-active")
        root.style.setProperty("--animation-duration", "0ms")
        root.style.setProperty("--transition-duration", "200ms")
        root.setAttribute("data-reduced-motion", "true")
      } else {
        document.body.classList.remove("reduced-motion-active")
        root.style.removeProperty("--animation-duration")
        root.style.removeProperty("--transition-duration")
        root.removeAttribute("data-reduced-motion")
      }

      if (autismSettings.pictogramLabels) {
        document.body.classList.add("pictogram-labels-active")
        root.setAttribute("data-pictogram-labels", "true")
      } else {
        document.body.classList.remove("pictogram-labels-active")
        root.removeAttribute("data-pictogram-labels")
      }

      if (autismSettings.highPredictability) {
        document.body.classList.add("consistent-layout-active")
        root.setAttribute("data-high-predictability", "true")
      } else {
        document.body.classList.remove("consistent-layout-active")
        root.removeAttribute("data-high-predictability")
      }

      if (autismSettings.enhancedStructure) {
        document.body.classList.add("clear-boundaries-active")
        root.setAttribute("data-enhanced-structure", "true")
      } else {
        document.body.classList.remove("clear-boundaries-active")
        root.removeAttribute("data-enhanced-structure")
      }
    } else if (profile === "adhd") {
      const root = document.documentElement
      root.setAttribute("data-preset", "adhd")
      root.setAttribute("data-profile", "adhd")

      document.body.classList.add("adhd-profile-active")

      if (adhdSettings.hideNonEssential) {
        document.body.classList.add("hide-non-essential")
      }

      if (adhdSettings.showProgress) {
        document.body.classList.add("show-progress")
      }

      if (adhdSettings.stepByStep) {
        document.body.classList.add("step-by-step")
      }

      window.dispatchEvent(
        new CustomEvent("wave:presetChanged", {
          detail: { preset: "adhd", settings: adhdSettings },
        }),
      )
    } else if (profile === "visual") {
      const root = document.documentElement
      root.setAttribute("data-preset", "visual")
      root.setAttribute("data-profile", "visual")

      document.body.classList.add("visual-profile-active")

      // Apply high contrast focus
      root.style.setProperty("--focus-outline", "6px solid #F1C47B")
      root.style.setProperty("--focus-outline-offset", "3px")

      // Set minimum font size
      root.style.setProperty("--min-font-size", "18px")
      root.style.setProperty("--line-height-accessible", "1.8")

      // Set QA hook
      if (typeof window !== "undefined") {
        ;(window as any).__waveVisualActive = true
      }

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent("wave:presetChanged:visual", {
          detail: { preset: "visual", settings: visualSettings },
        }),
      )

      // Auto-start TTS if enabled
      if (visualSettings.ttsAutoStart) {
        setTimeout(() => {
          const mainHeading = document.querySelector("h1")
          if (mainHeading) {
            startTTS(`Visual profile active. ${mainHeading.textContent}`)
          }
        }, 500)
      }
    } else {
      const root = document.documentElement
      root.removeAttribute("data-profile")
      root.removeAttribute("data-preset")
      root.removeAttribute("data-sepia")
      root.style.removeProperty("--bg-primary")
      root.style.removeProperty("--text-primary")
      root.style.removeProperty("--card-bg")
      root.style.removeProperty("--dyslexia-font-size-base")
      root.style.removeProperty("--dyslexia-letter-spacing")
      root.style.removeProperty("--primary-color")
      root.style.removeProperty("--accent-color")
      root.style.removeProperty("--animation-duration")
      root.style.removeProperty("--transition-duration")

      document.body.classList.remove(
        "dyslexia-active",
        "autism-active",
        "autism-profile-active",
        "soft-colors-active",
        "reduced-motion-active",
        "pictogram-labels-active",
        "consistent-layout-active",
        "clear-boundaries-active",
        "adhd-profile-active",
        "hide-non-essential",
        "show-progress",
        "step-by-step",
        "visual-profile-active",
      )

      if (typeof window !== "undefined") {
        ;(window as any).__waveVisualActive = false
      }
    }
  }

  const resetToDefaultProfile = () => {
    speechSynthesis.cancel()

    const root = document.documentElement
    root.removeAttribute("data-profile")
    root.removeAttribute("data-preset")
    root.removeAttribute("data-sepia")
    root.style.removeProperty("--bg-primary")
    root.style.removeProperty("--text-primary")
    root.style.removeProperty("--card-bg")
    root.style.removeProperty("--dyslexia-font-size-base")
    root.style.removeProperty("--dyslexia-letter-spacing")
    root.style.removeProperty("--primary-color")
    root.style.removeProperty("--accent-color")
    root.style.removeProperty("--animation-duration")
    root.style.removeProperty("--transition-duration")

    document.body.classList.remove(
      "dyslexia-active",
      "autism-active",
      "autism-profile-active",
      "soft-colors-active",
      "reduced-motion-active",
      "pictogram-labels-active",
      "consistent-layout-active",
      "clear-boundaries-active",
      "adhd-profile-active",
      "hide-non-essential",
      "show-progress",
      "step-by-step",
      "visual-profile-active",
    )

    localStorage.removeItem("wave_accessibility_choice")
    localStorage.removeItem("wave_dyslexia_settings")
    localStorage.removeItem("wave_autism_settings")
    localStorage.removeItem("wave_adhd_settings")
    localStorage.removeItem("wave_visual_settings")
    localStorage.removeItem("wave_visual_tts_rate")
    localStorage.setItem("wave_accessibility_choice", "base")
    localStorage.setItem("wave_dont_ask", "true")

    setActiveProfile(null)
    setCurrentReadingParagraph(null)
    setIsTTSPlaying(false)
  }

  useEffect(() => {
    if (activeProfile !== "dyslexia") {
      speechSynthesis.cancel()
      setCurrentReadingParagraph(null)
    }

    if (activeProfile === "dyslexia") {
      applyProfileStyles("dyslexia")
    } else if (activeProfile === "autism") {
      applyProfileStyles("autism")
    } else if (activeProfile === "adhd") {
      applyProfileStyles("adhd")
    } else if (activeProfile === "visual") {
      applyProfileStyles("visual")
    } else {
      const root = document.documentElement
      root.removeAttribute("data-profile")
      root.removeAttribute("data-preset")
      root.removeAttribute("data-sepia")
      root.style.setProperty("--bg-primary", "#FAFAFA")
      root.style.setProperty("--text-primary", "#1C1C1C")
      root.style.setProperty("--card-bg", "#FFFFFF")
      root.style.removeProperty("--dyslexia-font-size-base")
      root.style.removeProperty("--dyslexia-letter-spacing")
      root.style.removeProperty("--primary-color")
      root.style.removeProperty("--accent-color")
      root.style.removeProperty("--animation-duration")
      root.style.removeProperty("--transition-duration")

      document.body.classList.remove(
        "dyslexia-active",
        "autism-active",
        "autism-profile-active",
        "soft-colors-active",
        "reduced-motion-active",
        "pictogram-labels-active",
        "consistent-layout-active",
        "clear-boundaries-active",
        "adhd-profile-active",
        "hide-non-essential",
        "show-progress",
        "step-by-step",
        "visual-profile-active",
      )

      if (typeof window !== "undefined") {
        ;(window as any).__waveVisualActive = false
      }
    }
  }, [activeProfile, dyslexiaSettings, autismSettings, adhdSettings, visualSettings])

  const updateDyslexiaSettings = (newSettings: Partial<DyslexiaSettings>) => {
    const updated = { ...dyslexiaSettings, ...newSettings }
    setDyslexiaSettings(updated)
    localStorage.setItem("wave_dyslexia_settings", JSON.stringify(updated))

    if (activeProfile === "dyslexia") {
      const root = document.documentElement

      if (updated.sepiaTheme) {
        root.setAttribute("data-sepia", "true")
        root.style.setProperty("--bg-primary", "#F5F5DC")
        root.style.setProperty("--text-primary", "#2F2F2F")
        root.style.setProperty("--card-bg", "#F0E68C")
      } else {
        root.removeAttribute("data-sepia")
        root.style.setProperty("--bg-primary", "#FAFAFA")
        root.style.setProperty("--text-primary", "#1C1C1C")
        root.style.setProperty("--card-bg", "#FFFFFF")
      }

      root.style.setProperty("--dyslexia-font-size-base", `${updated.fontSize}px`)
      root.style.setProperty("--dyslexia-letter-spacing", `${updated.letterSpacing}em`)

      document.body.offsetHeight
    }
  }

  const updateAutismSettings = (newSettings: Partial<AutismSettings>) => {
    const updated = { ...autismSettings, ...newSettings }
    setAutismSettings(updated)
    localStorage.setItem("wave_autism_settings", JSON.stringify(updated))

    if (activeProfile === "autism") {
      applyProfileStyles("autism")
      document.body.offsetHeight // Force reflow for immediate visual changes
    }
  }

  const updateADHDSettings = (newSettings: Partial<ADHDSettings>) => {
    const updated = { ...adhdSettings, ...newSettings }
    setADHDSettings(updated)
    localStorage.setItem("wave_adhd_settings", JSON.stringify(updated))

    if (activeProfile === "adhd") {
      applyProfileStyles("adhd")
      document.body.offsetHeight // Force reflow for immediate visual changes
    }
  }

  const updateVisualSettings = (newSettings: Partial<VisualSettings>) => {
    const updated = { ...visualSettings, ...newSettings }
    setVisualSettings(updated)
    localStorage.setItem("wave_visual_settings", JSON.stringify(updated))

    // Save TTS rate separately for quick access
    if (newSettings.ttsRate !== undefined) {
      localStorage.setItem("wave_visual_tts_rate", newSettings.ttsRate.toString())
    }

    if (activeProfile === "visual") {
      applyProfileStyles("visual")
      document.body.offsetHeight // Force reflow for immediate visual changes
    }
  }

  const handleSetActiveProfile = (profile: string | null) => {
    setActiveProfile(profile)
    if (profile) {
      localStorage.setItem("wave_accessibility_choice", profile)
    } else {
      localStorage.setItem("wave_accessibility_choice", "base")
    }
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const startTTS = (text: string) => {
    if (!text) return

    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = visualSettings.ttsRate
    utterance.onstart = () => setIsTTSPlaying(true)
    utterance.onend = () => setIsTTSPlaying(false)
    utterance.onerror = () => setIsTTSPlaying(false)

    speechSynthesis.speak(utterance)

    // Announce action
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", "polite")
    announcement.textContent = "Reading started"
    announcement.style.position = "absolute"
    announcement.style.left = "-10000px"
    document.body.appendChild(announcement)
    setTimeout(() => document.body.removeChild(announcement), 1000)
  }

  const pauseTTS = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause()
      setIsTTSPlaying(false)

      // Announce action
      const announcement = document.createElement("div")
      announcement.setAttribute("aria-live", "polite")
      announcement.textContent = "Paused"
      announcement.style.position = "absolute"
      announcement.style.left = "-10000px"
      document.body.appendChild(announcement)
      setTimeout(() => document.body.removeChild(announcement), 1000)
    }
  }

  const stopTTS = () => {
    speechSynthesis.cancel()
    setIsTTSPlaying(false)

    // Announce action
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", "polite")
    announcement.textContent = "Stopped"
    announcement.style.position = "absolute"
    announcement.style.left = "-10000px"
    document.body.appendChild(announcement)
    setTimeout(() => document.body.removeChild(announcement), 1000)
  }

  return (
    <AccessibilityContext.Provider
      value={{
        activeProfile,
        setActiveProfile: handleSetActiveProfile,
        isModalOpen,
        setIsModalOpen,
        openModal,
        dyslexiaSettings,
        updateDyslexiaSettings,
        autismSettings,
        updateAutismSettings,
        adhdSettings,
        updateADHDSettings,
        visualSettings,
        updateVisualSettings,
        currentReadingParagraph,
        setCurrentReadingParagraph,
        resetToDefaultProfile,
        startTTS,
        pauseTTS,
        stopTTS,
        isTTSPlaying,
        setIsTTSPlaying,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}
