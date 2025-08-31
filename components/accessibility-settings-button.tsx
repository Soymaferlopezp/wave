"use client"

import { useState } from "react"
import { Settings, X } from "lucide-react"
import { useAccessibility } from "@/contexts/accessibility-context"

export function AccessibilitySettingsButton() {
  const { activeProfile, dyslexiaSettings, updateDyslexiaSettings, setIsModalOpen } = useAccessibility()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 left-6 w-12 h-12 bg-[#094985] hover:bg-[#0A5A9A] text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#094985] focus:ring-offset-2 z-50"
        aria-label="Accessibility Settings"
        title="Accessibility Settings"
      >
        <Settings className="h-6 w-6" />
      </button>

      {activeProfile === "dyslexia" && isOpen && (
        <div className="fixed bottom-20 left-6 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1C1C1C]">Dyslexia Settings</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="line-highlight" className="text-sm font-medium text-[#1C1C1C]">
                Line Highlight
              </label>
              <input
                id="line-highlight"
                type="checkbox"
                checked={dyslexiaSettings.lineHighlight}
                onChange={(e) => updateDyslexiaSettings({ lineHighlight: e.target.checked })}
                className="w-4 h-4 text-[#094985] focus:ring-[#094985] border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="text-to-speech" className="text-sm font-medium text-[#1C1C1C]">
                Read Aloud Buttons
              </label>
              <input
                id="text-to-speech"
                type="checkbox"
                checked={dyslexiaSettings.textToSpeech}
                onChange={(e) => updateDyslexiaSettings({ textToSpeech: e.target.checked })}
                className="w-4 h-4 text-[#094985] focus:ring-[#094985] border-gray-300 rounded"
              />
            </div>

            <div>
              <label htmlFor="font-size" className="block text-sm font-medium text-[#1C1C1C] mb-2">
                Font Size: {dyslexiaSettings.fontSize}px
              </label>
              <input
                id="font-size"
                type="range"
                min="18"
                max="20"
                step="1"
                value={dyslexiaSettings.fontSize}
                onChange={(e) => updateDyslexiaSettings({ fontSize: Number.parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          <div aria-live="polite" aria-atomic="true" className="sr-only">
            Dyslexia Profile Active - Settings Updated
          </div>
        </div>
      )}
    </>
  )
}
