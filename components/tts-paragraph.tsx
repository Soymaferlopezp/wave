"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Volume2, Pause } from "lucide-react"
import { useAccessibility } from "@/contexts/accessibility-context"

interface TTSParagraphProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function TTSParagraph({ children, className = "", id }: TTSParagraphProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const { dyslexiaSettings, activeProfile, currentReadingParagraph, setCurrentReadingParagraph } = useAccessibility()

  if (activeProfile !== "dyslexia") {
    return <p className={className}>{children}</p>
  }

  const handleSpeak = () => {
    console.log("[v0] TTS button clicked, isPlaying:", isPlaying)

    if (isPlaying) {
      // Stop current speech
      speechSynthesis.cancel()
      setIsPlaying(false)
      setIsHighlighted(false)
      setCurrentReadingParagraph(null)
      console.log("[v0] Speech stopped")
      return
    }

    // Check if speech synthesis is available
    if (!("speechSynthesis" in window)) {
      console.log("[v0] Speech synthesis not supported")
      return
    }

    // Stop any other speech first
    speechSynthesis.cancel()

    // Reset all other paragraphs
    setCurrentReadingParagraph(id || null)

    // Get text content
    const textContent =
      typeof children === "string" ? children : (children as any)?.props?.children || "Text content not available"

    console.log("[v0] Speaking text:", textContent.substring(0, 50) + "...")

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(textContent)
    utterance.lang = "en-US"
    utterance.rate = dyslexiaSettings.voiceSpeed
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utteranceRef.current = utterance

    utterance.onstart = () => {
      console.log("[v0] Speech started")
      setIsPlaying(true)
      setIsHighlighted(true)
    }

    utterance.onend = () => {
      console.log("[v0] Speech ended")
      setIsPlaying(false)
      setIsHighlighted(false)
      setCurrentReadingParagraph(null)
    }

    utterance.onerror = (event) => {
      console.log("[v0] Speech error:", event.error)
      if (event.error !== "interrupted") {
        console.error("[v0] TTS error:", event.error)
      }
      setIsPlaying(false)
      setIsHighlighted(false)
      setCurrentReadingParagraph(null)
    }

    speechSynthesis.speak(utterance)
  }

  // Stop speech if another paragraph is reading
  if (currentReadingParagraph && currentReadingParagraph !== id && isPlaying) {
    setIsPlaying(false)
    setIsHighlighted(false)
  }

  const highlightClass = isHighlighted ? "bg-accent/20 transition-colors duration-200" : ""

  return (
    <div className={`group relative ${highlightClass}`}>
      <p className={className}>{children}</p>
      <button
        onClick={handleSpeak}
        className="absolute top-0 right-0 p-1 rounded-full bg-background/80 hover:bg-background border border-border hover:border-primary transition-all duration-200 opacity-100"
        aria-label={isPlaying ? "Stop reading" : "Read aloud"}
        title={isPlaying ? "Stop reading" : "Read aloud"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 text-primary" />
        ) : (
          <Volume2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
        )}
      </button>
    </div>
  )
}
