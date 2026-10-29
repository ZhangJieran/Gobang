import { BOARD_SIZE, type Board, type Point, type Stone } from '../types'

// 四个方向
const DIRECTIONS: Point[] = [
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
  { row: 1, col: -1 },
]

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

// 棋型评分权重
const SCORE = {
  FIVE: 100000, // 连五
  OPEN_FOUR: 10000, // 活四
  FOUR: 1000, // 冲四
  OPEN_THREE: 1000, // 活三
  THREE: 100, // 眠三
  OPEN_TWO: 100, // 活二
  TWO: 10, // 眠二
}

/**
 * 获取某方向上以 (row, col) 为中心的线段
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
 * 评估某条线段中指定棋色的得分
 * stone: 'B' 或 'W'
 */
function scoreLine(line: string, stone: 'B' | 'W'): number {
  const other = stone === 'B' ? 'W' : 'B'
  // 将对方棋子和边界视为阻挡 'X'，空位为 '.'，己方为 'S'
  const normalized = line
    .split('')
    .map((ch) => {
      if (ch === stone) return 'S'
      if (ch === other || ch === '#') return 'X'
      return '.'
    })
    .join('')

  let score = 0

  // 连五 SSSSS
  if (normalized.includes('SSSSS')) return SCORE.FIVE

  // 活四 .SSSS.
  if (normalized.includes('.SSSS.')) score += SCORE.OPEN_FOUR

  // 冲四（四连一端被堵，或跳四）
  // XSSSS. 或 .SSSSX
  if (normalized.includes('XSSSS.') || normalized.includes('.SSSSX')) score += SCORE.FOUR
  // 跳四: SSS.S, SS.SS, S.SSS
  if (/S\.SSS|SS\.SS|SSS\.S/.test(normalized)) score += SCORE.FOUR

  // 活三 .SSS.  以及跳活三 .S.SS. / .SS.S.
  if (normalized.includes('.SSS.')) score += SCORE.OPEN_THREE
  if (normalized.includes('.S.SS.') || normalized.includes('.SS.S.')) score += SCORE.OPEN_THREE

  // 眠三（三连一端被堵）
  if (normalized.includes('XSSS.') || normalized.includes('.SSSX')) score += SCORE.THREE
  // 跳眠三
  if (/X\.SS\.S|S\.SS\.X|XS\.SS\.|\.SS\.SX/.test(normalized)) score += SCORE.THREE

  // 活二 .SS.
  if (normalized.includes('.SS.')) score += SCORE.OPEN_TWO
  // 跳活二 .S.S.
  if (normalized.includes('.S.S.')) score += SCORE.OPEN_TWO

  // 眠二
  if (normalized.includes('XSS.') || normalized.includes('.SSX')) score += SCORE.TWO

  return score
}

/**
 * 评估在 (row, col) 落指定棋子后的总分（四个方向之和）
 */
export function evaluatePoint(board: Board, row: number, col: number, stone: Stone): number {
  const testBoard = board.map((r) => [...r])
  testBoard[row][col] = stone
  const ch = stone === 1 ? 'B' : 'W'

  let total = 0
  for (const dir of DIRECTIONS) {
    const line = getLine(testBoard, row, col, dir)
    total += scoreLine(line, ch)
  }
  return total
}

/**
 * 获取 AI 候选落子点：仅考虑已有棋子周围两格内的空位
 * 以减少计算量
 */
function getCandidatePoints(board: Board): Point[] {
  const candidates = new Set<string>()
  let hasStone = false

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== 0) {
        hasStone = true
        // 周围两格
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const r = row + dr
            const c = col + dc
            if (inBounds(r, c) && board[r][c] === 0) {
              candidates.add(`${r},${c}`)
            }
          }
        }
      }
    }
  }

  if (!hasStone) {
    // 空棋盘，下天元
    return [{ row: 7, col: 7 }]
  }

  return Array.from(candidates).map((s) => {
    const [r, c] = s.split(',').map(Number)
    return { row: r, col: c }
  })
}

/**
 * AI 选择落子位置
 * 综合进攻分（己方白棋）和防守分（对方黑棋）
 */
export function chooseAiMove(board: Board): Point | null {
  const candidates = getCandidatePoints(board)
  if (candidates.length === 0) return null

  let bestPoint = candidates[0]
  let bestScore = -Infinity

  for (const p of candidates) {
    // 进攻分：白棋在此落子的得分
    const offense = evaluatePoint(board, p.row, p.col, 2)
    // 防守分：黑棋在此落子的得分（阻止对方）
    const defense = evaluatePoint(board, p.row, p.col, 1)

    // 进攻略优先，但要防守对方的威胁
    const score = offense * 1.1 + defense
    if (score > bestScore) {
      bestScore = score
      bestPoint = p
    }
  }

  return bestPoint
}
