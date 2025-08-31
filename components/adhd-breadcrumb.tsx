"use client"

import { useAccessibility } from "@/contexts/accessibility-context"

interface ADHDBreadcrumbProps {
  steps: string[]
  currentStep: number
}

export function ADHDBreadcrumb({ steps, currentStep }: ADHDBreadcrumbProps) {
  const { activeProfile } = useAccessibility()

  if (activeProfile !== "adhd") return null

  return (
    <div className="bg-blue-50 border-2 border-adhd-primary rounded-lg p-4 mb-6">
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-adhd-primary">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <span
              className={`px-2 py-1 rounded ${
                index === currentStep
                  ? "bg-adhd-primary text-white"
                  : index < currentStep
                    ? "bg-adhd-success text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {index + 1}) {step}
            </span>
            {index < steps.length - 1 && <span className="mx-2 text-gray-400">→</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
