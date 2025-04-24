import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/game/snake',
      name: 'snake',
      component: () => import('../components/games/SnakeGame.vue'),
    },
    {
      path: '/game/memory',
      name: 'memory',
      component: () => import('../components/games/MemoryGame.vue'),
    },
    {
      path: '/game/tictactoe',
      name: 'tictactoe',
      component: () => import('../components/games/TicTacToeGame.vue'),
    },
    {
      path: '/game/tetris',
      name: 'tetris',
      component: () => import('../components/games/TetrisGame.vue'),
    },
    // {
    //   path: '/game/test',
    //   name: 'test',
    //   component: () => import('../components/games/TestGame.vue'),
    // },
  ],
})

export default router
