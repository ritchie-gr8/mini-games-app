<script>
export default {
  name: 'ConnectFour',
  data() {
    return {
      board: [],
      currentPlayer: 1, // 1 player , 0 AI
      gameOver: false,
      winner: null,
      isAITurn: false,
      aiDifficulty: 'medium',
      statusMessage: 'YOUR TURN',
      directions: [
        [0, 1], // horizontal
        [1, 0], // vertical
        [1, 1], // diagonal down-right
        [1, -1], // diagonal down-left
      ],
    }
  },
  created() {
    this.resetGame()
  },
  methods: {
    resetGame() {
      this.board = Array(6)
        .fill()
        .map(() => Array(7).fill(0))
      this.currentPlayer = 1
      this.gameOver = false
      this.winner = null
      this.isAITurn = false
      this.statusMessage = 'YOUR TURN'
      this.directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
      ]
    },

    getCellClass(row, col) {
      const cell = this.board[row][col]
      if (cell === 0) return 'bg-white border-2 border-black'
      if (cell === 1) return 'bg-red-500 border-4 border-black scale-95 shadow-inner'
      return 'bg-yellow-400 border-4 border-black scale-95 shadow-inner'
    },

    canDropInColumn(col) {
      return this.board[0][col] === 0
    },

    findAvailableRow(col) {
      for (let row = 5; row >= 0; row--) {
        if (this.board[row][col] === 0) return row
      }
      return -1
    },

    dropPiece(col) {
      if (this.gameOver || this.isAITurn) return

      const row = this.findAvailableRow(col)
      if (row === -1) return

      this.board[row][col] = this.currentPlayer

      if (this.checkWin(row, col, this.currentPlayer)) {
        this.gameOver = true
        this.winner = this.currentPlayer
        this.statusMessage = 'YOU WIN!'
        return
      }

      if (this.isBoardFull()) {
        this.gameOver = true
        this.statusMessage = 'DRAW'
        return
      }

      this.currentPlayer = 2
      this.isAITurn = true
      this.statusMessage = 'AI IS THINKING...'

      setTimeout(() => {
        this.makeAIMove()
      }, 500)
    },

    makeAIMove() {
      let col

      switch (this.aiDifficulty) {
        case 'easy':
          col = this.getEasyAIMove()
          break
        case 'medium':
          col = Math.random() < 0.7 ? this.getMediumAIMove() : this.getEasyAIMove()
          break
        case 'hard':
          col = this.getHardAIMove()
          break
        default:
          col = this.getMediumAIMove()
      }

      const row = this.findAvailableRow(col)
      this.board[row][col] = 2

      if (this.checkWin(row, col, 2)) {
        this.gameOver = true
        this.winner = 2
        this.statusMessage = 'AI WINS!'
        return
      }

      if (this.isBoardFull()) {
        this.gameOver = true
        this.statusMessage = 'DRAW!'
        return
      }

      this.currentPlayer = 1
      this.isAITurn = false
      this.statusMessage = 'YOUR TURN'
    },

    getEasyAIMove() {
      const validMoves = []
      for (let col = 0; col < 7; col++) {
        if (this.canDropInColumn(col)) {
          validMoves.push(col)
        }
      }

      return validMoves[Math.floor(Math.random() * validMoves.length)]
    },

    getMediumAIMove() {
      // check for winning move
      for (let col = 0; col < 7; col++) {
        if (!this.canDropInColumn(col)) continue

        const row = this.findAvailableRow(col)
        this.board[row][col] = 2
        if (this.checkWin(row, col, 2)) {
          this.board[row][col] = 0
          return col
        }

        this.board[row][col] = 0
      }

      // check if player is about to win and block
      for (let col = 0; col < 7; col++) {
        if (!this.canDropInColumn(col)) continue

        const row = this.findAvailableRow(col)
        this.board[row][col] = 1
        if (this.checkWin(row, col, 1)) {
          this.board[row][col] = 0
          return col
        }

        this.board[row][col] = 0
      }

      return this.getEasyAIMove()
    },

    getHardAIMove() {
      let bestScore = -Infinity
      let bestCol = 0

      const mediumMove = this.getMediumAIMove()
      if (this.isWinningMove(mediumMove, 2) || this.isWinningMove(mediumMove, 1)) {
        return mediumMove
      }

      for (let col = 0; col < 7; col++) {
        if (!this.canDropInColumn(col)) continue

        const row = this.findAvailableRow(col)
        this.board[row][col] = 2
        const score = this.evaluatePosition()
        this.board[row][col] = 0

        if (score > bestScore) {
          bestScore = score
          bestCol = col
        }
      }

      return bestCol
    },

    evaluatePosition() {
      let score = 0

      const centerPreference = [0, 1, 2, 3, 2, 1, 0]

      for (let col = 0; col < 7; col++) {
        if (!this.canDropInColumn(col)) continue

        const row = this.findAvailableRow(col)
        score += centerPreference[col]
        score += this.countThreats(row, col)
      }

      return score
    },

    countThreats(row, col) {
      let threats = 0

      const directions = this.directions

      for (let [dx, dy] of directions) {
        threats += this.evaluateDirection(row, col, dx, dy)
      }

      return threats
    },

    evaluateDirection(row, col, dx, dy) {
      let score = 0

      let aiCount = 0
      let emptyCount = 0

      for (let i = -3; i <= 3; i++) {
        const newRow = row + i * dx
        const newCol = col + i * dy

        if (newRow < 0 || newRow >= 6 || newCol < 0 || newCol >= 7) continue

        if (this.board[newRow][newCol] === 2) {
          aiCount++
        } else if (this.board[newRow][newCol] === 0) {
          emptyCount++
        }
      }

      if (aiCount >= 2 && emptyCount >= 2) score += aiCount * 2

      return score
    },

    isWinningMove(col, player) {
      if (!this.canDropInColumn(col)) return false

      const row = this.findAvailableRow(col)
      this.board[row][col] = player
      const isWinning = this.checkWin(row, col, player)
      this.board[row][col] = 0
      return isWinning
    },

    isBoardFull() {
      for (let col = 0; col < 7; col++) {
        if (this.canDropInColumn(col)) return false
      }
      return true
    },

    checkWin(row, col, player) {
      const directions = this.directions

      for (let [dx, dy] of directions) {
        let count = 1

        count += this.countPieces(row, col, dx, dy, player)
        count += this.countPieces(row, col, -dx, -dy, player)

        if (count >= 4) return true
      }

      return false
    },

    countPieces(row, col, dx, dy, player) {
      let count = 0
      let newRow = row + dx
      let newCol = col + dy

      while (
        newRow >= 0 &&
        newRow < 6 &&
        newCol >= 0 &&
        newCol < 7 &&
        this.board[newRow][newCol] === player
      ) {
        count++
        newRow += dx
        newCol += dy
      }

      return count
    },
  },
}
</script>

