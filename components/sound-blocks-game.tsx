"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X } from "lucide-react"

interface SoundBlocksGameProps {
  onClose: () => void
}

const WORDS_EN = ["hash", "block", "node", "chain", "wallet", "key", "transaction"]
const WORDS_ES = ["hash", "bloque", "nodo", "cadena", "billetera", "llave", "transacción"]

export default function SoundBlocksGame({ onClose }: SoundBlocksGameProps) {
  const [gameState, setGameState] = useState<
    "instructions" | "playing" | "listening" | "inputting" | "success" | "error" | "completed"
  >("instructions")
  const [currentSequence, setCurrentSequence] = useState<number[]>([])
  const [playerInput, setPlayerInput] = useState<number[]>([])
  const [round, setRound] = useState(1)
  const [status, setStatus] = useState("")
  const [speechSupported, setSpeechSupported] = useState(false)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    setSpeechSupported("speechSynthesis" in window)
  }, [])

  const cleanup = useCallback(() => {
    if (speechSupported && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    timeoutsRef.current = []
  }, [speechSupported])

  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      callback()
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== timeout)
    }, delay)
    timeoutsRef.current.push(timeout)
    return timeout
  }, [])

  const handleClose = useCallback(() => {
    cleanup()
    onClose()
  }, [cleanup, onClose])

  const speak = useCallback(
    (textEn: string, textEs?: string, rate = 0.7) => {
      if (!speechSupported) return

      window.speechSynthesis.cancel()

      const utteranceEn = new SpeechSynthesisUtterance(textEn)
      utteranceEn.rate = rate
      utteranceEn.pitch = 1
      utteranceEn.volume = 1
      utteranceEn.lang = "en-US"

      window.speechSynthesis.speak(utteranceEn)

      if (textEs) {
        utteranceEn.onend = () => {
          safeSetTimeout(() => {
            const utteranceEs = new SpeechSynthesisUtterance(textEs)
            utteranceEs.rate = rate
            utteranceEs.pitch = 1
            utteranceEs.volume = 1
            utteranceEs.lang = "es-ES"
            window.speechSynthesis.speak(utteranceEs)
          }, 300)
        }
      }
    },
    [speechSupported, safeSetTimeout],
  )

  const announceInstructions = useCallback(() => {
    if (!speechSupported) return

    const instructionsEn = `Welcome to Sound Blocks. Listen to the sequence of words. Use keys 1 to 7 to repeat in order. Each round adds one more word. Mistakes restart the sequence. Complete 7 rounds to win.`

    const instructionsEs = `Bienvenido a Sound Blocks. Escucha la secuencia de palabras. Usa las teclas del 1 al 7 para repetir en orden. Cada ronda añade una palabra más. Los errores reinician la secuencia. Completa 7 rondas para ganar.`

    speak(instructionsEn, instructionsEs, 0.8)

    safeSetTimeout(() => {
      announceMappings()
    }, 8000)
  }, [speak, speechSupported, safeSetTimeout])

  const announceMappings = useCallback(() => {
    if (!speechSupported) return

    const mappings = [
      { en: "Key 1 is Hash", es: "Uno es Hash" },
      { en: "Key 2 is Block", es: "Dos es Bloque" },
      { en: "Key 3 is Node", es: "Tres es Nodo" },
      { en: "Key 4 is Chain", es: "Cuatro es Cadena" },
      { en: "Key 5 is Wallet", es: "Cinco es Billetera" },
      { en: "Key 6 is Key", es: "Seis es Llave" },
      { en: "Key 7 is Transaction", es: "Siete es Transacción" },
    ]

    let delay = 0
    mappings.forEach((mapping, index) => {
      safeSetTimeout(() => {
        speak(mapping.en, mapping.es, 0.6)
      }, delay)
      delay += 3000
    })

    safeSetTimeout(() => {
      speak("Press the spacebar to start.", "Presiona la barra espaciadora para comenzar.")
    }, delay + 1000)
  }, [speak, speechSupported, safeSetTimeout])

  const generateSequence = useCallback(() => {
    const sequence = []
    const sequenceLength = round + 1
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push(Math.floor(Math.random() * 7))
    }
    setCurrentSequence(sequence)
    return sequence
  }, [round])

  const playSequence = useCallback(async () => {
    if (!speechSupported) return

    setGameState("listening")
    const sequenceLength = round + 1
    setStatus(`Round ${round}. Sequence length: ${sequenceLength}.`)
    speak(
      `Round ${round}. Sequence length: ${sequenceLength}.`,
      `Ronda ${round}. Secuencia de ${sequenceLength} palabras.`,
    )

    await new Promise((resolve) => safeSetTimeout(resolve, 3000))

    for (let i = 0; i < currentSequence.length; i++) {
      const wordEn = WORDS_EN[currentSequence[i]]
      const wordEs = WORDS_ES[currentSequence[i]]
      speak(`${wordEn} — ${wordEs}`, undefined, 0.6)
      await new Promise((resolve) => safeSetTimeout(resolve, 2500))
    }

    await new Promise((resolve) => safeSetTimeout(resolve, 1000))
    setGameState("inputting")
    setStatus("Now repeat the sequence using keys 1 through 7.")
    speak("Now repeat the sequence using keys 1 through 7.", "Ahora repite la secuencia usando las teclas del 1 al 7.")
  }, [currentSequence, round, speak, speechSupported, safeSetTimeout])

  const startRound = useCallback(() => {
    const sequence = generateSequence()
    setPlayerInput([])
    playSequence()
  }, [generateSequence, playSequence])

  const handleKeyPress = useCallback(
    (key: number) => {
      if (gameState !== "inputting") return

      const newInput = [...playerInput, key]
      setPlayerInput(newInput)

      const wordEn = WORDS_EN[key]
      const wordEs = WORDS_ES[key]
      speak(wordEn, wordEs)

      if (newInput.length === currentSequence.length) {
        const isCorrect = newInput.every((input, index) => input === currentSequence[index])

        if (isCorrect) {
          setGameState("success")
          if (round >= 7) {
            setStatus("Congratulations! You mastered the Sound Blocks challenge. Blockchain confirmed.")
            speak(
              "Congratulations! You mastered the Sound Blocks challenge. Blockchain confirmed.",
              "¡Felicitaciones! Has dominado el reto de Sound Blocks. Blockchain confirmada.",
            )
            safeSetTimeout(() => {
              setGameState("completed")
              speak("Press the spacebar to play again.", "Presiona la barra espaciadora para jugar de nuevo.")
            }, 4000)
          } else {
            setStatus("Correct. Sequence confirmed. Next round.")
            speak("Correct. Sequence confirmed. Next round.", "Correcto. Secuencia confirmada. Siguiente ronda.")
            safeSetTimeout(() => {
              setRound((prev) => prev + 1)
              safeSetTimeout(startRound, 1000)
            }, 3000)
          }
        } else {
          setGameState("error")
          setStatus("Incorrect. Try again. Restarting sequence.")
          speak("Incorrect. Try again. Restarting sequence.", "Incorrecto. Inténtalo de nuevo. Reiniciando secuencia.")
          safeSetTimeout(() => {
            setPlayerInput([])
            playSequence()
          }, 3000)
        }
      }
    },
    [gameState, playerInput, currentSequence, round, speak, startRound, playSequence, safeSetTimeout],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        handleClose()
        return
      }

      if (gameState === "instructions") {
        if (event.code === "Space") {
          event.preventDefault()
          setGameState("playing")
          setStatus("Starting Sound Blocks...")
          speak("Starting Sound Blocks...", "Iniciando Sound Blocks...")
          safeSetTimeout(startRound, 1000)
        }
        return
      }

      if (gameState === "completed") {
        if (event.code === "Space") {
          event.preventDefault()
          setRound(1)
          setPlayerInput([])
          setCurrentSequence([])
          setGameState("playing")
          setStatus("Starting Sound Blocks...")
          speak("Starting Sound Blocks...", "Iniciando Sound Blocks...")
          safeSetTimeout(startRound, 1000)
        }
        return
      }

      if (event.key.toLowerCase() === "m") {
        event.preventDefault()
        announceMappings()
        return
      }

      const key = Number.parseInt(event.key)
      if (key >= 1 && key <= 7) {
        event.preventDefault()
        handleKeyPress(key - 1)
      }

      if (event.code === "Space" && gameState === "inputting") {
        event.preventDefault()
        playSequence()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState, handleKeyPress, startRound, playSequence, speak, announceMappings, handleClose, safeSetTimeout])

  useEffect(() => {
    if (speechSupported && gameState === "instructions") {
      safeSetTimeout(announceInstructions, 1000)
    }
  }, [announceInstructions, speechSupported, gameState, safeSetTimeout])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white hover:text-[#F1C47B] transition-colors z-10"
        aria-label="Close Sound Blocks game"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-4xl mx-auto p-8 text-center">
        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-white">Sound Blocks</h1>
          <p className="text-xl text-[#F1C47B]">Bilingual Audio Mode Active</p>

          {gameState === "instructions" && (
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-lg p-6 text-left max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-[#F1C47B] mb-4 text-center">Key Mapping / Mapeo de Teclas</h2>
                <div className="grid grid-cols-1 gap-2 text-lg text-white">
                  <div>1 = Hash — Hash</div>
                  <div>2 = Block — Bloque</div>
                  <div>3 = Node — Nodo</div>
                  <div>4 = Chain — Cadena</div>
                  <div>5 = Wallet — Billetera</div>
                  <div>6 = Key — Llave</div>
                  <div>7 = Transaction — Transacción</div>
                </div>
              </div>
              <p className="text-lg text-white">Press M to repeat mapping | Press spacebar to begin</p>
              <p className="text-lg text-white">
                Presiona M para repetir mapeo | Presiona barra espaciadora para comenzar
              </p>
              {!speechSupported && (
                <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                  <p className="text-white">
                    Speech synthesis is not supported in your browser. Please use a modern browser for the full audio
                    experience.
                  </p>
                </div>
              )}
            </div>
          )}

          {(gameState === "playing" ||
            gameState === "listening" ||
            gameState === "inputting" ||
            gameState === "success" ||
            gameState === "error") && (
            <div className="space-y-6">
              <div className="text-2xl text-[#F1C47B]">Round {round} of 7</div>
              <div className="text-lg text-white min-h-[3rem]" aria-live="polite" aria-atomic="true">
                {status}
              </div>
              {gameState === "inputting" && (
                <div className="space-y-2">
                  <p className="text-white">Use keys 1-7 | M for mapping | Spacebar to replay</p>
                  <p className="text-white">Usa teclas 1-7 | M para mapeo | Barra espaciadora para repetir</p>
                </div>
              )}
            </div>
          )}

          {gameState === "completed" && (
            <div className="space-y-6">
              <div className="text-3xl text-[#F1C47B] font-bold">Challenge Complete! / ¡Reto Completado!</div>
              <p className="text-lg text-white">Press spacebar to play again</p>
              <p className="text-lg text-white">Presiona barra espaciadora para jugar de nuevo</p>
            </div>
          )}
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {status}
      </div>
    </div>
  )
}
