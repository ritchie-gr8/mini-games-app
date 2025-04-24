<script setup>
import { Worm, Search, Fingerprint, Grid, Package } from 'lucide-vue-next'
import { computed } from 'vue'

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
</template>
