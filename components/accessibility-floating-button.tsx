"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useAccessibility } from "@/contexts/accessibility-context"
import { DyslexiaSettingsPanel } from "./dyslexia-settings-panel"
import { AutismSettingsPanel } from "./autism-settings-panel"

export function AccessibilityFloatingButton() {
  const { openModal, activeProfile } = useAccessibility()
  const [showDyslexiaPanel, setShowDyslexiaPanel] = useState(false)
  const [showAutismPanel, setShowAutismPanel] = useState(false)

  const handleClick = () => {
    if (activeProfile === "dyslexia") {
      setShowDyslexiaPanel(true)
    } else if (activeProfile === "autism") {
      setShowAutismPanel(true)
    } else {
      openModal()
    }
  }

  const buttonStyles =
    activeProfile === "autism"
      ? "fixed bottom-6 left-6 z-40 h-12 w-12 rounded-full bg-[#87CEEB] text-[#2F4F4F] shadow-lg hover:bg-[#7BB8D6] transition-colors duration-200 p-0"
      : "fixed bottom-6 left-6 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform duration-200 p-0"

  return (
    <>
      <Button onClick={handleClick} className={buttonStyles} aria-label="Open accessibility settings">
        <Settings className="h-6 w-6" />
        {activeProfile === "autism" && (
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-[#2F4F4F] whitespace-nowrap">
            Settings
          </span>
        )}
      </Button>

      {activeProfile === "dyslexia" && (
        <DyslexiaSettingsPanel isOpen={showDyslexiaPanel} onClose={() => setShowDyslexiaPanel(false)} />
      )}

      {activeProfile === "autism" && (
        <AutismSettingsPanel isOpen={showAutismPanel} onClose={() => setShowAutismPanel(false)} />
      )}
    </>
  )
}
