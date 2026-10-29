import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import Board from './components/Board'
import { checkWin, getForbiddenPoints, isBoardFull } from './game/rules'
import { chooseAiMove } from './game/ai'
import { BOARD_SIZE, type Board as BoardType, type GameStatus, type Move, type Point, type Stone } from './types'

// 创建空棋盘
function createEmptyBoard(): BoardType {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 0 as Stone),
  )
}

function App() {
  const [board, setBoard] = useState<BoardType>(createEmptyBoard)
  const [currentPlayer, setCurrentPlayer] = useState<Stone>(1)
  const [status, setStatus] = useState<GameStatus>('playing')
  const [lastMove, setLastMove] = useState<Point | null>(null)
  const [history, setHistory] = useState<Move[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const forbiddenPoints = useMemo<Point[]>(() => {
    if (currentPlayer !== 1 || status !== 'playing') return []
    return getForbiddenPoints(board)
  }, [board, currentPlayer, status])

  const isAiTurn = currentPlayer === 2 && status === 'playing'
  const canUndo = history.length >= 2 && status === 'playing' && !isAiTurn

  // AI 回合：异步落子 + 思考延迟
  useEffect(() => {
    if (!isAiTurn) return

    timerRef.current = setTimeout(() => {
      const move = chooseAiMove(board)
      if (!move) return

      setBoard((prev) => {
        const newBoard = prev.map((r) => [...r])
        newBoard[move.row][move.col] = 2
        setLastMove(move)
        setHistory((h) => [...h, { row: move.row, col: move.col, stone: 2 }])

        if (checkWin(newBoard, move.row, move.col)) {
          setStatus('white-win')
        } else if (isBoardFull(newBoard)) {
          setStatus('draw')
        } else {
          setCurrentPlayer(1)
        }
        return newBoard
      })
    }, 800)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isAiTurn, board])

  const placeStone = (row: number, col: number, stone: Stone) => {
    const newBoard = board.map((r) => [...r])
    newBoard[row][col] = stone
    setBoard(newBoard)
    setLastMove({ row, col })
    setHistory((h) => [...h, { row, col, stone }])

    if (checkWin(newBoard, row, col)) {
      setStatus(stone === 1 ? 'black-win' : 'white-win')
      return
    }
    if (isBoardFull(newBoard)) {
      setStatus('draw')
      return
    }
    setCurrentPlayer(stone === 1 ? 2 : 1)
  }

  const handleCellClick = (row: number, col: number) => {
    if (status !== 'playing' || isAiTurn) return
    if (board[row][col] !== 0) return
    if (forbiddenPoints.some((p) => p.row === row && p.col === col)) return
    placeStone(row, col, currentPlayer)
  }

  // 悔棋：撤销最近两步（玩家 + AI）
  const handleUndo = () => {
    if (!canUndo) return
    const newHistory = history.slice(0, -2)
    const newBoard = createEmptyBoard()
    newHistory.forEach((m) => {
      newBoard[m.row][m.col] = m.stone
    })
    setBoard(newBoard)
    setHistory(newHistory)
    setLastMove(newHistory.length > 0 ? newHistory[newHistory.length - 1] : null)
    setCurrentPlayer(1)
    setStatus('playing')
  }

  // 重新开始
  const handleRestart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setBoard(createEmptyBoard())
    setCurrentPlayer(1)
    setStatus('playing')
    setLastMove(null)
    setHistory([])
  }

  return (
    <div className="app">
      <h1>五子棋</h1>
      <div className="status">
        {status === 'playing' && (isAiTurn ? 'AI 思考中...' : '轮到你（黑棋）')}
        {status === 'black-win' && '🎉 黑棋获胜！'}
        {status === 'white-win' && '白棋获胜！'}
        {status === 'draw' && '平局！'}
      </div>
      <div className="board-container">
        <Board
          board={board}
          onCellClick={handleCellClick}
          lastMove={lastMove}
          forbiddenPoints={forbiddenPoints}
          disabled={isAiTurn || status !== 'playing'}
        />
      </div>
      <div className="controls">
        <button type="button" onClick={handleUndo} disabled={!canUndo}>
          悔棋
        </button>
        <button type="button" onClick={handleRestart}>
          重新开始
        </button>
      </div>
    </div>
  )
}

export default App
