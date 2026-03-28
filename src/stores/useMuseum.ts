import { create } from 'zustand'
import type { RoomId } from '../data/paintings'

interface MuseumState {
  // Navigation
  currentRoom: RoomId
  visitedRooms: Set<RoomId>
  setCurrentRoom: (room: RoomId) => void

  // Painting interaction
  activePainting: string | null
  setActivePainting: (id: string | null) => void

  // Music
  playingMusic: string | null
  setPlayingMusic: (id: string | null) => void
  isMuted: boolean
  toggleMute: () => void

  // Favorites
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

  // Music
  playingMusic: null,
  setPlayingMusic: (id) => set({ playingMusic: id }),
  isMuted: false,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  // Favorites
  favoritePaintings: new Set<string>(),
  favoriteMusic: new Set<string>(),
  toggleFavoritePainting: (id) =>
    set((state) => {
      const next = new Set(state.favoritePaintings)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { favoritePaintings: next }
    }),
  toggleFavoriteMusic: (id) =>
    set((state) => {
      const next = new Set(state.favoriteMusic)
      if (next.has(id)) next.delete(id)
      else next.add(id)
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
}))
