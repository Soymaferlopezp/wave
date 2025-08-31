"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { CheckCircle, RotateCcw } from "lucide-react"

interface Position {
  x: number
  y: number
}

interface GameState {
  snake: Position[]
  currentBlock: number
  blocksCollected: number
  blockPosition: Position
  direction: Position
  gameStatus: "instructions" | "playing" | "gameOver" | "success"
  score: number
}

const GRID_SIZE = 20
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }]
const BLOCK_SEQUENCE = [2, 4, 8, 16, 32, 64, 128]

const SnakeChainGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    currentBlock: 0,
    blocksCollected: 0,
    blockPosition: { x: 5, y: 5 },
    direction: { x: 0, y: 0 },
    gameStatus: "instructions",
    score: 0,
  })

  const [announcement, setAnnouncement] = useState("")

  const generateBlockPosition = useCallback((snake: Position[]): Position => {
    let newPosition: Position
    do {
      newPosition = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (snake.some((segment) => segment.x === newPosition.x && segment.y === newPosition.y))
    return newPosition
  }, [])

  const resetGame = useCallback(() => {
    const newBlockPosition = generateBlockPosition(INITIAL_SNAKE)
    setGameState({
      snake: INITIAL_SNAKE,
      currentBlock: 0,
      blocksCollected: 0,
      blockPosition: newBlockPosition,
      direction: { x: 0, y: 0 },
      gameStatus: "playing",
      score: 0,
    })
    setAnnouncement("Game started. Collect block with 2 confirmations.")
  }, [generateBlockPosition])

  const startGame = () => {
    resetGame()
  }

  const moveSnake = useCallback(() => {
    if (gameState.gameStatus !== "playing") return

    setGameState((prevState) => {
      const { snake, direction, blockPosition, currentBlock, blocksCollected } = prevState

      if (direction.x === 0 && direction.y === 0) return prevState

      const newSnake = [...snake]
      const head = { ...newSnake[0] }
      head.x += direction.x
      head.y += direction.y

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setAnnouncement("Collision with wall! Try again.")
        return { ...prevState, gameStatus: "gameOver" }
      }

      // Check self collision
      if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        setAnnouncement("Snake collision! Try again.")
        return { ...prevState, gameStatus: "gameOver" }
      }

      newSnake.unshift(head)

      // Check block collection
      if (head.x === blockPosition.x && head.y === blockPosition.y) {
        const newBlocksCollected = blocksCollected + 1
        const blockValue = BLOCK_SEQUENCE[currentBlock]

        setAnnouncement(
          `Block collected! ${blockValue} confirmations received. ${newBlocksCollected} of 7 blocks collected.`,
        )

        if (newBlocksCollected === 7) {
          return {
            ...prevState,
            snake: newSnake,
            blocksCollected: newBlocksCollected,
            gameStatus: "success",
            score: prevState.score + blockValue,
          }
        }

        const newBlockPosition = generateBlockPosition(newSnake)
        return {
          ...prevState,
          snake: newSnake,
          currentBlock: currentBlock + 1,
          blocksCollected: newBlocksCollected,
          blockPosition: newBlockPosition,
          score: prevState.score + blockValue,
        }
      } else {
        newSnake.pop()
      }

      return { ...prevState, snake: newSnake }
    })
  }, [gameState.gameStatus, generateBlockPosition])

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const { direction } = gameState
      let newDirection = { ...direction }

      switch (event.key) {
        case "ArrowUp":
          if (direction.y !== 1) newDirection = { x: 0, y: -1 }
          break
        case "ArrowDown":
          if (direction.y !== -1) newDirection = { x: 0, y: 1 }
          break
        case "ArrowLeft":
          if (direction.x !== 1) newDirection = { x: -1, y: 0 }
          break
        case "ArrowRight":
          if (direction.x !== -1) newDirection = { x: 1, y: 0 }
          break
      }

      setGameState((prev) => ({ ...prev, direction: newDirection }))
    },
    [gameState],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  useEffect(() => {
    if (gameState.gameStatus === "playing") {
      const gameLoop = setInterval(moveSnake, 200)
      return () => clearInterval(gameLoop)
    }
  }, [moveSnake, gameState.gameStatus])

  const renderGrid = () => {
    const grid = []
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        let cellType = "empty"

        if (gameState.snake.some((segment) => segment.x === x && segment.y === y)) {
          cellType = "snake"
        } else if (
          gameState.blockPosition.x === x &&
          gameState.blockPosition.y === y &&
          gameState.gameStatus === "playing"
        ) {
          cellType = "block"
        }

        grid.push(
          <div
            key={`${x}-${y}`}
            className={`w-4 h-4 ${
              cellType === "snake" ? "bg-white" : cellType === "block" ? "bg-[#094985]" : "bg-black"
            } border border-gray-800`}
          />,
        )
      }
    }
    return grid
  }

  if (gameState.gameStatus === "instructions") {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-[#094985] text-center mb-6">SnakeChain – Confirm your transaction</h1>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-[#094985] mb-4">Game Rules:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Use arrow keys (↑ ↓ ← →) to move the snake.</li>
            <li>Collect the 7 blocks in sequence: 2, 4, 8, 16, 32, 64, 128.</li>
            <li>Each block grows the snake and represents confirmations.</li>
            <li>Avoid colliding with walls or yourself, or you must restart.</li>
            <li>Collect all 7 blocks to complete the transaction.</li>
          </ol>
        </div>

        <div className="text-center">
          <button
            onClick={startGame}
            className="bg-[#094985] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#094985] focus:ring-offset-2"
            aria-label="Start SnakeChain game"
          >
            Start Game
          </button>
        </div>
      </div>
    )
  }

  if (gameState.gameStatus === "success") {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-[#094985] mb-4">Transaction Confirmed!</h1>
        <p className="text-xl text-gray-700 mb-6">Transaction confirmed with 128 confirmations on BASE ✅</p>
        <p className="text-lg text-gray-600 mb-6">Score: {gameState.score} confirmations</p>
        <button
          onClick={() => setGameState((prev) => ({ ...prev, gameStatus: "instructions" }))}
          className="bg-[#F1C47B] text-[#094985] px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F1C47B] focus:ring-offset-2"
          aria-label="Play SnakeChain again"
        >
          Play Again
        </button>
      </div>
    )
  }

  if (gameState.gameStatus === "gameOver") {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <RotateCcw className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-red-600 mb-4">Try Again</h1>
        <p className="text-lg text-gray-700 mb-6">Transaction failed. You need to restart the confirmation process.</p>
        <button
          onClick={resetGame}
          className="bg-[#094985] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#094985] focus:ring-offset-2"
          aria-label="Try SnakeChain again"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-[#094985] text-center mb-6">SnakeChain – Confirm your transaction</h1>

      <div className="text-center mb-4">
        <p className="text-lg text-gray-700">
          Next block:{" "}
          <span className="font-bold text-[#094985]">{BLOCK_SEQUENCE[gameState.currentBlock]} confirmations</span>
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <div
          className="grid grid-cols-20 gap-0 border-2 border-gray-800 bg-black p-2 rounded-lg"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
          role="grid"
          aria-label="SnakeChain game grid"
        >
          {renderGrid()}
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700" aria-live="polite">
          Blocks collected: {gameState.blocksCollected} / 7
        </p>
        <p className="text-sm text-gray-600 mt-2">Use arrow keys to move the snake</p>
      </div>

      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {announcement}
      </div>
    </div>
  )
}

export default SnakeChainGame
