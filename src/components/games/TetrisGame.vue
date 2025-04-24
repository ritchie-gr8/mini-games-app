<script setup>
import { CELL_SIZE, EMPTY_CELL, GRID_HEIGHT, GRID_WIDTH, TETROMINOS } from '@/constant/tetris'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const gameBoard = ref(null)
const grid = ref([])
const currentPiece = ref(null)
const currentPosition = ref({ x: 0, y: 0 })
const gameInterval = ref(null)
const isGameOver = ref(false)
const score = ref(0)
const level = ref(1)
const linesCleared = ref(0)
const isGameStarted = ref(false)
const gameSpeed = computed(() => Math.max(800 - (level.value - 1) * 100, 100))
const ghostPosition = computed(() => {
  if (!currentPiece.value || !isGameStarted.value || isGameOver.value) return null

  let distance = 0
  while (isValidMove(0, distance + 1, currentPiece.value.shape)) {
    distance++
  }

  return {
    x: currentPosition.value.x,
    y: currentPosition.value.y + distance,
    color: currentPiece.value.color + ' opacity-25',
  }
})
const holdPiece = ref(null)
const canHold = ref(true)
const nextPiece = ref(null)

const initGrid = () => {
  grid.value = []
  for (let y = 0; y < GRID_HEIGHT; y++) {
    const row = []
    for (let x = 0; x < GRID_WIDTH; x++) {
      row.push(EMPTY_CELL)
    }
    grid.value.push(row)
  }
}

const createNewPiece = (initial = false) => {
  // Generate next piece if needed
  if (!nextPiece.value || initial) {
    const pieces = Object.keys(TETROMINOS)
    const random = pieces[Math.floor(Math.random() * pieces.length)]
    nextPiece.value = {
      shape: TETROMINOS[random].shape,
      color: TETROMINOS[random].color,
      type: random,
    }
  }

  // Set current piece from next piece
  currentPiece.value = { ...nextPiece.value }

  // Generate new next piece
  const pieces = Object.keys(TETROMINOS)
  const newNext = pieces[Math.floor(Math.random() * pieces.length)]
  nextPiece.value = {
    shape: TETROMINOS[newNext].shape,
    color: TETROMINOS[newNext].color,
    type: newNext,
  }

  // Reset position
  currentPosition.value = {
    x: Math.floor((GRID_WIDTH - currentPiece.value.shape[0].length) / 2),
    y: 0,
  }

  canHold.value = true // Reset hold availability

  // Collision check
  if (!isValidMove(0, 0, currentPiece.value.shape)) {
    gameOver()
  }
}

const startGame = async () => {
  isGameStarted.value = false
  await nextTick()

  initGrid()
  score.value = 0
  level.value = 1
  linesCleared.value = 0
  isGameOver.value = false
  holdPiece.value = null
  canHold.value = true
  nextPiece.value = null

  stopGameLoop()
  createNewPiece()

  isGameStarted.value = true
  await nextTick()
  startGameLoop()
  gameBoard.value.focus()
}

const gameOver = () => {
  isGameOver.value = true
  isGameStarted.value = false
  stopGameLoop()
}

const stopGameLoop = () => {
  if (gameInterval.value) {
    clearInterval(gameInterval.value)
    gameInterval.value = null
  }
}

const startGameLoop = () => {
  stopGameLoop()
  if (isGameStarted.value && !isGameOver.value) {
    gameInterval.value = setInterval(moveDown, gameSpeed.value)
  }
}

const isValidMove = (offsetX, offsetY, shape = currentPiece.value.shape) => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== EMPTY_CELL) {
        const newX = currentPosition.value.x + x + offsetX
        const newY = currentPosition.value.y + y + offsetY

        // Check boundaries
        if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
          return false
        }

        // Check if position is already filled
        if (newY >= 0 && grid.value[newY][newX] !== EMPTY_CELL) {
          return false
        }
      }
    }
  }
  return true
}

const holdCurrentPiece = () => {
  if (!canHold.value || !currentPiece.value) return

  // Swap current piece with hold
  if (!holdPiece.value) {
    holdPiece.value = { ...currentPiece.value }
    createNewPiece()
  } else {
    const temp = { ...holdPiece.value }
    holdPiece.value = { ...currentPiece.value }
    currentPiece.value = temp

    // Reset position
    currentPosition.value = {
      x: Math.floor((GRID_WIDTH - currentPiece.value.shape[0].length) / 2),
      y: 0,
    }
  }

  canHold.value = false
}

