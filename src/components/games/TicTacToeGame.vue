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
  <div class="flex flex-col items-center p-4">
    <h1 class="text-2xl font-bold mb-6">Tic Tac Toe</h1>

    <div class="mb-4">
      <button
        v-for="level in ['Easy', 'Medium', 'Unbeatable']"
        :key="level"
        class="px-3 py-1 mx-1 rounded cursor-pointer w-28"
        :class="
          difficulty === level.toLowerCase()
            ? 'bg-yellow-400 text-gray-900'
            : 'bg-gray-200 dark:bg-gray-700'
        "
        @click="setDifficulty(level.toLowerCase())"
      >
        {{ level }}
      </button>
    </div>

    <div class="status mb-4 h-6">
      <span v-if="winner">
        {{ winner === 'draw' ? "It's a draw!" : `${winner === 'X' ? 'You' : 'AI'} wins!` }}
      </span>
      <span v-else>
        {{ currentPlayer === 'X' ? 'Your turn' : 'AI is thinking...' }}
      </span>
    </div>

    <div class="board grid grid-cols-3 gap-2 mb-6">
      <div
        v-for="(cell, index) in board"
        :key="index"
        class="size-20 flex items-center justify-center cursor-pointer text-2xl font-bold bg-gray-200 dark:bg-gray-800 rounded"
        @click="makeMove(index)"
      >
        <span v-if="cell === 'X'" class="text-blue-500">X</span>
        <span v-else-if="cell === 'O'" class="text-red-500">O</span>
      </div>
    </div>

    <button
      class="cursor-pointer px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      @click="resetGame"
    >
      New Game
    </button>

    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-2">Top Scores</h2>
      <div class="grid grid-cols-2 gap-2">
        <div>Wins: {{ playerStats.wins }}</div>
        <div>Losses: {{ playerStats.losses }}</div>
        <div>Draws: {{ playerStats.draws }}</div>
      </div>
    </div>
  </div>
</template>
