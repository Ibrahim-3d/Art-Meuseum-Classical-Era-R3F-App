import { useState, useRef, useCallback } from 'react'
import { useMuseum } from '../stores/useMuseum'
import type { RoomId } from '../data/paintings'

interface RoomCell {
  id: RoomId
  label: string
  col: number   // 0 = left, 1 = center, 2 = right
  row: number   // 0 = top, higher = lower on screen
}

// Layout: 3 columns × 4 rows
// Col 0 (left)  — painting wings A/B/C (rows 1/2/3)
// Col 1 (center)— Rooftop(0), Atrium(1), Immersive(2), Lobby(3)
// Col 2 (right) — music halls 1/2/3 (rows 1/2/3)
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

// World-space center positions for each room (y=1.5 = standing height above floor)
const ROOM_CENTERS: Record<RoomId, { x: number; y: number; z: number }> = {
  lobby:     { x: 0,   y: 1.5, z: 4 },
  wingA:     { x: -13, y: 1.5, z: 0 },
  wingB:     { x: -13, y: 1.5, z: -16 },
  wingC:     { x: -13, y: 1.5, z: -32 },
  hall1:     { x: 12,  y: 1.5, z: 0 },
  hall2:     { x: 12,  y: 1.5, z: -16 },
  hall3:     { x: 12,  y: 1.5, z: -32 },
  immersive: { x: 0,   y: 1.5, z: -16 },
  atrium:    { x: 0,   y: 1.5, z: -32 },
  rooftop:   { x: 0,   y: 1.5, z: -48 },
}

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

  const [hoveredRoom, setHoveredRoom] = useState<RoomId | null>(null)
  const [clickedRoom, setClickedRoom] = useState<RoomId | null>(null)

  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleRoomClick = useCallback((id: RoomId) => {
    useMuseum.getState().setCurrentRoom(id)
    useMuseum.getState().setTeleportTarget(ROOM_CENTERS[id])

    // Flash the cell gold for 300ms
    if (clickTimerRef.current !== null) {
      clearTimeout(clickTimerRef.current)
    }
    setClickedRoom(id)
    clickTimerRef.current = setTimeout(() => {
      setClickedRoom(null)
      clickTimerRef.current = null
    }, 300)
  }, [])

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
        pointerEvents: 'auto',
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
        const isHovered = id === hoveredRoom && !isCurrent
        const isClicked = id === clickedRoom

        let bgColor: string
        if (isClicked) {
          bgColor = 'rgba(228, 176, 60, 0.5)'
        } else if (isCurrent) {
          bgColor = 'rgba(228, 176, 60, 0.25)'
        } else if (isHovered) {
          bgColor = 'rgba(228, 176, 60, 0.15)'
        } else if (isVisited) {
          bgColor = 'rgba(255, 255, 255, 0.12)'
        } else {
          bgColor = 'rgba(255, 255, 255, 0.04)'
        }

        let borderStyle: string
        if (isCurrent) {
          borderStyle = '2px solid #e4b03c'
        } else if (isHovered) {
          borderStyle = '1px solid rgba(228, 176, 60, 0.4)'
        } else if (isVisited) {
          borderStyle = '1px solid rgba(255, 255, 255, 0.2)'
        } else {
          borderStyle = '1px solid rgba(255, 255, 255, 0.07)'
        }

        return (
          <div
            key={id}
            onClick={() => handleRoomClick(id)}
            onMouseEnter={() => setHoveredRoom(id)}
            onMouseLeave={() => setHoveredRoom(null)}
            style={{
              position: 'absolute',
              left: cellLeft(col),
              top: cellTop(row),
              width: CELL_W,
              height: CELL_H,
              backgroundColor: bgColor,
              borderRadius: 4,
              border: borderStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              cursor: 'pointer',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.15s ease',
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
                pointerEvents: 'none',
              }}
            >
              {label}
            </span>
          </div>
        )
      })}

      {/* Tooltip */}
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.3)',
          fontSize: 8,
          fontFamily: 'sans-serif',
          letterSpacing: '0.05em',
        }}
      >
        Click room to teleport
      </div>
    </div>
  )
}
