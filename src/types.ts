// 棋子类型：0=空，1=黑，2=白
export type Stone = 0 | 1 | 2

// 棋盘：15x15 二维数组
export type Board = Stone[][]

// 落子记录
export interface Move {
  row: number
  col: number
  stone: Stone
}

// 游戏状态
export type GameStatus = 'playing' | 'black-win' | 'white-win' | 'draw'

// 坐标点
export interface Point {
  row: number
  col: number
}

// 棋盘大小
export const BOARD_SIZE = 15
