"use client"

import { useAccessibility } from "@/contexts/accessibility-context"
import { Button } from "@/components/ui/button"
import { X, ArrowLeft } from "lucide-react"

interface AutismSettingsPanelProps {
  onClose: () => void
}

export function AutismSettingsPanel({ onClose }: AutismSettingsPanelProps) {
  const { autismSettings, updateAutismSettings, openModal } = useAccessibility()

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="autism-settings-panel fixed right-5 top-20 w-[350px] max-w-[calc(100vw-40px)] max-h-[calc(100vh-100px)] bg-white shadow-2xl border border-gray-200 rounded-lg z-[9999] transform transition-all duration-300 ease-in-out overflow-hidden sm:w-[400px] md:right-8">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#F0F8FF]">
          <Button
            onClick={() => {
              onClose()
              openModal()
            }}
            variant="ghost"
            size="sm"
            className="text-[#2F4F4F] hover:bg-[#E6E6FA]/40 flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Profile</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-[#E6E6FA]/40 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-[#2F4F4F]" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-180px)] p-6 space-y-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-[#F8F9FA] border border-[#E6E6FA]/50">
              <div className="flex-1">
                <div className="font-semibold text-[#2F4F4F] mb-2">Soft Colors</div>
                <p className="text-sm text-[#2F4F4F]/70 leading-relaxed">
                  Use gentle pastel color palette throughout the site
                </p>
              </div>
              <button
                onClick={() => updateAutismSettings({ softColors: !autismSettings.softColors })}
                className={`flex-shrink-0 w-14 h-7 rounded-full transition-all duration-300 shadow-sm ${
                  autismSettings.softColors ? "bg-[#87CEEB] shadow-md" : "bg-gray-300"
                }`}
                aria-label={`Toggle soft colors ${autismSettings.softColors ? "off" : "on"}`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                    autismSettings.softColors ? "translate-x-7" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-[#F8F9FA] border border-[#E6E6FA]/50">
              <div className="flex-1">
                <div className="font-semibold text-[#2F4F4F] mb-2">Reduced Motion</div>
                <p className="text-sm text-[#2F4F4F]/70 leading-relaxed">
                  Minimize animations and transitions for calmer experience
                </p>
              </div>
              <button
                onClick={() => updateAutismSettings({ reducedMotion: !autismSettings.reducedMotion })}
                className={`flex-shrink-0 w-14 h-7 rounded-full transition-all duration-300 shadow-sm ${
                  autismSettings.reducedMotion ? "bg-[#87CEEB] shadow-md" : "bg-gray-300"
                }`}
                aria-label={`Toggle reduced motion ${autismSettings.reducedMotion ? "off" : "on"}`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                    autismSettings.reducedMotion ? "translate-x-7" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-[#F8F9FA] border border-[#E6E6FA]/50">
              <div className="flex-1">
                <div className="font-semibold text-[#2F4F4F] mb-2">Pictogram Labels</div>
                <p className="text-sm text-[#2F4F4F]/70 leading-relaxed">
                  Show descriptive text labels under all icons for clarity
                </p>
              </div>
              <button
                onClick={() => updateAutismSettings({ pictogramLabels: !autismSettings.pictogramLabels })}
                className={`flex-shrink-0 w-14 h-7 rounded-full transition-all duration-300 shadow-sm ${
                  autismSettings.pictogramLabels ? "bg-[#87CEEB] shadow-md" : "bg-gray-300"
                }`}
                aria-label={`Toggle pictogram labels ${autismSettings.pictogramLabels ? "off" : "on"}`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                    autismSettings.pictogramLabels ? "translate-x-7" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-[#F8F9FA] border border-[#E6E6FA]/50">
              <div className="flex-1">
                <div className="font-semibold text-[#2F4F4F] mb-2">Consistent Layout</div>
                <p className="text-sm text-[#2F4F4F]/70 leading-relaxed">
                  Enforce predictable button sizes and element positioning
                </p>
              </div>
              <button
                onClick={() => updateAutismSettings({ highPredictability: !autismSettings.highPredictability })}
                className={`flex-shrink-0 w-14 h-7 rounded-full transition-all duration-300 shadow-sm ${
                  autismSettings.highPredictability ? "bg-[#87CEEB] shadow-md" : "bg-gray-300"
                }`}
                aria-label={`Toggle consistent layout ${autismSettings.highPredictability ? "off" : "on"}`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                    autismSettings.highPredictability ? "translate-x-7" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-[#F8F9FA] border border-[#E6E6FA]/50">
              <div className="flex-1">
                <div className="font-semibold text-[#2F4F4F] mb-2">Clear Boundaries</div>
                <p className="text-sm text-[#2F4F4F]/70 leading-relaxed">
                  Add soft borders between sections and cards for structure
                </p>
              </div>
              <button
                onClick={() => updateAutismSettings({ enhancedStructure: !autismSettings.enhancedStructure })}
                className={`flex-shrink-0 w-14 h-7 rounded-full transition-all duration-300 shadow-sm ${
                  autismSettings.enhancedStructure ? "bg-[#87CEEB] shadow-md" : "bg-gray-300"
                }`}
                aria-label={`Toggle clear boundaries ${autismSettings.enhancedStructure ? "off" : "on"}`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                    autismSettings.enhancedStructure ? "translate-x-7" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
