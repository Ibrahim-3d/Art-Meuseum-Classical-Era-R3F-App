import { useMuseum } from '../stores/useMuseum'
import type { RoomId } from '../data/paintings'

const ROOM_NAMES: Record<RoomId, string> = {
  lobby: 'Entrance Lobby',
  wingA: 'Renaissance Wing',
  wingB: 'Baroque Wing',
  wingC: 'Neoclassical & Romantic Wing',
  hall1: 'Baroque Music Hall',
  hall2: 'Classical Music Hall',
  hall3: 'Romantic Music Hall',
  immersive: 'Immersive Chamber',
  atrium: 'Central Atrium',
  rooftop: 'Rooftop Terrace',
}

const TOTAL_ROOMS = 10

export default function HUD() {
  const currentRoom = useMuseum((s) => s.currentRoom)
  const visitedRooms = useMuseum((s) => s.visitedRooms)
  const isMuted = useMuseum((s) => s.isMuted)
  const toggleMute = useMuseum((s) => s.toggleMute)

  const visitedCount = visitedRooms.size

  return (
    <>
      {/* Top-center: room name + progress */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '10px 20px',
          }}
        >
          <div
            style={{
              color: '#f5e6c8',
              fontSize: 17,
              fontFamily: 'Georgia, serif',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            {ROOM_NAMES[currentRoom]}
          </div>
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 11,
              fontFamily: 'sans-serif',
              marginTop: 4,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {visitedCount} / {TOTAL_ROOMS} rooms visited
          </div>
        </div>
      </div>

      {/* Bottom-right: mute toggle */}
      <button
        onClick={toggleMute}
        title={isMuted ? 'Unmute' : 'Mute'}
        style={{
          position: 'absolute',
          bottom: 28,
          right: 28,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 8,
          color: isMuted ? 'rgba(255, 255, 255, 0.4)' : '#f5e6c8',
          cursor: 'pointer',
          fontSize: 22,
          lineHeight: 1,
          padding: '8px 12px',
          transition: 'color 0.2s, border-color 0.2s',
        }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </>
  )
}
