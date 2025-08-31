"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Check, BookOpen, Target, Brain, Eye } from "lucide-react"
import { useAccessibility } from "@/contexts/accessibility-context"

export function AccessibilityModal() {
  const { isModalOpen, setIsModalOpen, setActiveProfile, activeProfile, resetToDefaultProfile } = useAccessibility()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [dontAskAgain, setDontAskAgain] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstCardRef = useRef<HTMLButtonElement>(null)

  const accessibilityOptions = [
    {
      id: "dyslexia",
      label: "Dyslexia",
      description: "Clear fonts & comfortable spacing",
      icon: BookOpen,
    },
    {
      id: "adhd",
      label: "ADHD",
      description: "Organized content & minimal distractions",
      icon: Target,
    },
    {
      id: "autism",
      label: "Autism",
      description: "Predictable navigation & consistency",
      icon: Brain,
    },
    {
      id: "visual",
      label: "Visual Impairment",
      description: "High contrast & screen reader support",
      icon: Eye,
    },
  ]

  useEffect(() => {
    if (isModalOpen) {
      if (activeProfile) {
        setSelectedOption(activeProfile)
      } else {
        const savedProfile = localStorage.getItem("wave_accessibility_choice")
        if (savedProfile && savedProfile !== "default" && savedProfile !== "base") {
          setSelectedOption(savedProfile)
        }
      }

      // Focus first card for accessibility
      setTimeout(() => {
        if (firstCardRef.current) {
          firstCardRef.current.focus()
        }
      }, 100)
    }
  }, [isModalOpen, activeProfile])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleSkip()
      return
    }

    // Focus trapping and arrow key navigation
    if (e.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll('button, input[type="checkbox"]')
      if (focusableElements) {
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Arrow key navigation between cards
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault()
      const cards = modalRef.current?.querySelectorAll("[data-card]")
      if (!cards) return

      const currentIndex = Array.from(cards).findIndex((card) => card === document.activeElement)
      let nextIndex = currentIndex

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % cards.length
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        nextIndex = currentIndex <= 0 ? cards.length - 1 : currentIndex - 1
      }
      ;(cards[nextIndex] as HTMLElement).focus()
    }
  }

  const handleAccept = () => {
    if (selectedOption) {
      localStorage.setItem("wave_accessibility_choice", selectedOption)
      setActiveProfile(selectedOption)

      // Apply profile styles immediately
      if (selectedOption === "dyslexia") {
        document.documentElement.setAttribute("data-profile", "dyslexia")
      }

      window.dispatchEvent(
        new CustomEvent("accessibility-profile-changed", {
          detail: { profile: selectedOption },
        }),
      )
    } else {
      resetToDefaultProfile()
    }

    if (dontAskAgain) {
      localStorage.setItem("wave_dont_ask", "true")
    }
    setIsModalOpen(false)
    window.dispatchEvent(new CustomEvent("wave:modalClosed"))
  }

  const handleSkip = () => {
    resetToDefaultProfile()
    setIsModalOpen(false)
    window.dispatchEvent(new CustomEvent("wave:modalClosed"))
  }

  if (!isModalOpen) {
    return <div className="fixed inset-0 opacity-0 pointer-events-none" style={{ zIndex: 9999 }} aria-hidden="true" />
  }

  return (
    <div
      id="accessibility-modal"
      className="modal-overlay fixed inset-0 flex items-center justify-center p-4 opacity-100 pointer-events-auto transition-opacity duration-300"
      style={{
        zIndex: 9999,
        backgroundColor: "rgba(28, 28, 28, 0.8)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
      ref={modalRef}
    >
      <div className="modal-panel bg-white rounded-xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto mx-auto p-6 relative shadow-[0_20px_60px_rgba(9,73,133,0.3)] md:p-6 sm:p-5">
        <button
          onClick={handleSkip}
          data-close
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-[#094985] focus:outline-none focus:ring-3 focus:ring-[#094985] focus:ring-offset-2"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-6">
          <h2
            id="modal-title"
            data-modal-title
            className="text-[28px] md:text-[28px] sm:text-[24px] font-bold mb-2 leading-tight text-[#0b1320]"
          >
            What's your accessibility preference?
          </h2>
          <p className="text-[#6b7280] text-base">Customize your learning experience</p>
        </div>

        <div className="sr-only">
          {accessibilityOptions.map((option) => (
            <p key={`${option.id}-desc`} id={`${option.id}-desc`}>
              {option.description}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6" role="radiogroup" aria-labelledby="modal-title">
          {accessibilityOptions.map((option, index) => {
            const IconComponent = option.icon
            const isSelected = selectedOption === option.id

            return (
              <button
                key={option.id}
                ref={index === 0 ? firstCardRef : null}
                data-card
                className={`
                  accessibility-card relative p-4 rounded-lg cursor-pointer transition-all duration-200 
                  text-center hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(9,73,133,0.2)]
                  focus:outline-none focus:ring-3 focus:ring-[#094985] focus:ring-offset-2
                  ${
                    isSelected
                      ? "selected bg-[#094985] border-[3px] border-[#f1c47b] shadow-[0_8px_24px_rgba(9,73,133,0.2)] text-white"
                      : "bg-white text-[#0b1320] border-2 border-[#094985]"
                  }
                  w-full h-[140px] md:w-[180px] md:h-[140px] sm:h-[120px]
                `}
                onClick={() => setSelectedOption(option.id)}
                role="radio"
                aria-checked={isSelected}
                aria-describedby={`${option.id}-desc`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setSelectedOption(option.id)
                  }
                }}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                )}

                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <IconComponent className={`h-12 w-12 ${isSelected ? "text-white" : "text-[#094985]"}`} />
                  <h3 className={`font-bold text-lg ${isSelected ? "text-white" : "text-[#0b1320]"}`}>
                    {option.label}
                  </h3>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <label className="flex items-center space-x-3 text-base cursor-pointer text-[#0b1320]">
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              className="w-[18px] h-[18px] rounded border-gray-300 text-[#094985] focus:ring-[#094985] focus:ring-offset-0 min-w-[44px] min-h-[44px]"
            />
            <span>Don't ask again</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <Button
              onClick={handleSkip}
              variant="outline"
              className="btn-secondary border-[#094985] text-[#094985] hover:bg-[#f8fafc] bg-transparent w-full sm:w-[160px] h-11 focus:ring-3 focus:ring-[#094985] focus:ring-offset-2 min-h-[44px]"
            >
              Use Default Settings
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!selectedOption}
              className="btn-primary bg-[#094985] text-white hover:bg-[#073a6b] disabled:bg-gray-300 disabled:cursor-not-allowed w-full sm:w-[120px] h-11 focus:ring-3 focus:ring-[#094985] focus:ring-offset-2 min-h-[44px]"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
