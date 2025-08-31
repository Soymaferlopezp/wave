"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Volume2, Pause } from "lucide-react"
import { useAccessibility } from "@/contexts/accessibility-context"

interface DyslexiaParagraphProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function DyslexiaParagraph({ children, className = "", id }: DyslexiaParagraphProps) {
  const { activeProfile, dyslexiaSettings, currentReadingParagraph, setCurrentReadingParagraph } = useAccessibility()
  const [isReading, setIsReading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const paragraphId = id || `paragraph-${Math.random().toString(36).substr(2, 9)}`

  const isCurrentlyReading = currentReadingParagraph === paragraphId

  const handleReadAloud = () => {
    // Check if speech synthesis is supported
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis not supported")
      return
    }

    if (isReading) {
      // Stop current reading
      speechSynthesis.cancel()
      setIsReading(false)
      setCurrentReadingParagraph(null)
      return
    }

    // Get text content from paragraph
    const text = paragraphRef.current?.textContent || ""
    if (!text.trim()) {
      console.warn("No text content to read")
      return
    }

    // Stop any existing speech before starting new one
    speechSynthesis.cancel()

    // Set this paragraph as currently reading
    setCurrentReadingParagraph(paragraphId)

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text)

    // Apply speed settings from dyslexia settings
    utterance.rate = dyslexiaSettings.voiceSpeed || 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Set up event handlers
    utterance.onstart = () => {
      console.log("[v0] TTS started for paragraph:", paragraphId)
      setIsReading(true)
    }

    utterance.onend = () => {
      console.log("[v0] TTS ended for paragraph:", paragraphId)
      setIsReading(false)
      setCurrentReadingParagraph(null)
    }

    utterance.onerror = (event) => {
      if (event.error === "interrupted") {
        console.log("[v0] TTS interrupted (normal behavior)")
      } else {
        console.error("[v0] TTS error:", event.error)
      }
      setIsReading(false)
      setCurrentReadingParagraph(null)
    }

    // Store reference and start speech
    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (currentReadingParagraph && currentReadingParagraph !== paragraphId && isReading) {
      speechSynthesis.cancel()
      setIsReading(false)
    }
  }, [currentReadingParagraph, paragraphId, isReading])

  useEffect(() => {
    // Speed changes will only apply to new speech sessions
  }, [dyslexiaSettings.voiceSpeed])

  const isDyslexiaActive = activeProfile === "dyslexia"
  const shouldHighlight = isDyslexiaActive && dyslexiaSettings.lineHighlight && (isHovered || isCurrentlyReading)

  return (
    <div className="relative group">
      <p
        ref={paragraphRef}
        className={`
          readable-paragraph
          ${className}
          ${isDyslexiaActive ? "dyslexia-paragraph" : ""}
          ${shouldHighlight ? "reading-highlight" : ""}
          ${isCurrentlyReading ? "currently-reading" : ""}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          fontSize: isDyslexiaActive ? `${dyslexiaSettings.fontSize}px` : undefined,
          lineHeight: isDyslexiaActive ? "1.6" : undefined,
          letterSpacing: isDyslexiaActive ? `${dyslexiaSettings.letterSpacing}em` : undefined,
        }}
      >
        {children}
      </p>

      {isDyslexiaActive && (
        <button
          onClick={handleReadAloud}
          className="tts-button absolute -right-10 top-0 w-8 h-8 rounded-full bg-[#094985] hover:bg-[#0A5A9A] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#094985] focus:ring-offset-2"
          aria-label={isReading ? "Stop reading" : "Read paragraph aloud"}
          title={isReading ? "Stop reading" : "Read paragraph aloud"}
        >
          {isReading ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
}
