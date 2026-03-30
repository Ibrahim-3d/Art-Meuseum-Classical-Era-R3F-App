import { useCallback, useEffect, useRef, useState } from 'react'
import { useMuseum } from '../stores/useMuseum'
import { music } from '../data/music'

const VOLUME = 0.6
const FADE_MS = 500
const WAVEFORM_BINS = 24 // first 24 of 32 bins (fftSize 64)

// ── helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── component ─────────────────────────────────────────────────────────────────

export default function MusicPlayer() {
  const playingMusic = useMuseum((s) => s.playingMusic)
  const setPlayingMusic = useMuseum((s) => s.setPlayingMusic)
  const isMuted = useMuseum((s) => s.isMuted)
  const favoriteMusic = useMuseum((s) => s.favoriteMusic)
  const toggleFavoriteMusic = useMuseum((s) => s.toggleFavoriteMusic)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)

  // Canvas ref for waveform drawing
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawRafRef = useRef<number | null>(null)

  // isPaused tracks user-initiated pause (distinct from the audio element's paused state)
  const [isPaused, setIsPaused] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [visible, setVisible] = useState(false)

  // New state for features
  const [showBio, setShowBio] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const track = playingMusic ? music.find((m) => m.id === playingMusic) ?? null : null

  // ── Web Audio setup helpers ────────────────────────────────────────────────

  function getOrCreateAudioContext(): AudioContext {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }

  function setupWebAudio(audio: HTMLAudioElement) {
    try {
      const ctx = getOrCreateAudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      const source = ctx.createMediaElementSource(audio)
      source.connect(analyser)
      analyser.connect(ctx.destination)
      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
    } catch {
      // Web Audio setup failure is non-fatal — player still works without visualizer
      analyserRef.current = null
      dataArrayRef.current = null
    }
  }

  // ── Fade helpers using requestAnimationFrame for smooth ramps ─────────────

  function fadeOut(audio: HTMLAudioElement, onDone: () => void) {
    const start = performance.now()
    const startVol = audio.volume

    function step(now: number) {
      const elapsed = now - start
      const prog = Math.min(elapsed / FADE_MS, 1)
      audio.volume = startVol * (1 - prog)
      if (prog < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        audio.volume = 0
        onDone()
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function fadeIn(audio: HTMLAudioElement) {
    const target = isMuted ? 0 : VOLUME
    if (target === 0) {
      audio.volume = 0
      return
    }
    const start = performance.now()

    function step(now: number) {
      const elapsed = now - start
      const prog = Math.min(elapsed / FADE_MS, 1)
      audio.volume = target * prog
      if (prog < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        audio.volume = target
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function cancelFade() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (fadeTimerRef.current !== null) {
      clearTimeout(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
  }

  // ── Waveform drawing loop ─────────────────────────────────────────────────

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current
    if (!canvas || !analyser || !dataArray) {
      drawRafRef.current = requestAnimationFrame(drawWaveform)
      return
    }

    analyser.getByteFrequencyData(dataArray)

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      drawRafRef.current = requestAnimationFrame(drawWaveform)
      return
    }

    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const binCount = WAVEFORM_BINS
    const gapPx = 2
    const totalGaps = gapPx * (binCount - 1)
    const barW = (W - totalGaps) / binCount

    for (let i = 0; i < binCount; i++) {
      const amplitude = (dataArray[i] ?? 0) / 255
      const barH = Math.max(2, amplitude * H)
      const x = i * (barW + gapPx)
      const y = H - barH
      const opacity = 0.25 + amplitude * 0.75

      ctx.save()
      ctx.lineCap = 'round'
      ctx.strokeStyle = `rgba(245, 230, 200, ${opacity})`
      ctx.lineWidth = barW
      ctx.beginPath()
      ctx.moveTo(x + barW / 2, H)
      ctx.lineTo(x + barW / 2, y)
      ctx.stroke()
      ctx.restore()
    }

    drawRafRef.current = requestAnimationFrame(drawWaveform)
  }, [])

  function startDrawLoop() {
    if (drawRafRef.current !== null) cancelAnimationFrame(drawRafRef.current)
    drawRafRef.current = requestAnimationFrame(drawWaveform)
  }

  function stopDrawLoop() {
    if (drawRafRef.current !== null) {
      cancelAnimationFrame(drawRafRef.current)
      drawRafRef.current = null
    }
  }

  // ── React to playingMusic changes: cross-fade between tracks ──────────────

  useEffect(() => {
    const prev = audioRef.current

    if (!playingMusic || !track) {
      if (prev && !prev.paused) {
        cancelFade()
        fadeOut(prev, () => {
          prev.pause()
          prev.src = ''
        })
      }
      setVisible(false)
      setAudioError(false)
      setIsPaused(false)
      setShowBio(false)
      setProgress(0)
      setCurrentTime(0)
      setDuration(0)
      stopDrawLoop()
      return
    }

    const startNewTrack = () => {
      const audio = new Audio()
      audio.crossOrigin = 'anonymous' // required for Web Audio API with Vite dev server
      audio.loop = true
      audio.volume = 0
      audio.muted = isMuted

      // Set up Web Audio immediately after creating the element and before setting src
      setupWebAudio(audio)

      audio.onerror = () => {
        setAudioError(true)
      }

      audio.ontimeupdate = () => {
        const dur = audio.duration
        const cur = audio.currentTime
        if (isFinite(dur) && dur > 0) {
          setProgress(cur / dur)
          setCurrentTime(cur)
          setDuration(dur)
        }
      }

      audio.onloadedmetadata = () => {
        if (isFinite(audio.duration)) {
          setDuration(audio.duration)
        }
      }

      audio.oncanplay = () => {
        setAudioError(false)
        if (!isPaused) {
          // Resume AudioContext if suspended (browser autoplay policy)
          const ctx = audioCtxRef.current
          if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {})
          }
          audio.play().then(() => {
            fadeIn(audio)
            startDrawLoop()
          }).catch(() => setAudioError(true))
        }
      }

      audio.src = track.audioFile
      audio.load()
      audioRef.current = audio
    }

    setAudioError(false)
    setIsPaused(false)
    setShowBio(false)
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
    setVisible(true)

    if (prev && !prev.paused) {
      cancelFade()
      fadeOut(prev, () => {
        prev.pause()
        prev.src = ''
        startNewTrack()
      })
    } else {
      if (prev) {
        prev.pause()
        prev.src = ''
      }
      startNewTrack()
    }

    return () => {
      // Intentionally not cleaning up here — handled by next effect run or unmount
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingMusic])

  // ── Sync muted state without interrupting playback ─────────────────────────

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = isMuted
    if (!isMuted && audio.volume === 0) {
      audio.volume = VOLUME
    }
  }, [isMuted])

  // ── Start/stop draw loop based on play state ──────────────────────────────

  useEffect(() => {
    if (!isPaused && visible) {
      startDrawLoop()
    } else {
      stopDrawLoop()
      // Clear canvas when paused
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, visible])

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      cancelFade()
      stopDrawLoop()
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.src = ''
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handlePlayPause() {
    const audio = audioRef.current
    if (!audio || !track) return

    if (audio.paused) {
      cancelFade()
      const ctx = audioCtxRef.current
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      audio.play().then(() => {
        fadeIn(audio)
        startDrawLoop()
      }).catch(() => setAudioError(true))
      setIsPaused(false)
    } else {
      cancelFade()
      fadeOut(audio, () => audio.pause())
      setIsPaused(true)
    }
  }

  function handleClose() {
    setPlayingMusic(null)
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !isFinite(duration) || duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = duration * ratio
    setProgress(ratio)
    setCurrentTime(duration * ratio)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (!playingMusic || !track) return null

  const isFavorite = favoriteMusic.has(track.id)

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(40px)',
        zIndex: 200,
        maxWidth: 420,
        width: '90%',
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 14,
        padding: '16px 20px',
        boxSizing: 'border-box',
        fontFamily: 'Georgia, serif',
        color: '#fff',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease',
      }}
    >
      {/* Main row: portrait + track info + controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Composer portrait — clickable to toggle bio */}
        <img
          src={`/artists/${track.composerId}.webp`}
          alt={track.composer}
          onClick={() => setShowBio((prev) => !prev)}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            border: '2px solid rgba(245, 230, 200, 0.25)',
            background: 'rgba(255, 255, 255, 0.06)',
            cursor: 'pointer',
            transition: 'transform 0.18s ease',
            transform: showBio ? 'scale(1.08)' : 'scale(1)',
          }}
        />

        {/* Track title + composer */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#f5e6c8',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {track.title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.55)',
              marginTop: 3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {track.composer}
            {track.year ? ` \u2014 ${track.year}` : ''}
          </div>
        </div>

        {/* Controls: play/pause, favorite, close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button onClick={handlePlayPause} title={isPaused ? 'Play' : 'Pause'} style={buttonStyle}>
            {isPaused ? '\u25B6' : '\u23F8'}
          </button>
          <button
            onClick={() => toggleFavoriteMusic(track.id)}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={{ ...buttonStyle, color: isFavorite ? '#e8b44b' : 'rgba(255, 255, 255, 0.55)' }}
          >
            {isFavorite ? '\u2665' : '\u2661'}
          </button>
          <button onClick={handleClose} title="Stop playback" style={buttonStyle}>
            &#x2715;
          </button>
        </div>
      </div>

      {/* Audio unavailable notice */}
      {audioError && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255, 100, 100, 0.8)', fontStyle: 'italic', fontFamily: 'sans-serif' }}>
          Audio unavailable
        </div>
      )}

      {/* ── Waveform visualizer ─────────────────────────────────────────── */}
      {!audioError && (
        <canvas
          ref={canvasRef}
          width={380}
          height={32}
          style={{
            display: 'block',
            width: '100%',
            height: 32,
            marginTop: 10,
            borderRadius: 4,
          }}
        />
      )}

      {/* ── Era badge + playing indicator ──────────────────────────────── */}
      {!audioError && (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'rgba(245, 230, 200, 0.5)', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {track.era}
          </span>
          {!isPaused && (
            <span style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 10 }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: 2,
                    background: '#f5e6c8',
                    borderRadius: 1,
                    opacity: 0.7,
                    animation: `musicBar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                  }}
                />
              ))}
            </span>
          )}
        </div>
      )}

      {/* ── Seekable progress bar ────────────────────────────────────────── */}
      {!audioError && (
        <div style={{ marginTop: 10 }}>
          {/* Track */}
          <div
            onClick={handleSeek}
            style={{
              width: '100%',
              height: 4,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {/* Filled portion */}
            <div
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                borderRadius: 2,
                background: '#f5e6c8',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Elapsed / total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'sans-serif' }}>
              {formatTime(currentTime)}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'sans-serif' }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      {/* ── Composer bio panel (expandable) ────────────────────────────── */}
      <div
        style={{
          maxHeight: showBio ? 200 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: 12,
            paddingTop: 12,
          }}
        >
          {/* Composer name */}
          <div style={{ fontSize: 14, color: '#f5e6c8', fontWeight: 600, marginBottom: 2 }}>
            {track.composer}
          </div>
          {/* Year + era */}
          <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'sans-serif', marginBottom: 8 }}>
            {track.year} &middot; {track.era}
          </div>
          {/* Bio text */}
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.65)',
              lineHeight: 1.6,
              fontFamily: 'Georgia, serif',
            }}
          >
            {track.bio}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes musicBar {
          from { height: 3px; }
          to   { height: 10px; }
        }
      `}</style>
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: 6,
  color: 'rgba(255, 255, 255, 0.75)',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
  padding: '6px 10px',
  transition: 'color 0.15s, border-color 0.15s',
}
