"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Web3Game from "@/components/web3-game" // Import Web3Game component
import SnakeChainGame from "@/components/snake-chain-game" // Added SnakeChain game import
import SoundBlocksGame from "@/components/sound-blocks-game" // Added Sound Blocks game import
import {
  Home,
  BookOpen,
  BarChart3,
  Trophy,
  Settings,
  Globe,
  Wallet,
  Gamepad2,
  MessageCircle,
  Tag,
  Link,
  ArrowLeft,
  Menu,
  X,
  Calendar,
  Award,
  Target,
  Zap,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react"

interface LearningDashboardProps {
  isOpen: boolean
  onClose: () => void
  connectedAddress: string
}

interface Lesson {
  id: string
  title: string
  text: string
  example: string
  status: "not-started" | "in-progress" | "completed"
  hasCallout?: boolean
  callout?: {
    title: string
    text: string
    buttonLabel: string
    buttonHref: string
    note: string
  }
}

interface ModuleData {
  id: string
  title: string
  intro: string
  lessons: Lesson[]
}

const moduleData: Record<string, ModuleData> = {
  "ens-101": {
    id: "ens-101",
    title: "ENS 101",
    intro:
      "ENS is the Ethereum Name Service. It makes using Web3 easier by replacing long wallet addresses with human-readable names.",
    lessons: [
      {
        id: "why-ens-matters",
        title: "Why ENS matters",
        text: "Wallet addresses like 0x1234… are hard to remember. ENS gives you a readable name that maps to your wallet.",
        example: "wave.crecimiento.eth resolves directly to an Ethereum wallet address.",
        status: "not-started",
      },
      {
        id: "claiming-ens-name",
        title: "Claiming an ENS name",
        text: "Users can register names via ENS dapps. Names can represent people, apps, or organizations.",
        example: "Registering myname.eth makes it easier to receive tokens.",
        status: "in-progress",
        hasCallout: true,
        callout: {
          title: "Claim a free ENS (wink 😉)",
          text: "The 'crecimiento' team is offering a free ENS-style name template: user.crecimiento.eth — claim yours.",
          buttonLabel: "Claim your name",
          buttonHref: "https://crecimiento-claim-page.vercel.app",
          note: "Replace 'user' with your alias.",
        },
      },
    ],
  },
  "social-farcaster": {
    id: "social-farcaster",
    title: "Social (Farcaster)",
    intro: "Farcaster is a decentralized social protocol where you own your identity and data.",
    lessons: [
      {
        id: "what-is-farcaster",
        title: "What is Farcaster?",
        text: "Unlike Web2 social media, Farcaster identities live onchain and are portable between apps.",
        example: "Creating a Farcaster profile means your username and followers belong to you, not the platform.",
        status: "not-started",
      },
      {
        id: "posting-interacting",
        title: "Posting and interacting",
        text: "Farcaster apps let you share messages (casts), reply, and follow others directly.",
        example: "Post a cast from a Farcaster client, and it stays linked to your onchain ID.",
        status: "in-progress",
      },
    ],
  },
  "base-101": {
    id: "base-101",
    title: "BASE 101",
    intro: "BASE is a Layer 2 blockchain built on Ethereum, developed by Coinbase. It is fast, affordable, and secure.",
    lessons: [
      {
        id: "what-is-layer-2",
        title: "What is a Layer 2?",
        text: "Layer 2 chains scale Ethereum by processing transactions off-chain and settling on Ethereum for security.",
        example: "BASE batches transactions and anchors them back to Ethereum mainnet.",
        status: "not-started",
      },
      {
        id: "strength-of-base",
        title: "The strength of BASE",
        text: "BASE combines Coinbase's user base with Ethereum's security. Its ecosystem grows rapidly with apps and builders.",
        example: "Today, users can try the BASE App to explore dapps, NFTs, and DeFi.",
        status: "completed",
      },
    ],
  },
}

export function LearningDashboard({ isOpen, onClose, connectedAddress }: LearningDashboardProps) {
  const [activeNav, setActiveNav] = useState("home")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showGame, setShowGame] = useState(false) // Added game state management
  const [showSnakeChain, setShowSnakeChain] = useState(false) // Added SnakeChain game state
  const [showSoundBlocks, setShowSoundBlocks] = useState(false) // Added Sound Blocks game state
  const [showGameDashboard, setShowGameDashboard] = useState(false)
  const [moduleFilter, setModuleFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recommended")

  const [openModule, setOpenModule] = useState<string | null>(null)
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
  const [lessonCompletions, setLessonCompletions] = useState<Record<string, boolean>>({})

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wave_dark_mode") === "true"
    }
    return false
  })
  const [textSize, setTextSize] = useState(() => {
    if (typeof window !== "undefined") {
      return Number.parseInt(localStorage.getItem("wave_text_size") || "100")
    }
    return 100
  })
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wave_tts_enabled") === "true"
    }
    return false
  })
  const [voiceNavEnabled, setVoiceNavEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wave_voice_nav") === "true"
    }
    return false
  })
  const [hideExtras, setHideExtras] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wave_hide_extras") === "true"
    }
    return false
  })
  const [selectedPreset, setSelectedPreset] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wave_accessibility_choice") || "base"
    }
    return "base"
  })

  const [resetConfirmation, setResetConfirmation] = useState("")

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    localStorage.setItem("wave_accessibility_choice", preset)
    window.dispatchEvent(new CustomEvent("wave:presetChanged", { detail: { preset } }))
  }

  const handleDarkModeToggle = () => {
    const newValue = !darkMode
    setDarkMode(newValue)
    localStorage.setItem("wave_dark_mode", newValue.toString())
  }

  const handleTextSizeChange = (size: number) => {
    setTextSize(size)
    localStorage.setItem("wave_text_size", size.toString())
  }

  const handleTtsToggle = () => {
    const newValue = !ttsEnabled
    setTtsEnabled(newValue)
    localStorage.setItem("wave_tts_enabled", newValue.toString())
  }

  const handleVoiceNavToggle = () => {
    const newValue = !voiceNavEnabled
    setVoiceNavEnabled(newValue)
    localStorage.setItem("wave_voice_nav", newValue.toString())
  }

  const handleHideExtrasToggle = () => {
    const newValue = !hideExtras
    setHideExtras(newValue)
    localStorage.setItem("wave_hide_extras", newValue.toString())
  }

  const handleResetSettings = () => {
    // Clear only settings-related localStorage keys
    localStorage.removeItem("wave_accessibility_choice")
    localStorage.removeItem("wave_text_size")
    localStorage.removeItem("wave_tts_enabled")
    localStorage.removeItem("wave_voice_nav")
    localStorage.removeItem("wave_hide_extras")

    // Update UI state to defaults immediately
    setSelectedPreset("base")
    setDarkMode(false)
    setTextSize(100)
    setTtsEnabled(false)
    setVoiceNavEnabled(false)
    setHideExtras(false)

    // Dispatch custom event for other components to react
    window.dispatchEvent(new CustomEvent("wave:settingsReset"))

    // Show confirmation message
    setResetConfirmation("Settings have been reset to defaults.")

    // Clear confirmation after 3 seconds
    setTimeout(() => {
      setResetConfirmation("")
    }, 3000)
  }

  const accessibilityPresets = [
    {
      id: "base",
      label: "Base",
      description: "Standard interface with default settings",
      icon: "🎯",
    },
    {
      id: "dyslexia",
      label: "Dyslexia",
      description: "Dyslexia-friendly fonts and spacing",
      icon: "📖",
    },
    {
      id: "autism",
      label: "Autism",
      description: "Predictable layout with reduced motion",
      icon: "🧩",
    },
    {
      id: "adhd",
      label: "ADHD",
      description: "Focused interface with minimal distractions",
      icon: "⚡",
    },
    {
      id: "visual",
      label: "Visual Impairment",
      description: "High contrast with screen reader support",
      icon: "👁️",
    },
  ]

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const navigationItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "modules", label: "Learning Modules", icon: BookOpen },
    { id: "games", label: "Game & Learn", icon: Gamepad2 },
    { id: "progress", label: "Progress & Certificates", icon: BarChart3 },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "settings", label: "Settings & Accessibility", icon: Settings },
  ]

  const learningModules = [
    {
      id: "web3-basics",
      title: "Web3 Basics",
      description: "Understand blockchain fundamentals and decentralization",
      icon: Globe,
      duration: "~45 minutes",
      difficulty: "Beginner",
      status: "not-started",
      progress: 0,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "wallets-101",
      title: "Wallets 101",
      description: "Master wallet security and transaction management",
      icon: Wallet,
      duration: "~30 minutes",
      difficulty: "Beginner",
      status: "in-progress",
      progress: 35,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      id: "social-101",
      title: "Social 101 (Farcaster)",
      description: "Join decentralized social networks and communities",
      icon: MessageCircle,
      duration: "~40 minutes",
      difficulty: "Beginner",
      status: "not-started",
      progress: 0,
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
    },
    {
      id: "ens-101",
      title: "ENS 101",
      description: "Create your Web3 identity with Ethereum Name Service",
      icon: Tag,
      duration: "~35 minutes",
      difficulty: "Beginner",
      status: "not-started",
      progress: 0,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      id: "lisk",
      title: "Lisk Blockchain",
      description: "Build on Lisk blockchain ecosystem",
      icon: Link,
      duration: "~50 minutes",
      difficulty: "Intermediate",
      status: "not-started",
      progress: 0,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
  ]

  const filteredModules = learningModules.filter((module) => {
    if (difficultyFilter !== "all" && module.difficulty.toLowerCase() !== difficultyFilter) return false
    if (statusFilter !== "all" && module.status !== statusFilter) return false
    return true
  })

  const sortedModules = [...filteredModules].sort((a, b) => {
    switch (sortBy) {
      case "duration":
        return Number.parseInt(a.duration) - Number.parseInt(b.duration)
      case "difficulty":
        const difficultyOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 }
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      default:
        return 0
    }
  })

  const getModuleButtonText = (status: string, progress: number) => {
    switch (status) {
      case "in-progress":
        return "Continue Learning"
      case "completed":
        return "Review Module"
      default:
        return "Start Learning"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-orange-100 text-orange-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleModuleClick = (moduleId: string) => {
    if (moduleId === "game-learn") {
      setShowGame(true)
      return
    }

    // Check if this is one of the modules with detail content
    const moduleKey = moduleId === "social-101" ? "social-farcaster" : moduleId
    if (moduleData[moduleKey]) {
      setOpenModule(moduleKey)
      return
    }

    // Placeholder for future module content implementation
    console.log(`Opening module: ${moduleId}`)
  }

  const handleGameClick = (gameId: string) => {
    if (gameId === "match-learn") {
      setShowGame(true)
      return
    }
    if (gameId === "snakechain") {
      setShowSnakeChain(true)
      return
    }
    if (gameId === "sound-blocks") {
      setShowSoundBlocks(true)
      return
    }
    // Placeholder for future game implementations
    console.log(`Opening game: ${gameId}`)
  }

  const toggleLessonExpansion = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons)
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId)
    } else {
      newExpanded.add(lessonId)
    }
    setExpandedLessons(newExpanded)
  }

  const toggleLessonCompletion = (lessonId: string) => {
    setLessonCompletions((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }))
  }

  const calculateModuleProgress = (moduleId: string) => {
    const module = moduleData[moduleId]
    if (!module) return 0

    const completedLessons = module.lessons.filter(
      (lesson) => lessonCompletions[lesson.id] || lesson.status === "completed",
    ).length

    return Math.round((completedLessons / module.lessons.length) * 100)
  }

  const getStatusBadge = (lesson: Lesson) => {
    if (lessonCompletions[lesson.id] || lesson.status === "completed") {
      return <Badge className="bg-green-600 text-white text-xs">Completed</Badge>
    }
    if (lesson.status === "in-progress") {
      return <Badge className="bg-blue-600 text-white text-xs">In Progress</Badge>
    }
    return <Badge className="bg-gray-600 text-white text-xs">Not Started</Badge>
  }

  const renderModuleDetail = () => {
    if (!openModule || !moduleData[openModule]) return null

    const module = moduleData[openModule]
    const progress = calculateModuleProgress(openModule)

    return (
      <div className="space-y-6 lg:space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#094985]">{module.title}</h2>
            <Button
              onClick={() => setOpenModule(null)}
              variant="outline"
              className="border-[#094985] text-[#094985] hover:bg-[#094985] hover:text-white"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#094985]">Module Progress</span>
              <span className="text-sm text-[#094985] font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-[#F1C47B] h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Intro */}
          <p className="text-gray-600 leading-relaxed">{module.intro}</p>
        </div>

        {/* Lessons */}
        <div className="space-y-4">
          {module.lessons.map((lesson, index) => (
            <Card key={lesson.id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {/* Lesson Header */}
                <button
                  onClick={() => toggleLessonExpansion(lesson.id)}
                  className="w-full p-4 lg:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  aria-expanded={expandedLessons.has(lesson.id)}
                  aria-controls={`lesson-content-${lesson.id}`}
                  aria-label={`${expandedLessons.has(lesson.id) ? "Collapse" : "Expand"} lesson: ${lesson.title}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {expandedLessons.has(lesson.id) ? (
                        <ChevronDown className="h-5 w-5 text-[#094985]" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-[#094985]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#094985] mb-1">
                        Lesson {index + 1}: {lesson.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(lesson)}
                        {(lessonCompletions[lesson.id] || lesson.status === "completed") && (
                          <Badge className="bg-[#F1C47B] text-[#094985] text-xs font-semibold">🏆 Achievement</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Lesson Content */}
                {expandedLessons.has(lesson.id) && (
                  <div
                    id={`lesson-content-${lesson.id}`}
                    className="px-4 lg:px-6 pb-4 lg:pb-6 border-t border-gray-100"
                  >
                    <div className="space-y-4 pt-4">
                      {/* Explanation */}
                      <div>
                        <h4 className="font-medium text-[#094985] mb-2">Explanation:</h4>
                        <p className="text-gray-700 leading-relaxed">{lesson.text}</p>
                      </div>

                      {/* Example */}
                      <div>
                        <h4 className="font-medium text-[#094985] mb-2">Example:</h4>
                        <div className="bg-[#F1C47B]/10 p-3 rounded-lg border-l-4 border-[#F1C47B]">
                          <p className="text-gray-700 italic">{lesson.example}</p>
                        </div>
                      </div>

                      {lesson.hasCallout && lesson.callout && (
                        <div className="mt-4 p-4 border-2 border-[#094985] rounded-lg bg-[#FAFAFA] dark:bg-[#121B28]">
                          <h4 className="font-semibold text-[#094985] mb-2">{lesson.callout.title}</h4>
                          <p className="text-sm text-[#1C1C1C] dark:text-[#FAFAFA] mb-3">{lesson.callout.text}</p>
                          <a
                            href={lesson.callout.buttonHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-[#094985] text-[#FAFAFA] rounded-lg hover:bg-[#0B5A9E] transition-colors focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2"
                            aria-label="Open claim page for user.crecimiento.eth in a new tab"
                          >
                            {lesson.callout.buttonLabel}
                          </a>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{lesson.callout.note}</p>
                        </div>
                      )}

                      {/* Mark as Done */}
                      <div className="flex items-center space-x-3 pt-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lessonCompletions[lesson.id] || lesson.status === "completed"}
                            onChange={() => toggleLessonCompletion(lesson.id)}
                            className="h-4 w-4 text-[#094985] focus:ring-[#094985] border-gray-300 rounded"
                            disabled={lesson.status === "completed"}
                          />
                          <span className="text-sm font-medium text-[#094985]">Mark as done</span>
                        </label>
                        {lessonCompletions[lesson.id] && (
                          <div className="text-green-600 text-sm flex items-center" aria-live="polite">
                            <Check className="h-4 w-4 mr-1" />
                            Lesson completed!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button
            onClick={() => setOpenModule(null)}
            className="bg-[#094985] text-white hover:bg-[#094985]/90 px-8 py-3"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex">
      {showGame && <Web3Game isOpen={showGame} onClose={() => setShowGame(false)} />}
      {showSnakeChain && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowSnakeChain(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 rounded-full p-2 shadow-lg transition-colors"
              aria-label="Close SnakeChain game"
            >
              <X className="h-6 w-6" />
            </button>
            <SnakeChainGame />
          </div>
        </div>
      )}
      {showSoundBlocks && <SoundBlocksGame onClose={() => setShowSoundBlocks(false)} />}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ width: "280px" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={onClose}
              className="flex items-center space-x-3 w-full hover:bg-gray-50 p-2 rounded-lg transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-[#094985] flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-[#094985]">W.A.V.E</h1>
                <p className="text-xs text-gray-600">Learning Dashboard</p>
              </div>
            </button>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back to Landing
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id)
                      setOpenModule(null) // Close module detail when navigating
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                      activeNav === item.id
                        ? "bg-[#F1C47B] text-[#094985] font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Connected Wallet */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-[#F1C47B]/10 p-3 rounded-lg">
              <p className="text-sm font-medium text-[#094985] mb-1">Connected Wallet</p>
              <p className="text-xs text-gray-600 font-mono">
                {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
              </p>
            </div>
          </div>

          {/* Close Button (Mobile) */}
          <div className="p-4 border-t border-gray-200 lg:hidden">
            <Button variant="outline" onClick={() => setSidebarOpen(false)} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Close Menu
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-[#094985]">W.A.V.E Learning</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Close dashboard">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 bg-gray-50">
          {openModule ? (
            renderModuleDetail()
          ) : (
            <>
              {activeNav === "home" && (
                <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
                  {/* Welcome Section */}
                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl lg:text-2xl font-bold text-[#094985] mb-2">
                      Welcome back, {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}! 👋
                    </h2>
                    <p className="text-gray-600 mb-4">Continue your Web3 learning journey</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-[#F1C47B]/20 text-[#094985] text-xs">
                        Accessibility First
                      </Badge>
                      <Badge variant="secondary" className="bg-[#F1C47B]/20 text-[#094985] text-xs">
                        Safe Learning
                      </Badge>
                      <Badge variant="secondary" className="bg-[#F1C47B]/20 text-[#094985] text-xs">
                        Progress Tracking
                      </Badge>
                    </div>
                  </div>

                  {/* Quick Stats Dashboard */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#094985] mb-4">Your Progress</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                      <Card className="text-center">
                        <CardContent className="p-3 lg:p-4">
                          <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-[#094985] mx-auto mb-2" />
                          <p className="text-xl lg:text-2xl font-bold text-[#094985]">2/6</p>
                          <p className="text-xs lg:text-sm text-gray-600">Modules Started</p>
                        </CardContent>
                      </Card>
                      <Card className="text-center">
                        <CardContent className="p-3 lg:p-4">
                          <Zap className="h-6 w-6 lg:h-8 lg:w-8 text-[#F1C47B] mx-auto mb-2" />
                          <p className="text-xl lg:text-2xl font-bold text-[#094985]">150</p>
                          <p className="text-xs lg:text-sm text-gray-600">XP Earned</p>
                        </CardContent>
                      </Card>
                      <Card className="text-center">
                        <CardContent className="p-3 lg:p-4">
                          <Award className="h-6 w-6 lg:h-8 lg:w-8 text-[#094985] mx-auto mb-2" />
                          <p className="text-xl lg:text-2xl font-bold text-[#094985]">1</p>
                          <p className="text-xs lg:text-sm text-gray-600">Certificates</p>
                        </CardContent>
                      </Card>
                      <Card className="text-center">
                        <CardContent className="p-3 lg:p-4">
                          <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-[#F1C47B] mx-auto mb-2" />
                          <p className="text-xl lg:text-2xl font-bold text-[#094985]">3</p>
                          <p className="text-xs lg:text-sm text-gray-600">Day Streak</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#094985] mb-4">Recent Activity</h3>
                    <Card>
                      <CardContent className="p-4 lg:p-6">
                        <div className="space-y-3 lg:space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0"></div>
                            <p className="text-sm text-gray-700 flex-1">Completed: Web3 Basics Module</p>
                            <span className="text-xs text-gray-500">2 days ago</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <p className="text-sm text-gray-700 flex-1">Started: Wallets 101 Module</p>
                            <span className="text-xs text-gray-500">1 day ago</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="h-2 w-2 bg-[#F1C47B] rounded-full flex-shrink-0"></div>
                            <p className="text-sm text-gray-700 flex-1">Earned: First Steps Badge</p>
                            <span className="text-xs text-gray-500">3 hours ago</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#094985] mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                      <Button className="bg-[#094985] text-white hover:bg-[#094985]/90 h-auto p-3 lg:p-4 flex flex-col items-center space-y-2">
                        <BookOpen className="h-5 w-5 lg:h-6 lg:w-6" />
                        <span className="text-sm lg:text-base">Continue Last Module</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="border-[#094985] text-[#094985] hover:bg-[#094985] hover:text-white h-auto p-3 lg:p-4 flex flex-col items-center space-y-2 bg-transparent"
                      >
                        <Target className="h-5 w-5 lg:h-6 lg:w-6" />
                        <span className="text-sm lg:text-base">Take Daily Challenge</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="border-[#F1C47B] text-[#094985] hover:bg-[#F1C47B] hover:text-[#094985] h-auto p-3 lg:p-4 flex flex-col items-center space-y-2 bg-transparent"
                      >
                        <Trophy className="h-5 w-5 lg:h-6 lg:w-6" />
                        <span className="text-sm lg:text-base">View All Achievements</span>
                      </Button>
                    </div>
                  </div>

                  {/* Learning Path Suggestion */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#094985] mb-4">Suggested Next</h3>
                    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-[#F1C47B]/30">
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                          <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-[#F1C47B]/20 flex items-center justify-center flex-shrink-0">
                            <Wallet className="h-6 w-6 lg:h-8 lg:w-8 text-[#094985]" />
                          </div>
                          <div className="flex-1 w-full">
                            <h4 className="text-lg font-semibold text-[#094985] mb-1">Wallets 101</h4>
                            <p className="text-gray-600 text-sm mb-3">Continue where you left off - 35% complete</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                              <div
                                className="bg-[#F1C47B] h-2 rounded-full transition-all duration-300"
                                style={{ width: "35%" }}
                              ></div>
                            </div>
                            <Button className="bg-[#094985] text-white hover:bg-[#094985]/90 w-full sm:w-auto">
                              Continue Learning
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Learning Modules Section */}
              {activeNav === "modules" && (
                <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
                  {/* Welcome Section */}
                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl lg:text-2xl font-bold text-[#094985] mb-2">
                      GM, {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}! 👋
                    </h2>
                    <p className="text-gray-600 mb-4">Continue your Web3 learning journey</p>

                    {/* Overall Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#094985]">Overall Learning Progress</span>
                        <span className="text-sm text-[#094985] font-bold">25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-[#F1C47B] h-3 rounded-full transition-all duration-300"
                          style={{ width: "25%" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Learning Modules Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* BASE 101 */}
                    <Card className="bg-[#094985] text-white border-0 hover:shadow-xl transition-all duration-300 h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Icon */}
                        <div className="mb-4">
                          <Link className="h-10 w-10 text-white stroke-2" />
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-xl font-bold mb-2">BASE 101</h3>
                        <p className="text-white/90 text-sm mb-4">Learn the fundamentals of the BASE blockchain.</p>

                        {/* Lessons List */}
                        <div className="mb-4 flex-grow">
                          <h4 className="text-sm font-semibold mb-2 text-white/80">Lessons:</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>• What makes BASE different?</span>
                              <Badge className="bg-blue-600 text-white text-xs">In Progress</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>• How transactions confirm on BASE</span>
                              <Badge className="bg-gray-600 text-white text-xs">Not Started</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Button */}
                        <Button
                          className="bg-[#094985] border-2 border-white text-white hover:bg-white hover:text-[#094985] w-full mt-auto"
                          aria-label="Open module BASE 101"
                          onClick={() => handleModuleClick("base-101")}
                        >
                          Open Module
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Social (Farcaster) */}
                    <Card className="bg-[#094985] text-white border-0 hover:shadow-xl transition-all duration-300 h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Icon */}
                        <div className="mb-4">
                          <MessageCircle className="h-10 w-10 text-white stroke-2" />
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-xl font-bold mb-2">Social (Farcaster)</h3>
                        <p className="text-white/90 text-sm mb-4">Explore decentralized social networks.</p>

                        {/* Lessons List */}
                        <div className="mb-4 flex-grow">
                          <h4 className="text-sm font-semibold mb-2 text-white/80">Lessons:</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>• Create your Farcaster profile</span>
                              <Badge className="bg-gray-600 text-white text-xs">Not Started</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>• Follow and interact onchain</span>
                              <Badge className="bg-gray-600 text-white text-xs">Not Started</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Button */}
                        <Button
                          className="bg-[#094985] border-2 border-white text-white hover:bg-white hover:text-[#094985] w-full mt-auto"
                          aria-label="Open module Social (Farcaster)"
                          onClick={() => handleModuleClick("social-101")}
                        >
                          Open Module
                        </Button>
                      </CardContent>
                    </Card>

                    {/* ENS 101 */}
                    <Card className="bg-[#094985] text-white border-0 hover:shadow-xl transition-all duration-300 h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Icon */}
                        <div className="mb-4">
                          <Tag className="h-10 w-10 text-white stroke-2" />
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-xl font-bold mb-2">ENS 101</h3>
                        <p className="text-white/90 text-sm mb-4">Discover Ethereum Name Service and identities.</p>

                        {/* Lessons List */}
                        <div className="mb-4 flex-grow">
                          <h4 className="text-sm font-semibold mb-2 text-white/80">Lessons:</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>• Claim your first ENS name</span>
                              <Badge className="bg-gray-600 text-white text-xs">Not Started</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>• Why names are easier than addresses</span>
                              <Badge className="bg-gray-600 text-white text-xs">Not Started</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Button */}
                        <Button
                          className="bg-[#094985] border-2 border-white text-white hover:bg-white hover:text-[#094985] w-full mt-auto"
                          aria-label="Open module ENS 101"
                          onClick={() => handleModuleClick("ens-101")}
                        >
                          Open Module
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Introduction to Web3 */}
                    <Card className="bg-[#094985] text-white border-0 hover:shadow-xl transition-all duration-300 h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Icon */}
                        <div className="mb-4">
                          <Globe className="h-10 w-10 text-white stroke-2" />
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-xl font-bold mb-2">Introduction to Web3</h3>
                        <p className="text-white/90 text-sm mb-4">Learn the basics of blockchain and Web3.</p>

                        {/* Lessons List */}
                        <div className="mb-4 flex-grow">
                          <h4 className="text-sm font-semibold mb-2 text-white/80">Lessons:</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>• What is decentralization?</span>
                              <Badge className="bg-gray-600 text-white text-xs">Not Started</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>• How does a blockchain work?</span>
                              <Badge className="bg-blue-600 text-white text-xs">In Progress</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Button */}
                        <Button
                          className="bg-[#094985] border-2 border-white text-white hover:bg-white hover:text-[#094985] w-full mt-auto"
                          aria-label="Open module Introduction to Web3"
                          onClick={() => handleModuleClick("web3-basics")}
                        >
                          Open Module
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Wallets */}
                    <Card className="bg-[#094985] text-white border-0 hover:shadow-xl transition-all duration-300 h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Icon */}
                        <div className="mb-4">
                          <Wallet className="h-10 w-10 text-white stroke-2" />
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-xl font-bold mb-2">Wallets</h3>
                        <p className="text-white/90 text-sm mb-4">Practice using wallets safely and step by step.</p>

                        {/* Lessons List */}
                        <div className="mb-4 flex-grow">
                          <h4 className="text-sm font-semibold mb-2 text-white/80">Lessons:</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>• Seed phrase vs Public address</span>
                              <Badge className="bg-green-600 text-white text-xs">Completed</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>• Send and receive tokens</span>
                              <Badge className="bg-gray-600 text-white text-xs">Not Started</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Achievement Badge */}
                        <div className="mb-4">
                          <Badge
                            className="bg-[#F1C47B] text-[#094985] text-xs font-semibold"
                            aria-label="Achievement unlocked for Seed phrase vs Public address"
                          >
                            🏆 Achievement
                          </Badge>
                        </div>

                        {/* Button */}
                        <Button
                          className="bg-[#094985] border-2 border-white text-white hover:bg-white hover:text-[#094985] w-full mt-auto"
                          aria-label="Open module Wallets"
                          onClick={() => handleModuleClick("wallets-101")}
                        >
                          Open Module
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Security & Safety */}
                    <Card className="bg-[#094985] text-white border-0 hover:shadow-xl transition-all duration-300 h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Icon */}
                        <div className="mb-4">
                          <Target className="h-10 w-10 text-white stroke-2" />
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-xl font-bold mb-2">Security & Safety</h3>
                        <p className="text-white/90 text-sm mb-4">Understand risks and protect your funds.</p>

                        {/* Lessons List */}
                        <div className="mb-4 flex-grow">
                          <h4 className="text-sm font-semibold mb-2 text-white/80">Lessons:</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>• How to avoid phishing</span>
                              <Badge className="bg-green-600 text-white text-xs">Completed</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>• Double-checking transactions</span>
                              <Badge className="bg-blue-600 text-white text-xs">In Progress</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Achievement Badge */}
                        <div className="mb-4">
                          <Badge
                            className="bg-[#F1C47B] text-[#094985] text-xs font-semibold"
                            aria-label="Achievement unlocked for How to avoid phishing"
                          >
                            🏆 Achievement
                          </Badge>
                        </div>

                        {/* Button */}
                        <Button
                          className="bg-[#094985] border-2 border-white text-white hover:bg-white hover:text-[#094985] w-full mt-auto"
                          aria-label="Open module Security & Safety"
                          onClick={() => handleModuleClick("security-safety")}
                        >
                          Open Module
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Glossary */}
                    <Card className="bg-[#094985] text-white border-0 hover:shadow-xl transition-all duration-300 h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Icon */}
                        <div className="mb-4">
                          <BookOpen className="h-10 w-10 text-white stroke-2" />
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-xl font-bold mb-2">Glossary</h3>
                        <p className="text-white/90 text-sm mb-4">Quick definitions of key Web3 terms.</p>

                        {/* Lessons List */}
                        <div className="mb-4 flex-grow">
                          <h4 className="text-sm font-semibold mb-2 text-white/80">Lessons:</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>• What is a smart contract?</span>
                              <Badge className="bg-gray-600 text-white text-xs">Not Started</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>• What is gas?</span>
                              <Badge className="bg-gray-600 text-white text-xs">Not Started</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Button */}
                        <Button
                          className="bg-[#094985] border-2 border-white text-white hover:bg-white hover:text-[#094985] w-full mt-auto"
                          aria-label="Open module Glossary"
                          onClick={() => handleModuleClick("glossary")}
                        >
                          Open Module
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Game & Learn Section */}
              {activeNav === "games" && (
                <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
                  {/* Header Section */}
                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col space-y-2 mb-4">
                      <nav className="text-sm text-gray-500">
                        <button onClick={() => setActiveNav("home")} className="hover:text-[#094985]">
                          Home
                        </button>
                        <span className="mx-2">&gt;</span>
                        <span className="text-[#094985]">Game & Learn</span>
                      </nav>
                      <h2 className="text-2xl lg:text-3xl font-bold text-[#094985]">Game & Learn</h2>
                      <p className="text-gray-600">Interactive Web3 games designed for accessibility</p>
                    </div>
                  </div>

                  {/* Game Cards Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Dyslexia / ADHD Game Card */}
                    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#F1C47B] group">
                      <CardContent className="p-8 text-center">
                        {/* Icon */}
                        <div className="h-20 w-20 mx-auto mb-6 bg-gradient-to-br from-[#094985]/10 to-[#F1C47B]/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <div className="relative">
                            <div className="h-10 w-10 bg-[#094985] rounded-lg transform rotate-12"></div>
                            <div className="h-10 w-10 bg-[#F1C47B] rounded-lg absolute -top-2 -left-2 transform -rotate-12"></div>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-[#094985] mb-4">Match & Learn</h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-8 leading-relaxed">
                          Match Web3 concepts with their correct definitions. Designed with dyslexia-friendly fonts and
                          ADHD-friendly pacing.
                        </p>

                        {/* Accessibility Features */}
                        <div className="mb-8 space-y-2">
                          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>High contrast colors</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Readable typography</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Self-paced learning</span>
                          </div>
                        </div>

                        {/* Play Button */}
                        <Button
                          className="w-full h-14 text-lg font-semibold bg-[#094985] hover:bg-[#094985]/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-4 focus:ring-[#094985]/20"
                          onClick={() => handleGameClick("match-learn")}
                          aria-label="Play Match & Learn game for dyslexia and ADHD users"
                        >
                          Play
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Autism Game Card */}
                    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#F1C47B] group">
                      <CardContent className="p-8 text-center">
                        {/* Icon */}
                        <div className="h-20 w-20 mx-auto mb-6 bg-gradient-to-br from-[#094985]/10 to-[#F1C47B]/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <div className="flex space-x-1">
                            <div className="h-4 w-4 bg-[#094985] rounded-sm"></div>
                            <div className="h-4 w-4 bg-[#F1C47B] rounded-sm"></div>
                            <div className="h-4 w-4 bg-[#094985] rounded-sm"></div>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-[#094985] mb-4">SnakeChain</h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-8 leading-relaxed">
                          Guide the snake to collect blocks that confirm a transaction on the BASE network. Predictable
                          patterns and clear visual cues.
                        </p>

                        {/* Accessibility Features */}
                        <div className="mb-8 space-y-2">
                          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Predictable gameplay</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Clear visual patterns</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Sensory-friendly design</span>
                          </div>
                        </div>

                        {/* Play Button */}
                        <Button
                          className="w-full h-14 text-lg font-semibold bg-[#094985] hover:bg-[#094985]/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-4 focus:ring-[#094985]/20"
                          onClick={() => handleGameClick("snakechain")}
                          aria-label="Play SnakeChain game designed for autism accessibility"
                        >
                          Play
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Visual Impairment Game Card */}
                    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#F1C47B] group">
                      <CardContent className="p-8 text-center">
                        {/* Icon */}
                        <div className="h-20 w-20 mx-auto mb-6 bg-gradient-to-br from-[#094985]/10 to-[#F1C47B]/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <div className="relative">
                            <div className="h-12 w-12 border-4 border-[#094985] rounded-full"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-2 w-8 bg-[#F1C47B] rounded-full"></div>
                            </div>
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-[#F1C47B] rounded-full"></div>
                            <div className="absolute -bottom-1 -left-1 h-4 w-4 bg-[#F1C47B] rounded-full"></div>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-[#094985] mb-4">Sound Blocks</h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-8 leading-relaxed">
                          Listen and repeat blockchain keyword sequences. Audio-first gameplay with optional
                          high-contrast visual support.
                        </p>

                        {/* Accessibility Features */}
                        <div className="mb-8 space-y-2">
                          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Audio-first design</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Screen reader compatible</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Keyboard navigation</span>
                          </div>
                        </div>

                        {/* Play Button */}
                        <Button
                          className="w-full h-14 text-lg font-semibold bg-[#094985] hover:bg-[#094985]/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-4 focus:ring-[#094985]/20"
                          onClick={() => handleGameClick("sound-blocks")}
                          aria-label="Play Sound Blocks game designed for visual impairment accessibility"
                        >
                          Play
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional Info Section */}
                  <div className="bg-gradient-to-r from-[#094985]/5 to-[#F1C47B]/5 p-6 lg:p-8 rounded-xl border border-[#F1C47B]/20">
                    <div className="text-center max-w-3xl mx-auto">
                      <h3 className="text-xl font-bold text-[#094985] mb-4">Accessibility-First Gaming</h3>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        Our games are designed with accessibility at the core, ensuring that everyone can learn Web3
                        concepts regardless of their abilities. Each game includes multiple accessibility features and
                        can be customized to individual needs.
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Badge className="bg-[#094985]/10 text-[#094985] px-4 py-2">WCAG 2.1 AA Compliant</Badge>
                        <Badge className="bg-[#F1C47B]/20 text-[#094985] px-4 py-2">Keyboard Navigation</Badge>
                        <Badge className="bg-[#094985]/10 text-[#094985] px-4 py-2">Screen Reader Support</Badge>
                        <Badge className="bg-[#F1C47B]/20 text-[#094985] px-4 py-2">High Contrast Mode</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeNav === "achievements" && (
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
                    <p className="text-gray-600">Unlock badges as you complete lessons.</p>
                  </div>

                  {/* Achievements Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* ENS 101 Achievements */}
                    <div className="bg-[#094985] rounded-[20px] p-6 shadow-lg relative overflow-hidden">
                      <div className="text-center space-y-4">
                        {/* Icon with progress ring */}
                        <div className="relative mx-auto w-16 h-16">
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          </div>
                          {/* Progress ring */}
                          <svg className="absolute inset-0 w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="3" fill="none" opacity="0.3" />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="#F1C47B"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray="176"
                              strokeDashoffset="88"
                              className="transition-all duration-300"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">ENS Explorer</h3>
                          <p className="text-white/80 text-sm">Complete "Why ENS matters"</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">ENS</span>
                          <span className="bg-[#F1C47B] text-[#094985] text-xs px-2 py-1 rounded-full font-medium">
                            In Progress
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#D7DEE8] rounded-[20px] p-6 shadow-lg relative">
                      <div className="text-center space-y-4">
                        {/* Locked icon */}
                        <div className="relative mx-auto w-16 h-16">
                          <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          {/* Lock overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#1C1C1C]">Name Owner</h3>
                          <p className="text-[#1C1C1C]/70 text-sm">Complete "Claiming an ENS name"</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">ENS</span>
                          <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Locked</span>
                        </div>
                      </div>
                    </div>

                    {/* Social (Farcaster) Achievements */}
                    <div className="bg-[#D7DEE8] rounded-[20px] p-6 shadow-lg relative">
                      <div className="text-center space-y-4">
                        {/* Locked icon */}
                        <div className="relative mx-auto w-16 h-16">
                          <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                          </div>
                          {/* Lock overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#1C1C1C]">First Cast</h3>
                          <p className="text-[#1C1C1C]/70 text-sm">Complete "What is Farcaster?"</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Social</span>
                          <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Locked</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#094985] rounded-[20px] p-6 shadow-lg relative overflow-hidden">
                      <div className="text-center space-y-4">
                        {/* Icon with progress ring */}
                        <div className="relative mx-auto w-16 h-16">
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                          {/* Progress ring */}
                          <svg className="absolute inset-0 w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="3" fill="none" opacity="0.3" />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="#F1C47B"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray="176"
                              strokeDashoffset="132"
                              className="transition-all duration-300"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Connector</h3>
                          <p className="text-white/80 text-sm">Complete "Posting and interacting"</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Social</span>
                          <span className="bg-[#F1C47B] text-[#094985] text-xs px-2 py-1 rounded-full font-medium">
                            In Progress
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BASE 101 Achievements */}
                    <div className="bg-[#D7DEE8] rounded-[20px] p-6 shadow-lg relative">
                      <div className="text-center space-y-4">
                        {/* Locked icon */}
                        <div className="relative mx-auto w-16 h-16">
                          <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                          </div>
                          {/* Lock overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#1C1C1C]">L2 Learner</h3>
                          <p className="text-[#1C1C1C]/70 text-sm">Complete "What is a Layer 2?"</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">BASE</span>
                          <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Not Started</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F1C47B] rounded-[20px] p-6 shadow-lg relative overflow-hidden animate-pulse">
                      <div className="text-center space-y-4">
                        {/* Unlocked icon with glow */}
                        <div className="relative mx-auto w-16 h-16">
                          <div className="w-16 h-16 rounded-full bg-[#094985] flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-[#F1C47B]" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          {/* Glow effect */}
                          <div className="absolute inset-0 rounded-full bg-[#F1C47B] opacity-30 animate-ping"></div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#1C1C1C]">BASE Pioneer</h3>
                          <p className="text-[#1C1C1C]/70 text-sm">Complete "The strength of BASE"</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="bg-[#094985] text-white text-xs px-2 py-1 rounded-full">BASE</span>
                          <span className="bg-[#094985] text-[#F1C47B] text-xs px-2 py-1 rounded-full font-medium">
                            Unlocked
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Screen reader announcements */}
                  <div aria-live="polite" className="sr-only">
                    Achievement updates will be announced here
                  </div>
                </div>
              )}

              {activeNav === "settings" && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#094985] mb-2">Settings & Accessibility</h1>
                    <p className="text-gray-600">Customize your learning experience and accessibility preferences</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Accessibility Profile */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                      <h2 className="text-lg font-semibold text-[#094985] mb-4" id="accessibility-profile">
                        Choose your accessibility profile
                      </h2>
                      <div className="space-y-3" role="radiogroup" aria-labelledby="accessibility-profile">
                        {accessibilityPresets.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => handlePresetChange(preset.id)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2 ${
                              selectedPreset === preset.id
                                ? "bg-[#094985] text-white border-[#094985]"
                                : "bg-gray-50 text-gray-900 border-gray-200 hover:border-[#094985]"
                            }`}
                            role="radio"
                            aria-checked={selectedPreset === preset.id}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{preset.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium">{preset.label}</div>
                                <div
                                  className={`text-sm ${selectedPreset === preset.id ? "text-gray-200" : "text-gray-600"}`}
                                >
                                  {preset.description}
                                </div>
                              </div>
                              {selectedPreset === preset.id && (
                                <div className="text-white">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Display Settings */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                      <h2 className="text-lg font-semibold text-[#094985] mb-4" id="display-settings">
                        Display Settings
                      </h2>
                      <div className="space-y-6" aria-labelledby="display-settings">
                        {/* Dark Mode Toggle */}
                        <div className="flex items-center justify-between">
                          <div>
                            <label htmlFor="dark-mode" className="font-medium text-gray-900">
                              Dark Mode
                            </label>
                            <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                          </div>
                          <button
                            id="dark-mode"
                            onClick={handleDarkModeToggle}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2 ${
                              darkMode ? "bg-[#094985]" : "bg-gray-200"
                            }`}
                            role="switch"
                            aria-checked={darkMode}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                darkMode ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Text Size Slider */}
                        <div>
                          <label htmlFor="text-size" className="font-medium text-gray-900 block mb-2">
                            Text Size: {textSize}%
                          </label>
                          <input
                            id="text-size"
                            type="range"
                            min="100"
                            max="150"
                            step="10"
                            value={textSize}
                            onChange={(e) => handleTextSizeChange(Number.parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2"
                            style={{
                              background: `linear-gradient(to right, #094985 0%, #094985 ${(textSize - 100) * 2}%, #e5e7eb ${(textSize - 100) * 2}%, #e5e7eb 100%)`,
                            }}
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>100%</span>
                            <span>150%</span>
                          </div>
                        </div>

                        {/* Live Preview */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Preview:</p>
                          <p style={{ fontSize: `${textSize}%` }} className="text-gray-900">
                            This is how your text will appear with the current settings.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reading & Navigation */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                      <h2 className="text-lg font-semibold text-[#094985] mb-4" id="reading-navigation">
                        Reading & Navigation
                      </h2>
                      <div className="space-y-6" aria-labelledby="reading-navigation">
                        {/* TTS Toggle */}
                        <div className="flex items-center justify-between">
                          <div>
                            <label htmlFor="tts-enabled" className="font-medium text-gray-900">
                              Text-to-Speech (TTS)
                            </label>
                            <p className="text-sm text-gray-600">Enable audio reading of content</p>
                          </div>
                          <button
                            id="tts-enabled"
                            onClick={handleTtsToggle}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2 ${
                              ttsEnabled ? "bg-[#094985]" : "bg-gray-200"
                            }`}
                            role="switch"
                            aria-checked={ttsEnabled}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                ttsEnabled ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Voice Commands Toggle */}
                        <div className="flex items-center justify-between">
                          <div>
                            <label htmlFor="voice-nav" className="font-medium text-gray-900">
                              Voice Commands
                            </label>
                            <p className="text-sm text-gray-600">Navigate using voice commands</p>
                          </div>
                          <button
                            id="voice-nav"
                            onClick={handleVoiceNavToggle}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2 ${
                              voiceNavEnabled ? "bg-[#094985]" : "bg-gray-200"
                            }`}
                            role="switch"
                            aria-checked={voiceNavEnabled}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                voiceNavEnabled ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Voice Commands Info */}
                        {voiceNavEnabled && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-[#094985] font-medium mb-1">Supported Commands:</p>
                            <p className="text-sm text-gray-600">
                              "Next lesson" / "Siguiente lección", "Go back" / "Regresar", "Read this" / "Lee esto"
                            </p>
                          </div>
                        )}

                        {/* Hide Extras Toggle */}
                        <div className="flex items-center justify-between">
                          <div>
                            <label htmlFor="hide-extras" className="font-medium text-gray-900">
                              Hide non-essential UI
                            </label>
                            <p className="text-sm text-gray-600">Reduce visual clutter for focus</p>
                          </div>
                          <button
                            id="hide-extras"
                            onClick={handleHideExtrasToggle}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2 ${
                              hideExtras ? "bg-[#094985]" : "bg-gray-200"
                            }`}
                            role="switch"
                            aria-checked={hideExtras}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                hideExtras ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status & Reset */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                      <h2 className="text-lg font-semibold text-[#094985] mb-4" id="status-reset">
                        Status & Reset
                      </h2>
                      <div className="space-y-4" aria-labelledby="status-reset">
                        {/* Current Status */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-medium text-gray-900 mb-2">Current Settings</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              Profile:{" "}
                              <span className="font-medium text-[#094985]">
                                {accessibilityPresets.find((p) => p.id === selectedPreset)?.label}
                              </span>
                            </p>
                            <p>
                              Theme: <span className="font-medium">{darkMode ? "Dark" : "Light"}</span>
                            </p>
                            <p>
                              Text Size: <span className="font-medium">{textSize}%</span>
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {ttsEnabled && (
                                <span className="px-2 py-1 bg-[#094985] text-white text-xs rounded">TTS</span>
                              )}
                              {voiceNavEnabled && (
                                <span className="px-2 py-1 bg-[#094985] text-white text-xs rounded">Voice Nav</span>
                              )}
                              {hideExtras && (
                                <span className="px-2 py-1 bg-[#094985] text-white text-xs rounded">Minimal UI</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {resetConfirmation && (
                          <div
                            className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg"
                            aria-live="polite"
                          >
                            {resetConfirmation}
                          </div>
                        )}

                        {/* Reset Button */}
                        <button
                          onClick={handleResetSettings}
                          className="w-full px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors focus:outline-none focus:ring-3 focus:ring-[#F1C47B] focus:ring-offset-2"
                        >
                          Reset to Defaults
                        </button>
                        <p className="text-xs text-gray-500">
                          This will reset all accessibility and display settings to defaults without leaving this
                          screen.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live Announcements */}
                  <div aria-live="polite" aria-atomic="true" className="sr-only">
                    {/* Screen reader announcements will be inserted here */}
                  </div>
                </div>
              )}

              {/* Other navigation content placeholders */}
              {activeNav !== "home" &&
                activeNav !== "modules" &&
                activeNav !== "games" &&
                activeNav !== "settings" &&
                activeNav !== "achievements" && (
                  <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                    <h2 className="text-xl font-semibold text-[#094985] mb-4">
                      {navigationItems.find((item) => item.id === activeNav)?.label}
                    </h2>
                    <p className="text-gray-600 mb-4">This section is coming soon!</p>
                    <Button
                      onClick={() => setActiveNav("home")}
                      variant="outline"
                      className="border-[#094985] text-[#094985] hover:bg-[#094985] hover:text-white"
                    >
                      Back to Home
                    </Button>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
