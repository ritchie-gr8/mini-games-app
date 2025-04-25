<script setup>
import { Worm, Search, Grid, Blocks, Grip } from 'lucide-vue-next'
import { computed, ref } from 'vue'

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

const isHovered = ref(false)

const iconComponent = computed(() => {
  const iconMap = {
    memory: Search,
    connect4: Grip,
    snake: Worm,
    tictactoe: Grid,
    tetris: Blocks,
  }
  return iconMap[props.icon] || Search
})

const gameName = computed(() => {
  const nameMap = {
    memory: 'Memory',
    connect4: 'Connect 4',
    snake: 'Snake',
    tictactoe: 'Tic Tac Toe',
    tetris: 'Tetris',
  }
  return nameMap[props.icon] || props.icon
})
</script>

<template>
  <div class="relative">
    <div
      v-if="isHovered"
      class="absolute left-1/2 transform -translate-x-1/2 -top-9 bg-pink-400 px-3 py-1 rounded border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-bold text-black whitespace-nowrap text-sm z-10 pointer-events-none"
    >
      {{ gameName }}
    </div>

    <div
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      class="w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-300 bg-white border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] transform hover:translate-y-1"
      :class="{
        'bg-yellow-400 shadow-[5px_5px_0_0_rgba(0,0,0,1)] rotate-2': active,
        '-rotate-1': !active,
        'hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]': !active,
      }"
    >
      <component
        :is="iconComponent"
        class="size-8 stroke-2"
        :class="active ? 'stroke-black' : 'stroke-gray-800'"
      />
    </div>
  </div>
</template>
