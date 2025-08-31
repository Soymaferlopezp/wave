"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useAccessibility } from "@/contexts/accessibility-context"

interface StatusMessage {
  id: string
  message: string
  type: "info" | "success" | "warning"
}

export function ADHDStatusArea() {
  const { activeProfile } = useAccessibility()
  const [messages, setMessages] = useState<StatusMessage[]>([])

  useEffect(() => {
    if (activeProfile !== "adhd") return

    const handleStatusMessage = (event: CustomEvent) => {
      const newMessage: StatusMessage = {
        id: Date.now().toString(),
        message: event.detail.message,
        type: event.detail.type || "info",
      }
      setMessages((prev) => [...prev, newMessage])
    }

    window.addEventListener("wave:statusMessage", handleStatusMessage as EventListener)

    return () => {
      window.removeEventListener("wave:statusMessage", handleStatusMessage as EventListener)
    }
  }, [activeProfile])

  const dismissMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
  }

  if (activeProfile !== "adhd" || messages.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm"
      role="status"
      aria-live="polite"
      aria-label="Status messages"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`
            p-4 rounded-lg shadow-lg border-l-4 bg-white
            ${message.type === "success" ? "border-green-500" : ""}
            ${message.type === "warning" ? "border-yellow-500" : ""}
            ${message.type === "info" ? "border-blue-500" : ""}
          `}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-gray-800 flex-1">{message.message}</p>
            <button
              onClick={() => dismissMessage(message.id)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
