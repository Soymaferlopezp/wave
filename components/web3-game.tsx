"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Trophy, Star, Check, ChevronUp, ChevronDown } from "lucide-react"

interface Web3GameProps {
  isOpen: boolean
  onClose: () => void
}

interface GameConcept {
  id: string
  term: string
  definition: string
  explanation: string
  analogy: string
  difficulty: number
}

interface DragItem {
  id: string
  term: string
  isMatched: boolean
}

interface DropZone {
  id: string
  definition: string
  matchedTerm?: string
  isCorrect?: boolean
}

interface DragState {
  isDragging: boolean
  dragY: number
  autoScrollDirection: "up" | "down" | null
}

const gameConcepts: GameConcept[] = [
  {
    id: "wallet",
    term: "Wallet",
    definition: "Software that stores your crypto safely",
    explanation:
      "A digital wallet is like your physical wallet, but for cryptocurrency. It keeps your digital money secure and lets you send or receive payments.",
    analogy: "Your digital safe for storing cryptocurrency securely",
    difficulty: 1,
  },
  {
    id: "token",
    term: "Token",
    definition: "Digital currency on blockchain",
    explanation:
      "Tokens are like digital coins that represent value or utility on a blockchain network. They can be used for payments, voting, or accessing services.",
    analogy: "Digital coins that represent value or utility",
    difficulty: 1,
  },
  {
    id: "blockchain",
    term: "Blockchain",
    definition: "Digital ledger recording all transactions",
    explanation:
      "A blockchain is a special database that records all transactions in a way that makes them permanent and transparent to everyone.",
    analogy: "Like a digital notebook that everyone can read but no one can erase",
    difficulty: 1,
  },
  {
    id: "smart-contract",
    term: "Smart Contract",
    definition: "Code that executes automatically when conditions are met",
    explanation:
      "Smart contracts are like digital agreements that automatically execute when certain conditions are met, without needing a middleman.",
    analogy: "Like a digital vending machine - input triggers automatic output",
    difficulty: 2,
  },
  {
    id: "defi",
    term: "DeFi",
    definition: "Financial services without traditional banks",
    explanation:
      "DeFi stands for Decentralized Finance - it's a way to access banking services like lending and trading without going through traditional banks.",
    analogy: "Banking services that work 24/7 without traditional banks",
    difficulty: 2,
  },
  {
    id: "gas-fee",
    term: "Gas Fee",
    definition: "Fee paid to process transactions",
    explanation:
      "Gas fees are small payments you make to the network to process your transactions. Think of it as paying for the computational energy needed.",
    analogy: "Like a toll fee for using the blockchain highway",
    difficulty: 2,
  },
  {
    id: "nft",
    term: "NFT",
    definition: "Unique digital assets you can own",
    explanation:
      "NFTs (Non-Fungible Tokens) are unique digital items that prove you own something specific, like digital art or collectibles.",
    analogy: "Like a digital certificate proving you own something unique",
    difficulty: 3,
  },
  {
    id: "dapp",
    term: "dApp",
    definition: "Decentralized application built on blockchain",
    explanation:
      "dApps are applications that run on blockchain networks instead of traditional servers, making them more transparent and resistant to censorship.",
    analogy: "Apps that run on blockchain instead of company servers",
    difficulty: 3,
  },
]

