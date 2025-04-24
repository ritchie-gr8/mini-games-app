<script setup>
import GameIcon from '@/components/GameIcon.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeGame = ref(null)

const navigateToGame = (game) => {
  activeGame.value = game
  router.push(`/game/${game}`)
}
</script>

<template>
  <main class="flex flex-col items-center justify-center min-h-screen p-4 bg-blue-100">
    <h1
      class="text-4xl font-black mb-12 text-black transform"
      style="text-shadow: 3px 3px 0 #ff00aa"
    >
      MINI GAMES
    </h1>

    <div
      class="grid grid-cols-3 gap-6 bg-pink-200 p-8 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
    >
      <GameIcon icon="snake" :active="activeGame === 'snake'" @click="navigateToGame('snake')" />
      <GameIcon icon="word" :active="activeGame === 'word'" @click="navigateToGame('test')" />
      <GameIcon icon="memory" :active="activeGame === 'memory'" @click="navigateToGame('memory')" />
      <GameIcon
        icon="tictactoe"
        :active="activeGame === 'tictactoe'"
        @click="navigateToGame('tictactoe')"
      />
      <GameIcon icon="tetris" :active="activeGame === 'tetris'" @click="navigateToGame('tetris')" />
    </div>
  </main>
</template>
