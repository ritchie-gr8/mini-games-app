export const GRID_WIDTH = 10
export const GRID_HEIGHT = 20
export const CELL_SIZE = 30
export const EMPTY_CELL = 0

export const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: 'bg-cyan-500',
  },
  O: {
    shape: [
      [2, 2],
      [2, 2],
    ],
    color: 'bg-yellow-500',
  },
  T: {
    shape: [
      [0, 3, 0],
      [3, 3, 3],
      [0, 0, 0],
    ],
    color: 'bg-purple-500',
  },
  S: {
    shape: [
      [0, 4, 4],
      [4, 4, 0],
      [0, 0, 0],
    ],
    color: 'bg-green-500',
  },
  Z: {
    shape: [
      [5, 5, 0],
      [0, 5, 5],
      [0, 0, 0],
    ],
    color: 'bg-red-500',
  },
  J: {
    shape: [
      [6, 0, 0],
      [6, 6, 6],
      [0, 0, 0],
    ],
    color: 'bg-blue-500',
  },
  L: {
    shape: [
      [0, 0, 7],
      [7, 7, 7],
      [0, 0, 0],
    ],
    color: 'bg-orange-500',
  },
}
