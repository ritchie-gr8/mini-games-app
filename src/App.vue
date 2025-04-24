<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen transition-colors duration-300">
    <div class="bg-blue-100 min-h-screen text-gray-900 dark:text-white">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
