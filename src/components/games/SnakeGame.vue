<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import BackButton from '../BackButton.vue'

const cellSize = 20
const gridSize = 15
const boardSize = cellSize * gridSize
const gameSpeed = ref(150)

const snake = ref([{ x: 7, y: 7 }])
const food = ref([{ x: 3, y: 3 }])
const direction = ref('right')
const nextDirection = ref('right')
const isRunning = ref(false)
const score = ref(0)
const gameInterval = ref(null)

const startGame = () => {
  placeFood()

  clearInterval(gameInterval.value)

  isRunning.value = true
  gameInterval.value = setInterval(gameLoop, gameSpeed.value)
}

const resetGame = () => {
  snake.value = [{ x: 7, y: 7 }]
  food.value = [{ x: 3, y: 3 }]
  gameSpeed.value = 150
  nextDirection.value = 'right'
  score.value = 0
}

const gameLoop = () => {
  direction.value = nextDirection.value

  const head = { ...snake.value[0] }
  switch (direction.value) {
    case 'up':
      head.y--
      break
    case 'down':
      head.y++
      break
    case 'left':
      head.x--
      break
    case 'right':
      head.x++
      break
  }

  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    gameOver()
    return
  }

  if (snake.value.some((s) => s.x === head.x && s.y === head.y)) {
    gameOver()
    return
  }

  snake.value.unshift(head)

  if (head.x === food.value.x && head.y === food.value.y) {
    score.value += 10

    if (gameSpeed.value > 50) {
      gameSpeed.value -= 5
      clearInterval(gameInterval.value)
      gameInterval.value = setInterval(gameLoop, gameSpeed.value)
    }

    placeFood()
  } else {
    snake.value.pop()
  }
}

const placeFood = () => {
  let newFood
  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    }
  } while (snake.value.some((s) => s.x === newFood.x && s.y === newFood.y))
  food.value = newFood
}

const changeDirection = (newDirection) => {
  if (
    (newDirection === 'up' && direction.value === 'down') ||
    (newDirection === 'down' && direction.value === 'up') ||
    (newDirection === 'left' && direction.value === 'right') ||
    (newDirection === 'right' && direction.value === 'left')
  ) {
    return
  }

  nextDirection.value = newDirection
}

const showGameOver = ref(false)
const finalScore = ref(0)

const gameOver = () => {
  isRunning.value = false
  clearInterval(gameInterval.value)
  finalScore.value = score.value
  showGameOver.value = true
}

const handleClose = () => {
  showGameOver.value = false
  resetGame()
}

const handleRestart = () => {
  showGameOver.value = false
  resetGame()
  startGame()
}

const handleKeydown = (e) => {
  switch (e.code) {
    case 'ArrowUp':
    case 'KeyW':
      changeDirection('up')
      break
    case 'ArrowDown':
    case 'KeyS':
      changeDirection('down')
      break
    case 'ArrowLeft':
    case 'KeyA':
      changeDirection('left')
      break
    case 'ArrowRight':
    case 'KeyD':
      changeDirection('right')
      break
    case 'Space':
      startGame()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  placeFood()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (gameInterval.value) clearInterval(gameInterval.value)
})
</script>

<template>
  <div class="flex flex-col items-center gap-6 py-8">
    <BackButton />
    <h2
      class="text-3xl font-black text-black transform -rotate-2"
      style="text-shadow: 3px 3px 0 #ff00aa"
    >
      SNAKE GAME
    </h2>

    <div
      ref="gameBoard"
      class="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative"
      :style="`width: ${boardSize}px; height: ${boardSize}px;`"
    >
      <!-- Snake segments -->
      <div
        v-for="(segment, index) in snake"
        :key="index"
        class="absolute bg-green-600 border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
        :style="`
          width: ${cellSize - 2}px;
          height: ${cellSize - 2}px;
          left: ${segment.x * cellSize + 1}px;
          top: ${segment.y * cellSize + 1}px;
        `"
      ></div>

      <!-- Food -->
      <div
        class="absolute bg-red-500 border-3 border-black rounded-full shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
        :style="`
          width: ${cellSize - 2}px;
          height: ${cellSize - 2}px;
          left: ${food.x * cellSize + 1}px;
          top: ${food.y * cellSize + 1}px;
        `"
      ></div>
    </div>

    <div class="flex flex-col items-center gap-6 w-full max-w-md">
      <div class="flex items-center gap-6">
        <div
          class="bg-yellow-400 px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rotate-1"
        >
          <span class="text-black font-bold text-xl">SCORE: {{ score }}</span>
        </div>
        <button
          @click="startGame"
          class="cursor-pointer px-6 py-2 bg-yellow-400 text-black font-bold rounded border-4 border-black transform rotate-1 hover:translate-y-1 transition-transform shadow-[5px_5px_0_0_rgba(0,0,0,1)]"
        >
          {{ isRunning ? 'RESTART' : 'START' }}
        </button>
      </div>

      <div
        class="hidden md:block bg-yellow-100 text-black p-4 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] w-full"
      >
        <h3 class="font-black text-lg mb-2 text-center">HOW TO PLAY</h3>
        <div class="text-center">
          <p class="font-bold">Keyboard Controls:</p>
          <ul class="pl-5 space-y-1">
            <li>↑ or W: Move Up</li>
            <li>↓ or S: Move Down</li>
            <li>← or A: Move Left</li>
            <li>→ or D: Move Right</li>
            <li>Space: Start/Restart</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Game Over Modal -->
    <div
      v-if="showGameOver"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <div
        class="relative text-gray-100 bg-yellow-400 p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] max-w-md w-full mx-4"
      >
        <button
          @click="handleClose"
          class="absolute cursor-pointer text-black top-2 right-3 text-2xl font-bold hover:scale-110 transition-transform"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-x-icon lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <h2
          class="text-3xl text-black font-bold text-center mb-4"
          style="text-shadow: 3px 3px 0 #ff00aa"
        >
          GAME OVER
        </h2>
        <p class="text-xl text-center mb-6 text-black">
          Your score: <span class="font-bold">{{ finalScore }}</span>
        </p>
        <div class="flex justify-center gap-4">
          <button
            @click="handleClose"
            class="cursor-pointer px-6 py-2 bg-gray-200 text-black font-bold rounded border-4 border-black transform hover:translate-y-1 transition-transform shadow-[5px_5px_0_0_rgba(0,0,0,1)] hover:bg-gray-300"
          >
            CLOSE
          </button>
          <button
            @click="handleRestart"
            class="cursor-pointer px-6 py-2 bg-yellow-400 text-black font-bold rounded border-4 border-black transform hover:translate-y-1 transition-transform shadow-[5px_5px_0_0_rgba(0,0,0,1)] hover:bg-yellow-500"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile controls -->
    <div
      class="grid grid-cols-3 gap-3 w-64 mt-4 md:hidden p-4 bg-pink-200 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
    >
      <div></div>
      <button
        @click="changeDirection('up')"
        class="p-3 bg-pink-400 border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-y-1 transform rotate-1"
      >
        ↑
      </button>
      <div></div>
      <button
        @click="changeDirection('left')"
        class="p-3 bg-pink-400 border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-y-1 transform -rotate-1"
      >
        ←
      </button>
      <div></div>
      <button
        @click="changeDirection('right')"
        class="p-3 bg-pink-400 border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-y-1 transform rotate-2"
      >
        →
      </button>
      <div></div>
      <button
        @click="changeDirection('down')"
        class="p-3 bg-pink-400 border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-y-1 transform -rotate-2"
      >
        ↓
      </button>
      <div></div>
    </div>
  </div>
</template>
