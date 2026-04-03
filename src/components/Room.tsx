import React, { useMemo } from 'react'
import { MeshReflectorMaterial, useTexture } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { RepeatWrapping, SRGBColorSpace, MeshStandardMaterial } from 'three'

// Door opening on a wall
export interface DoorConfig {
  wall: 'north' | 'south' | 'east' | 'west'
  width: number
  height: number
  offset?: number
}

export interface TextureSet {
  color?: string
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
  omitWalls?: Array<'north' | 'south' | 'east' | 'west'>
  omitCeiling?: boolean
  useReflectiveFloor?: boolean
  floorTextures?: TextureSet
  wallTextures?: TextureSet
  ceilingTextures?: TextureSet
  floorTileDensity?: number
  wallTileDensity?: number
  ceilingTileDensity?: number
  children?: React.ReactNode
}

const WALL_DEPTH = 0.2
const DOOR_COLLIDER_CLEARANCE = 0.3

// Default texture paths (color only)
const TEX = {
  floor: { color: '/Materials/Wood083A_1K-JPG/Wood083A_1K-JPG_Color.webp' },
  wall: { color: '/Materials/Plaster002_1K-JPG/Plaster002_1K-JPG_Color.webp' },
  ceiling: { color: '/Materials/OfficeCeiling001_1K-JPG/OfficeCeiling001_1K-JPG_Color.webp' },
  marble: { color: '/Materials/Marble021_1K-JPG/Marble021_1K-JPG_Color.webp' },
} as const

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
  const doorCenter = offset
  const doorLeft = doorCenter - dw / 2
  const doorRight = doorCenter + dw / 2
  const wallLeft = -wallLength / 2
  const wallRight = wallLength / 2

  const segments: Array<{ uPos: number; uSize: number; yPos: number; ySize: number }> = []

  const leftWidth = doorLeft - wallLeft
  if (leftWidth > 0.01) {
    segments.push({ uPos: wallLeft + leftWidth / 2, uSize: leftWidth, yPos: wallHeight / 2, ySize: wallHeight })
  }

  const rightWidth = wallRight - doorRight
  if (rightWidth > 0.01) {
    segments.push({ uPos: doorRight + rightWidth / 2, uSize: rightWidth, yPos: wallHeight / 2, ySize: wallHeight })
  }

  const lintelHeight = wallHeight - dh
  if (lintelHeight > 0.01) {
    segments.push({ uPos: doorCenter, uSize: dw, yPos: dh + lintelHeight / 2, ySize: lintelHeight })
  }

  return segments
}

/**
 * Create a simple tiled MeshStandardMaterial — no custom shaders.
 * Uses UV repeat for tiling. Avoids the texture-unit overflow that
 * the triplanar onBeforeCompile approach caused.
 */
function useTiledMaterial(
  texSet: TextureSet,
  tileX: number,
  tileY: number,
  color: string,
  roughness: number,
  metalness: number,
  envMapIntensity: number,
): MeshStandardMaterial {
  const path = texSet.color || TEX.wall.color
  const tex = useTexture(path)

  return useMemo(() => {
    const t = tex.clone()
    t.wrapS = t.wrapT = RepeatWrapping
    t.repeat.set(tileX, tileY)
    t.colorSpace = SRGBColorSpace
    t.needsUpdate = true

    return new MeshStandardMaterial({
      map: t,
      color,
      roughness,
      metalness,
      envMapIntensity,
    })
  }, [tex, tileX, tileY, color, roughness, metalness, envMapIntensity])
}

// ── Room component ─────────────────────────────────────────────────────────

