"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Copy,
  Download,
  CheckCircle,
  Clock,
  QrCode,
  X,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react"

interface WalletSimulatorProps {
  isOpen: boolean
  onClose: () => void
}

const CRYPTO_WORDS = [
  "abandon",
  "ability",
  "able",
  "about",
  "above",
  "absent",
  "absorb",
  "abstract",
  "absurd",
  "abuse",
  "access",
  "accident",
  "account",
  "accuse",
  "achieve",
  "acid",
  "acoustic",
  "acquire",
  "across",
  "act",
  "action",
  "actor",
  "actress",
  "actual",
  "adapt",
  "add",
  "addict",
  "address",
  "adjust",
  "admit",
  "adult",
  "advance",
  "advice",
  "aerobic",
  "affair",
  "afford",
  "afraid",
  "again",
  "agent",
  "agree",
  "ahead",
  "aim",
  "air",
  "airport",
  "aisle",
  "alarm",
  "album",
  "alcohol",
  "alert",
  "alien",
  "crystal",
  "decline",
  "energy",
  "frozen",
  "guitar",
  "hollow",
  "impact",
  "jungle",
  "kitchen",
  "ladder",
  "market",
  "nature",
  "ocean",
  "palace",
  "quality",
  "rescue",
  "shadow",
  "temple",
  "unique",
  "village",
]

const Tooltip = ({ id, children, content }: { id: string; children: React.ReactNode; content: string }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setActiveTooltip(id)}
        onMouseLeave={() => setActiveTooltip(null)}
        onClick={() => setActiveTooltip(activeTooltip === id ? null : id)}
        className="inline-flex items-center space-x-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded-full transition-colors"
      >
        <span>💡</span>
        <span>Learn</span>
      </button>
      {activeTooltip === id && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-700 z-50 animate-in slide-in-from-bottom-2">
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
          {content}
        </div>
      )}
      {children}
    </div>
  )
}

