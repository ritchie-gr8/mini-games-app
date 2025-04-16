<script setup>
import { computed } from 'vue'
import { Worm, Search, Fingerprint, Grid, Package } from 'lucide-vue-next'

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

const iconComponent = computed(() => {
  const iconMap = {
    memory: Search,
    word: Fingerprint,
    snake: Worm,
    tictactoe: Grid,
    tetris: Package,
  }

  return iconMap[props.icon] || Search
})
</script>

<template>
  <div
    class="w-16 h-16 flex items-center justify-center rounded-md cursor-pointer transition-all duration-300 bg-gray-200 dark:bg-gray-800"
    :class="{ 'ring-2 ring-yellow-400 ring-opacity-100 shadow-lg': active }"
  >
    <component :is="iconComponent" class="size-8" />
  </div>
</template>
