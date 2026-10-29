import { BOARD_SIZE, type Board, type Point } from '../types'

// 四个方向：横、竖、主对角线、副对角线
const DIRECTIONS: Point[] = [
  { row: 0, col: 1 }, // 横
  { row: 1, col: 0 }, // 竖
  { row: 1, col: 1 }, // 主对角
  { row: 1, col: -1 }, // 副对角
]

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

/**
 * 判断在 (row, col) 落子后是否形成五连（胜）
 * 统计落子点四个方向上的连续同色棋子数
 */
export function checkWin(board: Board, row: number, col: number): boolean {
  const stone = board[row][col]
  if (stone === 0) return false

  for (const dir of DIRECTIONS) {
    let count = 1
    // 正方向
    let r = row + dir.row
    let c = col + dir.col
    while (inBounds(r, c) && board[r][c] === stone) {
      count++
      r += dir.row
      c += dir.col
    }
    // 反方向
    r = row - dir.row
    c = col - dir.col
    while (inBounds(r, c) && board[r][c] === stone) {
      count++
      r -= dir.row
      c -= dir.col
    }
    if (count >= 5) return true
  }
  return false
}

/**
 * 判断棋盘是否已满（平局）
 */
export function isBoardFull(board: Board): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 0) return false
    }
  }
  return true
}

/**
 * 获取某方向上以 (row, col) 为中心的线段（用于棋型分析）
 * 返回字符数组：'B'黑 'W'白 '.'空，越界用 '#' 表示
 */
function getLine(board: Board, row: number, col: number, dir: Point, radius = 5): string {
  const cells: string[] = []
  for (let i = -radius; i <= radius; i++) {
    const r = row + i * dir.row
    const c = col + i * dir.col
    if (!inBounds(r, c)) {
      cells.push('#')
    } else {
      const s = board[r][c]
      cells.push(s === 1 ? 'B' : s === 2 ? 'W' : '.')
    }
  }
  return cells.join('')
}

/**
 * 检查某方向上是否存在"四"（4连且可补成5）
 * 在线段中查找包含中心位置的 4 连黑子，且至少一端有空位可补 5
 */
function hasFour(line: string): boolean {
  const center = Math.floor(line.length / 2)
  // 中心必须是黑子
  if (line[center] !== 'B') return false

  // 向左右扩展连续黑子
  let left = center
  let right = center
  while (left > 0 && line[left - 1] === 'B') left--
  while (right < line.length - 1 && line[right + 1] === 'B') right++

  const runLen = right - left + 1
  if (runLen !== 4) return false

  // 四连的两端至少有一端是空位（可补成5）
  const leftOpen = left > 0 && line[left - 1] === '.'
  const rightOpen = right < line.length - 1 && line[right + 1] === '.'
  return leftOpen || rightOpen
}

/**
 * 检查某方向上是否存在"活三"（可形成活四的三）
 * 活四 = 4连黑子两端均为空
 * 活三形态：
 *   .BBB.   （连三两端空）
 *   .B.BB.  （跳三，中间隔一空，补后成连四）
 *   .BB.B.  （跳三）
 */
function hasOpenThree(line: string): boolean {
  const center = Math.floor(line.length / 2)
  if (line[center] !== 'B') return false

  // 形态1: .BBB.  中心在三连中的任意位置
  // 查找包含中心的 BBB 且两端为 .
  for (let start = center - 2; start <= center; start++) {
    if (start < 0 || start + 2 >= line.length) continue
    if (
      line[start] === 'B' &&
      line[start + 1] === 'B' &&
      line[start + 2] === 'B' &&
      start > 0 &&
      line[start - 1] === '.' &&
      start + 3 < line.length &&
      line[start + 3] === '.'
    ) {
      return true
    }
  }

  // 形态2: 跳三 .B.BB. 或 .BB.B.  中心参与其中
  // 检测 .B.BB. 模式（位置 i,i+1,i+2,i+3,i+4,i+5 = .,B,.,B,B,.）
  for (let i = center - 5; i <= center; i++) {
    if (i < 0 || i + 5 >= line.length) continue
    const seg = line.substring(i, i + 6)
    if (seg === '.B.BB.' || seg === '.BB.B.') {
      // 确认中心黑子在这个跳三内
      const centerInSeg = center - i
      if (seg[centerInSeg] === 'B') return true
    }
  }

  return false
}

/**
 * 检查黑棋在 (row, col) 落子是否为禁手
 * 返回 true 表示禁手
 * 禁手类型：长连（6+连）、三三（双活三）、四四（双四）
 */
export function isForbiddenMove(board: Board, row: number, col: number): boolean {
  // 模拟落黑子
  const testBoard = board.map((r) => [...r])
  testBoard[row][col] = 1

  let fourCount = 0
  let openThreeCount = 0

  for (const dir of DIRECTIONS) {
    const line = getLine(testBoard, row, col, dir)

    // 长连禁手：6连及以上
    let runLen = 1
    let i = 1
    while (line[Math.floor(line.length / 2) + i] === 'B') {
      runLen++
      i++
    }
    i = 1
    while (line[Math.floor(line.length / 2) - i] === 'B') {
      runLen++
      i++
    }
    if (runLen >= 6) return true // 长连禁手

    if (hasFour(line)) fourCount++
    if (hasOpenThree(line)) openThreeCount++
  }

  if (fourCount >= 2) return true // 四四禁手
  if (openThreeCount >= 2) return true // 三三禁手

  return false
}

/**
 * 获取黑棋所有禁手点
 */
export function getForbiddenPoints(board: Board): Point[] {
  const points: Point[] = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== 0) continue
      if (isForbiddenMove(board, row, col)) {
        points.push({ row, col })
      }
    }
  }
  return points
}
