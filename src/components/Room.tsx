import React from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'

// Door opening on a wall
export interface DoorConfig {
  wall: 'north' | 'south' | 'east' | 'west'
  width: number
  height: number
  /** lateral offset from wall center (positive = right when facing wall) */
  offset?: number
}

export interface RoomProps {
  position?: [number, number, number]
  size: [number, number, number]
  wallColor?: string
  floorColor?: string
  ceilingColor?: string
  wallRoughness?: number
  wallMetalness?: number
  envMapIntensity?: number
  doors?: DoorConfig[]
  useReflectiveFloor?: boolean
  children?: React.ReactNode
}

const WALL_DEPTH = 0.2

/**
 * Build the list of box segments needed to represent a wall that may have
 * one door opening cut into it.
 *
 * Returns an array of { pos, size } in the wall's LOCAL axis space where
 * - the wall runs along the U axis (its length)
 * - height is Y
 * - thickness is Z (= WALL_DEPTH, handled by caller)
 *
 * @param wallLength  total length of this wall
 * @param wallHeight  room height
 * @param door        optional door config (already resolved to this wall)
 */
function buildWallSegments(
  wallLength: number,
  wallHeight: number,
  door?: DoorConfig,
): Array<{ uPos: number; uSize: number; yPos: number; ySize: number }> {
  if (!door) {
    return [{ uPos: 0, uSize: wallLength, yPos: wallHeight / 2, ySize: wallHeight }]
  }

  const dw = door.width
  const dh = door.height
  const offset = door.offset ?? 0
  const doorCenter = offset // offset from wall mid-point along U axis
  const doorLeft = doorCenter - dw / 2
  const doorRight = doorCenter + dw / 2
  const wallLeft = -wallLength / 2
  const wallRight = wallLength / 2

  const segments: Array<{ uPos: number; uSize: number; yPos: number; ySize: number }> = []

  // --- Left segment (if any) ---
  const leftWidth = doorLeft - wallLeft
  if (leftWidth > 0.01) {
    segments.push({
      uPos: wallLeft + leftWidth / 2,
      uSize: leftWidth,
      yPos: wallHeight / 2,
      ySize: wallHeight,
    })
  }

  // --- Right segment (if any) ---
  const rightWidth = wallRight - doorRight
  if (rightWidth > 0.01) {
    segments.push({
      uPos: doorRight + rightWidth / 2,
      uSize: rightWidth,
      yPos: wallHeight / 2,
      ySize: wallHeight,
    })
  }

  // --- Lintel above door ---
  const lintelHeight = wallHeight - dh
  if (lintelHeight > 0.01) {
    segments.push({
      uPos: doorCenter,
      uSize: dw,
      yPos: dh + lintelHeight / 2,
      ySize: lintelHeight,
    })
  }

  return segments
}

export default function Room({
  position = [0, 0, 0],
  size,
  wallColor = '#e8e0d0',
  floorColor = '#1a1a1a',
  ceilingColor = '#f5f0e8',
  wallRoughness = 0.85,
  wallMetalness = 0.0,
  envMapIntensity = 0.8,
  doors = [],
  useReflectiveFloor = false,
  children,
}: RoomProps) {
  const [width, height, depth] = size

  // Helper: find door for a given wall face
  const doorFor = (wall: DoorConfig['wall']) => doors.find((d) => d.wall === wall)

  // ── Shared wall material props ──────────────────────────────────────────
  const wallMatProps = {
    color: wallColor,
    roughness: wallRoughness,
    metalness: wallMetalness,
    envMapIntensity,
  }

  // ── Render one set of wall segments for a single wall face ──────────────
  // `wallLength`  — how long the wall is (X or Z of the room)
  // `axis`        — 'x' walls run along X (north/south), 'z' walls run along Z (east/west)
  // `sign`        — +1 or -1 (which side of the room)
  // `door`        — optional door config for this face
  const renderWall = (
    wallLength: number,
    axis: 'x' | 'z',
    sign: number,
    door?: DoorConfig,
  ) => {
    const segments = buildWallSegments(wallLength, height, door)
    const wallOffset = (axis === 'x' ? depth : width) / 2 * sign

    return segments.map((seg, i) => {
      // Translate segment local coords back to world-space box args
      let segX: number, segZ: number, segHalfW: number, segHalfD: number

      if (axis === 'x') {
        // North/South walls — they run along the X axis, offset along Z
        segX = seg.uPos
        segZ = wallOffset
        segHalfW = seg.uSize / 2
        segHalfD = WALL_DEPTH / 2
      } else {
        // East/West walls — they run along the Z axis, offset along X
        segX = wallOffset
        segZ = seg.uPos
        segHalfW = WALL_DEPTH / 2
        segHalfD = seg.uSize / 2
      }

      const segHalfH = seg.ySize / 2
      const segY = seg.yPos

      return (
        <RigidBody key={i} type="fixed" position={[segX, segY, segZ]}>
          <CuboidCollider args={[segHalfW, segHalfH, segHalfD]} />
          <mesh castShadow receiveShadow>
            <boxGeometry args={[segHalfW * 2, segHalfH * 2, segHalfD * 2]} />
            <meshStandardMaterial {...wallMatProps} />
          </mesh>
        </RigidBody>
      )
    })
  }

  return (
    <group position={position}>
      {/* ── Floor ─────────────────────────────────────────────────────────── */}
      <RigidBody type="fixed" position={[0, 0, 0]}>
        <CuboidCollider args={[width / 2, 0.05, depth / 2]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[width, depth]} />
          {useReflectiveFloor ? (
            <MeshReflectorMaterial
              blur={[400, 100]}
              resolution={1024}
              mixStrength={15}
              roughness={0.7}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color={floorColor}
              metalness={0.5}
              mirror={0}
            />
          ) : (
            <meshStandardMaterial
              color={floorColor}
              roughness={0.8}
              metalness={0.1}
              envMapIntensity={envMapIntensity}
            />
          )}
        </mesh>
      </RigidBody>

      {/* ── Ceiling ───────────────────────────────────────────────────────── */}
      <RigidBody type="fixed" position={[0, height, 0]}>
        <CuboidCollider args={[width / 2, 0.05, depth / 2]} />
        <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial
            color={ceilingColor}
            roughness={wallRoughness}
            metalness={wallMetalness}
            envMapIntensity={envMapIntensity}
          />
        </mesh>
      </RigidBody>

      {/* ── North wall (–Z face, runs along X) ───────────────────────────── */}
      {renderWall(width, 'x', -1, doorFor('north'))}

      {/* ── South wall (+Z face, runs along X) ───────────────────────────── */}
      {renderWall(width, 'x', +1, doorFor('south'))}

      {/* ── West wall (–X face, runs along Z) ────────────────────────────── */}
      {renderWall(depth, 'z', -1, doorFor('west'))}

      {/* ── East wall (+X face, runs along Z) ────────────────────────────── */}
      {renderWall(depth, 'z', +1, doorFor('east'))}

      {/* Children (paintings, lights, props, etc.) */}
      {children}
    </group>
  )
}
