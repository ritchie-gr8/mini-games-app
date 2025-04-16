<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

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

const gameOver = () => {
  isRunning.value = false
  clearInterval(gameInterval.value)
  resetGame()
  alert('Game Over!')
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
  <div class="flex flex-col items-center gap-4">
    <h2 class="text-xl font-semibold mt-16">Snake</h2>

    <div
      ref="gameBoard"
      class="border-2 border-gray-400 dark:border-gray-600 relative"
      :style="`width: ${boardSize}px; height: ${boardSize}px;`"
    >
      <!-- Snake segments -->
      <div
        v-for="(segment, index) in snake"
        :key="index"
        class="absolute bg-green-500 rounded-sm"
        :style="`
          width: ${cellSize - 2}px;
          height: ${cellSize - 2}px;
          left: ${segment.x * cellSize + 1}px;
          top: ${segment.y * cellSize + 1}px;
        `"
      ></div>

      <!-- Food -->
      <div
        class="absolute bg-red-500 rounded-full"
        :style="`
          width: ${cellSize - 2}px;
          height: ${cellSize - 2}px;
          left: ${food.x * cellSize + 1}px;
          top: ${food.y * cellSize + 1}px;
        `"
      ></div>
    </div>

    <div class="flex items-center gap-4">
      <div class="text-lg">Score: {{ score }}</div>
      <button
        @click="startGame"
        class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        {{ isRunning ? 'Restart' : 'Start' }}
      </button>
    </div>

    <!-- Mobile controls -->
    <div class="grid grid-cols-3 gap-2 w-48 mt-4 md:hidden">
      <div></div>
      <button @click="changeDirection('up')" class="p-2 bg-gray-200 dark:bg-gray-700 rounded">
        ↑
      </button>
      <div></div>
      <button @click="changeDirection('left')" class="p-2 bg-gray-200 dark:bg-gray-700 rounded">
        ←
      </button>
      <div></div>
      <button @click="changeDirection('right')" class="p-2 bg-gray-200 dark:bg-gray-700 rounded">
        →
      </button>
      <div></div>
      <button @click="changeDirection('down')" class="p-2 bg-gray-200 dark:bg-gray-700 rounded">
        ↓
      </button>
      <div></div>
    </div>
  </div>
</template>
