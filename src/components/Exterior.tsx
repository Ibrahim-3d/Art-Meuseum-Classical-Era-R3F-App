/**
 * Exterior environment — displaced terrain, scattered trees, museum shell, sky.
 *
 * Museum interior footprint: x ∈ [-12.3, 12.3], z ∈ [-42.3, 6.3]
 * Building shell walls sit just outside that at ±12.15 / ±42.15 / 6.15.
 * Terrain must stay completely clear of the building interior.
 */

import { useMemo, useEffect, useRef } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Sky } from '@react-three/drei'
import {
  PlaneGeometry,
  DoubleSide,
  Object3D,
  CylinderGeometry,
  ConeGeometry,
  SphereGeometry,
  MeshStandardMaterial,
  InstancedMesh,
} from 'three'

// ── Deterministic pseudo-random generator ────────────────────────────────────

function createRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ── Museum exclusion zone ────────────────────────────────────────────────────
// Building footprint: wings x ∈ [-19, -7], center x ∈ [-7, +7], halls x ∈ [+7, +17]
// Rows z: +8 (south) to -56 (north, rooftop back)
// Bounding box with margin:
const MU_X_MIN = -19.8
const MU_X_MAX = 17.8
const MU_Z_MIN = -56.8 // north edge - margin (rooftop back)
const MU_Z_MAX = 8.8 // south edge + margin
// (MU_Z_CENTER removed — use BLD_CZ from BuildingShell instead)
const RAMP_WIDTH = 10 // meters for a gentle ramp from floor level → hills

// Entrance approach zone — stone path extends south from the door
const ENT_HALF_W = 4.0 // half-width of the entrance clearing
const ENT_Z_MAX = 22 // how far south the clearing extends

/** Signed distance to an axis-aligned box [xMin,xMax] × [zMin,zMax]. */
function signedDistToBox(
  x: number, z: number,
  xMin: number, xMax: number, zMin: number, zMax: number,
): number {
  const dxMin = xMin - x
  const dxMax = x - xMax
  const dzMin = zMin - z
  const dzMax = z - zMax

  const dxInside = Math.max(dxMin, dxMax) // negative when inside on X
  const dzInside = Math.max(dzMin, dzMax) // negative when inside on Z

  if (dxInside < 0 && dzInside < 0) {
    return Math.max(dxInside, dzInside) // inside → negative
  }
  const ox = Math.max(0, dxInside)
  const oz = Math.max(0, dzInside)
  return Math.sqrt(ox * ox + oz * oz) // outside → positive
}

// ── Terrain height function ──────────────────────────────────────────────────

// Under building interior (hidden by walls) — slightly below floor to avoid z-fight
const BURIED_LEVEL = -0.1

function terrainHeight(x: number, z: number): number {
  const dBuilding = signedDistToBox(x, z, MU_X_MIN, MU_X_MAX, MU_Z_MIN, MU_Z_MAX)
  const dEntrance = signedDistToBox(x, z, -ENT_HALF_W, ENT_HALF_W, MU_Z_MAX, ENT_Z_MAX)
  const dist = Math.min(dBuilding, dEntrance)

  // Inside entrance approach — flush with museum floor (y=0) so the player
  // walks straight in without hitting a step
  if (dEntrance < 0) return 0

  // Inside building footprint (not entrance) — hidden under floor
  if (dBuilding < 0) return BURIED_LEVEL

  // Hills formula
  const h =
    Math.sin(x * 0.04) * Math.cos(z * 0.05) * 2.5 +
    Math.sin(x * 0.09 + z * 0.06) * 1.8 +
    Math.cos(x * 0.025 - z * 0.03) * 1.5
  const hillHeight = Math.max(0, h)

  // Past ramp → full hills
  if (dist > RAMP_WIDTH) return hillHeight

  // Ramp zone: gently rise from ground level (0) to hill height
  const t = dist / RAMP_WIDTH
  const smooth = t * t * (3 - 2 * t)
  return hillHeight * smooth
}

// ── Building Shell ───────────────────────────────────────────────────────────

const FACADE_COLOR = '#c0b8a0'
const FACADE_MAT = { color: FACADE_COLOR, roughness: 0.85, metalness: 0.02 }

// Building bounding box derived from room layout
const BLD_X_MIN = -19.15
const BLD_X_MAX = 17.15
const BLD_Z_MIN = -56.15
const BLD_Z_MAX = 8.15
const BLD_W = BLD_X_MAX - BLD_X_MIN // ~30.3
const BLD_D = BLD_Z_MAX - BLD_Z_MIN // ~64.3
const BLD_CX = (BLD_X_MIN + BLD_X_MAX) / 2 // ~-1
const BLD_CZ = (BLD_Z_MIN + BLD_Z_MAX) / 2 // ~-24
const BLD_H = 8 // match tallest room (lobby)

