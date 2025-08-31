"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff, Play, Pause, RotateCcw, ArrowDown, Timer, CheckSquare } from "lucide-react"
import { useAccessibility } from "@/contexts/accessibility-context"

interface ADHDControlsProps {
  currentStep?: number
  totalSteps?: number
  onNextStep?: () => void
  checklist?: Array<{ id: string; text: string; completed: boolean }>
  onToggleChecklistItem?: (id: string) => void
  moduleId?: string
}

export function ADHDControls({
  currentStep = 1,
  totalSteps = 1,
  onNextStep,
  checklist = [],
  onToggleChecklistItem,
  moduleId = "default",
}: ADHDControlsProps) {
  const { activeProfile, adhdSettings, updateADHDSettings } = useAccessibility()
  const [announcement, setAnnouncement] = useState("")
  const pomodoroIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const announcementTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Pomodoro timer logic
  useEffect(() => {
    if (activeProfile !== "adhd") return

    if (adhdSettings.pomodoroRunning && adhdSettings.pomodoroRemaining > 0) {
      pomodoroIntervalRef.current = setInterval(() => {
        updateADHDSettings({
          pomodoroRemaining: Math.max(0, adhdSettings.pomodoroRemaining - 1),
        })

        // Announce time remaining at specific intervals
        const remaining = adhdSettings.pomodoroRemaining - 1
        if (remaining === 600) {
          // 10 minutes
          setAnnouncement("10 minutes remaining in your focus session")
        } else if (remaining === 300) {
          // 5 minutes
          setAnnouncement("5 minutes remaining in your focus session")
        } else if (remaining === 0) {
          setAnnouncement("Focus session complete! Take a break.")
          updateADHDSettings({ pomodoroRunning: false })
        }
      }, 1000)
    } else {
      if (pomodoroIntervalRef.current) {
        clearInterval(pomodoroIntervalRef.current)
        pomodoroIntervalRef.current = null
      }
    }

    return () => {
      if (pomodoroIntervalRef.current) {
        clearInterval(pomodoroIntervalRef.current)
      }
    }
  }, [adhdSettings.pomodoroRunning, adhdSettings.pomodoroRemaining, updateADHDSettings])

  // Auto-dismiss announcements
  useEffect(() => {
    if (announcement) {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current)
      }
      announcementTimeoutRef.current = setTimeout(() => {
        setAnnouncement("")
      }, 5000)
    }
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current)
      }
    }
  }, [announcement])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handlePomodoroStart = () => {
    updateADHDSettings({ pomodoroRunning: true })
    setAnnouncement("Focus session started")
  }

  const handlePomodoroPause = () => {
    updateADHDSettings({ pomodoroRunning: false })
    setAnnouncement("Focus session paused")
  }

  const handlePomodoroReset = () => {
    updateADHDSettings({
      pomodoroRunning: false,
      pomodoroRemaining: adhdSettings.pomodoroTime,
    })
    setAnnouncement("Focus session reset")
  }

  const handleToggleNonEssential = () => {
    const newValue = !adhdSettings.hideNonEssential
    updateADHDSettings({ hideNonEssential: newValue })
    setAnnouncement(newValue ? "Non-essential UI hidden" : "Non-essential UI shown")
  }

  const handleShowNext = () => {
    // Find next actionable element and scroll to it
    const actionableElements = document.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )

    const currentFocus = document.activeElement
    let nextIndex = 0

    if (currentFocus) {
      const currentIndex = Array.from(actionableElements).indexOf(currentFocus as Element)
      nextIndex = (currentIndex + 1) % actionableElements.length
    }

    const nextElement = actionableElements[nextIndex] as HTMLElement
    if (nextElement) {
      nextElement.focus()
      nextElement.scrollIntoView({ behavior: "smooth", block: "center" })
      setAnnouncement(`Focused on ${nextElement.tagName.toLowerCase()}`)
    }
  }

  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Top utility bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Progress indicator */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium whitespace-nowrap">
                  Step {currentStep} of {totalSteps}
                </span>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Hide non-essential toggle */}
              <Button variant="outline" size="sm" onClick={handleToggleNonEssential} className="gap-2 bg-transparent">
                {adhdSettings.hideNonEssential ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span className="hidden sm:inline">{adhdSettings.hideNonEssential ? "Show" : "Hide"} extras</span>
              </Button>

              {/* Pomodoro timer */}
              <Card className="flex items-center gap-2 px-3 py-1">
                <Timer className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">{formatTime(adhdSettings.pomodoroRemaining)}</span>
                <div className="flex gap-1">
                  {!adhdSettings.pomodoroRunning ? (
                    <Button size="sm" variant="ghost" onClick={handlePomodoroStart}>
                      <Play className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={handlePomodoroPause}>
                      <Pause className="h-3 w-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={handlePomodoroReset}>
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              </Card>

              {/* Show me next button */}
              <Button variant="outline" size="sm" onClick={handleShowNext} className="gap-2 bg-transparent">
                <ArrowDown className="h-4 w-4" />
                <span className="hidden sm:inline">Next</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist sidebar (desktop) or bottom section (mobile) */}
      {checklist.length > 0 && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 w-64 max-h-96 overflow-y-auto lg:block hidden">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Progress Checklist
            </h3>
            <div className="space-y-2">
              {checklist.map((item) => (
                <label key={item.id} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => onToggleChecklistItem?.(item.id)}
                    className="mt-0.5 h-4 w-4 rounded border-2 border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  />
                  <span className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Status announcements */}
      {announcement && (
        <div className="fixed bottom-4 left-4 right-4 z-50" role="status" aria-live="polite">
          <Card className="p-4 bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <span>{announcement}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAnnouncement("")}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                ×
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
