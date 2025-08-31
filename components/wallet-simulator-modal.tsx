"use client"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface WalletSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  onStartPractice: () => void
}

export function WalletSimulatorModal({ isOpen, onClose, onStartPractice }: WalletSimulatorModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">W</span>
          </div>
          <span className="text-xl font-bold text-foreground">W.A.V.E</span>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Welcome to Practice Mode</h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            This is your practice wallet. Here you'll learn how it works, step by step, without any risk of losing
            anything.
          </p>

          <Button
            onClick={onStartPractice}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6"
          >
            Start Practice
          </Button>
        </div>
      </div>
    </div>
  )
}