// Entrance gap: 3.4m wide (matches lobby south door)
const ENT_GAP = 3.4
const ENT_PIECE_W = (BLD_W - ENT_GAP) / 2
const ENT_LEFT_X = BLD_X_MIN + ENT_PIECE_W / 2
const ENT_RIGHT_X = BLD_X_MAX - ENT_PIECE_W / 2

function BuildingShell() {
  return (
    <group>
      {/* ── South facade — entrance side, split for doorway ── */}
      <RigidBody type="fixed" position={[ENT_LEFT_X, BLD_H / 2, BLD_Z_MAX]}>
        <CuboidCollider args={[ENT_PIECE_W / 2, BLD_H / 2, 0.15]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[ENT_PIECE_W, BLD_H, 0.3]} />
          <meshStandardMaterial {...FACADE_MAT} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[ENT_RIGHT_X, BLD_H / 2, BLD_Z_MAX]}>
        <CuboidCollider args={[ENT_PIECE_W / 2, BLD_H / 2, 0.15]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[ENT_PIECE_W, BLD_H, 0.3]} />
          <meshStandardMaterial {...FACADE_MAT} />
        </mesh>
      </RigidBody>
      {/* Lintel above entrance */}
      <RigidBody type="fixed" position={[BLD_CX, BLD_H - 1, BLD_Z_MAX]}>
        <CuboidCollider args={[ENT_GAP / 2 + 0.3, 1.2, 0.15]} />
        <mesh castShadow>
          <boxGeometry args={[ENT_GAP + 0.6, 2.4, 0.3]} />
          <meshStandardMaterial {...FACADE_MAT} />
        </mesh>
      </RigidBody>

      {/* ── West facade ── */}
      <RigidBody type="fixed" position={[BLD_X_MIN, BLD_H / 2, BLD_CZ]}>
        <CuboidCollider args={[0.15, BLD_H / 2, BLD_D / 2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, BLD_H, BLD_D]} />
          <meshStandardMaterial {...FACADE_MAT} />
        </mesh>
      </RigidBody>

      {/* ── East facade ── */}
      <RigidBody type="fixed" position={[BLD_X_MAX, BLD_H / 2, BLD_CZ]}>
        <CuboidCollider args={[0.15, BLD_H / 2, BLD_D / 2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, BLD_H, BLD_D]} />
          <meshStandardMaterial {...FACADE_MAT} />
        </mesh>
      </RigidBody>

      {/* ── North facade ── */}
      <RigidBody type="fixed" position={[BLD_CX, BLD_H / 2, BLD_Z_MIN]}>
        <CuboidCollider args={[BLD_W / 2, BLD_H / 2, 0.15]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[BLD_W, BLD_H, 0.3]} />
          <meshStandardMaterial {...FACADE_MAT} />
        </mesh>
      </RigidBody>

      {/* ── Roof slabs — split to leave a hole over the lobby dome (x:-7→+7, z:-8→+8) ── */}
      {/* North section (z < -8) */}
      <mesh position={[BLD_CX, BLD_H + 0.05, (BLD_Z_MIN + (-8)) / 2]} receiveShadow>
        <boxGeometry args={[BLD_W, 0.15, (-8) - BLD_Z_MIN]} />
        <meshStandardMaterial color="#a09888" roughness={0.9} />
      </mesh>
      {/* South section (z > +8) — small strip at entrance */}
      <mesh position={[BLD_CX, BLD_H + 0.05, (8 + BLD_Z_MAX) / 2]} receiveShadow>
        <boxGeometry args={[BLD_W, 0.15, BLD_Z_MAX - 8]} />
        <meshStandardMaterial color="#a09888" roughness={0.9} />
      </mesh>
      {/* West strip beside dome (x < -7, z: -8→+8) */}
      <mesh position={[(BLD_X_MIN + (-7)) / 2, BLD_H + 0.05, 0]} receiveShadow>
        <boxGeometry args={[(-7) - BLD_X_MIN, 0.15, 16]} />
        <meshStandardMaterial color="#a09888" roughness={0.9} />
      </mesh>
      {/* East strip beside dome (x > +7, z: -8→+8) */}
      <mesh position={[(7 + BLD_X_MAX) / 2, BLD_H + 0.05, 0]} receiveShadow>
        <boxGeometry args={[BLD_X_MAX - 7, 0.15, 16]} />
        <meshStandardMaterial color="#a09888" roughness={0.9} />
      </mesh>

      {/* ── Foundation strips ── */}
      <mesh position={[BLD_CX, 0.15, BLD_Z_MAX + 0.15]} receiveShadow>
        <boxGeometry args={[BLD_W + 1, 0.3, 1.0]} />
        <meshStandardMaterial color="#a09888" roughness={0.9} />
      </mesh>
      <mesh position={[BLD_X_MIN - 0.15, 0.15, BLD_CZ]} receiveShadow>
        <boxGeometry args={[1.0, 0.3, BLD_D + 1]} />
        <meshStandardMaterial color="#a09888" roughness={0.9} />
      </mesh>
      <mesh position={[BLD_X_MAX + 0.15, 0.15, BLD_CZ]} receiveShadow>
        <boxGeometry args={[1.0, 0.3, BLD_D + 1]} />
        <meshStandardMaterial color="#a09888" roughness={0.9} />
      </mesh>
      <mesh position={[BLD_CX, 0.15, BLD_Z_MIN - 0.15]} receiveShadow>
        <boxGeometry args={[BLD_W + 1, 0.3, 1.0]} />
        <meshStandardMaterial color="#a09888" roughness={0.9} />
      </mesh>

      {/* ── Entrance columns ── */}
      <mesh position={[-(ENT_GAP / 2 + 0.4), BLD_H / 2, BLD_Z_MAX + 0.4]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, BLD_H, 10]} />
        <meshStandardMaterial color="#d4cbb8" roughness={0.5} />
      </mesh>
      <mesh position={[ENT_GAP / 2 + 0.4, BLD_H / 2, BLD_Z_MAX + 0.4]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, BLD_H, 10]} />
        <meshStandardMaterial color="#d4cbb8" roughness={0.5} />
      </mesh>

      {/* Entrance pediment */}
      <mesh position={[0, BLD_H + 0.3, BLD_Z_MAX + 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0, ENT_GAP / 2 + 1.2, 0.25, 3]} />
        <meshStandardMaterial {...FACADE_MAT} />
      </mesh>

      {/* Stone path from entrance */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[0, 0.01, BLD_Z_MAX + 1 + i * 1.5]} receiveShadow>
          <boxGeometry args={[ENT_GAP + 0.5, 0.04, 1.2]} />
          <meshStandardMaterial color="#b0a898" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ── Instanced Trees ──────────────────────────────────────────────────────────