export function WalletSimulator({ isOpen, onClose }: WalletSimulatorProps) {
  const [currentStep, setCurrentStep] = useState<
    "generate" | "validate" | "wallet" | "receive" | "send" | "activity" | "complete"
  >("generate")
  const [walletAddress, setWalletAddress] = useState("")
  const [seedPhrase, setSeedPhrase] = useState<string[]>([])
  const [balance, setBalance] = useState(100)
  const [validationWord, setValidationWord] = useState("")
  const [validationPosition, setValidationPosition] = useState(0)
  const [validationOptions, setValidationOptions] = useState<string[]>([])
  const [sendAmount, setSendAmount] = useState("")
  const [sendAddress, setSendAddress] = useState("")
  const [transactions, setTransactions] = useState<
    Array<{
      type: "receive" | "send"
      amount: number
      hash: string
      fullHash?: string
      timestamp: string
      status: "pending" | "confirmed"
      recipient?: string
      sender?: string
      gasFee?: number
      blockNumber?: number
      network?: string
    }>
  >([])
  const [showReceiveSuccess, setShowReceiveSuccess] = useState(false)
  const [securityChecklist, setSecurityChecklist] = useState({
    publicAddress: false,
    seedPhrase: false,
    sendReceive: false,
    transactions: false,
    errors: false,
  })
  const [sampleAddress] = useState("0x742d35Cc6634C0532925a3b8D4017f2E2E7d0D2D")
  const [addressValid, setAddressValid] = useState(false)
  const [showSendSuccess, setShowSendSuccess] = useState(false)
  const [sendStep, setSendStep] = useState<"form" | "confirm">("form")
  const [receiveStep, setReceiveStep] = useState<"display" | "incoming" | "confirmed">("display")
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [incomingTxHash, setIncomingTxHash] = useState("")
  const [activityFilter, setActivityFilter] = useState<"all" | "sent" | "received">("all")
  const [activitySearch, setActivitySearch] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [showSeedCopySuccess, setShowSeedCopySuccess] = useState(false)
  const [showSeedCopyError, setShowSeedCopyError] = useState(false)
  const [seedCopyButtonClicked, setSeedCopyButtonClicked] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [wizardStep, setWizardStep] = useState<"completion" | "download" | "connect" | "network" | "success">(
    "completion",
  )
  const [showHeaderModal, setShowHeaderModal] = useState(false)
  const [showNetworkSelector, setShowNetworkSelector] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum Mainnet")
  const [selectedToken, setSelectedToken] = useState<number | null>(null)

  const networks = [
    { name: "Ethereum Mainnet", symbol: "E", color: "bg-[#094985]" },
    { name: "Polygon", symbol: "P", color: "bg-purple-600" },
    { name: "Base", symbol: "B", color: "bg-blue-600" },
    { name: "Arbitrum One", symbol: "A", color: "bg-blue-500" },
    { name: "Optimism", symbol: "O", color: "bg-red-500" },
  ]

  const tokens = [
    {
      name: "WAVE Token",
      symbol: "WAVE",
      amount: `${balance} WAVE`,
      usdValue: "Practice tokens",
      color: "bg-[#F1C47B]",
    },
    { name: "Ethereum", symbol: "ETH", amount: "0.05 ETH", usdValue: "(~$125)", color: "bg-[#094985]" },
    { name: "USD Coin", symbol: "USDC", amount: "50 USDC", usdValue: "(~$50)", color: "bg-blue-500" },
    { name: "Chainlink", symbol: "LINK", amount: "12.5 LINK", usdValue: "(~$150)", color: "bg-blue-600" },
    { name: "Uniswap", symbol: "UNI", amount: "8.2 UNI", usdValue: "(~$65)", color: "bg-pink-500" },
  ]

  const hasCompletedTransaction = transactions.length > 0

  const handleConnectMetaMask = () => {
    setWizardStep("download")
  }

  const handleWizardNext = () => {
    if (wizardStep === "download") setWizardStep("connect")
    else if (wizardStep === "connect") setWizardStep("network")
    else if (wizardStep === "network") setWizardStep("success")
  }

  const handleWizardClose = () => {
    setShowCompletionModal(false)
    setWizardStep("completion")
  }

  useEffect(() => {
    if (isOpen && currentStep === "generate") {
      generateWallet()
    }
  }, [isOpen])

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showTooltip])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTooltip && !(event.target as Element).closest(".tooltip-container")) {
        setShowTooltip(null)
      }
    }

    if (showTooltip) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [showTooltip])

  const generateWallet = () => {
    // Generate fake wallet address
    const address = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    setWalletAddress(address)

    const phrase = [
      "absurd",
      "acoustic",
      "ahead",
      "crystal",
      "decline",
      "energy",
      "frozen",
      "guitar",
      "hollow",
      "impact",
      "jungle",
      "kitchen",
    ]
    setSeedPhrase(phrase)

    // Set up validation
    const position = Math.floor(Math.random() * 12)
    setValidationPosition(position)
    setValidationWord(phrase[position])

    // Create validation options (correct word + 2 decoys)
    const decoys = CRYPTO_WORDS.filter((word) => word !== phrase[position]).slice(0, 2)
    const options = [phrase[position], ...decoys].sort(() => Math.random() - 0.5)
    setValidationOptions(options)
  }

  const handleValidation = (selectedWord: string) => {
    if (selectedWord === validationWord) {
      setCurrentStep("wallet")
      setSecurityChecklist((prev) => ({ ...prev, publicAddress: true, seedPhrase: true }))
    }
  }

  const simulateReceive = () => {
    setCurrentStep("receive")
    setReceiveStep("display")

    setTimeout(() => {
      setReceiveStep("incoming")
      const txHash = "0x" + Math.random().toString(16).substr(2, 8) + "..." + Math.random().toString(16).substr(2, 4)
      setIncomingTxHash(txHash)

      setTimeout(() => {
        setBalance((prev) => prev + 10)
        const newTransaction = {
          type: "receive" as const,
          amount: 10,
          hash: txHash,
          timestamp: new Date().toLocaleTimeString(),
          status: "pending" as const,
        }
        setTransactions((prev) => [newTransaction, ...prev])
        setReceiveStep("confirmed")

        // Simulate confirmation after 2 seconds
        setTimeout(() => {
          setTransactions((prev) => prev.map((tx) => (tx.hash === txHash ? { ...tx, status: "confirmed" } : tx)))
          setSecurityChecklist((prev) => ({ ...prev, sendReceive: true, transactions: true }))
        }, 2000)
      }, 2000)
    }, 60000) // Changed from 3000ms to 60000ms (60 seconds)
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      setShowCopySuccess(true)
      setTimeout(() => setShowCopySuccess(false), 2000)
    } catch (err) {
      console.log("Copy failed")
    }
  }

  const validateAddress = (address: string) => {
    const isValid = address.startsWith("0x") && address.length === 42
    setAddressValid(isValid)
    return isValid
  }

  const copySampleAddress = () => {
    setSendAddress(sampleAddress)
    validateAddress(sampleAddress)
  }

  const setMaxAmount = () => {
    const maxSendable = balance - 2 // Subtract gas fee
    setSendAmount(maxSendable.toString())
  }

  const handleSendConfirm = () => {
    const amount = Number.parseFloat(sendAmount)
    const gasFee = 2

    setBalance((prev) => prev - amount - gasFee)
    const newTransaction = {
      type: "send" as const,
      amount: amount,
      hash: "0x" + Math.random().toString(16).substr(2, 8) + "..." + Math.random().toString(16).substr(2, 4),
      fullHash: "0x" + Math.random().toString(16).substr(2, 64),
      timestamp: new Date().toLocaleTimeString(),
      status: "pending" as const,
      recipient: sendAddress,
      sender: walletAddress,
      gasFee: gasFee,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      network: "Ethereum Mainnet",
    }
    setTransactions((prev) => [newTransaction, ...prev])

    setShowSendSuccess(true)
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.hash === newTransaction.hash ? { ...tx, status: "confirmed" } : tx)),
      )
      setShowSendSuccess(false)
      setSendStep("form")
      setCurrentStep("wallet")
    }, 3000)

    setSendAmount("")
    setSendAddress("")
    setAddressValid(false)
    setSecurityChecklist((prev) => ({ ...prev, sendReceive: true, transactions: true }))
  }

  const truncateAddress = (address: string, isMobile = false) => {
    if (address.length <= 12) return address
    if (isMobile) {
      return `${address.slice(0, 4)}...${address.slice(-4)}`
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const truncateHash = (hash: string, isMobile = false) => {
    if (hash.length <= 12) return hash
    if (isMobile) {
      return `${hash.slice(0, 6)}...${hash.slice(-4)}`
    }
    return `${hash.slice(0, 8)}...${hash.slice(-4)}`
  }

  const copySeedPhrase = async () => {
    setSeedCopyButtonClicked(true)
    setTimeout(() => setSeedCopyButtonClicked(false), 200)

    try {
      const seedPhraseText = seedPhrase.join(" ")
      await navigator.clipboard.writeText(seedPhraseText)
      setShowSeedCopySuccess(true)
      setTimeout(() => setShowSeedCopySuccess(false), 3000)

      // Screen reader announcement
      const announcement = document.createElement("div")
      announcement.setAttribute("aria-live", "polite")
      announcement.setAttribute("aria-atomic", "true")
      announcement.className = "sr-only"
      announcement.textContent = "Seed phrase copied to clipboard"
      document.body.appendChild(announcement)
      setTimeout(() => document.body.removeChild(announcement), 1000)
    } catch (err) {
      setShowSeedCopyError(true)
      setTimeout(() => setShowSeedCopyError(false), 5000)

      // Fallback: select all seed phrase words
      const seedElements = document.querySelectorAll("[data-seed-word]")
      if (seedElements.length > 0) {
        const range = document.createRange()
        const selection = window.getSelection()
        range.selectNodeContents(seedElements[0].parentElement!)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      <header className="flex-shrink-0 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <button onClick={onClose} className="flex items-center space-x-2">
            <div className="w-32 h-auto">
              <img src="/wave_white_trans.png" alt="W.A.V.E Logo" />
            </div>
            <span className="text-xl font-bold text-foreground">W.A.V.E</span>
          </button>

          <button
            onClick={() => setShowHeaderModal(true)}
            className="bg-[#FFD700] hover:bg-[#E6C200] text-[#094985] px-4 py-2 rounded-lg font-semibold text-sm md:text-base transition-colors"
          >
            <span className="hidden sm:inline">Ready for Real Wallet?</span>
            <span className="sm:hidden">Ready?</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-md min-h-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">WAVE Wallet Simulator</h1>
            <p className="text-muted-foreground">Practice with fake funds - completely safe!</p>
          </div>

          {currentStep === "generate" && (
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-center">Your Practice Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Wallet Address</label>
                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-mono flex-1">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                    <Button size="sm" variant="outline" onClick={copyAddress}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {showCopySuccess && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                      Copied!
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Seed Phrase</label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {seedPhrase.map((word, index) => (
                      <div
                        key={index}
                        className="p-3 bg-muted rounded-lg text-center text-sm h-16 flex flex-col justify-center"
                        data-seed-word
                      >
                        <span className="text-xs text-muted-foreground mb-1">{index + 1}</span>
                        <div className="font-mono font-medium">{word}</div>
                      </div>
                    ))}
                  </div>

                  <div className="relative">
                    <Button
                      variant="outline"
                      className={`w-full bg-transparent transition-colors duration-200 ${
                        seedCopyButtonClicked ? "bg-green-100 border-green-300" : ""
                      }`}
                      onClick={copySeedPhrase}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          copySeedPhrase()
                        }
                      }}
                      aria-label="Copy seed phrase to clipboard"
                    >
                      {showSeedCopySuccess ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Seed Phrase
                        </>
                      )}
                    </Button>

                    {showSeedCopySuccess && (
                      <div className="mt-2 text-center text-sm text-green-600 font-medium">✅ Seed phrase copied!</div>
                    )}

                    {showSeedCopyError && (
                      <div className="mt-2 text-center text-sm text-red-600">
                        ❌ Copy failed - please select and copy manually
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    🔒 Never share your seed phrase. It's like the key to your house.
                  </p>
                </div>

                <Button onClick={() => setCurrentStep("validate")} className="w-full">
                  I've Saved My Seed Phrase
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === "validate" && (
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-center">Verify Your Seed Phrase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-center text-muted-foreground">
                  Select word #{validationPosition + 1} from your seed phrase
                </p>

                <div className="space-y-3">
                  {validationOptions.map((word, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => handleValidation(word)}
                    >
                      {word}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "wallet" && (
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-center">Your Practice Wallet</CardTitle>
                <p className="text-center text-muted-foreground text-sm">
                  Address: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{balance} $WAVE</div>
                  <p className="text-muted-foreground text-sm">Practice tokens (not real money)</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => setCurrentStep("receive")}
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <ArrowDownLeft className="h-5 w-5 mb-1" />
                    <span className="text-xs">Receive</span>
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("send")}
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <ArrowUpRight className="h-5 w-5 mb-1" />
                    <span className="text-xs">Send</span>
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("activity")}
                    variant="outline"
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <Clock className="h-5 w-5 mb-1" />
                    <span className="text-xs">Activity</span>
                  </Button>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  {/* Network Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Network</label>
                    <div className="relative">
                      <Button
                        onClick={() => setShowNetworkSelector(!showNetworkSelector)}
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#094985] flex items-center justify-center">
                            <span className="text-white text-xs font-bold">E</span>
                          </div>
                          <span>{selectedNetwork}</span>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>

                      {showNetworkSelector && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
                          {networks.map((network) => (
                            <button
                              key={network.name}
                              onClick={() => {
                                setSelectedNetwork(network.name)
                                setShowNetworkSelector(false)
                              }}
                              className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                            >
                              <div className={`w-5 h-5 rounded-full ${network.color} flex items-center justify-center`}>
                                <span className="text-white text-xs font-bold">{network.symbol}</span>
                              </div>
                              <span className="text-sm">{network.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Token List */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Assets</label>
                    <div className="space-y-1">
                      {tokens.map((token, index) => (
                        <button
                          key={token.symbol}
                          onClick={() => setSelectedToken(selectedToken === index ? null : index)}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${token.color} flex items-center justify-center`}>
                              <span className="text-white text-sm font-bold">{token.symbol}</span>
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">{token.name}</div>
                              <div className="text-xs text-muted-foreground">{token.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">{token.amount}</div>
                            <div className="text-xs text-muted-foreground">{token.usdValue}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {hasCompletedTransaction && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => setShowCompletionModal(true)}
                      className="w-full bg-[#F1C47B] hover:bg-[#E6B366] text-[#094985] font-semibold py-3 rounded-lg text-lg"
                    >
                      I'm Ready for Real Wallet! 🎉
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === "receive" && (
            <Card className="p-6">
              <CardHeader>
                <div className="flex items-center justify-center space-x-2">
                  <CardTitle className="text-center">Receive</CardTitle>
                  <Tooltip
                    id="receive-header-tooltip"
                    content="This is your public address - it's safe to share with anyone who wants to send you tokens"
                  >
                    <div></div>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {receiveStep === "display" && (
                  <>
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <h3 className="font-medium">QR Code</h3>
                        <Tooltip
                          id="qr-tooltip"
                          content="QR codes make it easy to share your address without typing errors"
                        >
                          <div></div>
                        </Tooltip>
                      </div>
                      <div className="w-48 h-48 bg-muted rounded-lg mx-auto flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                        <div className="text-center space-y-2">
                          <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                          <p className="text-xs text-muted-foreground">QR Code with Address</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Scan with any wallet app</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <h3 className="font-medium">Your Address</h3>
                        <Tooltip
                          id="address-share-tooltip"
                          content="Your public address is like your email - safe to share, but never share your seed phrase"
                        >
                          <div></div>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <div className="p-4 bg-muted rounded-lg border">
                          <div className="flex items-center justify-between space-x-2">
                            <span className="font-mono text-sm break-all flex-1">{walletAddress}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={copyAddress}
                              className="flex-shrink-0 bg-transparent"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {showCopySuccess && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            Copied!
                          </div>
                        )}
                      </div>
                      <p className="text-center text-sm text-muted-foreground">
                        Share this address to receive $WAVE tokens
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        📍 Practice Mode - Auto-simulation will start in 60 seconds
                      </p>
                      <p className="text-xs text-blue-700">
                        In real wallets, you'd share your address and wait for someone to send tokens
                      </p>
                    </div>
                  </>
                )}

                {receiveStep === "incoming" && (
                  <>
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center animate-pulse">
                        <Download className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <h3 className="font-medium">Incoming transaction detected...</h3>
                          <Tooltip
                            id="incoming-tooltip"
                            content="Real transactions can take a few minutes to confirm on the blockchain"
                          >
                            <div></div>
                          </Tooltip>
                        </div>
                        <p className="text-sm text-muted-foreground">Processing your transaction</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm font-medium text-yellow-800">Transaction Pending</p>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">Waiting for network confirmation...</p>
                    </div>
                  </>
                )}

                {receiveStep === "confirmed" && (
                  <>
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-green-800">You received 10 $WAVE for practice!</h3>
                        <div className="text-2xl font-bold text-primary">
                          {balance - 10} → {balance} $WAVE
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Transaction Hash:</span>
                        <Tooltip
                          id="tx-hash-tooltip"
                          content="This unique code proves your transaction exists on the blockchain forever"
                        >
                          <div></div>
                        </Tooltip>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-green-700">{incomingTxHash}</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700">Status:</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-green-800 font-medium">Confirmed ✓</span>
                          </div>
                          <Tooltip
                            id="status-tooltip"
                            content="Pending means the network is processing. Confirmed means it's permanent"
                          >
                            <div></div>
                          </Tooltip>
                        </div>
                      </div>
                      <p className="text-xs text-green-700">2 minutes ago</p>
                    </div>
                  </>
                )}

                <Button onClick={() => setCurrentStep("wallet")} variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Wallet
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === "send" && (
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-center">
                  {sendStep === "form" ? "Send $WAVE" : "Review Transaction"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {sendStep === "form" ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-3">
                        📍 Practice Address - Use this for safe testing:
                      </p>
                      <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border">
                        <span className="text-sm font-mono flex-1 text-blue-800 overflow-hidden">
                          {truncateAddress(sampleAddress)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={copySampleAddress}
                          className="flex-shrink-0 bg-transparent"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        This address is safe for practice - no real funds will be sent
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Recipient Address</label>
                        <Tooltip
                          id="address-tooltip"
                          content="This is like a house address. It must be exact or tokens will be lost forever. Always double-check before sending!"
                        >
                          <div></div>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <Input
                          placeholder="Enter wallet address (0x...)"
                          value={sendAddress}
                          onChange={(e) => {
                            setSendAddress(e.target.value)
                            validateAddress(e.target.value)
                          }}
                          className={`pr-10 ${
                            sendAddress
                              ? addressValid
                                ? "border-green-500 focus:border-green-500"
                                : "border-red-500 focus:border-red-500"
                              : ""
                          }`}
                        />
                        {sendAddress && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {addressValid ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                                <span className="text-white text-xs">!</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {sendAddress && !addressValid && (
                        <p className="text-xs text-red-600 mt-1">
                          Invalid address format. Must start with 0x and be 42 characters long.
                        </p>
                      )}
                      <div className="flex justify-between mt-2">
                        <Button size="sm" variant="ghost" onClick={copySampleAddress} className="text-xs h-auto p-1">
                          Use Practice Address
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Amount</label>
                        <Tooltip
                          id="amount-tooltip"
                          content="You can send some or all tokens. Always keep some for gas fees to make future transactions."
                        >
                          <div></div>
                        </Tooltip>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">Balance: {balance} $WAVE</div>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="0.0"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          className={`flex-1 ${
                            sendAmount && Number.parseFloat(sendAmount) + 2 > balance
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }`}
                        />
                        <Button size="sm" variant="outline" onClick={setMaxAmount} className="px-4 bg-transparent">
                          Max
                        </Button>
                      </div>
                      {sendAmount && Number.parseFloat(sendAmount) + 2 > balance && (
                        <p className="text-xs text-red-600 mt-1">
                          Insufficient funds! You need {Number.parseFloat(sendAmount) + 2} $WAVE but only have {balance}{" "}
                          $WAVE
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Network Fee</label>
                        <Tooltip
                          id="gas-tooltip"
                          content="Blockchain networks charge a small fee to process transactions. This pays the network validators who secure your transaction."
                        >
                          <div></div>
                        </Tooltip>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex justify-between text-sm">
                          <span>Network Fee:</span>
                          <span className="font-medium">~2 $WAVE</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Fees vary by network congestion</p>
                      </div>
                    </div>

                    {sendAmount && addressValid && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Transaction Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Send Amount:</span>
                            <span>{sendAmount} $WAVE</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Network Fee:</span>
                            <span>2 $WAVE</span>
                          </div>
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>Total Cost:</span>
                            <span>{Number.parseFloat(sendAmount) + 2} $WAVE</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Remaining Balance:</span>
                            <span>{Math.max(0, balance - Number.parseFloat(sendAmount) - 2)} $WAVE</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Double-check the recipient address. Blockchain transactions cannot be undone!
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <Button onClick={() => setCurrentStep("wallet")} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                      <Button
                        onClick={() => setSendStep("confirm")}
                        className="flex-1"
                        disabled={
                          !addressValid ||
                          !sendAmount ||
                          Number.parseFloat(sendAmount) <= 0 ||
                          Number.parseFloat(sendAmount) + 2 > balance
                        }
                      >
                        Review Transaction
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Review Transaction</h3>
                        <Tooltip
                          id="review-tooltip"
                          content="Check everything carefully - blockchain transactions cannot be undone once confirmed."
                        >
                          <div></div>
                        </Tooltip>
                      </div>

                      <div className="bg-muted rounded-lg p-4 space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Sending to:</p>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm">{truncateAddress(sendAddress)}</span>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="border-t pt-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Send Amount:</span>
                              <span className="font-medium">{sendAmount} $WAVE</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Network Fee:</span>
                              <span className="font-medium">2 $WAVE</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold">
                              <span>Total Cost:</span>
                              <span>{Number.parseFloat(sendAmount) + 2} $WAVE</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 font-medium mb-2">⚠️ Final Warning</p>
                        <p className="text-sm text-red-700">
                          This transaction cannot be reversed. Make sure the recipient address is correct.
                        </p>
                      </div>

                      {showSendSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-medium text-green-800">Transaction sent successfully!</p>
                          </div>
                          <p className="text-xs text-green-700 mt-1">
                            Your transaction is being processed and will appear in Activity
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <Button onClick={() => setSendStep("form")} variant="outline" className="flex-1">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Edit
                        </Button>
                        <Button onClick={handleSendConfirm} className="flex-1" disabled={showSendSuccess}>
                          {showSendSuccess ? "Processing..." : "Confirm Send"}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity Section */}
          {currentStep === "activity" && (
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle>Transaction History</CardTitle>
                    <div className="relative tooltip-container">
                      <button
                        className="inline-flex items-center space-x-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded-full transition-colors"
                        onMouseEnter={() => setShowTooltip("activity-header")}
                        onMouseLeave={() => setShowTooltip(null)}
                        onClick={() => setShowTooltip(showTooltip === "activity-header" ? null : "activity-header")}
                      >
                        <span>💡</span>
                        <span>Learn</span>
                      </button>
                      {showTooltip === "activity-header" && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm text-gray-700 z-50 animate-in slide-in-from-bottom-2">
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                          All your wallet transactions are recorded here permanently
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex space-x-2 mt-4">
                  {(["all", "sent", "received"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActivityFilter(filter)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        activityFilter === filter
                          ? "bg-[#094985] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                  <div className="relative tooltip-container">
                    <button
                      className="inline-flex items-center space-x-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded-full transition-colors"
                      onMouseEnter={() => setShowTooltip("filter")}
                      onMouseLeave={() => setShowTooltip(null)}
                      onClick={() => setShowTooltip(showTooltip === "filter" ? null : "filter")}
                    >
                      <span>💡</span>
                      <span>Learn</span>
                    </button>
                    {showTooltip === "filter" && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm text-gray-700 z-50 animate-in slide-in-from-bottom-2">
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                        Filter to see only certain types of transactions
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search by hash or amount"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#094985] focus:border-transparent"
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {(() => {
                  const filteredTransactions = transactions.filter((tx) => {
                    const matchesFilter =
                      activityFilter === "all" ||
                      (activityFilter === "sent" && tx.type === "send") ||
                      (activityFilter === "received" && tx.type === "receive")
                    const matchesSearch =
                      activitySearch === "" ||
                      tx.hash.toLowerCase().includes(activitySearch.toLowerCase()) ||
                      tx.amount.toString().includes(activitySearch)
                    return matchesFilter && matchesSearch
                  })

                  if (filteredTransactions.length === 0 && transactions.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-2">No transactions yet</p>
                        <div className="relative tooltip-container inline-block">
                          <button
                            className="inline-flex items-center space-x-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded-full transition-colors"
                            onMouseEnter={() => setShowTooltip("empty-state")}
                            onMouseLeave={() => setShowTooltip(null)}
                            onClick={() => setShowTooltip(showTooltip === "empty-state" ? null : "empty-state")}
                          >
                            <span>💡</span>
                            <span>Learn</span>
                          </button>
                          {showTooltip === "empty-state" && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm text-gray-700 z-50 animate-in slide-in-from-bottom-2">
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                              Your sends and receives will appear here once you make transactions
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }

                  if (filteredTransactions.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No transactions match your search</p>
                      </div>
                    )
                  }

                  return filteredTransactions.map((tx, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedTransaction(tx)
                        setShowTransactionDetails(true)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`text-2xl ${tx.type === "receive" ? "text-green-600" : "text-blue-600"}`}>
                            {tx.type === "receive" ? "💰" : "📤"}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p
                                className={`font-medium ${tx.type === "receive" ? "text-green-600" : "text-blue-600"}`}
                              >
                                {tx.type === "receive" ? "+" : "-"}
                                {tx.amount} $WAVE
                              </p>
                              <button
                                className="text-xs bg-blue-50 text-blue-600 px-1 py-0.5 rounded hover:bg-blue-100 transition-colors"
                                onMouseEnter={() => setShowTooltip(`tx-type-${index}`)}
                                onMouseLeave={() => setShowTooltip(null)}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowTooltip(showTooltip === `tx-type-${index}` ? null : `tx-type-${index}`)
                                }}
                              >
                                💡 Learn
                              </button>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="relative group">
                                <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                                  {tx.type === "receive" ? "From" : "To"}:{" "}
                                  <span className="font-mono">
                                    {truncateAddress(
                                      tx.type === "receive"
                                        ? tx.sender || "0x742d35Cc6634C0532925a3b8D4017f2E2E7d0D2D"
                                        : tx.recipient || "0x742d35Cc6634C0532925a3b8D4017f2E2E7d0D2D",
                                    )}
                                  </span>
                                </p>
                                {/* Hover tooltip for full address */}
                                <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                                  {tx.type === "receive"
                                    ? tx.sender || "0x742d35Cc6634C0532925a3b8D4017f2E2E7d0D2D"
                                    : tx.recipient || "0x742d35Cc6634C0532925a3b8D4017f2E2E7d0D2D"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="relative group flex-1">
                                <p className="text-xs text-muted-foreground max-w-[180px] truncate">
                                  Hash: <span className="font-mono">{truncateHash(tx.hash)}</span>
                                </p>
                                {/* Hover tooltip for full hash */}
                                <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                                  {tx.fullHash || tx.hash}
                                </div>
                              </div>
                              <button
                                className="text-xs bg-blue-50 text-blue-600 px-1 py-0.5 rounded hover:bg-blue-100 transition-colors flex-shrink-0"
                                onMouseEnter={() => setShowTooltip(`hash-${index}`)}
                                onMouseLeave={() => setShowTooltip(null)}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigator.clipboard.writeText(tx.fullHash || tx.hash)
                                  setShowTooltip(`hash-copied-${index}`)
                                  setTimeout(() => setShowTooltip(null), 2000)
                                }}
                              >
                                💡 Learn
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date().getTime() - new Date(tx.timestamp).getTime() < 60000
                                ? "Just now"
                                : Math.floor((new Date().getTime() - new Date(tx.timestamp).getTime()) / 60000) +
                                  " minutes ago"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-1">
                            <Badge
                              variant={tx.status === "confirmed" ? "default" : "secondary"}
                              className={
                                tx.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {tx.status === "confirmed" ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Confirmed
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </Badge>
                            <button
                              className="text-xs bg-blue-50 text-blue-600 px-1 py-0.5 rounded hover:bg-blue-100 transition-colors"
                              onMouseEnter={() => setShowTooltip(`status-${index}`)}
                              onMouseLeave={() => setShowTooltip(null)}
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowTooltip(showTooltip === `status-${index}` ? null : `status-${index}`)
                              }}
                            >
                              💡 Learn
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Tooltips */}
                      {showTooltip === `tx-type-${index}` && (
                        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 animate-in slide-in-from-bottom-2">
                          {tx.type === "receive"
                            ? "Someone sent tokens to your wallet address"
                            : "You sent tokens to another wallet address"}
                        </div>
                      )}
                      {showTooltip === `hash-${index}` && (
                        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 animate-in slide-in-from-bottom-2">
                          This unique code proves your transaction exists on the blockchain forever
                        </div>
                      )}
                      {showTooltip === `hash-copied-${index}` && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm text-sm text-green-700 animate-in slide-in-from-bottom-2">
                          Hash copied!
                        </div>
                      )}
                      {showTooltip === `status-${index}` && (
                        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 animate-in slide-in-from-bottom-2">
                          {tx.status === "confirmed"
                            ? "This transaction is permanent and cannot be reversed"
                            : "The network is still processing this transaction. It will be confirmed soon"}
                        </div>
                      )}
                    </div>
                  ))
                })()}

                <Button onClick={() => setCurrentStep("wallet")} variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Wallet
                </Button>

                {transactions.length > 0 && Object.values(securityChecklist).every(Boolean) && (
                  <Button onClick={() => setCurrentStep("complete")} className="w-full">
                    Complete Tutorial
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transaction Details Modal */}
          {showTransactionDetails && selectedTransaction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Transaction Details</h3>
                    <button
                      onClick={() => setShowTransactionDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="text-sm">{selectedTransaction.type === "receive" ? "Received" : "Sent"}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Amount</label>
                      <p className="text-sm font-medium">{selectedTransaction.amount} $WAVE</p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-500">Gas Fee</label>
                        <button
                          className="text-xs bg-blue-50 text-blue-600 px-1 py-0.5 rounded hover:bg-blue-100 transition-colors"
                          onMouseEnter={() => setShowTooltip("gas-fee")}
                          onMouseLeave={() => setShowTooltip(null)}
                          onClick={() => setShowTooltip(showTooltip === "gas-fee" ? null : "gas-fee")}
                        >
                          💡 Learn
                        </button>
                      </div>
                      <p className="text-sm">{selectedTransaction.gasFee || 2} $WAVE</p>
                      {showTooltip === "gas-fee" && (
                        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 animate-in slide-in-from-bottom-2">
                          This is the fee paid to the network to process your transaction
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {selectedTransaction.type === "receive" ? "From" : "To"}
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm font-mono break-all flex-1 bg-gray-50 p-2 rounded border max-w-full overflow-hidden">
                          {selectedTransaction.type === "receive"
                            ? selectedTransaction.sender || "0x742d35Cc6634C0532925a3b8D4017f2E2E7d0D2D"
                            : selectedTransaction.recipient || "0x742d35Cc6634C0532925a3b8D4017f2E2E7d0D2D"}
                        </p>
                        <button
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex-shrink-0"
                          onClick={() => {
                            const address =
                              selectedTransaction.type === "receive"
                                ? selectedTransaction.sender || "0x742d35Cc6634C0532925a3b8D4017f2E2E7d0D2D"
                                : selectedTransaction.recipient || "0x742d35Cc6634C0532925a3b8D4017f2E2E7d0D2D"
                            navigator.clipboard.writeText(address)
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Transaction Hash</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm font-mono break-all flex-1 bg-gray-50 p-2 rounded border max-w-full overflow-hidden">
                          {selectedTransaction.fullHash || selectedTransaction.hash}
                        </p>
                        <button
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex-shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedTransaction.fullHash || selectedTransaction.hash)
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-500">Block Number</label>
                        <button
                          className="text-xs bg-blue-50 text-blue-600 px-1 py-0.5 rounded hover:bg-blue-100 transition-colors"
                          onMouseEnter={() => setShowTooltip("block-number")}
                          onMouseLeave={() => setShowTooltip(null)}
                          onClick={() => setShowTooltip(showTooltip === "block-number" ? null : "block-number")}
                        >
                          💡 Learn
                        </button>
                      </div>
                      <p className="text-sm">#{selectedTransaction.blockNumber || "18,234,567"}</p>
                      {showTooltip === "block-number" && (
                        <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 animate-in slide-in-from-bottom-2">
                          Transactions are grouped into blocks on the blockchain
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Network</label>
                      <p className="text-sm">{selectedTransaction.network || "Ethereum Mainnet"}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <Badge
                        variant={selectedTransaction.status === "confirmed" ? "default" : "secondary"}
                        className={
                          selectedTransaction.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {selectedTransaction.status === "confirmed" ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirmed
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === "complete" && (
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-center text-green-600">🎉 Tutorial Complete!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-center text-muted-foreground">
                  Ready! You've practiced without risk. Now you're prepared to use a real wallet.
                </p>

                <div className="space-y-3">
                  <h3 className="font-medium">Security Checklist:</h3>
                  {Object.entries({
                    publicAddress: "I understand what a public address is",
                    seedPhrase: "I understand what a seed phrase is",
                    sendReceive: "I practiced sending and receiving tokens",
                    transactions: "I saw how transactions appear",
                    errors: "I learned what common errors are",
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <CheckCircle
                        className={`h-4 w-4 ${
                          securityChecklist[key as keyof typeof securityChecklist]
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Ready for a real wallet?</h3>
                  <Button className="w-full">Download MetaMask</Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Try Rainbow Wallet
                  </Button>
                </div>

                <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
                  Return to W.A.V.E
                </Button>
              </CardContent>
            </Card>
          )}

          {showHeaderModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
              <div className="bg-white rounded-lg max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1" />
                    <button onClick={() => setShowHeaderModal(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="text-center space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#094985] mb-2">🎉 Ready for Real Web3?</h2>
                      <p className="text-gray-600">
                        You've practiced safely. Connect MetaMask to access our learning platform and earn blockchain
                        certificates.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={() => {
                          setShowHeaderModal(false)
                          setShowCompletionModal(true)
                          setWizardStep("download")
                        }}
                        className="w-full bg-[#094985] hover:bg-[#073a6b] text-white py-3 text-lg"
                      >
                        Connect MetaMask
                      </Button>
                      <Button
                        onClick={() => setShowHeaderModal(false)}
                        variant="outline"
                        className="w-full py-3 bg-transparent"
                      >
                        Keep Practicing
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showCompletionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
              <div className="bg-white rounded-lg max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1" />
                    <button onClick={handleWizardClose} className="text-gray-400 hover:text-gray-600">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {wizardStep === "completion" && (
                    <div className="text-center space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-[#094985] mb-2">🎉 Ready for Real Web3?</h2>
                        <p className="text-gray-600">You've practiced safely. Time to connect a real wallet!</p>
                      </div>

                      <div className="text-left space-y-4">
                        <p className="text-gray-700">
                          You learned wallet basics without risk. Now connect MetaMask to access our learning platform
                          and earn real blockchain certificates.
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Learn with real Web3 tools</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Earn blockchain certificates (SBTs)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Practice on safe testnets</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Join Wave & Aleph community</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Button
                          onClick={handleConnectMetaMask}
                          className="w-full bg-[#094985] hover:bg-[#073a6b] text-white py-3 text-lg"
                        >
                          Connect MetaMask
                        </Button>
                        <Button onClick={handleWizardClose} variant="outline" className="w-full py-3 bg-transparent">
                          Stay in Simulator
                        </Button>
                      </div>
                    </div>
                  )}

                  {wizardStep === "download" && (
                    <div className="text-center space-y-6">
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-sm text-gray-500">Step 1/3</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#094985] mb-2">Download MetaMask</h2>
                        <p className="text-gray-600">First, you'll need to install the MetaMask browser extension</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 mb-3">
                          MetaMask is a secure wallet that lets you interact with Web3 applications
                        </p>
                        <Button
                          onClick={() => window.open("https://metamask.io/download/", "_blank")}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Download MetaMask
                        </Button>
                      </div>
                      <Button onClick={handleWizardNext} className="w-full">
                        I've Installed MetaMask
                      </Button>
                    </div>
                  )}

                  {wizardStep === "connect" && (
                    <div className="text-center space-y-6">
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-sm text-gray-500">Step 2/3</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#094985] mb-2">Connect Your Wallet</h2>
                        <p className="text-gray-600">Now connect MetaMask to W.A.V.E</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 mb-3">
                          Click the button below to connect your MetaMask wallet
                        </p>
                        <Button
                          onClick={handleWizardNext}
                          className="w-full bg-[#094985] hover:bg-[#073a6b] text-white"
                        >
                          Connect Wallet
                        </Button>
                      </div>
                    </div>
                  )}

                  {wizardStep === "network" && (
                    <div className="text-center space-y-6">
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-sm text-gray-500">Step 3/3</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#094985] mb-2">Switch to Base Network</h2>
                        <p className="text-gray-600">Switch to Base testnet for safe learning</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 mb-3">
                          Base testnet uses fake ETH so you can learn without spending real money
                        </p>
                        <Button onClick={handleWizardNext} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                          Switch to Base Testnet
                        </Button>
                      </div>
                    </div>
                  )}

                  {wizardStep === "success" && (
                    <div className="text-center space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 Success!</h2>
                        <p className="text-gray-600">You're now connected and ready to learn!</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-700 mb-3">
                          Welcome to real Web3! You can now access our learning platform and earn certificates.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          handleWizardClose()
                          onClose()
                        }}
                        className="w-full bg-[#094985] hover:bg-[#073a6b] text-white"
                      >
                        Start Learning
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
