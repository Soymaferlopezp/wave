"use client"

import { useAccessibility } from "@/contexts/accessibility-context"
import { useState, useEffect, useRef, useCallback } from "react"

interface TTSQueueItem {
  text: string
  element?: Element
  type: "heading" | "paragraph" | "list" | "other"
}

export default function VisualTTSToolbar() {
  const { activeProfile, visualSettings, updateVisualSettings, startTTS, pauseTTS, stopTTS, isTTSPlaying } =
    useAccessibility()

  const [showBanner, setShowBanner] = useState(false)
  const [showReaderButton, setShowReaderButton] = useState(false)
  const [ttsQueue, setTtsQueue] = useState<TTSQueueItem[]>([])
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [announcement, setAnnouncement] = useState("")

  const bannerRef = useRef<HTMLDivElement>(null)
  const mutationObserverRef = useRef<MutationObserver | null>(null)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const updateLayoutPadding = useCallback(() => {
    const bannerHeight = bannerRef.current?.offsetHeight || 0
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height || 0

    document.documentElement.style.setProperty("--reader-h", `${bannerHeight}px`)
    document.documentElement.style.setProperty("--header-h", `${headerHeight}px`)

    if (showBanner) {
      document.body.style.paddingTop = `calc(${bannerHeight}px + ${headerHeight}px)`
    } else {
      document.body.style.paddingTop = `${headerHeight}px`
    }
  }, [showBanner])

  useEffect(() => {
    if (activeProfile === "visual") {
      setShowBanner(true)
      setShowReaderButton(false)
    } else {
      setShowBanner(false)
      setShowReaderButton(false)
      stopAllTTS()
    }
  }, [activeProfile])

  useEffect(() => {
    updateLayoutPadding()

    const handleResize = () => updateLayoutPadding()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect()
      }
    }
  }, [updateLayoutPadding])

  const buildTTSQueue = useCallback((): TTSQueueItem[] => {
    const main = document.querySelector("main")
    if (!main) return []

    const queue: TTSQueueItem[] = []
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        const element = node as Element

        // Skip hidden or aria-hidden elements
        if (
          element.hasAttribute("aria-hidden") ||
          element.hasAttribute("hidden") ||
          element.hasAttribute("inert") ||
          getComputedStyle(element).display === "none" ||
          getComputedStyle(element).visibility === "hidden"
        ) {
          return NodeFilter.FILTER_REJECT
        }

        // Skip nav, header, footer, aside, code blocks
        if (["NAV", "HEADER", "FOOTER", "ASIDE", "CODE", "PRE"].includes(element.tagName)) {
          return NodeFilter.FILTER_REJECT
        }

        // Accept headings, paragraphs, lists
        if (["H1", "H2", "H3", "H4", "H5", "H6", "P", "UL", "OL", "LI"].includes(element.tagName)) {
          return NodeFilter.FILTER_ACCEPT
        }

        return NodeFilter.FILTER_SKIP
      },
    })

    let node
    while ((node = walker.nextNode())) {
      const element = node as Element
      const text = element.textContent?.trim()

      if (text && text.length > 0) {
        let type: TTSQueueItem["type"] = "other"
        let processedText = text

        if (element.tagName.match(/^H[1-6]$/)) {
          type = "heading"
          processedText = `Heading: ${text}`
        } else if (element.tagName === "P") {
          type = "paragraph"
        } else if (["UL", "OL", "LI"].includes(element.tagName)) {
          type = "list"
        }

        queue.push({
          text: processedText,
          element,
          type,
        })
      }
    }

    return queue
  }, [])

  const setupMutationObserver = useCallback(() => {
    const main = document.querySelector("main")
    if (!main || mutationObserverRef.current) return

    mutationObserverRef.current = new MutationObserver((mutations) => {
      if (!isReading) return

      let hasNewContent = false
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              const text = element.textContent?.trim()
              if (text && text.length > 0) {
                hasNewContent = true
              }
            }
          })
        }
      })

      if (hasNewContent) {
        // Rebuild queue and continue from current position
        const newQueue = buildTTSQueue()
        setTtsQueue(newQueue)
      }
    })

    mutationObserverRef.current.observe(main, {
      childList: true,
      subtree: true,
    })
  }, [isReading, buildTTSQueue])

  const stopAllTTS = useCallback(() => {
    speechSynthesis.cancel()
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current = null
    }
    setIsReading(false)
    setCurrentQueueIndex(0)
    setTtsQueue([])
    setAnnouncement("Stopped")
  }, [])

  const processQueue = useCallback(() => {
    if (currentQueueIndex >= ttsQueue.length || !isReading) {
      setIsReading(false)
      setAnnouncement("Reading complete")
      return
    }

    const item = ttsQueue[currentQueueIndex]
    if (!item) return

    // Scroll element into view if it exists
    if (item.element && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      item.element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      })
    }

    const utterance = new SpeechSynthesisUtterance(item.text)
    utterance.rate = visualSettings.ttsRate
    utterance.onend = () => {
      setCurrentQueueIndex((prev) => prev + 1)
    }
    utterance.onerror = () => {
      setCurrentQueueIndex((prev) => prev + 1)
    }

    currentUtteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }, [currentQueueIndex, ttsQueue, isReading, visualSettings.ttsRate])

  useEffect(() => {
    if (isReading && currentQueueIndex < ttsQueue.length) {
      processQueue()
    } else if (currentQueueIndex >= ttsQueue.length && isReading) {
      setIsReading(false)
      setAnnouncement("Reading complete")
    }
  }, [currentQueueIndex, isReading, processQueue, ttsQueue.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showBanner) return

      // Only handle shortcuts when banner is focused or no other input is focused
      const activeElement = document.activeElement
      if (activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName)) {
        return
      }

      switch (e.key) {
        case " ":
          e.preventDefault()
          handleTogglePlayPause()
          break
        case "s":
        case "S":
          e.preventDefault()
          handleStop()
          break
        case "+":
        case "=":
          e.preventDefault()
          handleSpeedChange(0.1)
          break
        case "-":
          e.preventDefault()
          handleSpeedChange(-0.1)
          break
        case "r":
        case "R":
          e.preventDefault()
          handleReadPage()
          break
        case "l":
        case "L":
          e.preventDefault()
          handleReadSection()
          break
        case "Escape":
          e.preventDefault()
          handleCloseBanner()
          break
      }
    }

    if (showBanner) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [showBanner, visualSettings.ttsRate])

  useEffect(() => {
    if (activeProfile === "visual" && visualSettings.ttsAutoStart && showBanner) {
      setTimeout(() => {
        handleReadPage()
      }, 1000)
    }
  }, [activeProfile, visualSettings.ttsAutoStart, showBanner])

  const handleSpeedChange = (delta: number) => {
    const newRate = Math.max(0.8, Math.min(1.5, visualSettings.ttsRate + delta))
    updateVisualSettings({ ttsRate: newRate })
    setAnnouncement(`Speed ${newRate.toFixed(1)}x`)
  }

  const handleTogglePlayPause = () => {
    if (isReading) {
      speechSynthesis.pause()
      setIsReading(false)
      setAnnouncement("Paused")
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume()
      setIsReading(true)
      setAnnouncement("Resumed")
    } else {
      handleReadPage()
    }
  }

  const handleStop = () => {
    stopAllTTS()
  }

  const handleReadPage = () => {
    stopAllTTS()
    const queue = buildTTSQueue()
    setTtsQueue(queue)
    setCurrentQueueIndex(0)
    setIsReading(true)
    setAnnouncement("Reading started")
    setupMutationObserver()
  }

  const handleReadSection = () => {
    const focusedElement = document.activeElement
    if (!focusedElement) return

    // Find closest section or heading
    let section = focusedElement.closest("section")
    if (!section) {
      // Find closest heading and read until next heading of same or higher level
      const heading = focusedElement.closest("h1, h2, h3, h4, h5, h6")
      if (heading) {
        section = heading.parentElement
      }
    }

    if (section) {
      const sectionQueue: TTSQueueItem[] = []
      const elements = section.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, li")

      elements.forEach((element) => {
        const text = element.textContent?.trim()
        if (text && text.length > 0) {
          let processedText = text
          let type: TTSQueueItem["type"] = "other"

          if (element.tagName.match(/^H[1-6]$/)) {
            type = "heading"
            processedText = `Heading: ${text}`
          } else if (element.tagName === "P") {
            type = "paragraph"
          } else if (["UL", "OL", "LI"].includes(element.tagName)) {
            type = "list"
          }

          sectionQueue.push({
            text: processedText,
            element,
            type,
          })
        }
      })

      if (sectionQueue.length > 0) {
        stopAllTTS()
        setTtsQueue(sectionQueue)
        setCurrentQueueIndex(0)
        setIsReading(true)
        setAnnouncement("Reading section")
      }
    }
  }

  const handleCloseBanner = () => {
    stopAllTTS()
    setShowBanner(false)
    setShowReaderButton(true)
    updateLayoutPadding()
  }

  const handleOpenBanner = () => {
    setShowBanner(true)
    setShowReaderButton(false)
    updateLayoutPadding()
  }

  if (activeProfile !== "visual") return null

  return (
    <>
      {showBanner && (
        <div
          ref={bannerRef}
          className="fixed top-0 left-0 right-0 z-[10000] bg-[#094985] text-[#FAFAFA] p-4"
          role="banner"
          aria-label="Visual accessibility reader controls"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Visual profile: Screen reader is ON</h2>

                <div className="flex items-center gap-2" role="toolbar" aria-label="Reading controls">
                  <button
                    onClick={handleTogglePlayPause}
                    className="bg-white text-[#094985] px-4 py-2 rounded font-medium hover:bg-gray-100 focus:outline-none focus:ring-[6px] focus:ring-[#F1C47B] focus:ring-offset-[3px] min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={isReading ? "Pause reading" : "Play reading"}
                  >
                    {isReading ? "⏸️" : "▶️"}
                  </button>

                  <button
                    onClick={handleStop}
                    className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 focus:outline-none focus:ring-[6px] focus:ring-[#F1C47B] focus:ring-offset-[3px] min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Stop reading"
                  >
                    ⏹️
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSpeedChange(-0.1)}
                      className="bg-gray-600 text-white px-3 py-2 rounded font-medium hover:bg-gray-700 focus:outline-none focus:ring-[6px] focus:ring-[#F1C47B] focus:ring-offset-[3px] min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Decrease speed"
                    >
                      −
                    </button>

                    <span className="text-sm font-mono px-2 min-w-[50px] text-center bg-white text-[#094985] rounded py-1">
                      {visualSettings.ttsRate.toFixed(1)}x
                    </span>

                    <button
                      onClick={() => handleSpeedChange(0.1)}
                      className="bg-gray-600 text-white px-3 py-2 rounded font-medium hover:bg-gray-700 focus:outline-none focus:ring-[6px] focus:ring-[#F1C47B] focus:ring-offset-[3px] min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Increase speed"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleReadPage}
                    className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 focus:outline-none focus:ring-[6px] focus:ring-[#F1C47B] focus:ring-offset-[3px] min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Read entire page"
                  >
                    Read page
                  </button>

                  <button
                    onClick={handleReadSection}
                    className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 focus:outline-none focus:ring-[6px] focus:ring-[#F1C47B] focus:ring-offset-[3px] min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Read current section"
                  >
                    Read section
                  </button>
                </div>
              </div>

              <button
                onClick={handleCloseBanner}
                className="bg-white text-[#094985] px-3 py-2 rounded font-bold hover:bg-gray-100 focus:outline-none focus:ring-[6px] focus:ring-[#F1C47B] focus:ring-offset-[3px] min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close reader banner"
              >
                ×
              </button>
            </div>

            {announcement && (
              <div
                className="mt-2 text-sm bg-white text-[#094985] px-3 py-1 rounded inline-block"
                aria-live="polite"
                role="status"
              >
                {announcement}
              </div>
            )}
          </div>
        </div>
      )}

      {showReaderButton && (
        <button
          onClick={handleOpenBanner}
          className="fixed bottom-4 left-4 bg-[#094985] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#0B5A9E] focus:outline-none focus:ring-[6px] focus:ring-[#F1C47B] focus:ring-offset-[3px] min-w-[44px] min-h-[44px] z-50"
          aria-label="Open screen reader controls"
        >
          Reader
        </button>
      )}
    </>
  )
}