const moveDown = () => {
  if (!isGameStarted.value || isGameOver.value || !currentPiece.value) return

  if (isValidMove(0, 1)) {
    currentPosition.value.y++
  } else {
    stopGameLoop()
    lockPiece()
    clearRows()
    createNewPiece()
    startGameLoop()
  }
}

const moveLeft = () => {
  if (!isGameStarted.value || isGameOver.value || !currentPiece.value) return
  if (isValidMove(-1, 0)) {
    currentPosition.value.x--
  }
}

const moveRight = () => {
  if (!isGameStarted.value || isGameOver.value || !currentPiece.value) return
  if (isValidMove(1, 0)) {
    currentPosition.value.x++
  }
}

const rotatePiece = () => {
  if (!isGameStarted.value || isGameOver.value || !currentPiece.value) return

  const rotated = []
  for (let y = 0; y < currentPiece.value.shape[0].length; y++) {
    const newRow = []
    for (let x = currentPiece.value.shape.length - 1; x >= 0; x--) {
      newRow.push(currentPiece.value.shape[x][y])
    }
    rotated.push(newRow)
  }

  if (isValidMove(0, 0, rotated)) {
    currentPiece.value.shape = rotated
    currentPiece.value.width = rotated[0].length
    currentPiece.value.height = rotated.length
  }
}

const lockPiece = () => {
  if (!currentPiece.value) return

  const newGrid = grid.value.map((row) => [...row])

  for (let y = 0; y < currentPiece.value.shape.length; y++) {
    for (let x = 0; x < currentPiece.value.shape[y].length; x++) {
      if (currentPiece.value.shape[y][x] !== EMPTY_CELL) {
        const gridY = currentPosition.value.y + y
        const gridX = currentPosition.value.x + x

        if (gridY >= 0 && gridY < GRID_HEIGHT) {
          newGrid[gridY][gridX] = currentPiece.value.shape[y][x]
        }
      }
    }
  }

  grid.value = newGrid
}

const clearRows = () => {
  let rowsCleared = 0

  for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
    if (grid.value[y].every((cell) => cell !== EMPTY_CELL)) {
      // Remove the completed row
      grid.value.splice(y, 1)
      // Add new empty row at the top
      const newRow = Array(GRID_WIDTH).fill(EMPTY_CELL)
      grid.value.unshift(newRow)

      rowsCleared++
      y++ // Check the same row again after shifting
    }
  }

  if (rowsCleared > 0) {
    // Update score based on number of rows cleared at once
    const points = [0, 40, 100, 300, 1200][rowsCleared] * level.value
    score.value += points
    linesCleared.value += rowsCleared

    // Increase level every 10 lines
    if (Math.floor(linesCleared.value / 10) + 1 > level.value) {
      level.value = Math.floor(linesCleared.value / 10) + 1
      // Update game speed based on level
      clearInterval(gameInterval.value)
      gameInterval.value = setInterval(moveDown, gameSpeed.value)
    }
  }
}

const hardDrop = async () => {
  if (!isGameStarted.value || isGameOver.value || !currentPiece.value) return

  stopGameLoop()

  let distance = 0
  while (isValidMove(0, distance + 1)) {
    distance++
  }

  currentPosition.value.y += distance
  lockPiece()
  clearRows()

  await nextTick()
  createNewPiece()
  startGameLoop()
}

