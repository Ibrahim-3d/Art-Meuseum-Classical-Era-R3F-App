import { create } from 'zustand'
import type { RoomId } from '../data/paintings'

interface TeleportTarget {
  x: number
  y: number
  z: number
}

// Load persisted favorites from localStorage
function loadFavorites(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return new Set(JSON.parse(raw))
  } catch { /* ignore corrupt data */ }
  return new Set<string>()
}

function saveFavorites(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]))
}

interface MuseumState {
  // Navigation
  currentRoom: RoomId
  visitedRooms: Set<RoomId>
  setCurrentRoom: (room: RoomId) => void

  // Painting interaction
  activePainting: string | null
  setActivePainting: (id: string | null) => void

  // Deep zoom (full-page painting preview)
  deepZoomPainting: string | null
  setDeepZoomPainting: (id: string | null) => void

  // Nearest painting (for proximity hints in HUD)
  nearestPaintingId: string | null
  setNearestPaintingId: (id: string | null) => void

  // Music
  playingMusic: string | null
  setPlayingMusic: (id: string | null) => void
  isMuted: boolean
  toggleMute: () => void

  // Favorites (persisted to localStorage)
  favoritePaintings: Set<string>
  favoriteMusic: Set<string>
  toggleFavoritePainting: (id: string) => void
  toggleFavoriteMusic: (id: string) => void

  // UI
  showInfoPanel: boolean
  setShowInfoPanel: (show: boolean) => void
  showMinimap: boolean
  toggleMinimap: () => void
  showControls: boolean
  setShowControls: (show: boolean) => void
  isPointerLocked: boolean
  setPointerLocked: (locked: boolean) => void

  // Speed tier: 1=slow(2), 2=normal(4), 3=fast(8)
  speedTier: 1 | 2 | 3
  setSpeedTier: (tier: 1 | 2 | 3) => void

  // Teleport target — set by minimap waypoint clicks, consumed by Player
  teleportTarget: TeleportTarget | null
  setTeleportTarget: (target: TeleportTarget | null) => void
}

export const useMuseum = create<MuseumState>((set) => ({
  // Navigation
  currentRoom: 'lobby',
  visitedRooms: new Set<RoomId>(['lobby']),
  setCurrentRoom: (room) =>
    set((state) => ({
      currentRoom: room,
      visitedRooms: new Set([...state.visitedRooms, room]),
    })),

  // Painting interaction
  activePainting: null,
  setActivePainting: (id) => set({ activePainting: id, showInfoPanel: id !== null }),

  // Deep zoom
  deepZoomPainting: null,
  setDeepZoomPainting: (id) => set({ deepZoomPainting: id }),

  // Nearest painting
  nearestPaintingId: null,
  setNearestPaintingId: (id) => set({ nearestPaintingId: id }),

  // Music
  playingMusic: null,
  setPlayingMusic: (id) => set({ playingMusic: id }),
  isMuted: false,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  // Favorites — persisted to localStorage
  favoritePaintings: loadFavorites('echoes-fav-paintings'),
  favoriteMusic: loadFavorites('echoes-fav-music'),
  toggleFavoritePainting: (id) =>
    set((state) => {
      const next = new Set(state.favoritePaintings)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveFavorites('echoes-fav-paintings', next)
      return { favoritePaintings: next }
    }),
  toggleFavoriteMusic: (id) =>
    set((state) => {
      const next = new Set(state.favoriteMusic)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveFavorites('echoes-fav-music', next)
      return { favoriteMusic: next }
    }),

  // UI
  showInfoPanel: false,
  setShowInfoPanel: (show) => set({ showInfoPanel: show }),
  showMinimap: true,
  toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
  showControls: true,
  setShowControls: (show) => set({ showControls: show }),
  isPointerLocked: false,
  setPointerLocked: (locked) => set({ isPointerLocked: locked }),

  // Speed tier
  speedTier: 2,
  setSpeedTier: (tier) => set({ speedTier: tier }),

  // Teleport target
  teleportTarget: null,
  setTeleportTarget: (target) => set({ teleportTarget: target }),
}))
