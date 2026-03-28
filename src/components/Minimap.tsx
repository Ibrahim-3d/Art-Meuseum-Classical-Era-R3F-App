import { useMuseum } from '../stores/useMuseum'
import type { RoomId } from '../data/paintings'

interface RoomCell {
  id: RoomId
  label: string
  col: number   // 0 = left, 1 = center, 2 = right
  row: number   // 0 = top, higher = lower on screen
}

// Layout: 3 columns × 5 rows
// Col 0 (left)  — painting wings A/B/C (rows 1/2/3)
// Col 1 (center)— Rooftop(0), Atrium(1), Immersive(2), Lobby(4)
// Col 2 (right) — music halls 1/2/3 (rows 1/2/3)
// Rows match world Z: row 0 = z=-30 (furthest), row 3 = z=0 (entrance)
const ROOM_CELLS: RoomCell[] = [
  { id: 'rooftop',   label: 'Rooftop',     col: 1, row: 0 },
  { id: 'wingC',     label: 'Wing C',      col: 0, row: 1 },
  { id: 'atrium',    label: 'Atrium',      col: 1, row: 1 },
  { id: 'hall3',     label: 'Hall 3',      col: 2, row: 1 },
  { id: 'wingB',     label: 'Wing B',      col: 0, row: 2 },
  { id: 'immersive', label: 'Immersive',   col: 1, row: 2 },
  { id: 'hall2',     label: 'Hall 2',      col: 2, row: 2 },
  { id: 'wingA',     label: 'Wing A',      col: 0, row: 3 },
  { id: 'lobby',     label: 'Lobby',       col: 1, row: 3 },
  { id: 'hall1',     label: 'Hall 1',      col: 2, row: 3 },
]

const MAP_WIDTH  = 200
const MAP_HEIGHT = 300
const PADDING    = 10
const COLS       = 3
const ROWS       = 4

const CELL_W = (MAP_WIDTH  - PADDING * 2 - (COLS - 1) * 6) / COLS  // ~54px
const CELL_H = (MAP_HEIGHT - PADDING * 2 - (ROWS - 1) * 6) / ROWS  // ~50px
const GAP_X  = 6
const GAP_Y  = 6

function cellLeft(col: number): number {
  return PADDING + col * (CELL_W + GAP_X)
}

function cellTop(row: number): number {
  return PADDING + row * (CELL_H + GAP_Y)
}

export default function Minimap() {
  const currentRoom  = useMuseum((s) => s.currentRoom)
  const visitedRooms = useMuseum((s) => s.visitedRooms)
  const showMinimap  = useMuseum((s) => s.showMinimap)

  if (!showMinimap) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        right: 24,
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderRadius: 8,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 100,
        pointerEvents: 'none',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.35)',
          fontSize: 9,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
        }}
      >
        Floor Plan
      </div>

      {/* Room cells */}
      {ROOM_CELLS.map(({ id, label, col, row }) => {
        const isCurrent = id === currentRoom
        const isVisited = visitedRooms.has(id)

        let bgColor: string
        if (isCurrent) {
          bgColor = 'rgba(228, 176, 60, 0.25)'
        } else if (isVisited) {
          bgColor = 'rgba(255, 255, 255, 0.12)'
        } else {
          bgColor = 'rgba(255, 255, 255, 0.04)'
        }

        return (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: cellLeft(col),
              top: cellTop(row),
              width: CELL_W,
              height: CELL_H,
              backgroundColor: bgColor,
              borderRadius: 4,
              border: isCurrent
                ? '2px solid #e4b03c'
                : isVisited
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                color: isCurrent
                  ? '#f5d97a'
                  : isVisited
                  ? 'rgba(255, 255, 255, 0.65)'
                  : 'rgba(255, 255, 255, 0.25)',
                fontSize: 8,
                fontFamily: 'sans-serif',
                fontWeight: isCurrent ? 700 : 400,
                letterSpacing: '0.04em',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