const handleKeydown = (e) => {
  if (!isGameStarted.value || isGameOver.value) return

  if (e.key === ' ') {
    e.preventDefault()
  }

  switch (e.key) {
    case 'ArrowLeft':
      moveLeft()
      break
    case 'ArrowRight':
      moveRight()
      break
    case 'ArrowDown':
      moveDown()
      break
    case 'ArrowUp':
      rotatePiece()
      break
    case 'c':
    case 'shift':
      holdCurrentPiece()
      break
    case ' ':
      hardDrop()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (gameInterval.value) clearInterval(gameInterval.value)
})
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-8 px-4">
    <h2
      class="text-3xl font-black text-black rotate-1 transform"
      style="text-shadow: 3px 3px 0 #ff00aa"
    >
      Tetris
    </h2>

    <!-- Game controls -->
    <div class="flex gap-4 mb-4">
      <button
        @click="startGame"
        class="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg border-4 border-black transform rotate-1 hover:translate-y-1 transition-transform shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
      >
        {{ isGameStarted ? 'Restart' : 'Start Game' }}
      </button>
    </div>

    <!-- Game instructions -->
    <div
      v-if="!isGameStarted"
      class="hidden sm:block mt-4 text-center text-black dark:text-white text-sm font-bold"
    >
      <p class="rotate-1 transform">Press Start to begin the game</p>
      <p class="mt-2 -rotate-1 transform">Controls:</p>
      <p class="rotate-1 transform">← → : Move left/right</p>
      <p class="-rotate-1 transform">↓ : Move down</p>
      <p class="rotate-1 transform">↑ : Rotate</p>
      <p class="-rotate-1 transform">Space : Hard drop</p>
    </div>

    <!-- Game stats -->
    <div class="flex gap-6 text-center">
      <div
        class="bg-pink-400 p-3 border-4 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] rotate-1 transform"
      >
        <div class="text-sm text-black font-bold">Score</div>
        <div class="font-mono text-lg font-black">{{ score }}</div>
      </div>
      <div
        class="bg-cyan-400 p-3 border-4 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] -rotate-1 transform"
      >
        <div class="text-sm text-black font-bold">Level</div>
        <div class="font-mono text-lg font-black">{{ level }}</div>
      </div>
      <div
        class="bg-green-400 p-3 border-4 border-black rounded-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] rotate-2 transform"
      >
        <div class="text-sm text-black font-bold">Lines</div>
        <div class="font-mono text-lg font-black">{{ linesCleared }}</div>
      </div>
    </div>

    <!-- Game section -->
    <div v-if="isGameStarted" class="flex gap-8 items-start">
      <!-- Hold Piece -->
      <div class="text-center">
        <div class="text-sm mb-2 font-bold">Hold</div>
        <div
          class="border-4 border-black bg-purple-200 dark:bg-purple-800 p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)] rotate-1 transform"
          style="width: 100px; height: 100px"
        >
          <div v-if="holdPiece" class="relative w-full h-full mt-4">
            <div
              v-for="(row, y) in holdPiece.shape"
              :key="`hold-row-${y}`"
              class="absolute flex border-none"
              :style="`
            top: ${y * 25}%;
            left: ${(4 - holdPiece.shape[0].length) * 12.5}%;
            width: 100%;
            height: 100%;
          `"
            >
              <div
                v-for="(cell, x) in row"
                :key="`hold-cell-${x}-${y}`"
                :class="
                  cell !== EMPTY_CELL ? `${holdPiece.color} border-2 border-black` : 'border-none'
                "
                style="width: 25%; height: 25%"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Game board -->
      <div
        class="relative border-4 border-black dark:border-black bg-gray-100 dark:bg-gray-800 focus:outline-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] transform"
        :style="`width: ${GRID_WIDTH * CELL_SIZE}px; height: ${GRID_HEIGHT * CELL_SIZE}px;`"
        tabindex="0"
        ref="gameBoard"
      >
        <!-- Static grid cells -->
        <div v-for="(row, y) in grid" :key="`row-${y}`" class="flex">
          <div
            v-for="(cell, x) in row"
            :key="`cell-${x}-${y}`"
            class="border border-black"
            :class="
              cell !== EMPTY_CELL
                ? TETROMINOS[Object.keys(TETROMINOS)[cell - 1]].color
                : 'bg-transparent'
            "
            :style="`width: ${CELL_SIZE}px; height: ${CELL_SIZE}px;`"
          ></div>
        </div>

        <!-- ghost piece -->
        <div v-if="ghostPosition && currentPiece && isGameStarted && !isGameOver">
          <div
            v-for="(row, y) in currentPiece.shape"
            :key="`ghost-row-${y}`"
            class="absolute flex pointer-events-none"
            :style="`
            top: ${(ghostPosition.y + y) * CELL_SIZE}px;
            left: ${ghostPosition.x * CELL_SIZE}px;
          `"
          >
            <div
              v-for="(cell, x) in row"
              :key="`ghost-cell-${x}-${y}`"
              :class="
                cell !== EMPTY_CELL ? [ghostPosition.color, 'border-2 border-black opacity-50'] : ''
              "
              :style="`
              width: ${CELL_SIZE}px;
              height: ${CELL_SIZE}px;
              visibility: ${cell !== EMPTY_CELL ? 'visible' : 'hidden'};
            `"
            ></div>
          </div>
        </div>

        <!-- Current active piece -->
        <div v-if="currentPiece && isGameStarted && !isGameOver">
          <div
            v-for="(row, y) in currentPiece.shape"
            :key="`piece-row-${y}`"
            class="absolute flex"
            :style="`top: ${(currentPosition.y + y) * CELL_SIZE}px; left: ${currentPosition.x * CELL_SIZE}px;`"
          >
            <div
              v-for="(cell, x) in row"
              :key="`piece-cell-${x}-${y}`"
              :class="cell !== EMPTY_CELL ? [currentPiece.color, 'border-2 border-black'] : ''"
              :style="`
            width: ${CELL_SIZE}px;
            height: ${CELL_SIZE}px;
            visibility: ${cell !== EMPTY_CELL ? 'visible' : 'hidden'};
          `"
            ></div>
          </div>
        </div>

        <!-- Game over overlay -->
        <div
          v-if="isGameOver"
          class="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center border-4 border-black"
        >
          <div
            class="text-white text-center p-6 bg-red-500 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rotate-2 transform"
          >
            <h3 class="text-2xl font-black mb-2">Game Over</h3>
            <p class="font-bold">Score: {{ score }}</p>
            <button
              @click="startGame"
              class="mt-4 px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg border-4 border-black hover:translate-y-1 transition-transform shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>

      <!-- Next Piece -->
      <div class="text-center flex flex-col items-center">
        <div class="text-sm mb-2 font-bold">Next</div>
        <div
          class="border-4 border-black bg-orange-200 dark:bg-orange-800 p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)] -rotate-1 transform"
          style="width: 100px; height: 100px"
        >
          <div v-if="nextPiece" class="relative w-full h-full mt-4">
            <div
              v-for="(row, y) in nextPiece.shape"
              :key="`next-row-${y}`"
              class="absolute flex border-none"
              :style="`
            top: ${y * 25}%;
            left: ${(4 - nextPiece.shape[0].length) * 12.5}%;
            width: 100%;
            height: 100%;
          `"
            >
              <div
                v-for="(cell, x) in row"
                :key="`next-cell-${x}-${y}`"
                :class="
                  cell !== EMPTY_CELL ? `${nextPiece.color} border-2 border-black` : 'border-none'
                "
                style="width: 25%; height: 25%"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Mobile controls -->
    <div class="grid grid-cols-3 gap-2 w-48 mt-4 md:hidden">
      <div></div>
      <button
        @click="rotatePiece"
        class="p-3 bg-pink-400 text-black font-bold rounded border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 transition-transform"
      >
        ↻
      </button>
      <div></div>
      <button
        @click="moveLeft"
        class="p-3 bg-blue-400 text-black font-bold rounded border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 transition-transform"
      >
        ←
      </button>
      <button
        @click="hardDrop"
        class="p-3 bg-yellow-400 text-black font-bold rounded border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 transition-transform"
      >
        ↓↓
      </button>
      <button
        @click="moveRight"
        class="p-3 bg-green-400 text-black font-bold rounded border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 transition-transform"
      >
        →
      </button>
      <div></div>
      <button
        @click="moveDown"
        class="p-3 bg-purple-400 text-black font-bold rounded border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 transition-transform"
      >
        ↓
      </button>
      <div></div>
    </div>
  </div>
</template>

<style scoped>
.piece-preview {
  position: relative;
  aspect-ratio: 1;
}

.preview-cell {
  width: 25%;
  height: 25%;
  border: 2px solid black;
}

.bg-cyan-400 {
  background-color: #22d3ee;
}

.bg-red-500 {
  background-color: #ff3e3e;
}
.bg-orange-500 {
  background-color: #ff7a00;
}
.bg-yellow-500 {
  background-color: #ffdc00;
}
.bg-green-500 {
  background-color: #00cc66;
}
.bg-blue-500 {
  background-color: #0099ff;
}
.bg-indigo-500 {
  background-color: #5d00ff;
}
.bg-purple-500 {
  background-color: #9900ff;
}
.bg-pink-500 {
  background-color: #ff00aa;
}
</style>
