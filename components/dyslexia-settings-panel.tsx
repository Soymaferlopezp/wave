"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Eye, Type, Palette, ArrowLeft } from "lucide-react"
import { useAccessibility } from "@/contexts/accessibility-context"

interface DyslexiaSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function DyslexiaSettingsPanel({ isOpen, onClose }: DyslexiaSettingsPanelProps) {
  const { dyslexiaSettings, updateDyslexiaSettings, openModal } = useAccessibility()
  const [localSettings, setLocalSettings] = useState(dyslexiaSettings)

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(dyslexiaSettings)
    }
  }, [isOpen, dyslexiaSettings])

  if (!isOpen) return null

  const handleToggle = (setting: keyof typeof dyslexiaSettings) => {
    const newValue = !localSettings[setting]
    const newSettings = { ...localSettings, [setting]: newValue }
    setLocalSettings(newSettings)
    // Apply immediately
    updateDyslexiaSettings({ [setting]: newValue })
  }

  const handleSliderChange = (setting: keyof typeof dyslexiaSettings, value: number) => {
    const newSettings = { ...localSettings, [setting]: value }
    setLocalSettings(newSettings)
    // Apply immediately
    updateDyslexiaSettings({ [setting]: value })
  }

  const handleChangeProfile = () => {
    onClose()
    openModal()
  }

  const handleApply = () => {
    updateDyslexiaSettings(localSettings)
    onClose()
  }

  const handleRestore = () => {
    const defaultSettings = {
      openDyslexicFont: true,
      sepiaTheme: false,
      lineHighlight: true,
      fontSize: 20,
      letterSpacing: 0.04,
      voiceSpeed: 1,
    }
    setLocalSettings(defaultSettings)
    updateDyslexiaSettings(defaultSettings)
  }

  return (
    <div className="fixed inset-0 z-[10000] flex justify-end">
      {/* Overlay */}
      <div className="flex-1 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Panel - Updated width and positioning */}
      <div className="w-[380px] max-w-[90vw] bg-white shadow-xl flex flex-col h-full overflow-hidden">
        {/* Header - Added profile change button */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleChangeProfile}
              className="flex items-center space-x-2 text-[#094985] hover:text-[#073A6B] transition-colors"
              aria-label="Change accessibility profile"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Change Profile</span>
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close settings panel"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Profile Indicator - Added current profile display */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-b">
          <p className="text-sm font-medium text-[#094985]">Current Profile: Dyslexia</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Type className="h-5 w-5 text-[#094985]" />
                <span className="font-medium">OpenDyslexic Font</span>
              </div>
              <button
                onClick={() => handleToggle("openDyslexicFont")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.openDyslexicFont ? "bg-[#094985]" : "bg-gray-300"
                }`}
                aria-pressed={localSettings.openDyslexicFont}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.openDyslexicFont ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Palette className="h-5 w-5 text-[#094985]" />
                <span className="font-medium">Sepia Theme</span>
              </div>
              <button
                onClick={() => handleToggle("sepiaTheme")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.sepiaTheme ? "bg-[#094985]" : "bg-gray-300"
                }`}
                aria-pressed={localSettings.sepiaTheme}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.sepiaTheme ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-[#094985]" />
                <span className="font-medium">Active Line Marker</span>
              </div>
              <button
                onClick={() => handleToggle("lineHighlight")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.lineHighlight ? "bg-[#094985]" : "bg-gray-300"
                }`}
                aria-pressed={localSettings.lineHighlight}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.lineHighlight ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                Text Size: {localSettings.fontSize}px
              </label>
              <input
                type="range"
                min="16"
                max="24"
                value={localSettings.fontSize}
                onChange={(e) => handleSliderChange("fontSize", Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>16px</span>
                <span>24px</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-2">Letter Spacing</label>
              <input
                type="range"
                min="0"
                max="0.08"
                step="0.01"
                value={localSettings.letterSpacing}
                onChange={(e) => handleSliderChange("letterSpacing", Number.parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Normal</span>
                <span>Wide</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                Voice Speed: {localSettings.voiceSpeed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={localSettings.voiceSpeed}
                onChange={(e) => handleSliderChange("voiceSpeed", Number.parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5x</span>
                <span>2x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t space-y-3">
          <Button onClick={handleApply} className="w-full bg-[#094985] text-white hover:bg-[#073A6B]">
            Save Settings
          </Button>
          <Button
            onClick={handleRestore}
            variant="outline"
            className="w-full border-[#094985] text-[#094985] hover:bg-[#F8FAFC] bg-transparent"
          >
            Restore Default
          </Button>
        </div>
      </div>
    </div>
  )
}
