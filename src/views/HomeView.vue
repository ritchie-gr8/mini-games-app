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
  <main class="flex flex-col items-center justify-center min-h-screen p-4">
    <h1 class="text-2xl font-bold mb-16">Mini games</h1>

    <div class="grid grid-cols-3 gap-4">
      <GameIcon icon="snake" :active="activeGame === 'snake'" @click="navigateToGame('snake')" />
      <GameIcon icon="word" :active="activeGame === 'word'" @click="navigateToGame('word')" />
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
