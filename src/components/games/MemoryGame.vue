<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { emojis } from '@/constant/emoji'

const difficulties = {
  easy: { gridSize: 4, name: 'Easy' },
  medium: { gridSize: 6, name: 'Medium' },
  hard: { gridSize: 8, name: 'Hard' },
}

const difficulty = ref('easy')
const gridSize = computed(() => difficulties[difficulty.value].gridSize)
const cards = ref([])
const flippedCards = ref([])
const matchedPairs = ref([])
const timer = ref(0)
const timerInterval = ref(null)
const isGameStarted = ref(false)
const isGameComplete = ref(false)
const moves = ref(0)

const cardSize = computed(() => {
  const containerSize = 320
  return Math.floor(containerSize / gridSize.value - 4)
})

const initGame = () => {
  resetGame()

  const pairsNeeded = Math.floor((gridSize.value * gridSize.value) / 2)
  const selectedEmojis = emojis.slice(0, pairsNeeded)

  let cardArray = []
  selectedEmojis.forEach((emoji) => {
    cardArray.push({ emoji, isFlipped: false, isMatched: false })
    cardArray.push({ emoji, isFlipped: false, isMatched: false })
  })

  cards.value = shuffleArray(cardArray)
}

const shuffleArray = (array) => {
  let currentIndex = array.length
  let tempValue, randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    tempValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = tempValue
  }

  return array
}

const startTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value)
  timerInterval.value = setInterval(() => {
    timer.value++
  }, 1000)
}

const formattedTime = computed(() => {
  const min = Math.floor(timer.value / 60)
  const sec = timer.value % 60
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
})

const flipCard = (index) => {
  if (
    !isGameStarted.value ||
    flippedCards.value.length >= 2 ||
    cards.value[index].isFlipped ||
    cards.value[index].isMatched
  )
    return

  if (flippedCards.value.length === 0 && matchedPairs.value.length === 0) startTimer()

  cards.value[index].isFlipped = true
  flippedCards.value.push(index)

  if (flippedCards.value.length === 2) {
    moves.value++
    const [first, second] = flippedCards.value

    if (cards.value[first].emoji === cards.value[second].emoji) {
      cards.value[first].isMatched = true
      cards.value[second].isMatched = true
      matchedPairs.value.push(cards.value[first].emoji)
      flippedCards.value = []

      if (matchedPairs.value.length === Math.floor((gridSize.value * gridSize.value) / 2)) {
        gameComplete()
      }
    } else {
      setTimeout(() => {
        cards.value[first].isFlipped = false
        cards.value[second].isFlipped = false
        flippedCards.value = []
      }, 1000)
    }
  }
}

const gameComplete = () => {
  isGameComplete.value = true
  clearInterval(timerInterval.value)
}

const startGame = () => {
  initGame()
  isGameStarted.value = true
  isGameComplete.value = false
  startTimer()
}

const resetGame = () => {
  flippedCards.value = []
  matchedPairs.value = []
  moves.value = 0
  timer.value = 0
  isGameComplete.value = false
}

const changeDifficulty = (newDifficulty) => {
  if (isGameStarted.value && !isGameComplete.value) {
    if (!confirm('Are you sure you want to change the difficulty?')) return
  }

  difficulty.value = newDifficulty
  resetGame()
  clearInterval(timerInterval.value)
  isGameStarted.value = false
  initGame()
}

onMounted(() => initGame())

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value)
})

watch(difficulty, () => {
  initGame()
})
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-8 px-4">
    <h2 class="text-2xl font-bold">Emoji Memory Match</h2>

    <!-- Game controls -->
    <div class="flex flex-wrap justify-center gap-3 w-full mb-2">
      <div class="flex gap-2">
        <button
          v-for="(config, key) in difficulties"
          :key="key"
          @click="changeDifficulty(key)"
          class="px-3 py-1 rounded text-sm"
          :class="
            difficulty === key
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          "
        >
          {{ config.name }}
        </button>
      </div>

      <button
        @click="startGame"
        class="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
      >
        {{ isGameStarted && !isGameComplete ? 'Restart' : 'Start Game' }}
      </button>
    </div>

    <!-- Game stats -->
    <div class="flex gap-6 text-center">
      <div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Time</div>
        <div class="font-mono text-lg">{{ formattedTime }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Moves</div>
        <div class="font-mono text-lg">{{ moves }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Pairs</div>
        <div class="font-mono text-lg">
          {{ matchedPairs.length }} / {{ Math.floor((gridSize * gridSize) / 2) }}
        </div>
      </div>
    </div>

    <!-- Game board -->
    <div
      class="grid gap-1 bg-gray-100 dark:bg-gray-800 p-2 rounded border-2 border-gray-300 dark:border-gray-700"
      :style="{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        width: '340px',
        height: '340px',
      }"
    >
      <div
        v-for="(card, index) in cards"
        :key="index"
        @click="flipCard(index)"
        class="flex items-center justify-center cursor-pointer transition-all duration-300 transform"
        :class="{
          'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600':
            !card.isFlipped && !card.isMatched,
          'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700':
            card.isFlipped && !card.isMatched,
          'bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 opacity-70':
            card.isMatched,
          'hover:shadow-md': !card.isMatched && isGameStarted && !isGameComplete,
        }"
        :style="{
          width: `${cardSize}px`,
          height: `${cardSize}px`,
          fontSize: `${cardSize * 0.6}px`,
          transform: card.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }"
      >
        <span v-if="card.isFlipped || card.isMatched">{{ card.emoji }}</span>
        <span v-else class="text-gray-400 dark:text-gray-500">?</span>
      </div>
    </div>

    <!-- Game complete message -->
    <div
      v-if="isGameComplete"
      class="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-center"
    >
      <div class="font-bold text-lg">Congratulations!</div>
      <div>You completed the game in {{ formattedTime }} with {{ moves }} moves.</div>
    </div>

    <!-- Game instructions -->
    <div v-if="!isGameStarted" class="mt-4 text-center text-gray-600 dark:text-gray-400 text-sm">
      <p>Select a difficulty level and click "Start Game" to begin.</p>
      <p>Match all pairs of emojis to win!</p>
    </div>
  </div>
</template>

<style scoped></style>
