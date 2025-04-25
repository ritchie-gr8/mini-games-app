<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { emojis } from '@/constant/emoji'
import BackButton from '../BackButton.vue'

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
    <BackButton />
    <h2
      class="text-3xl font-black text-black transform -rotate-1"
      style="text-shadow: 3px 3px 0 #ff00aa"
    >
      Emoji Memory Match
    </h2>
    <!-- Game controls -->
    <div class="flex flex-wrap justify-center gap-3 w-full mb-4">
      <div class="flex gap-2">
        <button
          v-for="(config, key) in difficulties"
          :key="key"
          @click="changeDifficulty(key)"
          class="px-4 py-2 rounded font-bold text-black cursor-pointer border-3 border-black transform transition-transform hover:translate-y-1"
          :class="
            difficulty === key
              ? 'bg-pink-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] rotate-1'
              : 'bg-gray-200 dark:bg-gray-200 shadow-[3px_3px_0_0_rgba(0,0,0,1)] -rotate-1'
          "
        >
          {{ config.name }}
        </button>
      </div>
      <button
        @click="startGame"
        class="px-6 py-2 cursor-pointer bg-yellow-400 text-black font-bold rounded border-4 border-black transform rotate-1 hover:translate-y-1 transition-transform shadow-[5px_5px_0_0_rgba(0,0,0,1)]"
      >
        {{ isGameStarted && !isGameComplete ? 'Restart' : 'Start Game' }}
      </button>
    </div>
    <!-- Game stats -->
    <div class="flex gap-6 text-center">
      <div
        class="bg-cyan-400 p-3 border-4 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] rotate-1 transform"
      >
        <div class="text-sm text-black font-bold">Time</div>
        <div class="font-mono text-lg font-black">{{ formattedTime }}</div>
      </div>
      <div
        class="bg-green-400 p-3 border-4 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] -rotate-1 transform"
      >
        <div class="text-sm text-black font-bold">Moves</div>
        <div class="font-mono text-lg font-black">{{ moves }}</div>
      </div>
      <div
        class="bg-orange-400 p-3 border-4 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] rotate-2 transform"
      >
        <div class="text-sm text-black font-bold">Pairs</div>
        <div class="font-mono text-lg font-black">
          {{ matchedPairs.length }} / {{ Math.floor((gridSize * gridSize) / 2) }}
        </div>
      </div>
    </div>
    <!-- Game board -->
    <div
      class="grid gap-2 bg-blue-200 dark:bg-blue-800 p-4 rounded border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] transform"
      :style="{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        width: '360px',
        height: '380px',
      }"
    >
      <div
        v-for="(card, index) in cards"
        :key="index"
        @click="flipCard(index)"
        class="flex items-center justify-center cursor-pointer transition-all duration-300 transform border-3 border-black"
        :class="{
          'bg-white dark:bg-purple-200 shadow-[3px_3px_0_0_rgba(0,0,0,1)]':
            !card.isFlipped && !card.isMatched,
          'bg-pink-400 dark:bg-pink-400 shadow-[2px_2px_0_0_rgba(0,0,0,1)]':
            card.isFlipped && !card.isMatched,
          'bg-green-400 dark:bg-green-400 border-dashed': card.isMatched,
          'hover:translate-y-1 hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]':
            !card.isMatched && isGameStarted && !isGameComplete,
          'rotate-1': index % 3 === 0,
          '-rotate-1': index % 3 === 1,
          'rotate-0': index % 3 === 2,
        }"
        :style="{
          width: `${cardSize}px`,
          height: `${cardSize}px`,
          fontSize: `${cardSize * 0.6}px`,
          transform: card.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }"
      >
        <span v-if="card.isFlipped || card.isMatched">{{ card.emoji }}</span>
        <span v-else class="text-black dark:text-black font-bold">?</span>
      </div>
    </div>
    <!-- Game complete message -->
    <div
      v-if="isGameComplete"
      class="mt-4 p-6 bg-yellow-400 text-black font-bold rounded border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transform rotate-1 text-center"
    >
      <div class="font-black text-xl">Congratulations! 🎉</div>
      <div>You completed the game in {{ formattedTime }} with {{ moves }} moves.</div>
    </div>
    <!-- Game instructions -->
    <div v-if="!isGameStarted" class="mt-4 text-center text-black font-bold">
      <p class="transform rotate-1">Select a difficulty level and click "Start Game" to begin.</p>
      <p class="transform -rotate-1">Match all pairs of emojis to win!</p>
    </div>
  </div>
</template>

<style scoped>
/* Neo-brutalism custom colors */
.bg-cyan-400 {
  background-color: #22d3ee;
}

.bg-orange-400 {
  background-color: #fb923c;
}

.border-3 {
  border-width: 3px;
}

/* Card flip animation */
.transform {
  transition-property: transform, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
