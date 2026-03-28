/**
 * Module-level shared state for per-frame painting approach data.
 * Written by Painting components each frame, read by AmbientDimmer.
 * Avoids Zustand re-renders for 60fps updates.
 */

// Per-painting approach intensities (0 = far, 1 = fully approached)
const intensities = new Map<string, number>()

export function setApproachIntensity(id: string, value: number) {
  if (value < 0.001) intensities.delete(id)
  else intensities.set(id, value)
}

export function getMaxApproachIntensity(): number {
  let max = 0
  for (const v of intensities.values()) {
    if (v > max) max = v
  }
  return max
}

// Approach zone distances (world units) — matches reference project
export const APPROACH_INNER = 4
export const APPROACH_OUTER = 9
export const APPROACH_SCALE_MAX = 1.15
export const APPROACH_LERP_SPEED = 0.04
