"use client"
import { Eye, EyeOff } from "lucide-react"
import { useAccessibility } from "@/contexts/accessibility-context"

export function ADHDBadge() {
  const { activeProfile, adhdSettings, updateADHDSettings } = useAccessibility()

  if (activeProfile !== "adhd") return null

  const toggleHideNonEssential = () => {
    updateADHDSettings({ hideNonEssential: !adhdSettings.hideNonEssential })

    // Apply/remove class to body
    if (!adhdSettings.hideNonEssential) {
      document.body.classList.add("hide-non-essential")
    } else {
      document.body.classList.remove("hide-non-essential")
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border-2 border-adhd-primary rounded-lg p-3 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-adhd-primary">ADHD mode ON</span>
        <button
          onClick={toggleHideNonEssential}
          className="flex items-center gap-2 text-xs bg-adhd-primary text-white px-3 py-1 rounded hover:bg-opacity-90 transition-colors min-w-[44px] min-h-[44px]"
          aria-label={adhdSettings.hideNonEssential ? "Show non-essential UI" : "Hide non-essential UI"}
        >
          {adhdSettings.hideNonEssential ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          <span className="hidden sm:inline">{adhdSettings.hideNonEssential ? "Show extras" : "Hide extras"}</span>
        </button>
      </div>
    </div>
  )
}
