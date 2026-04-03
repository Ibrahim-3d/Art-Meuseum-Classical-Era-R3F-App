import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'

export default function LoadingScreen() {
  const { progress, active } = useProgress()
  // Keep the overlay mounted until fade-out animation completes
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (!active && progress >= 100) {
      const timer = setTimeout(() => setShow(false), 900)
      return () => clearTimeout(timer)
    }
  }, [active, progress])

  if (!show) return null

  const done = !active && progress >= 100

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: '#0a0806',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: done ? 0 : 1,
        transition: 'opacity 0.8s ease',
        pointerEvents: done ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          color: '#f5e6c8',
          fontSize: 28,
          fontFamily: 'Georgia, serif',
          marginBottom: 8,
          letterSpacing: '0.04em',
        }}
      >
        Echoes &amp; Visions
      </div>

      <div
        style={{
          color: 'rgba(245, 230, 200, 0.4)',
          fontSize: 11,
          fontFamily: 'sans-serif',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: 40,
        }}
      >
        Virtual Classical Museum
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 220,
          height: 1,
          background: 'rgba(245, 230, 200, 0.15)',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#f5e6c8',
            borderRadius: 1,
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      <div
        style={{
          marginTop: 14,
          color: 'rgba(245, 230, 200, 0.35)',
          fontSize: 11,
          fontFamily: 'sans-serif',
          letterSpacing: '0.08em',
        }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  )
}