<template>
  <div class="flex flex-col items-center p-4 font-mono">
    <button
      @click="$router.push('/')"
      class="px-4 py-2 mb-4 bg-blue-400 text-black font-bold rounded border-4 border-black transform -rotate-1 hover:translate-y-1 transition-transform shadow-[5px_5px_0_0_rgba(0,0,0,1)] flex items-center gap-2 cursor-pointer"
    >
      <span class="text-xl">←</span> BACK
    </button>
    <h2
      class="text-3xl font-black mb-6 text-black bg-pink-400 px-6 py-2 rounded-lg transform rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    >
      Connect Four
    </h2>

    <div class="flex flex-col md:flex-row justify-between w-full max-w-md mb-6 gap-4">
      <div
        class="text-lg font-bold px-4 py-2 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black text-center"
        :class="gameOver ? 'bg-red-400' : ''"
      >
        {{ statusMessage }}
      </div>
      <button
        @click="resetGame"
        class="px-6 py-3 bg-green-400 text-black font-bold border-4 border-black rounded-lg transform rotate-1 hover:rotate-0 transition hover:bg-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
      >
        NEW GAME
      </button>
    </div>

    <div
      class="bg-blue-600 p-6 rounded-lg border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div class="grid grid-cols-7 gap-3">
        <button
          v-for="col in 7"
          :key="`col-${col}`"
          @click="dropPiece(col - 1)"
          :disabled="!canDropInColumn(col - 1) || gameOver || isAITurn"
          class="w-12 h-8 bg-yellow-300 hover:bg-yellow-400 rounded-t-lg disabled:opacity-50 border-4 border-black font-black text-black transform hover:translate-y-1 transition cursor-pointer"
        >
          ▼
        </button>

        <template v-for="row in 6" :key="`row-${row}`">
          <div
            v-for="col in 7"
            :key="`${row}-${col}`"
            class="w-12 h-12 bg-blue-800 rounded border-4 border-black flex items-center justify-center p-1 overflow-hidden"
          >
            <div
              class="w-full h-full rounded-full transform transition-all duration-300"
              :class="getCellClass(row - 1, col - 1)"
            />
          </div>
        </template>
      </div>
    </div>

    <div
      class="mt-8 bg-cyan-300 p-4 border-4 border-black rounded transform rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    >
      <label class="mr-2 font-bold text-black">AI DIFFICULTY:</label>
      <select
        v-model="aiDifficulty"
        class="p-2 border-4 border-black rounded font-bold bg-white text-black cursor-pointer"
      >
        <option value="easy">EASY</option>
        <option value="medium">MEDIUM</option>
        <option value="hard">HARD</option>
      </select>
    </div>
  </div>
</template>