export default function Room({
  position = [0, 0, 0],
  size,
  wallColor = '#e8e0d0',
  floorColor = '#1a1a1a',
  ceilingColor = '#f5f0e8',
  wallRoughness = 0.85,
  wallMetalness = 0.0,
  envMapIntensity = 0.12,
  doors = [],
  omitWalls = [],
  omitCeiling = false,
  useReflectiveFloor = false,
  floorTextures = TEX.floor,
  wallTextures = TEX.wall,
  ceilingTextures = TEX.ceiling,
  floorTileDensity = 0.5,
  wallTileDensity = 0.5,
  ceilingTileDensity = 0.3,
  children,
}: RoomProps) {
  const [width, height, depth] = size

  // Simple UV-tiled materials — consistent tiling, no shader hacks
  const wallTileX = width * wallTileDensity
  const wallTileY = height * wallTileDensity
  const wallMat = useTiledMaterial(wallTextures, wallTileX, wallTileY, wallColor, wallRoughness, wallMetalness, envMapIntensity)
  const ceilingMat = useTiledMaterial(ceilingTextures, width * ceilingTileDensity, depth * ceilingTileDensity, ceilingColor, wallRoughness, 0, envMapIntensity * 0.5)

  // Floor: UV-tiled map for reflective floor, or standard material
  const floorTileX = width * floorTileDensity
  const floorTileY = depth * floorTileDensity
  const floorMat = useTiledMaterial(floorTextures, floorTileX, floorTileY, floorColor, 0.8, 0.1, envMapIntensity)

  // Reflective floor needs its own tiled texture (MeshReflectorMaterial doesn't accept a pre-built material)
  const reflFloorPath = floorTextures.color || TEX.floor.color
  const reflFloorTex = useTexture(reflFloorPath)
  const reflFloorMap = useMemo(() => {
    const t = reflFloorTex.clone()
    t.wrapS = t.wrapT = RepeatWrapping
    t.repeat.set(floorTileX, floorTileY)
    t.colorSpace = SRGBColorSpace
    t.needsUpdate = true
    return t
  }, [reflFloorTex, floorTileX, floorTileY])

  const doorFor = (wall: DoorConfig['wall']) => doors.find((d) => d.wall === wall)

  const renderWall = (
    wallLength: number,
    axis: 'x' | 'z',
    sign: number,
    door?: DoorConfig,
  ) => {
    const visualSegs = buildWallSegments(wallLength, height, door)
    const colliderDoor = door
      ? { ...door, width: door.width + DOOR_COLLIDER_CLEARANCE }
      : undefined
    const colliderSegs = buildWallSegments(wallLength, height, colliderDoor)
    const wallOffset = (axis === 'x' ? depth : width) / 2 * sign

    const toCoords = (seg: { uPos: number; uSize: number; yPos: number; ySize: number }) => {
      if (axis === 'x') {
        return { segX: seg.uPos, segZ: wallOffset, halfW: seg.uSize / 2, halfD: WALL_DEPTH / 2 }
      }
      return { segX: wallOffset, segZ: seg.uPos, halfW: WALL_DEPTH / 2, halfD: seg.uSize / 2 }
    }

    return (
      <>
        {colliderSegs.map((seg, i) => {
          const { segX, segZ, halfW, halfD } = toCoords(seg)
          return (
            <RigidBody key={`c${i}`} type="fixed" position={[segX, seg.yPos, segZ]}>
              <CuboidCollider args={[halfW, seg.ySize / 2, halfD]} />
            </RigidBody>
          )
        })}
        {visualSegs.map((seg, i) => {
          const { segX, segZ, halfW, halfD } = toCoords(seg)
          return (
            <mesh key={`m${i}`} position={[segX, seg.yPos, segZ]} castShadow receiveShadow material={wallMat}>
              <boxGeometry args={[halfW * 2, seg.ySize, halfD * 2]} />
            </mesh>
          )
        })}
      </>
    )
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
              map={reflFloorMap}
              blur={[400, 100]}
              resolution={512}
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
            <primitive object={floorMat} attach="material" />
          )}
        </mesh>
      </RigidBody>

      {/* ── Ceiling ────────────────────────────────────────────────────────── */}
      {!omitCeiling && (
        <RigidBody type="fixed" position={[0, height, 0]}>
          <CuboidCollider args={[width / 2, 0.05, depth / 2]} />
          <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow material={ceilingMat}>
            <planeGeometry args={[width, depth]} />
          </mesh>
        </RigidBody>
      )}

      {/* ── Walls ─────────────────────────────────────────────────────────── */}
      {!omitWalls.includes('north') && renderWall(width, 'x', -1, doorFor('north'))}
      {!omitWalls.includes('south') && renderWall(width, 'x', +1, doorFor('south'))}
      {!omitWalls.includes('west') && renderWall(depth, 'z', -1, doorFor('west'))}
      {!omitWalls.includes('east') && renderWall(depth, 'z', +1, doorFor('east'))}

      {children}
    </group>
  )
}

export { TEX }
