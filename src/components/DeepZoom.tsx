import { useEffect, useRef, useState, useCallback } from 'react'
import { useMuseum } from '../stores/useMuseum'
import { paintings } from '../data/paintings'

const MIN_ZOOM = 1
const MAX_ZOOM = 5
const ZOOM_SPEED = 0.003

/** Compose a ~30s narration script from painting metadata */
function composeScript(p: typeof paintings[0]): string {
  const parts: string[] = []
  parts.push(`${p.title}, by ${p.artist}.`)
  parts.push(`Painted ${p.year}.`)
  parts.push(p.description)
  parts.push(p.analysis)
  // First sentence of bio, capped at 200 chars
  const bioFirst = p.bio.split(/\.\s/)[0]
  if (bioFirst) parts.push(bioFirst.slice(0, 200) + '.')
  return parts.join(' ')
}

export default function DeepZoom() {
  const deepZoomPainting = useMuseum((s) => s.deepZoomPainting)
  const setDeepZoomPainting = useMuseum((s) => s.setDeepZoomPainting)
  const favoritePaintings = useMuseum((s) => s.favoritePaintings)
  const toggleFavoritePainting = useMuseum((s) => s.toggleFavoritePainting)

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [visible, setVisible] = useState(false)

  const overlayRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef({ x: 0, y: 0 })

  const painting = deepZoomPainting
    ? paintings.find((p) => p.id === deepZoomPainting)
    : null

  // Fade in on open, reset state
  useEffect(() => {
    if (painting) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      setHasInteracted(false)
      setIsSpeaking(false)
      // Trigger fade-in on next frame
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [painting])

  // ESC to close
  useEffect(() => {
    if (!painting) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'KeyE') {
        close()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [painting])

  const close = useCallback(() => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
    setVisible(false)
    // Wait for fade-out then clear state
    setTimeout(() => setDeepZoomPainting(null), 300)
  }, [setDeepZoomPainting])

  // Scroll wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation()
    setHasInteracted(true)
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z - e.deltaY * ZOOM_SPEED)))
  }, [])

  // Drag to pan
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    setHasInteracted(true)
    setPan((p) => ({
      x: p.x + (e.clientX - dragStart.current.x),
      y: p.y + (e.clientY - dragStart.current.y),
    }))
    dragStart.current = { x: e.clientX, y: e.clientY }
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Story mode TTS
  const toggleStory = useCallback(() => {
    if (!painting) return
    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const script = composeScript(painting)
    const utterance = new SpeechSynthesisUtterance(script)
    utterance.rate = 0.85
    utterance.pitch = 0.95
    utterance.volume = 1.0
    // Prefer a female English voice
    const voices = speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'),
    )
    if (preferred) utterance.voice = preferred
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }, [painting, isSpeaking])

  if (!painting) return null

  const isFavorite = favoritePaintings.has(painting.id)

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* ESC badge — top left */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          padding: '4px 10px',
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: 12,
          fontFamily: 'monospace',
          pointerEvents: 'none',
        }}
      >
        ESC
      </div>

      {/* Close button — top right */}
      <button
        onClick={(e) => { e.stopPropagation(); close() }}
        style={{
          position: 'absolute',
          top: 16,
          right: 20,
          background: 'none',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: 6,
          color: 'rgba(255, 255, 255, 0.7)',
          cursor: 'pointer',
          fontSize: 20,
          fontWeight: 700,
          lineHeight: 1,
          padding: '6px 12px',
          zIndex: 10,
        }}
      >
        ✕
      </button>

      {/* Painting image with zoom/pan */}
      <img
        src={painting.image}
        alt={painting.title}
        draggable={false}
        style={{
          maxWidth: '92%',
          maxHeight: '80%',
          objectFit: 'contain',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          pointerEvents: 'none',
        }}
      />

      {/* Zoom hint — fades after first interaction */}
      {!hasInteracted && (
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: 13,
            fontFamily: 'Georgia, serif',
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          Scroll to zoom &middot; Drag to pan
        </div>
      )}

      {/* Zoom level badge — bottom right */}
      {zoom > 1.05 && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            right: 24,
            padding: '4px 10px',
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 13,
            fontFamily: 'monospace',
            pointerEvents: 'none',
          }}
        >
          {zoom.toFixed(1)}×
        </div>
      )}

      {/* Bottom bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 24px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          pointerEvents: 'none',
        }}
      >
        {/* Title + artist */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: '#f5e6c8',
              fontSize: 18,
              fontFamily: 'Georgia, serif',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {painting.title}
          </div>
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 13,
              fontFamily: 'Georgia, serif',
              marginTop: 2,
            }}
          >
            {painting.artist} &mdash; {painting.year}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, pointerEvents: 'auto' }}>
          {/* Favorite */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavoritePainting(painting.id) }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 6,
              color: isFavorite ? '#e8b44b' : 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              fontSize: 18,
              padding: '6px 12px',
              transition: 'color 0.2s',
            }}
          >
            {isFavorite ? '♥' : '♡'}
          </button>

          {/* Story mode / TTS */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleStory() }}
            title={isSpeaking ? 'Stop narration' : 'Listen to narration'}
            style={{
              background: isSpeaking
                ? 'rgba(232, 180, 75, 0.2)'
                : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${isSpeaking ? 'rgba(232, 180, 75, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: 6,
              color: isSpeaking ? '#e8b44b' : 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'Georgia, serif',
              padding: '6px 14px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {isSpeaking ? '■ Stop Audio' : '♪ Listen to Audio'}
          </button>
        </div>
      </div>
    </div>
  )
}