/** Renders all trees using InstancedMesh — 4 draw calls instead of ~500 */
function InstancedTrees({ trees }: { trees: { pos: [number, number, number]; scale: number; round: boolean }[] }) {
  const simpleTrees = useMemo(() => trees.filter(t => !t.round), [trees])
  const roundTrees = useMemo(() => trees.filter(t => t.round), [trees])

  const sTrunkRef = useRef<InstancedMesh>(null)
  const sFoliageRef = useRef<InstancedMesh>(null)
  const rTrunkRef = useRef<InstancedMesh>(null)
  const rFoliageRef = useRef<InstancedMesh>(null)

  // Shared geometries
  const sTrunkGeo = useMemo(() => new CylinderGeometry(0.08, 0.14, 2.4, 6), [])
  const sFoliageGeo = useMemo(() => new ConeGeometry(1.3, 3.0, 7), [])
  const rTrunkGeo = useMemo(() => new CylinderGeometry(0.1, 0.16, 2.8, 6), [])
  const rFoliageGeo = useMemo(() => new SphereGeometry(1.6, 8, 6), [])

  // Shared materials
  const sTrunkMat = useMemo(() => new MeshStandardMaterial({ color: '#5a3a1a', roughness: 0.9 }), [])
  const sFoliageMat = useMemo(() => new MeshStandardMaterial({ color: '#2a5a2a', roughness: 0.85 }), [])
  const rTrunkMat = useMemo(() => new MeshStandardMaterial({ color: '#6a4420', roughness: 0.9 }), [])
  const rFoliageMat = useMemo(() => new MeshStandardMaterial({ color: '#3a6a3a', roughness: 0.8 }), [])

  useEffect(() => {
    const dummy = new Object3D()

    simpleTrees.forEach((t, i) => {
      dummy.position.set(t.pos[0], t.pos[1] + 1.2 * t.scale, t.pos[2])
      dummy.scale.setScalar(t.scale)
      dummy.updateMatrix()
      sTrunkRef.current?.setMatrixAt(i, dummy.matrix)

      dummy.position.y = t.pos[1] + 3.2 * t.scale
      dummy.updateMatrix()
      sFoliageRef.current?.setMatrixAt(i, dummy.matrix)
    })
    if (sTrunkRef.current) {
      sTrunkRef.current.instanceMatrix.needsUpdate = true
      // Disable frustum culling — computeBoundingSphere() only covers origin geometry,
      // causing the entire forest to disappear when the camera looks away from world origin
      sTrunkRef.current.frustumCulled = false
    }
    if (sFoliageRef.current) {
      sFoliageRef.current.instanceMatrix.needsUpdate = true
      sFoliageRef.current.frustumCulled = false
    }

    roundTrees.forEach((t, i) => {
      dummy.position.set(t.pos[0], t.pos[1] + 1.4 * t.scale, t.pos[2])
      dummy.scale.setScalar(t.scale)
      dummy.updateMatrix()
      rTrunkRef.current?.setMatrixAt(i, dummy.matrix)

      dummy.position.y = t.pos[1] + 3.6 * t.scale
      dummy.updateMatrix()
      rFoliageRef.current?.setMatrixAt(i, dummy.matrix)
    })
    if (rTrunkRef.current) {
      rTrunkRef.current.instanceMatrix.needsUpdate = true
      rTrunkRef.current.frustumCulled = false
    }
    if (rFoliageRef.current) {
      rFoliageRef.current.instanceMatrix.needsUpdate = true
      rFoliageRef.current.frustumCulled = false
    }

    // Dispose manually-created resources when instances change
    return () => {
      sTrunkGeo.dispose(); sFoliageGeo.dispose()
      rTrunkGeo.dispose(); rFoliageGeo.dispose()
      sTrunkMat.dispose(); sFoliageMat.dispose()
      rTrunkMat.dispose(); rFoliageMat.dispose()
    }
  }, [simpleTrees, roundTrees, sTrunkGeo, sFoliageGeo, rTrunkGeo, rFoliageGeo, sTrunkMat, sFoliageMat, rTrunkMat, rFoliageMat])

  return (
    <>
      {simpleTrees.length > 0 && (
        <>
          <instancedMesh ref={sTrunkRef} args={[sTrunkGeo, sTrunkMat, simpleTrees.length]} castShadow />
          <instancedMesh ref={sFoliageRef} args={[sFoliageGeo, sFoliageMat, simpleTrees.length]} castShadow />
        </>
      )}
      {roundTrees.length > 0 && (
        <>
          <instancedMesh ref={rTrunkRef} args={[rTrunkGeo, rTrunkMat, roundTrees.length]} castShadow />
          <instancedMesh ref={rFoliageRef} args={[rFoliageGeo, rFoliageMat, roundTrees.length]} castShadow />
        </>
      )}
    </>
  )
}

