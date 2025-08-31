"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"

interface TestTTSParagraphProps {
  children: React.ReactNode
  className?: string
}

export function TestTTSParagraph({ children, className = "" }: TestTTSParagraphProps) {
  const [isReading, setIsReading] = useState(false)

  const handleSpeak = () => {
    console.log("[v0] TTS button clicked")

    // Check if Web Speech API is available
    if (!("speechSynthesis" in window)) {
      console.log("[v0] Speech synthesis not supported")
      alert("Text-to-speech is not supported in this browser")
      return
    }

    console.log("[v0] Speech synthesis available")

    // Stop any current speech
    if (window.speechSynthesis.speaking) {
      console.log("[v0] Stopping current speech")
      window.speechSynthesis.cancel()
      setIsReading(false)
      return
    }

    // Get text content
    const text =
      typeof children === "string"
        ? children
        : (children as any)?.props?.children || "Test text to speech functionality"

    console.log("[v0] Text to speak:", text)

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text)

    // Set basic properties
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    console.log("[v0] Created utterance with rate:", utterance.rate)

    // Event handlers
    utterance.onstart = () => {
      console.log("[v0] Speech started")
      setIsReading(true)
    }

    utterance.onend = () => {
      console.log("[v0] Speech ended")
      setIsReading(false)
    }

    utterance.onerror = (event) => {
      console.log("[v0] Speech error:", event.error)
      setIsReading(false)
    }

    // Start speaking
    console.log("[v0] Starting speech synthesis")
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className={`relative group ${className}`}>
      <p className="leading-relaxed">{children}</p>

      {/* TTS Button */}
      <Button
        onClick={handleSpeak}
        size="sm"
        variant="outline"
        className="absolute -right-12 top-0 opacity-100 bg-background border shadow-sm hover:bg-accent"
        aria-label={isReading ? "Stop reading" : "Read aloud"}
      >
        {isReading ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
    </div>
  )
}
