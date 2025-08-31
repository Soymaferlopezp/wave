"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Shield,
  Eye,
  Target,
  Brain,
  Grid3X3,
  CheckCircle,
  ExternalLink,
  Github,
  Settings,
} from "lucide-react"
import { AccessibilityModal } from "@/components/accessibility-modal"
import { AccessibilityFloatingButton } from "@/components/accessibility-floating-button"
import { AutismSettingsPanel } from "@/components/autism-settings-panel"
import { useAccessibility } from "@/contexts/accessibility-context"
import { TTSParagraph } from "@/components/tts-paragraph"
import { WalletSimulatorModal } from "@/components/wallet-simulator-modal"
import { WalletSimulator } from "@/components/wallet-simulator"
import { LearningDashboard } from "@/components/learning-dashboard"
import { ADHDStatusArea } from "@/components/adhd-status-area"
import VisualTTSToolbar from "@/components/visual-tts-toolbar"
import SkipLinks from "@/components/skip-links"

export default function HomePage() {
  const { setActiveProfile, activeProfile, startTTS, setIsModalOpen } = useAccessibility()
  const [showAutismSettings, setShowAutismSettings] = useState(false)
  const [showSimulatorModal, setShowSimulatorModal] = useState(false)
  const [showSimulator, setShowSimulator] = useState(false)
  const [showLearningDashboard, setShowLearningDashboard] = useState(false)
  const [connectedAddress] = useState("0x1234567890abcdef1234567890abcdef12345678")

  useEffect(() => {
    let triggeringButton: HTMLElement | null = null

    const openAccessibility = (event: Event) => {
      event.preventDefault()
      event.stopPropagation()

      // Store the triggering button for focus return
      triggeringButton = event.target as HTMLElement

      // Try multiple fallback methods to open the modal
      if (typeof window !== "undefined") {
        // Method 1: Direct function call
        if ((window as any).openAccessibilityModal) {
          ;(window as any).openAccessibilityModal()
        }
        // Method 2: Custom event dispatch
        else {
          window.dispatchEvent(new CustomEvent("wave:openAccessibilityModal"))
          // Method 3: Direct modal manipulation as fallback
          setIsModalOpen(true)
        }
      }
    }

    const openSW = () => {
      // Try multiple fallback methods to open the simulator modal
      if (typeof window !== "undefined") {
        // Method 1: Direct function call
        if ((window as any).openStartWithoutWalletModal) {
          ;(window as any).openStartWithoutWalletModal()
        }
        // Method 2: Custom event dispatch
        window.dispatchEvent(new CustomEvent("wave:openStartWithoutWallet"))
        // Method 3: Direct modal manipulation as fallback
        setShowSimulatorModal(true)

        // Set focus to modal when it opens
        setTimeout(() => {
          const modal = document.querySelector("#onboarding-modal")
          if (modal) {
            modal.setAttribute("data-open", "true")
            modal.removeAttribute("hidden")
            // Focus the modal title or first focusable element
            const focusTarget = modal.querySelector("h2, h1, [tabindex='0'], button, input") as HTMLElement
            focusTarget?.focus()
          }
        }, 100)
      }
    }

    const bindAccessibilityButtons = () => {
      const buttons = document.querySelectorAll('[data-action="open-accessibility"]')

      buttons.forEach((button) => {
        // Remove any existing listeners
        button.removeEventListener("click", openAccessibility)
        button.removeEventListener("keydown", handleKeyDown)

        // Add new listeners
        button.addEventListener("click", openAccessibility)
        button.addEventListener("keydown", handleKeyDown)
      })
    }

    const bindSW = () => {
      const buttons = document.querySelectorAll('[data-action="open-onboarding"]')

      buttons.forEach((button) => {
        // Remove any existing listeners
        button.removeEventListener("click", handleSimulatorClick)
        button.removeEventListener("keydown", handleSimulatorKeyDown)

        // Add new listeners
        button.addEventListener("click", handleSimulatorClick)
        button.addEventListener("keydown", handleSimulatorKeyDown)
      })
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        openAccessibility(event)
      }
    }

    const handleSimulatorClick = (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
      openSW()
    }

    const handleSimulatorKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        openSW()
      }
    }

    // Bind on initial load
    bindAccessibilityButtons()
    bindSW()

    // Listen for SPA navigation and preset changes
    const handleSPANavigation = () => {
      setTimeout(() => {
        bindAccessibilityButtons()
        bindSW()
      }, 100)
    }

    window.addEventListener("spa:navigated", handleSPANavigation)
    window.addEventListener("wave:presetChanged", handleSPANavigation)
    window.addEventListener("DOMContentLoaded", () => {
      bindAccessibilityButtons()
      bindSW()
    })

    // Listen for modal close to return focus
    const handleModalClose = () => {
      if (triggeringButton) {
        setTimeout(() => {
          triggeringButton?.focus()
          triggeringButton = null
        }, 100)
      }
    }

    window.addEventListener("wave:modalClosed", handleModalClose)

    return () => {
      window.removeEventListener("spa:navigated", handleSPANavigation)
      window.removeEventListener("wave:presetChanged", handleSPANavigation)
      window.removeEventListener("DOMContentLoaded", bindAccessibilityButtons)
      window.removeEventListener("wave:modalClosed", handleModalClose)
    }
  }, [setIsModalOpen, setShowSimulatorModal])

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector(".sticky-header")
      if (header) {
        const height = header.getBoundingClientRect().height
        document.documentElement.style.setProperty("--header-h", `${height}px`)
      }
    }

    // Update on load and resize
    updateHeaderHeight()
    window.addEventListener("resize", updateHeaderHeight)

    return () => window.removeEventListener("resize", updateHeaderHeight)
  }, [])

  useEffect(() => {
    const handleProfileChange = (event: CustomEvent) => {
      setActiveProfile(event.detail.profile)
    }

    window.addEventListener("accessibility-profile-changed", handleProfileChange as EventListener)

    return () => {
      window.removeEventListener("accessibility-profile-changed", handleProfileChange as EventListener)
    }
  }, [setActiveProfile])

  useEffect(() => {
    const handleVisualPresetChange = (event: CustomEvent) => {
      if (event.detail.preset === "visual") {
        // Auto-start TTS when visual profile is activated
        setTimeout(() => {
          const mainHeading = document.querySelector("h1")
          if (mainHeading) {
            startTTS(`Visual profile activated. ${mainHeading.textContent}`)
          }
        }, 1000)
      }
    }

    window.addEventListener("wave:presetChanged:visual", handleVisualPresetChange as EventListener)
    return () => window.removeEventListener("wave:presetChanged:visual", handleVisualPresetChange as EventListener)
  }, [startTTS])

  const sendStatusMessage = (message: string, type: "info" | "success" | "warning" = "info") => {
    if (activeProfile === "adhd") {
      window.dispatchEvent(
        new CustomEvent("wave:statusMessage", {
          detail: { message, type },
        }),
      )
    }
  }

  const handleStartWithoutWallet = () => {
    setShowSimulatorModal(true)
    sendStatusMessage("Opening wallet simulator - safe practice environment", "info")
  }

  const handleStartPractice = () => {
    setShowSimulatorModal(false)
    setShowSimulator(true)
    sendStatusMessage("Starting wallet practice - no real funds involved", "success")
  }

  const handleConnectWallet = () => {
    setShowLearningDashboard(true)
    sendStatusMessage("Opening learning dashboard", "info")
  }

  const adhdBreadcrumbSteps = ["Choose profile", "Try simulator", "Start learning"]

  return (
    <div className="min-h-screen bg-background">
      <SkipLinks />

      {activeProfile === "adhd" && (
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
      )}

      <VisualTTSToolbar />

      <AccessibilityModal />
      {activeProfile !== "autism" && <AccessibilityFloatingButton />}
      {activeProfile === "autism" && showAutismSettings && (
        <AutismSettingsPanel onClose={() => setShowAutismSettings(false)} />
      )}

      <ADHDStatusArea />

      <WalletSimulatorModal
        isOpen={showSimulatorModal}
        onClose={() => setShowSimulatorModal(false)}
        onStartPractice={handleStartPractice}
      />

      <WalletSimulator isOpen={showSimulator} onClose={() => setShowSimulator(false)} />

      <LearningDashboard
        isOpen={showLearningDashboard}
        onClose={() => setShowLearningDashboard(false)}
        connectedAddress={connectedAddress}
      />

      {!showLearningDashboard && (
        <header
          className="sticky-header top-0 w-full border-b js-header-height-calc"
          style={{ backgroundColor: "#094985", zIndex: 100 }}
          role="banner"
        >
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
              </div>
              <h1 className="text-xl font-bold text-white">W.A.V.E</h1>
            </div>

            <nav className="hidden md:flex items-center space-x-6" role="navigation" id="navigation">
              <a
                href="#solution"
                className="text-sm font-medium text-white hover:text-[#F1C47B] transition-colors focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2 focus:ring-offset-[#094985] rounded px-2 py-1"
              >
                Solution
              </a>
              <a
                href="#wallet-simulator"
                className="text-sm font-medium text-white hover:text-[#F1C47B] transition-colors focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2 focus:ring-offset-[#094985] rounded px-2 py-1"
              >
                Simulator
              </a>
              <a
                href="#accessibility"
                className="text-sm font-medium text-white hover:text-[#F1C47B] transition-colors focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2 focus:ring-offset-[#094985] rounded px-2 py-1"
              >
                Accessibility
              </a>
              {activeProfile === "autism" && (
                <button
                  onClick={() => setShowAutismSettings(true)}
                  className="flex items-center space-x-2 text-sm font-medium bg-[#E6E6FA] text-[#2F4F4F] hover:bg-[#DDA0DD] px-4 py-2 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2 focus:ring-offset-[#094985]"
                >
                  <Settings className="h-4 w-4 text-[#4A90E2]" />
                  <span>Autism Settings</span>
                </button>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                className="btn-connect-wallet bg-[#F1C47B] text-[#1C1C1C] hover:bg-[#e6b366] focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2 focus:ring-offset-[#094985] min-h-[44px] min-w-[44px]"
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </Button>
            </div>
          </div>
        </header>
      )}

      {!showLearningDashboard && (
        <>
          {activeProfile === "adhd" && (
            <div className="bg-[#fafafa] border-b border-[#d7dee8] py-3 px-4 md:px-6">
              <div className="container mx-auto">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <button className="bg-[#fafafa] border border-[#d7dee8] text-[#0b1320] px-3 py-2 rounded-full hover:bg-[#f1f5f9] transition-colors focus:outline-none focus:ring-3 focus:ring-[#F1C47B] min-h-[44px] min-w-[44px]">
                    1) Choose profile
                  </button>
                  <span className="text-[#0b1320]">→</span>
                  <button className="bg-[#fafafa] border border-[#d7dee8] text-[#0b1320] px-3 py-2 rounded-full hover:bg-[#f1f5f9] transition-colors focus:outline-none focus:ring-3 focus:ring-[#F1C47B] min-h-[44px] min-w-[44px]">
                    2) Try simulator
                  </button>
                  <span className="text-[#0b1320]">→</span>
                  <button className="bg-[#fafafa] border border-[#d7dee8] text-[#0b1320] px-3 py-2 rounded-full hover:bg-[#f1f5f9] transition-colors focus:outline-none focus:ring-3 focus:ring-[#F1C47B] min-h-[44px] min-w-[44px]">
                    3) Start learning
                  </button>
                </div>
              </div>
            </div>
          )}

          <main id="main-content" role="main">
            <section className="py-20 px-4 md:px-6" style={{ scrollMarginTop: "calc(var(--header-h) + 12px)" }}>
              <div className="container mx-auto">
                {activeProfile === "adhd" && (
                  <div className="key-points mb-8">
                    <h3>Key Points</h3>
                    <ul>
                      <li>Learn Web3 step by step</li>
                      <li>Risk-free wallet simulator</li>
                      <li>Clear progress and checklists</li>
                    </ul>
                  </div>
                )}

                <div className="grid lg:grid-cols-5 gap-12 items-center">
                  <div className="lg:col-span-3 space-y-8">
                    <div className="space-y-4">
                      <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance">
                        Learn Web3 Without Barriers
                      </h1>
                      <TTSParagraph id="hero-subtitle" className="text-xl text-muted-foreground text-balance">
                        Your safe and accessible gateway to blockchain education
                      </TTSParagraph>
                      <TTSParagraph id="hero-description" className="text-lg text-foreground/80 leading-relaxed">
                        Master Web3 concepts through inclusive design, guided practice, and a risk-free wallet
                        simulator. Built for everyone, including people with dyslexia, ADHD, autism, and visual
                        impairments.
                      </TTSParagraph>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 btn-primary hero-cta relative z-100"
                        onClick={handleStartWithoutWallet}
                      >
                        Start Without Wallet
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      {activeProfile === "adhd" ? (
                        <a href="#solution" className="btn-secondary text-center py-6 hero-cta relative z-100">
                          Learn More About Our Solution
                        </a>
                      ) : (
                        <Button
                          size="lg"
                          variant="outline"
                          className="text-lg px-8 py-6 bg-[#094985] text-[#FAFAFA] hover:bg-[#094985]/90 hero-cta relative z-100 min-h-[44px] min-w-[44px]"
                          data-action="open-accessibility"
                          aria-controls="accessibility-modal"
                          aria-haspopup="dialog"
                          type="button"
                          aria-label="Open accessibility preferences"
                        >
                          Accessibility Preference
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 shadow-lg">
                      <div className="space-y-4">
                        <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
                            <p className="text-sm font-medium">Safe Learning Environment</p>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <Badge variant="secondary">Accessibility Toggles</Badge>
                          <Badge variant="secondary">Progress Tracking</Badge>
                        </div>
                      </div>
                    </Card>

                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">Safe Learning</Badge>
                      <Badge variant="outline">Risk-Free Practice</Badge>
                      <Badge variant="outline">Fully Accessible</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              className="py-20 px-4 md:px-6 bg-muted/30"
              id="decentralization-section"
              style={{ scrollMarginTop: "calc(var(--header-h) + 12px)" }}
            >
              <div className="container mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                    {activeProfile === "adhd" ? "How It Works" : "Web3 Isn't as Decentralized as It Claims"}
                  </h2>
                </div>

                {activeProfile === "adhd" ? (
                  <div className="grid md:grid-cols-3 gap-8">{/* Existing code for ADHD profile */}</div>
                ) : (
                  <div className="cards-grid">
                    <Card className="card bg-white border-gray-200 text-gray-900 p-8" tabIndex={0}>
                      <CardHeader className="card-header">
                        <div className="flex flex-col items-center text-center mb-4">
                          <Brain className={`icon mb-2 ${activeProfile === "autism" ? "h-16 w-16" : "h-12 w-12"}`} />
                          <span className={`font-medium ${activeProfile === "autism" ? "text-base" : "text-sm"}`}>
                            Dyslexia Support
                          </span>
                        </div>
                        <CardTitle className="text-xl">Dyslexia-Friendly</CardTitle>
                      </CardHeader>
                      <CardContent className="card-content">
                        <TTSParagraph id="accessibility-1" className="text-gray-900/80 leading-relaxed">
                          OpenDyslexic fonts, optimal spacing, high contrast options
                        </TTSParagraph>
                      </CardContent>
                    </Card>

                    <Card className="card bg-white border-gray-200 text-gray-900 p-8" tabIndex={0}>
                      <CardHeader className="card-header">
                        <div className="flex flex-col items-center text-center mb-4">
                          <Eye className={`icon mb-2 ${activeProfile === "autism" ? "h-16 w-16" : "h-12 w-12"}`} />
                          <span className={`font-medium ${activeProfile === "autism" ? "text-base" : "text-sm"}`}>
                            Vision Support
                          </span>
                        </div>
                        <CardTitle className="text-xl">Visual Accessibility</CardTitle>
                      </CardHeader>
                      <CardContent className="card-content">
                        <TTSParagraph id="accessibility-2" className="text-gray-900/80 leading-relaxed">
                          Screen reader support, keyboard navigation, customizable colors
                        </TTSParagraph>
                      </CardContent>
                    </Card>

                    <Card className="card bg-white border-gray-200 text-gray-900 p-8" tabIndex={0}>
                      <CardHeader className="card-header">
                        <div className="flex flex-col items-center text-center mb-4">
                          <Target className={`icon mb-2 ${activeProfile === "autism" ? "h-16 w-16" : "h-12 w-12"}`} />
                          <span className={`font-medium ${activeProfile === "autism" ? "text-base" : "text-sm"}`}>
                            Focus Support
                          </span>
                        </div>
                        <CardTitle className="text-xl">ADHD Support</CardTitle>
                      </CardHeader>
                      <CardContent className="card-content">
                        <TTSParagraph id="accessibility-3" className="text-gray-900/80 leading-relaxed">
                          Bite-sized lessons, progress tracking, minimal distractions
                        </TTSParagraph>
                      </CardContent>
                    </Card>

                    <Card className="card bg-white border-gray-200 text-gray-900 p-8" tabIndex={0}>
                      <CardHeader className="card-header">
                        <div className="flex flex-col items-center text-center mb-4">
                          <Grid3X3 className={`icon mb-2 ${activeProfile === "autism" ? "h-16 w-16" : "h-12 w-12"}`} />
                          <span className={`font-medium ${activeProfile === "autism" ? "text-base" : "text-sm"}`}>
                            Structure Support
                          </span>
                        </div>
                        <CardTitle className="text-xl">Autism-Friendly</CardTitle>
                      </CardHeader>
                      <CardContent className="card-content">
                        <TTSParagraph id="accessibility-4" className="text-gray-900/80 leading-relaxed">
                          Consistent layouts, clear navigation, reduced sensory overload
                        </TTSParagraph>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </section>

            <section
              id="solution"
              className="py-20 px-4 md:px-6"
              style={{ scrollMarginTop: "calc(var(--header-h) + 12px)" }}
            >
              <div className="container mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                    Education That Works for Everyone
                  </h2>
                  <TTSParagraph id="solution-intro" className="text-xl text-muted-foreground text-balance">
                    We created a platform where anyone can learn Web3 safely, regardless of their abilities or
                    background.
                  </TTSParagraph>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                  <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-accent -translate-y-1/2"></div>
                  <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-accent -translate-y-1/2"></div>

                  <Card className="text-center p-8 shadow-lg relative z-10">
                    <CardHeader>
                      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                        1
                      </div>
                      <CardTitle className="text-xl text-primary">Learn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TTSParagraph id="solution-1" className="text-muted-foreground leading-relaxed">
                        Start with simple, accessible lessons tailored to your learning style
                      </TTSParagraph>
                    </CardContent>
                  </Card>

                  <Card className="text-center p-8 shadow-lg relative z-10">
                    <CardHeader>
                      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold">
                        2
                      </div>
                      <CardTitle className="text-xl text-accent-foreground">Practice</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TTSParagraph id="solution-2" className="text-muted-foreground leading-relaxed">
                        Use our wallet simulator - all the learning, zero financial risk
                      </TTSParagraph>
                    </CardContent>
                  </Card>

                  <Card className="text-center p-8 shadow-lg relative z-10">
                    <CardHeader>
                      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                        3
                      </div>
                      <CardTitle className="text-xl text-primary">Study</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TTSParagraph id="solution-3" className="text-muted-foreground leading-relaxed">
                        Connect your real wallet and continue your blockchain education journey
                      </TTSParagraph>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section
              id="wallet-simulator"
              className="py-20 px-4 md:px-6"
              style={{ scrollMarginTop: "calc(var(--header-h) + 12px)" }}
            >
              <div className="container mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                        Learn by Doing - Safely
                      </h2>
                      <TTSParagraph id="simulator-intro" className="text-xl text-muted-foreground text-balance">
                        Our wallet simulator allows you to practice with test tokens before risking real money.
                      </TTSParagraph>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-foreground">Practice sending and receiving transactions</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-foreground">Learn about gas fees without spending real ETH</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-foreground">Understand seed phrases and wallet security</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <span className="text-foreground">Make mistakes without financial consequences</span>
                      </div>
                    </div>

                    <Button
                      className="bg-[#094985] text-[#FAFAFA] hover:bg-[#094985]/90 min-h-[44px] min-w-[44px]"
                      id="btn-try-simulator"
                      data-action="open-onboarding"
                      aria-haspopup="dialog"
                      aria-controls="onboarding-modal"
                      type="button"
                      aria-label="Open wallet onboarding"
                      onClick={handleStartWithoutWallet}
                    >
                      Try the Simulator
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <Card className="p-8 shadow-lg">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <span className="font-medium">Wallet Balance</span>
                        <span className="text-2xl font-bold text-accent">1,000 ETH</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-card border rounded">
                          <span>Send Transaction</span>
                          <Button size="sm" variant="outline">
                            Practice
                          </Button>
                        </div>
                        <div className="flex justify-between p-3 bg-card border rounded">
                          <span>Receive Funds</span>
                          <Button size="sm" variant="outline">
                            Practice
                          </Button>
                        </div>
                        <div className="flex justify-between p-3 bg-card border rounded">
                          <span>Smart Contract</span>
                          <Button size="sm" variant="outline">
                            Practice
                          </Button>
                        </div>
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        ⚠️ This is a simulation - no real funds involved
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section
              id="accessibility"
              className="py-20 px-4 md:px-6 bg-primary text-primary-foreground"
              style={{ scrollMarginTop: "calc(var(--header-h) + 12px)" }}
            >
              <div className="container mx-auto">
                <div className="text-center mb-16">
                  <h2
                    className="text-3xl md:text-4xl font-bold mb-4 text-balance text-white font-semibold"
                    style={{ letterSpacing: "0.025em" }}
                  >
                    Built for Accessibility from Day One
                  </h2>
                  <TTSParagraph id="accessibility-intro" className="text-xl text-white/90 text-balance font-medium">
                    Every feature is designed with inclusion in mind. We believe everyone deserves equal access to Web3
                    education.
                  </TTSParagraph>
                </div>

                {activeProfile === "adhd" ? (
                  <div className="max-w-2xl mx-auto">
                    <div className="checklist">
                      <div className="checklist-item completed bg-white text-[#0b1320] border border-[#d7dee8] p-4 rounded-xl mb-3">
                        <input type="checkbox" checked readOnly className="mr-3" />
                        <span className="text-[#0b1320]">✔ Dyslexia support with OpenDyslexic fonts</span>
                      </div>
                      <div className="checklist-item completed bg-white text-[#0b1320] border border-[#d7dee8] p-4 rounded-xl mb-3">
                        <input type="checkbox" checked readOnly className="mr-3" />
                        <span className="text-[#0b1320]">✔ Autism-friendly with consistent layouts</span>
                      </div>
                      <div className="checklist-item completed bg-white text-[#0b1320] border border-[#d7dee8] p-4 rounded-xl mb-3">
                        <input type="checkbox" checked readOnly className="mr-3" />
                        <span className="text-[#0b1320]">✔ ADHD support with step-by-step guidance</span>
                      </div>
                      <div className="checklist-item completed bg-white text-[#0b1320] border border-[#d7dee8] p-4 rounded-xl mb-3">
                        <input type="checkbox" checked readOnly className="mr-3" />
                        <span className="text-[#0b1320]">✔ Visual accessibility with screen readers</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8">
                    <Card className="card bg-white border-gray-200 text-gray-900 p-8">
                      <CardHeader className="card-header">
                        <div className="flex flex-col items-center text-center mb-4">
                          <Brain className={`mb-2 ${activeProfile === "autism" ? "h-16 w-16" : "h-12 w-12"}`} />
                          <span className={`font-medium ${activeProfile === "autism" ? "text-base" : "text-sm"}`}>
                            Dyslexia Support
                          </span>
                        </div>
                        <CardTitle className="text-xl">Dyslexia-Friendly</CardTitle>
                      </CardHeader>
                      <CardContent className="card-content">
                        <TTSParagraph id="accessibility-1" className="leading-relaxed">
                          OpenDyslexic fonts, optimal spacing, high contrast options
                        </TTSParagraph>
                      </CardContent>
                    </Card>

                    <Card className="card bg-white border-gray-200 text-gray-900 p-8">
                      <CardHeader className="card-header">
                        <div className="flex flex-col items-center text-center mb-4">
                          <Eye className={`mb-2 ${activeProfile === "autism" ? "h-16 w-16" : "h-12 w-12"}`} />
                          <span className={`font-medium ${activeProfile === "autism" ? "text-base" : "text-sm"}`}>
                            Vision Support
                          </span>
                        </div>
                        <CardTitle className="text-xl">Visual Accessibility</CardTitle>
                      </CardHeader>
                      <CardContent className="card-content">
                        <TTSParagraph id="accessibility-2" className="leading-relaxed">
                          Screen reader support, keyboard navigation, customizable colors
                        </TTSParagraph>
                      </CardContent>
                    </Card>

                    <Card className="card bg-white border-gray-200 text-gray-900 p-8">
                      <CardHeader className="card-header">
                        <div className="flex flex-col items-center text-center mb-4">
                          <Target className={`mb-2 ${activeProfile === "autism" ? "h-16 w-16" : "h-12 w-12"}`} />
                          <span className={`font-medium ${activeProfile === "autism" ? "text-base" : "text-sm"}`}>
                            Focus Support
                          </span>
                        </div>
                        <CardTitle className="text-xl">ADHD Support</CardTitle>
                      </CardHeader>
                      <CardContent className="card-content">
                        <TTSParagraph id="accessibility-3" className="leading-relaxed">
                          Bite-sized lessons, progress tracking, minimal distractions
                        </TTSParagraph>
                      </CardContent>
                    </Card>

                    <Card className="card bg-white border-gray-200 text-gray-900 p-8">
                      <CardHeader className="card-header">
                        <div className="flex flex-col items-center text-center mb-4">
                          <Grid3X3 className={`mb-2 ${activeProfile === "autism" ? "h-16 w-16" : "h-12 w-12"}`} />
                          <span className={`font-medium ${activeProfile === "autism" ? "text-base" : "text-sm"}`}>
                            Structure Support
                          </span>
                        </div>
                        <CardTitle className="text-xl">Autism-Friendly</CardTitle>
                      </CardHeader>
                      <CardContent className="card-content">
                        <TTSParagraph id="accessibility-4" className="leading-relaxed">
                          Consistent layouts, clear navigation, reduced sensory overload
                        </TTSParagraph>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </section>

            <section className="py-20 px-4 md:px-6" style={{ scrollMarginTop: "calc(var(--header-h) + 12px)" }}>
              <div className="container mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                    The Opportunity for Inclusion
                  </h2>
                  <TTSParagraph id="impact-intro" className="text-xl text-muted-foreground text-balance">
                    Web3 has an accessibility problem. We're here to solve it.
                  </TTSParagraph>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <Card className="text-center p-8 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="text-5xl md:text-6xl font-bold text-primary mb-4">15%</div>
                      <p className="text-lg text-muted-foreground">People worldwide live with disabilities</p>
                    </CardContent>
                  </Card>

                  <Card className="text-center p-8 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="text-5xl md:text-6xl font-bold text-accent mb-4">0%</div>
                      <p className="text-lg text-muted-foreground">Current data on their Web3 participation</p>
                    </CardContent>
                  </Card>

                  <Card className="text-center p-8 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="text-5xl md:text-6xl font-bold text-primary mb-4">100%</div>
                      <p className="text-lg text-muted-foreground">Our commitment to changing this</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section
              className="py-20 px-4 md:px-6 bg-accent text-accent-foreground"
              style={{ scrollMarginTop: "calc(var(--header-h) + 12px)" }}
            >
              <div className="container mx-auto text-center">
                <div className="space-y-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-balance">Ready to Start Your Web3 Journey?</h2>
                  <TTSParagraph
                    id="cta-description"
                    className="text-xl text-accent-foreground/80 text-balance max-w-2xl mx-auto"
                  >
                    Join thousands learning blockchain technology in an accessible, safe environment
                  </TTSParagraph>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6"
                      onClick={handleStartWithoutWallet}
                    >
                      Start Without Wallet
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-[#094985] text-[#FAFAFA] hover:bg-[#094985]/90 text-lg px-8 py-6 min-h-[44px] min-w-[44px] border-[#094985]"
                      data-action="open-accessibility"
                      aria-controls="accessibility-modal"
                      aria-haspopup="dialog"
                      type="button"
                      aria-label="Open accessibility preferences"
                    >
                      Accessibility Preference
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <footer className="py-16 px-4 md:px-6 bg-primary text-primary-foreground" role="contentinfo" id="footer">
              <div className="container mx-auto">
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-lg bg-primary-foreground flex items-center justify-center">
                      </div>
                      <div>
                        <h3 className="font-bold text-white">W.A.V.E</h3>
                        <p className="text-xs text-white/80">Web3 Accessibility & Virtual Education</p>
                      </div>
                    </div>
                    <TTSParagraph id="footer-description" className="text-white/80 text-sm leading-relaxed">
                      Breaking down barriers to Web3 education
                    </TTSParagraph>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Quick Links</h4>
                    <div className="space-y-2 text-sm">
                      <a href="#solution" className="block text-white/80 hover:text-white transition-colors">
                        Solution
                      </a>
                      <a href="#wallet-simulator" className="block text-white/80 hover:text-white transition-colors">
                        Simulator
                      </a>
                      <a href="#accessibility" className="block text-white/80 hover:text-white transition-colors">
                        Accessibility Features
                      </a>
                      <a href="#" className="block text-white/80 hover:text-white transition-colors">
                        FAQ
                      </a>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Resources</h4>
                    <div className="space-y-2 text-sm">
                      <a href="#wallet-simulator" className="block text-white/80 hover:text-white transition-colors">
                        Wallet Simulator
                      </a>
                      <a href="#" className="block text-white/80 hover:text-white transition-colors">
                        Learning Modules
                      </a>
                      <a href="#" className="block text-white/80 hover:text-white transition-colors">
                        Community Guidelines
                      </a>
                      <a href="#" className="block text-white/80 hover:text-white transition-colors">
                        Help Center
                      </a>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Contact</h4>
                    <div className="space-y-2 text-sm text-white/80">
                      <p>Built for Aleph Hackathon 2025</p>
                      <a href="https://github.com/Soymaferlopezp/wave" className="flex items-center space-x-2 hover:text-white transition-colors">
                        <Github className="h-4 w-4" />
                        <span>GitHub Repository</span>
                      </a>
                      <a href="#" className="flex items-center space-x-2 hover:text-white transition-colors">
                        <ExternalLink className="h-4 w-4" />
                        <span>Contact Information</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
                  <p className="text-white/80 text-sm">© 2025 W.A.V.E. Made with ❤️ for inclusion.</p>
                </div>
              </div>
            </footer>
          </main>
        </>
      )}
    </div>
  )
}
