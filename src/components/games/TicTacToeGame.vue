<script setup>
import { ref } from 'vue'

const board = ref(Array(9).fill(null))
const currentPlayer = ref('X')
const winner = ref(null)
const difficulty = ref('medium')
const gameActive = ref(true)
const playerStats = ref({
  wins: 0,
  losses: 0,
  draws: 0,
})

const setDifficulty = (level) => {
  difficulty.value = level
  resetGame()
}

const resetGame = () => {
  board.value = Array(9).fill(null)
  currentPlayer.value = 'X'
  winner.value = null
  gameActive.value = true
}

const makeMove = (index) => {
  if (board.value[index] !== null || !gameActive.value) return

  board.value[index] = currentPlayer.value
  checkGameState()
}

const checkGameState = () => {
  const result = checkWinner(board.value)

  if (result) {
    winner.value = result
    gameActive.value = false

    if (result === 'X') {
      playerStats.value.wins++
    } else if (result === 'O') {
      playerStats.value.losses++
    } else {
      playerStats.value.draws++
    }

    return
  }

  currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X'

  if (currentPlayer.value === 'O') {
    aiMove()
  }
}

const checkWinner = (boardState) => {
  const winPatterns = [
    // rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // diagonals
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return boardState[a]
    }
  }

  if (!hasEmptyCells(boardState)) {
    return 'draw'
  }

  return null
}

const hasEmptyCells = (boardState) => {
  return boardState.some((cell) => cell === null)
}

const aiMove = () => {
  if (!gameActive.value || currentPlayer.value !== 'O') return

  setTimeout(() => {
    const move = findBestMove()
    if (move !== -1) {
      board.value[move] = 'O'
      checkGameState()
    }
  }, 500)
}

const findBestMove = () => {
  let bestScore = -Infinity
  let bestMove = -1
  const boardCopy = [...board.value]

  // if easy mode ai will sometimes make random moves
  if (difficulty.value === 'easy' && Math.random() < 0.4) {
    const emptyCells = boardCopy
      .map((cell, idx) => (cell === null ? idx : -1))
      .filter((idx) => idx !== -1)
    return emptyCells[Math.floor(Math.random() * emptyCells.length)]
  }

  for (let i = 0; i < boardCopy.length; i++) {
    if (boardCopy[i] === null) {
      boardCopy[i] = 'O'
      const score = minimax(boardCopy, 0, false)
      boardCopy[i] = null

      if (score > bestScore) {
        bestScore = score
        bestMove = i
      }
    }
  }

  return bestMove
}

const minimax = (board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) => {
  const result = checkWinner(board)

  if (result === 'O') return 10 - depth
  if (result === 'X') return depth - 10
  if (result === 'draw') return 0

  if (
    (difficulty.value === 'easy' && depth >= 1) ||
    (difficulty.value === 'medium' && depth >= 3)
  ) {
    return evaluateBoard(board)
  }

  if (isMaximizing) {
    let bestScore = -Infinity

    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'O'
        const score = minimax(board, depth + 1, false, alpha, beta)
        board[i] = null
        bestScore = Math.max(score, bestScore)

        alpha = Math.max(score, alpha)
        if (beta <= alpha) break
      }
    }
    return bestScore
  } else {
    let bestScore = Infinity
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'X'
        const score = minimax(board, depth + 1, true, alpha, beta)
        board[i] = null

        bestScore = Math.min(score, bestScore)

        beta = Math.min(score, beta)
        if (beta <= alpha) break
      }
    }
    return bestScore
  }
}

const evaluateBoard = (boardState) => {
  const result = checkWinner(boardState)
  if (result === 'O') return 10
  if (result === 'X') return -10

  return 0
}
</script>

<template>
  <div class="flex flex-col items-center p-6 gap-6">
    <h1
      class="text-3xl font-black text-black transform -rotate-2"
      style="text-shadow: 3px 3px 0 #ff00aa"
    >
      TIC TAC TOE
    </h1>

    <div class="flex gap-2">
      <button
        v-for="level in ['Easy', 'Medium', 'Unbeatable']"
        :key="level"
        @click="setDifficulty(level.toLowerCase())"
        class="px-4 py-2 font-bold border-4 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] transform transition-transform hover:translate-y-1"
        :class="
          difficulty === level.toLowerCase()
            ? 'bg-yellow-400 rotate-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)]'
            : 'bg-gray-200 -rotate-1'
        "
      >
        {{ level }}
      </button>
    </div>

    <div
      class="bg-yellow-400 p-3 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rotate-1"
    >
      <span class="font-black text-xl">
        {{
          winner
            ? winner === 'draw'
              ? 'DRAW!'
              : `${winner === 'X' ? 'YOU WIN!' : 'AI WINS!'}`
            : currentPlayer === 'X'
              ? 'YOUR TURN'
              : 'AI THINKING...'
        }}
      </span>
    </div>

    <div
      class="grid grid-cols-3 gap-3 bg-pink-200 p-4 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rotate-1"
    >
      <div
        v-for="(cell, index) in board"
        :key="index"
        class="size-20 flex items-center justify-center cursor-pointer text-4xl font-black border-4 border-black bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)] transform transition-transform hover:translate-y-1"
        :class="{
          'rotate-2': index % 3 === 0,
          '-rotate-2': index % 3 === 1,
          'rotate-1': index % 3 === 2,
        }"
        @click="makeMove(index)"
      >
        <span v-if="cell === 'X'" class="text-blue-600" style="text-shadow: 2px 2px 0 #000">X</span>
        <span v-else-if="cell === 'O'" class="text-red-600" style="text-shadow: 2px 2px 0 #000"
          >O</span
        >
      </div>
    </div>

    <button
      @click="resetGame"
      class="px-6 py-2 bg-yellow-400 text-black font-bold rounded border-4 border-black transform rotate-1 hover:translate-y-1 transition-transform shadow-[5px_5px_0_0_rgba(0,0,0,1)]"
    >
      NEW GAME
    </button>

    <div class="grid grid-cols-3 gap-4 mt-4">
      <div
        class="bg-green-400 p-3 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] -rotate-1 text-center"
      >
        <div class="text-sm font-bold">WINS</div>
        <div class="text-2xl font-black">{{ playerStats.wins }}</div>
      </div>
      <div
        class="bg-red-400 p-3 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rotate-2 text-center"
      >
        <div class="text-sm font-bold">LOSSES</div>
        <div class="text-2xl font-black">{{ playerStats.losses }}</div>
      </div>
      <div
        class="bg-blue-400 p-3 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] -rotate-2 text-center"
      >
        <div class="text-sm font-bold">DRAWS</div>
        <div class="text-2xl font-black">{{ playerStats.draws }}</div>
      </div>
    </div>
  </div>
</template>