function Web3Game({ isOpen, onClose }: Web3GameProps) {
  const [currentRound, setCurrentRound] = useState(1)
  const [score, setScore] = useState(0)
  const [dragItems, setDragItems] = useState<DragItem[]>([])
  const [dropZones, setDropZones] = useState<DropZone[]>([])
  const [showLearningPopup, setShowLearningPopup] = useState(false)
  const [currentLearning, setCurrentLearning] = useState<GameConcept | null>(null)
  const [gameComplete, setGameComplete] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragY: 0,
    autoScrollDirection: null,
  })
  const [allMatches, setAllMatches] = useState<{ [key: string]: boolean }>({})
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize game
  useEffect(() => {
    if (isOpen) {
      resetGame()
      // Check for reduced motion preference
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setReducedMotion(mediaQuery.matches)
    }
  }, [isOpen])

  const setupRound = (round: number) => {
    // Show all 8 concepts from the start for trophy wall effect
    const allConcepts = gameConcepts
    const shuffledTerms = [...allConcepts].sort(() => Math.random() - 0.5)
    const shuffledDefinitions = [...allConcepts].sort(() => Math.random() - 0.5)

    setDragItems(
      shuffledTerms.map((concept) => ({
        id: concept.id,
        term: concept.term,
        isMatched: allMatches[concept.id] || false,
      })),
    )

    setDropZones(
      shuffledDefinitions.map((concept) => ({
        id: concept.id,
        definition: concept.definition,
        matchedTerm: allMatches[concept.id] ? concept.id : undefined,
        isCorrect: allMatches[concept.id] || false,
      })),
    )
  }

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    // Don't allow dragging matched items
    const item = dragItems.find((item) => item.id === itemId)
    if (item?.isMatched) {
      e.preventDefault()
      return
    }

    setDraggedItem(itemId)
    setDragState((prev) => ({ ...prev, isDragging: true }))
    e.dataTransfer.setData("text/plain", itemId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragState({ isDragging: false, dragY: 0, autoScrollDirection: null })
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"

    const rect = gameContainerRef.current?.getBoundingClientRect()
    if (!rect) return

    const y = e.clientY - rect.top
    const scrollZone = 50

    setDragState((prev) => ({ ...prev, dragY: y }))

    // Auto-scroll logic
    if (y < scrollZone) {
      // Near top edge
      if (dragState.autoScrollDirection !== "up") {
        setDragState((prev) => ({ ...prev, autoScrollDirection: "up" }))
        startAutoScroll("up")
      }
    } else if (y > rect.height - scrollZone) {
      // Near bottom edge
      if (dragState.autoScrollDirection !== "down") {
        setDragState((prev) => ({ ...prev, autoScrollDirection: "down" }))
        startAutoScroll("down")
      }
    } else {
      // Not in scroll zone
      if (dragState.autoScrollDirection) {
        setDragState((prev) => ({ ...prev, autoScrollDirection: null }))
        stopAutoScroll()
      }
    }
  }

  const startAutoScroll = (direction: "up" | "down") => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
    }

    autoScrollIntervalRef.current = setInterval(() => {
      if (gameContainerRef.current) {
        const scrollAmount = direction === "up" ? -10 : 10
        gameContainerRef.current.scrollBy({ top: scrollAmount, behavior: "smooth" })
      }
    }, 16) // ~60fps
  }

  const stopAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }
  }

  const handleDrop = (e: React.DragEvent, dropZoneId: string) => {
    e.preventDefault()
    const draggedItemId = e.dataTransfer.getData("text/plain")

    // Clean up drag state
    handleDragEnd()

    // Check if it's a correct match
    const isCorrect = draggedItemId === dropZoneId

    if (isCorrect) {
      // Correct match - update all matches tracking
      const newMatches = { ...allMatches, [draggedItemId]: true }
      setAllMatches(newMatches)

      setScore((prev) => prev + 10)
      setDragItems((prev) => prev.map((item) => (item.id === draggedItemId ? { ...item, isMatched: true } : item)))
      setDropZones((prev) =>
        prev.map((zone) => (zone.id === dropZoneId ? { ...zone, matchedTerm: draggedItemId, isCorrect: true } : zone)),
      )

      // Play success sound
      if (soundEnabled) {
        playSound("success")
      }

      // Check if all matches are complete
      if (Object.keys(newMatches).length === gameConcepts.length) {
        setTimeout(() => {
          setGameComplete(true)
        }, 1500)
      }
    } else {
      // Incorrect match - show learning popup
      const concept = gameConcepts.find((c) => c.id === dropZoneId)
      if (concept) {
        setCurrentLearning(concept)
        setShowLearningPopup(true)
      }
    }
  }

  const playSound = (type: "success" | "error") => {
    // Placeholder for sound effects
    console.log(`Playing ${type} sound`)
  }

  const closeLearningPopup = () => {
    setShowLearningPopup(false)
    setCurrentLearning(null)
  }

  const getProgressPercentage = () => {
    return (Object.keys(allMatches).length / gameConcepts.length) * 100
  }

  // Cleanup auto-scroll on unmount
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
    }
  }, [])

  const resetGame = () => {
    setCurrentRound(1)
    setScore(0)
    setGameComplete(false)
    setShowLearningPopup(false)
    setCurrentLearning(null)
    setAllMatches({})
    setupRound(1)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-[#094985] hover:bg-[#094985]/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-bold text-[#094985]">Web3 Concepts Match</h1>
            <p className="text-xs text-gray-600">Powered by BASE</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-xs text-gray-600">Matches</p>
            <p className="text-sm font-semibold text-[#094985]">{Object.keys(allMatches).length}/8</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Score</p>
            <p className="text-sm font-semibold text-[#F1C47B]">{score}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className="text-[#094985]">
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 h-1.5">
        <div
          className="bg-[#F1C47B] h-1.5 transition-all duration-500"
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Game Content */}
      {!gameComplete ? (
        <div
          ref={gameContainerRef}
          className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50 scroll-smooth relative"
          onDragOver={handleDragOver}
        >
          {dragState.isDragging && (
            <>
              {dragState.autoScrollDirection === "up" && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-20 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Scrolling Up
                </div>
              )}
              {dragState.autoScrollDirection === "down" && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Scrolling Down
                </div>
              )}
            </>
          )}

          <div className="p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                {/* Drag Items */}
                <div className="space-y-3">
                  <div className="sticky top-0 bg-blue-50/80 backdrop-blur-sm p-2 rounded-lg mb-3">
                    <h2 className="text-base lg:text-lg font-semibold text-[#094985]">Drag the Concepts</h2>
                    <div className="w-full bg-gray-200 h-1 rounded-full mt-1">
                      <div
                        className="bg-[#F1C47B] h-1 rounded-full transition-all duration-300"
                        style={{
                          width: `${(dragItems.filter((item) => item.isMatched).length / dragItems.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dragItems.map((item) => (
                      <Card
                        key={item.id}
                        className={`min-h-[44px] transition-all duration-200 ${
                          item.isMatched
                            ? "opacity-70 bg-green-50 border-green-400 cursor-not-allowed"
                            : "cursor-move hover:shadow-lg"
                        } ${
                          draggedItem === item.id ? "opacity-50 scale-95 z-50" : ""
                        } ${reducedMotion ? "" : !item.isMatched ? "hover:scale-105" : ""}`}
                        draggable={!item.isMatched}
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <CardContent className="p-3 relative">
                          {item.isMatched && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-100/80 rounded">
                              <div className="flex items-center space-x-2">
                                <Check className="h-5 w-5 text-green-600" />
                                <span className="text-xs font-semibold text-green-700">MATCHED</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-center min-h-[32px]">
                            <p
                              className={`text-sm lg:text-base font-semibold text-center leading-tight ${
                                item.isMatched ? "text-green-700" : "text-[#094985]"
                              }`}
                            >
                              {item.term}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Drop Zones */}
                <div className="space-y-3">
                  <div className="sticky top-0 bg-blue-50/80 backdrop-blur-sm p-2 rounded-lg mb-3">
                    <h2 className="text-base lg:text-lg font-semibold text-[#094985]">Drop on Matching Definitions</h2>
                    <div className="w-full bg-gray-200 h-1 rounded-full mt-1">
                      <div
                        className="bg-green-400 h-1 rounded-full transition-all duration-300"
                        style={{
                          width: `${(dropZones.filter((zone) => zone.isCorrect).length / dropZones.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dropZones.map((zone) => (
                      <Card
                        key={zone.id}
                        className={`min-h-[44px] border-2 transition-all duration-200 ${
                          zone.isCorrect
                            ? "border-green-400 bg-green-50 opacity-70"
                            : "border-dashed border-gray-300 hover:border-[#F1C47B] hover:bg-[#F1C47B]/5"
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, zone.id)}
                      >
                        <CardContent className="p-3 relative">
                          {zone.isCorrect && (
                            <div className="absolute top-1 right-1">
                              <Check className="h-5 w-5 text-green-600" />
                            </div>
                          )}
                          <div className="flex items-center justify-center min-h-[32px]">
                            {zone.matchedTerm ? (
                              <div className="text-center">
                                <p className="text-sm lg:text-base font-semibold text-green-700 mb-1 leading-tight">
                                  {dragItems.find((item) => item.id === zone.matchedTerm)?.term}
                                </p>
                                <p className="text-xs lg:text-sm text-gray-600 leading-tight">{zone.definition}</p>
                              </div>
                            ) : (
                              <p className="text-xs lg:text-sm text-gray-700 text-center leading-tight">
                                {zone.definition}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Game Complete Screen
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 overflow-y-auto">
          <Card className="max-w-md mx-auto m-4">
            <CardContent className="p-6 lg:p-8 text-center">
              <Trophy className="h-12 lg:h-16 w-12 lg:w-16 text-[#F1C47B] mx-auto mb-4" />
              <h2 className="text-xl lg:text-2xl font-bold text-[#094985] mb-2">Congratulations!</h2>
              <p className="text-gray-600 mb-4">You've mastered all Web3 concepts!</p>
              <div className="bg-[#F1C47B]/10 p-4 rounded-lg mb-6">
                <p className="text-lg font-semibold text-[#094985]">Final Score: {score}/80</p>
                <div className="flex items-center justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 lg:h-6 lg:w-6 ${i < Math.floor(score / 16) ? "text-[#F1C47B] fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Button onClick={resetGame} className="w-full bg-[#094985] text-white hover:bg-[#094985]/90">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Play Again
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full border-[#094985] text-[#094985] hover:bg-[#094985] hover:text-white bg-transparent"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showLearningPopup && currentLearning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4 overflow-y-auto">
          <Card className="max-w-md mx-auto my-8">
            <CardContent className="p-4 lg:p-6">
              <div className="text-center mb-4">
                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-[#F1C47B]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl lg:text-2xl">💡</span>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-[#094985] mb-2">Let's Learn Together!</h3>
                <p className="text-sm lg:text-base text-gray-600">Great question! Here's how it works...</p>
              </div>

              <div className="bg-[#094985]/5 p-3 lg:p-4 rounded-lg mb-4">
                <p className="font-semibold text-[#094985] mb-2 text-sm lg:text-base">
                  {currentLearning.term}: {currentLearning.definition}
                </p>
                <p className="text-gray-700 text-xs lg:text-sm mb-2 leading-relaxed">{currentLearning.explanation}</p>
                <p className="text-[#094985] text-xs lg:text-sm italic">💭 {currentLearning.analogy}</p>
              </div>

              <Button onClick={closeLearningPopup} className="w-full bg-[#F1C47B] text-[#094985] hover:bg-[#F1C47B]/90">
                Got it! 🎯
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Web3Game
