import { BOARD_SIZE, type Board, type Point } from '../types'

interface BoardProps {
  board: Board
  onCellClick: (row: number, col: number) => void
  lastMove: Point | null
  forbiddenPoints: Point[]
  disabled?: boolean
}

// 棋盘渲染尺寸
const CELL_SIZE = 40
const PADDING = 30
const BOARD_PX = (BOARD_SIZE - 1) * CELL_SIZE + PADDING * 2
const STONE_RADIUS = CELL_SIZE * 0.42

// 星位（天元 + 四角星）
const STAR_POINTS: Point[] = [
  { row: 3, col: 3 },
  { row: 3, col: 11 },
  { row: 7, col: 7 },
  { row: 11, col: 3 },
  { row: 11, col: 11 },
]

// 坐标转换：棋盘坐标 -> SVG 像素坐标
function toPixel(row: number, col: number) {
  return {
    x: PADDING + col * CELL_SIZE,
    y: PADDING + row * CELL_SIZE,
  }
}

export default function Board({
  board,
  onCellClick,
  lastMove,
  forbiddenPoints,
  disabled = false,
}: BoardProps) {
  // 生成网格线
  const gridLines = []
  for (let i = 0; i < BOARD_SIZE; i++) {
    const pos = PADDING + i * CELL_SIZE
    // 横线
    gridLines.push(
      <line
        key={`h-${i}`}
        x1={PADDING}
        y1={pos}
        x2={PADDING + (BOARD_SIZE - 1) * CELL_SIZE}
        y2={pos}
        stroke="#5c4033"
        strokeWidth={1}
      />,
    )
    // 竖线
    gridLines.push(
      <line
        key={`v-${i}`}
        x1={pos}
        y1={PADDING}
        x2={pos}
        y2={PADDING + (BOARD_SIZE - 1) * CELL_SIZE}
        stroke="#5c4033"
        strokeWidth={1}
      />,
    )
  }

  // 生成交叉点点击区域
  const clickAreas = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const { x, y } = toPixel(row, col)
      clickAreas.push(
        <rect
          key={`click-${row}-${col}`}
          x={x - CELL_SIZE / 2}
          y={y - CELL_SIZE / 2}
          width={CELL_SIZE}
          height={CELL_SIZE}
          fill="transparent"
          style={{ cursor: disabled ? 'default' : 'pointer' }}
          onClick={() => !disabled && onCellClick(row, col)}
        />,
      )
    }
  }

  // 生成棋子
  const stones = []
  let moveNumber = 0
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const stone = board[row][col]
      if (stone === 0) continue
      moveNumber++
      const { x, y } = toPixel(row, col)
      const isBlack = stone === 1
      const isLast = lastMove?.row === row && lastMove?.col === col
      stones.push(
        <g key={`stone-${row}-${col}`}>
          {/* 棋子阴影 */}
          <circle cx={x + 1.5} cy={y + 1.5} r={STONE_RADIUS} fill="rgba(0,0,0,0.3)" />
          {/* 棋子主体 */}
          <circle
            cx={x}
            cy={y}
            r={STONE_RADIUS}
            fill={isBlack ? 'url(#blackStone)' : 'url(#whiteStone)'}
            stroke={isBlack ? '#000' : '#a89878'}
            strokeWidth={0.5}
          />
          {/* 最后落子标记 */}
          {isLast && (
            <circle
              cx={x}
              cy={y}
              r={STONE_RADIUS * 0.35}
              fill="none"
              stroke={isBlack ? '#ff4444' : '#ff4444'}
              strokeWidth={2}
            />
          )}
          {/* 落子序号 */}
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={CELL_SIZE * 0.38}
            fontWeight="bold"
            fill={isBlack ? '#fff' : '#333'}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {moveNumber}
          </text>
        </g>,
      )
    }
  }

  // 禁手点标记
  const forbiddenMarkers = forbiddenPoints.map((p, i) => {
    const { x, y } = toPixel(p.row, p.col)
    const r = STONE_RADIUS * 0.35
    return (
      <g key={`forbidden-${i}`} style={{ pointerEvents: 'none' }}>
        <line x1={x - r} y1={y - r} x2={x + r} y2={y + r} stroke="#ff4444" strokeWidth={2} />
        <line x1={x + r} y1={y - r} x2={x - r} y2={y + r} stroke="#ff4444" strokeWidth={2} />
      </g>
    )
  })

  // 星位
  const starDots = STAR_POINTS.map((p, i) => {
    const { x, y } = toPixel(p.row, p.col)
    return <circle key={`star-${i}`} cx={x} cy={y} r={3.5} fill="#5c4033" />
  })

  return (
    <svg
      width={BOARD_PX}
      height={BOARD_PX}
      viewBox={`0 0 ${BOARD_PX} ${BOARD_PX}`}
      style={{ display: 'block', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
    >
      <defs>
        {/* 木质纹理渐变 */}
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8c87a" />
          <stop offset="30%" stopColor="#dcb35c" />
          <stop offset="60%" stopColor="#d4a84a" />
          <stop offset="100%" stopColor="#c99a3c" />
        </linearGradient>
        {/* 木纹线条（叠加层） */}
        <pattern id="woodGrain" width="620" height="620" patternUnits="userSpaceOnUse">
          <rect width="620" height="620" fill="url(#wood)" />
          {Array.from({ length: 30 }).map((_, i) => (
            <line
              key={i}
              x1={0}
              y1={i * 22 + (i % 3) * 4}
              x2={620}
              y2={i * 22 + (i % 3) * 4 + 8}
              stroke="rgba(139, 105, 20, 0.12)"
              strokeWidth={1.5}
            />
          ))}
        </pattern>
        {/* 黑棋渐变（3D 球体） */}
        <radialGradient id="blackStone" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="40%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        {/* 白棋渐变（3D 球体） */}
        <radialGradient id="whiteStone" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f0ece0" />
          <stop offset="100%" stopColor="#c8c0a8" />
        </radialGradient>
      </defs>

      {/* 木质背景 */}
      <rect x={0} y={0} width={BOARD_PX} height={BOARD_PX} fill="url(#woodGrain)" />
      {/* 边框 */}
      <rect
        x={2}
        y={2}
        width={BOARD_PX - 4}
        height={BOARD_PX - 4}
        fill="none"
        stroke="#8b6914"
        strokeWidth={3}
        rx={2}
      />
      {/* 网格线 */}
      {gridLines}
      {/* 星位 */}
      {starDots}
      {/* 禁手点标记 */}
      {forbiddenMarkers}
      {/* 棋子 */}
      {stones}
      {/* 点击区域（放在最上层） */}
      {clickAreas}
    </svg>
  )
}