// ── Main Exterior Component ──────────────────────────────────────────────────

export default function Exterior() {
  // Generate displaced terrain geometry
  const terrainGeo = useMemo(() => {
    const geo = new PlaneGeometry(200, 200, 100, 100)
    const pos = geo.getAttribute('position')
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i)
        const y = pos.getY(i) // plane Y → world Z = -y (rotation -π/2 on X flips sign)
        const h = terrainHeight(x, -y)
        pos.setZ(i, h)
      }
      pos.needsUpdate = true
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  // Generate tree positions deterministically
  const trees = useMemo(() => {
    const rng = createRng(42)
    const result: { pos: [number, number, number]; scale: number; round: boolean }[] = []
    for (let i = 0; i < 250; i++) {
      const x = (rng() - 0.5) * 180
      const z = (rng() - 0.5) * 180
      // Skip museum footprint + generous margin
      if (x > MU_X_MIN - 4 && x < MU_X_MAX + 4 && z > MU_Z_MIN - 4 && z < MU_Z_MAX + 4) continue
      const y = terrainHeight(x, z)
      // Don't place trees below ground level
      if (y < -0.5) continue
      const s = 0.6 + rng() * 0.8
      const round = rng() > 0.5
      result.push({ pos: [x, y, z], scale: s, round })
    }
    return result
  }, [])

  return (
    <group>
      {/* Procedural sky */}
      <Sky sunPosition={[50, 30, -20]} turbidity={8} rayleigh={2} />

      {/* Terrain visual mesh */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <primitive object={terrainGeo} attach="geometry" />
        <meshStandardMaterial color="#4a7a3a" roughness={0.92} side={DoubleSide} />
      </mesh>

      {/*
        Flat ground collider at y=-0.01 covering the entire area.
        Room floors sit at y=0 (1cm higher) so they take priority inside the museum.
        Outside, the player walks on this at ground level.
      */}
      <RigidBody type="fixed" position={[0, -0.01, 0]}>
        <CuboidCollider args={[100, 0.01, 100]} />
      </RigidBody>

      {/* Building shell + foundation */}
      <BuildingShell />

      {/* Trees — instanced (4 draw calls instead of ~500) */}
      <InstancedTrees trees={trees} />

      {/* Ground-level ambient fill for exterior */}
      <hemisphereLight args={['#87CEEB', '#4a7a3a', 0.4]} position={[0, 20, 0]} />
    </group>
  )
}
