import { useMemo, ReactNode, useEffect } from 'react'
import { SphereGeometry, DoubleSide } from 'three'
import Room, { TEX } from './Room'
import Painting from './Painting'
import MusicStation from './MusicStation'
import { Text, useTexture } from '@react-three/drei'
import { paintings } from '../data/paintings'
import { music } from '../data/music'
import { useMuseum } from '../stores/useMuseum'
import type { RoomId } from '../data/paintings'
import {
  Bench,
  Column,
  Pedestal,
  GrandPiano,
  OrganPipes,
  Candelabra,
  Chandelier,
  Balustrade,
  WindowFrame,
  ArchFrame,
  Sconce,
  Urn,
  Skylight,
} from './Decorations'

function musicFor(roomId: string) {
  return music.filter((m) => m.room === roomId)
}

// Room adjacency — which rooms are visible (through doors) from each room
const ROOM_ADJACENCY: Record<RoomId, RoomId[]> = {
  lobby:     ['lobby', 'wingA', 'hall1', 'immersive'],
  wingA:     ['wingA', 'lobby', 'wingB', 'hall1'],
  wingB:     ['wingB', 'wingA', 'wingC', 'immersive'],
  wingC:     ['wingC', 'wingB', 'atrium'],
  immersive: ['immersive', 'lobby', 'wingB', 'hall2', 'atrium'],
  atrium:    ['atrium', 'immersive', 'wingC', 'hall3', 'rooftop'],
  rooftop:   ['rooftop', 'atrium'],
  hall1:     ['hall1', 'lobby', 'hall2', 'wingA'],
  hall2:     ['hall2', 'hall1', 'hall3', 'immersive'],
  hall3:     ['hall3', 'hall2', 'atrium'],
}

/**
 * Preloads painting textures for all rooms adjacent to the current room.
 * Runs as a side-effect whenever the player changes rooms so textures are
 * already in the Three.js loader cache before the player walks through the door.
 * useTexture.preload() is a static method — safe to call outside render.
 */
function TexturePreloader() {
  const currentRoom = useMuseum((s) => s.currentRoom)

  useEffect(() => {
    const adjacentRooms = ROOM_ADJACENCY[currentRoom] ?? []
    paintings
      .filter((p) => adjacentRooms.includes(p.room))
      .forEach((p) => useTexture.preload(p.image))
  }, [currentRoom])

  return null
}

/** Hides a room's rendering when the player is far away. Physics colliders stay active. */
function VisibleRoom({ roomId, children }: { roomId: RoomId; children: ReactNode }) {
  const currentRoom = useMuseum((s) => s.currentRoom)
  const visible = ROOM_ADJACENCY[currentRoom]?.includes(roomId) ?? true
  return <group visible={visible}>{children}</group>
}

/*
  MASTER LAYOUT — Rooms connect flush at shared boundaries

  Wings (left):   center x=-13, w=12  → W=-19  E=-7
  Center:         center x=0,   w=14  → W=-7   E=+7
  Halls (right):  center x=+12, w=10  → W=+7   E=+17

  Row 0 (z=  0):  Wing A   ←→  Lobby      ←→  Hall 1
  Row 1 (z=-16):  Wing B   ←→  Immersive  ←→  Hall 2
  Row 2 (z=-32):  Wing C   ←→  Atrium     ←→  Hall 3
  Row 3 (z=-48):                Rooftop (16w)

  Shared walls:
    x=-7:  wings keep east wall (with door), center omits west
    x=+7:  center keeps east wall (with door), halls omit west
    z boundaries: upper row keeps north wall, lower row omits south
*/

/** Create a dome (bottom half of a sphere) by clipping triangles above the equator. */
function useDomeGeometry(radius: number, segments: number) {
  return useMemo(() => {
    const geo = new SphereGeometry(radius, segments, segments)
    const pos = geo.getAttribute('position')
    const idx = geo.getIndex()
    if (!pos || !idx) return geo

    // Keep only triangles whose ALL 3 vertices are at or above the equator (y >= -0.01)
    // This is the TOP half — the dome that curves upward
    const kept: number[] = []
    for (let i = 0; i < idx.count; i += 3) {
      const a = idx.getX(i)
      const b = idx.getX(i + 1)
      const c = idx.getX(i + 2)
      if (pos.getY(a) >= -0.01 && pos.getY(b) >= -0.01 && pos.getY(c) >= -0.01) {
        kept.push(a, b, c)
      }
    }
    geo.setIndex(kept)
    return geo
  }, [radius, segments])
}

/** Dome mesh — renders the bottom half-sphere at a given Y position */
function DomeMesh({ y, radius, segments, color, emissive }: {
  y: number; radius: number; segments: number; color: string; emissive?: string
}) {
  const geo = useDomeGeometry(radius, segments)
  return (
    <mesh position={[0, y, 0]} geometry={geo}>
      <meshStandardMaterial
        color={color}
        roughness={0.6}
        side={DoubleSide}
        emissive={emissive || '#000000'}
        emissiveIntensity={emissive ? 0.3 : 0}
      />
    </mesh>
  )
}

function DoorSign({ position, rotation = [0, 0, 0], text, subtitle }: {
  position: [number, number, number]
  rotation?: [number, number, number]
  text: string
  subtitle?: string
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[1.4, 0.35, 0.03]} />
        <meshStandardMaterial color="#1a1816" roughness={0.4} metalness={0.2} />
      </mesh>
      <Text position={[0, 0.04, 0.06]} fontSize={0.09} color="#e8dcc0" anchorX="center" anchorY="middle">
        {text}
      </Text>
      {subtitle && (
        <Text position={[0, -0.08, 0.06]} fontSize={0.05} color="#a09880" anchorX="center" anchorY="middle">
          {subtitle}
        </Text>
      )}
    </group>
  )
}

export default function Museum() {
  return (
    <group>
      <TexturePreloader />
      {/* ════════════════════════════════════════════════════════════════════
          LEFT COLUMN — Painting Wings (12w × 16d × 6h, center x=-13)
          ════════════════════════════════════════════════════════════════════ */}

      {/* ── Wing A: Renaissance ─────────────────────────────────────────── */}
      <VisibleRoom roomId="wingA">
        <Room
          position={[-13, 0, 0]}
          size={[12, 6, 16]}
          wallColor="#e8e0d0"
          floorColor="#c4a882"
          ceilingColor="#f5f0e8"
          wallRoughness={0.85}
          envMapIntensity={0.8}
          doors={[
            { wall: 'east', width: 3.0, height: 3.5 },
            { wall: 'north', width: 2.8, height: 3.5 },
          ]}
        >
          <Skylight position={[-3, 5.95, -3]} size={[2.5, 2.5]} />
          <Skylight position={[3, 5.95, 3]} size={[2.5, 2.5]} />
          <Skylight position={[-3, 5.95, 4]} size={[2, 2]} />
          <Bench position={[-3.5, 0, -5]} rotation={[0, Math.PI / 2, 0]} />
          <Bench position={[-3.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
          <Bench position={[-3.5, 0, 5]} rotation={[0, Math.PI / 2, 0]} />
          <Bench position={[0, 0, 0]} rotation={[0, Math.PI, 0]} />
          <Column position={[5.5, 0, -3]} height={6} />
          <Column position={[5.5, 0, 3]} height={6} />
          <Text position={[0, 5.2, -7.7]} fontSize={0.25} color="#8B7355" anchorX="center">
            Wing A — The Renaissance
          </Text>
          <Text position={[0, 4.8, -7.7]} fontSize={0.1} color="#999" anchorX="center">
            1400 – 1600
          </Text>
          <DoorSign position={[5.9, 3.8, 0]} rotation={[0, -Math.PI / 2, 0]} text="→ Lobby" subtitle="Main Hall" />
          <DoorSign position={[0, 3.8, -7.9]} text="→ Wing B" subtitle="Baroque Era" />
          <pointLight position={[0, 5.5, 0]} intensity={4} color="#fff5e0" />
        </Room>
      </VisibleRoom>

      {/* ── Wing B: Baroque ─────────────────────────────────────────────── */}
      <VisibleRoom roomId="wingB">
        <Room
          position={[-13, 0, -16]}
          size={[12, 6, 16]}
          wallColor="#3d1c1c"
          floorColor="#2a2020"
          ceilingColor="#2a1a1a"
          wallRoughness={0.7}
          wallMetalness={0.05}
          envMapIntensity={0.4}
          doors={[
            { wall: 'east', width: 2.8, height: 3.5 },
            { wall: 'north', width: 2.8, height: 3.5 },
          ]}
          omitWalls={['south']}
        >
          <Column position={[-5, 0, -6]} height={6} color="#4a3028" />
          <Column position={[-5, 0, 6]} height={6} color="#4a3028" />
          <Column position={[5, 0, -5]} height={6} color="#4a3028" />
          <Column position={[5, 0, 5]} height={6} color="#4a3028" />
          <Column position={[-3, 0, -6]} height={6} color="#4a3028" />
          <Column position={[3, 0, 6]} height={6} color="#4a3028" />
          <Candelabra position={[-3.5, 0, -4]} height={1.8} />
          <Candelabra position={[-3.5, 0, 4]} height={1.8} />
          <Candelabra position={[3.5, 0, 0]} height={1.8} />
          <Candelabra position={[-3.5, 0, 0]} height={1.8} />
          <Sconce position={[-5.8, 2.8, -5]} rotation={[0, Math.PI / 2, 0]} />
          <Sconce position={[-5.8, 2.8, -1]} rotation={[0, Math.PI / 2, 0]} />
          <Sconce position={[-5.8, 2.8, 3]} rotation={[0, Math.PI / 2, 0]} />
          <Bench position={[-3.5, 0, -2]} rotation={[0, Math.PI / 2, 0]} color="#4a3028" />
          <Bench position={[-3.5, 0, 2]} rotation={[0, Math.PI / 2, 0]} color="#4a3028" />
          <Text position={[0, 5.2, -7.7]} fontSize={0.25} color="#c0a070" anchorX="center">
            Wing B — The Baroque
          </Text>
          <Text position={[0, 4.8, -7.7]} fontSize={0.1} color="#806040" anchorX="center">
            1600 – 1750
          </Text>
          <DoorSign position={[5.9, 3.8, 0]} rotation={[0, -Math.PI / 2, 0]} text="→ Immersive" subtitle="Chamber" />
          <DoorSign position={[0, 3.8, -7.9]} text="→ Wing C" subtitle="Neoclassical & Romantic" />
        </Room>
      </VisibleRoom>

      {/* ── Wing C: Neoclassical & Romantic ─────────────────────────────── */}
      <VisibleRoom roomId="wingC">
        <Room
          position={[-13, 0, -32]}
          size={[12, 6, 16]}
          wallColor="#f0ebe0"
          floorColor="#d8d0c0"
          ceilingColor="#faf7f2"
          wallRoughness={0.9}
          envMapIntensity={1.0}
          floorTextures={TEX.marble}
          wallTextures={TEX.marble}
          floorTileDensity={0.7}
          wallTileDensity={0.4}
          doors={[
            { wall: 'east', width: 2.8, height: 3.5 },
          ]}
          omitWalls={['south']}
        >
          <Pedestal position={[-4, 0, -5]} />
          <Urn position={[-4, 1.05, -5]} />
          <Pedestal position={[4, 0, -5]} />
          <Urn position={[4, 1.05, -5]} />
          <Pedestal position={[-4, 0, 5]} />
          <Urn position={[-4, 1.05, 5]} />
          <Pedestal position={[4, 0, 5]} />
          <Urn position={[4, 1.05, 5]} />
          <Bench position={[-4, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
          <Bench position={[0, 0, 0]} />
          <Skylight position={[-2, 5.95, -3]} size={[3, 2.5]} />
          <Skylight position={[2, 5.95, 3]} size={[2.5, 2.5]} />
          <Column position={[5.5, 0, -3]} height={6} color="#d0c8b8" />
          <Column position={[5.5, 0, 3]} height={6} color="#d0c8b8" />
          <Text position={[0, 5.2, -7.7]} fontSize={0.25} color="#5a4a3a" anchorX="center">
            Wing C — Neoclassical & Romantic
          </Text>
          <Text position={[0, 4.8, -7.7]} fontSize={0.1} color="#999" anchorX="center">
            1750 – 1850
          </Text>
          <DoorSign position={[5.9, 3.8, 0]} rotation={[0, -Math.PI / 2, 0]} text="→ Atrium" subtitle="Central Hub" />
          <pointLight position={[0, 5.5, 0]} intensity={5} color="#fff5e0" />
        </Room>
      </VisibleRoom>

      {/* All paintings — culled per room visibility */}
      {paintings.map((p) => (
        <VisibleRoom key={p.id} roomId={p.room}>
          <Painting data={p} />
        </VisibleRoom>
      ))}

      {/* ════════════════════════════════════════════════════════════════════
          CENTER COLUMN — 14w × 16d, center x=0
          ════════════════════════════════════════════════════════════════════ */}

      {/* ── Lobby — Grand circular hall (8m tall) ──────────────────────── */}
      <VisibleRoom roomId="lobby">
      <Room
        position={[0, 0, 0]}
        size={[14, 8, 16]}
        wallColor="#d4cbb8"
        floorColor="#e8dcc8"
        ceilingColor="#ece6d8"
        wallRoughness={0.75}
        envMapIntensity={1.0}
        floorTextures={TEX.marble}
        floorTileDensity={0.6}
        omitWalls={['west']}
        omitCeiling
        doors={[
          { wall: 'east', width: 3.0, height: 3.5 },
          { wall: 'north', width: 3.0, height: 4.0 },
          { wall: 'south', width: 3.6, height: 5.0 },
        ]}
      >
        {/* Grand dome — bottom half of a sphere, positioned at ceiling (y=8).
            The equator rim sits at y=8, the bowl curves down to y=2 (radius 6).
            DoubleSide so the concave interior is visible from below. */}
        <DomeMesh y={8} radius={6} segments={32} color="#e8dcc0" />
        {/* Fresco band — slightly smaller dome inside */}
        <DomeMesh y={8} radius={5.8} segments={32} color="#c8a868" emissive="#554422" />
        {/* Oculus light from dome center */}
        <pointLight position={[0, 7, 0]} intensity={12} color="#fff5e0" distance={14} decay={2} />

        {/* Circular colonnade — 12 columns at r=5.5m, skipping doorways */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const r = 5.5
          const cx = Math.cos(angle) * r
          const cz = Math.sin(angle) * r
          if (Math.abs(cx) < 2.0 && Math.abs(cz) > 4.5) return null
          if (Math.abs(cz) < 2.0 && Math.abs(cx) > 4.5) return null
          return <Column key={i} position={[cx, 0, cz]} height={8} radius={0.28} color="#d4cbb8" />
        })}

        {/* Floor inlay rings */}
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.5, 5.0, 48]} />
          <meshStandardMaterial color="#b8962e" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.0, 3.1, 48]} />
          <meshStandardMaterial color="#8B7355" roughness={0.5} />
        </mesh>

        {/* Central globe */}
        <Pedestal position={[0, 0, 0]} size={[1.4, 1.8, 1.4]} color="#c8bfa8" />
        <mesh position={[0, 3.0, 0]}>
          <sphereGeometry args={[0.9, 32, 20]} />
          <meshStandardMaterial color="#2a5a7a" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 3.0, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.018, 0.018, 2.2, 6]} />
          <meshStandardMaterial color="#b8962e" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 3.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.92, 0.012, 8, 48]} />
          <meshStandardMaterial color="#b8962e" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Floor timeline */}
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 14]} />
          <meshStandardMaterial color="#8B7355" roughness={0.5} />
        </mesh>
        {[
          { z: 6, label: '1400', era: 'Early Renaissance' },
          { z: 3.5, label: '1500', era: 'High Renaissance' },
          { z: 1, label: '1600', era: 'Baroque' },
          { z: -1.5, label: '1700', era: 'Late Baroque' },
          { z: -4, label: '1800', era: 'Romantic' },
          { z: -6, label: '1900', era: 'Modern' },
        ].map((era) => (
          <group key={era.label}>
            <mesh position={[0, 0.007, era.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.18, 16]} />
              <meshStandardMaterial color="#b8962e" roughness={0.4} metalness={0.5} />
            </mesh>
            <Text position={[0.5, 0.01, era.z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.14} color="#8B7355" anchorX="left" anchorY="middle">
              {era.label}
            </Text>
            <Text position={[0.5, 0.01, era.z + 0.3]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.07} color="#a09878" anchorX="left" anchorY="middle">
              {era.era}
            </Text>
          </group>
        ))}

        {/* Glowing archways */}
        <ArchFrame position={[-7, 0, 0]} width={3.0} height={4.0} rotation={[0, Math.PI / 2, 0]} color="#c8bfa8" />
        <pointLight position={[-6.5, 2.5, 0]} intensity={5} color="#e4b03c" distance={7} decay={2} />
        <Text position={[-6.5, 3.5, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.2} color="#e4b03c" anchorX="center">
          Paintings
        </Text>
        <Text position={[-6.5, 3.1, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.08} color="#c0983c" anchorX="center">
          Renaissance · Baroque · Romantic
        </Text>

        <ArchFrame position={[6.9, 0, 0]} width={3.0} height={4.0} rotation={[0, Math.PI / 2, 0]} color="#c8bfa8" />
        <pointLight position={[6.5, 2.5, 0]} intensity={5} color="#4a8ac0" distance={7} decay={2} />
        <Text position={[6.5, 3.5, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.2} color="#4a8ac0" anchorX="center">
          Music
        </Text>
        <Text position={[6.5, 3.1, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.08} color="#3878a0" anchorX="center">
          Baroque · Classical · Romantic
        </Text>

        {/* Grand title */}
        <Text position={[0, 6.5, -7.7]} fontSize={0.55} color="#8B7355" anchorX="center" anchorY="middle">
          Echoes & Visions
        </Text>
        <Text position={[0, 5.8, -7.7]} fontSize={0.16} color="#666" anchorX="center" anchorY="middle">
          A Virtual Classical Museum
        </Text>

        <DoorSign position={[0, 4.5, -7.7]} text="↑ Immersive Chamber" />
        <DoorSign position={[0, 5.2, 7.7]} rotation={[0, Math.PI, 0]} text="↓ Exit" subtitle="To Gardens" />
        <WindowFrame position={[-3, 5.5, 7.9]} size={[1.6, 2.0]} color="#c0a878" />
        <WindowFrame position={[3, 5.5, 7.9]} size={[1.6, 2.0]} color="#c0a878" />
        <Chandelier position={[0, 7, 0]} radius={1.8} />
      </Room>
      </VisibleRoom>

      {/* ── Immersive Chamber ───────────────────────────────────────────── */}
      <VisibleRoom roomId="immersive">
      <Room
        position={[0, 0, -16]}
        size={[14, 6, 16]}
        wallColor="#0e0e12"
        floorColor="#2a2830"
        ceilingColor="#060608"
        wallRoughness={0.95}
        envMapIntensity={0.15}
        doors={[
          { wall: 'east', width: 2.8, height: 3.5 },
          { wall: 'north', width: 3.0, height: 3.5 },
        ]}
        omitWalls={['west', 'south']}
      >
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <cylinderGeometry args={[4, 4, 0.2, 32]} />
          <meshStandardMaterial color="#1a1a24" roughness={0.9} />
        </mesh>
        <Text position={[0, 5.2, -7.7]} fontSize={0.25} color="#445" anchorX="center" anchorY="middle">
          Immersive Chamber
        </Text>
        <Text position={[0, 4.7, -7.7]} fontSize={0.09} color="#334" anchorX="center" anchorY="middle">
          A generative audiovisual experience
        </Text>
        <pointLight position={[0, 5, 0]} intensity={1.5} color="#1a1a3a" />
        <pointLight position={[-4, 1.5, -5]} intensity={0.8} color="#2244aa" distance={8} />
        <pointLight position={[4, 1.5, 5]} intensity={0.8} color="#aa2244" distance={8} />
        <pointLight position={[0, 1.5, 0]} intensity={0.5} color="#22aa44" distance={6} />
      </Room>
      </VisibleRoom>

      {/* ── Central Atrium — Hub (7m tall) ──────────────────────────────── */}
      <VisibleRoom roomId="atrium">
      <Room
        position={[0, 0, -32]}
        size={[14, 7, 16]}
        wallColor="#c8bfa8"
        floorColor="#d8ceb8"
        floorTextures={TEX.marble}
        floorTileDensity={0.6}
        ceilingColor="#e0d8c8"
        wallRoughness={0.7}
        envMapIntensity={1.2}
        doors={[
          { wall: 'east', width: 3.0, height: 3.5 },
          { wall: 'north', width: 3.0, height: 4.0 },
        ]}
        omitWalls={['west', 'south']}
      >
        <mesh position={[0, 0.35, 0]} receiveShadow>
          <cylinderGeometry args={[1.5, 1.8, 0.7, 16]} />
          <meshStandardMaterial color="#a09888" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.35, 0.6, 0.6, 12]} />
          <meshStandardMaterial color="#b0a898" roughness={0.4} />
        </mesh>
        <Pedestal position={[-5, 0, -6]} color="#b8a888" />
        <Urn position={[-5, 1.05, -6]} />
        <Pedestal position={[5, 0, -6]} color="#b8a888" />
        <Urn position={[5, 1.05, -6]} />
        <Pedestal position={[-5, 0, 6]} color="#b8a888" />
        <Urn position={[-5, 1.05, 6]} />
        <Pedestal position={[5, 0, 6]} color="#b8a888" />
        <Urn position={[5, 1.05, 6]} />
        <Bench position={[-3, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Bench position={[3, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
        <Bench position={[0, 0, -4]} />
        <Bench position={[0, 0, 4]} />
        <Skylight position={[-3, 6.95, -3]} size={[3, 3]} />
        <Skylight position={[3, 6.95, 3]} size={[3, 3]} />
        <Text position={[0, 6.0, -7.7]} fontSize={0.3} color="#8B7355" anchorX="center" anchorY="middle">
          Central Atrium
        </Text>
        <Text position={[0, 5.5, -7.7]} fontSize={0.1} color="#666" anchorX="center" anchorY="middle">
          Explore all eras of human genius
        </Text>
        <DoorSign position={[-6.8, 4.0, 0]} rotation={[0, Math.PI / 2, 0]} text="← Wing C" subtitle="Neoclassical & Romantic" />
        <DoorSign position={[6.8, 4.0, 0]} rotation={[0, -Math.PI / 2, 0]} text="Hall 3 →" subtitle="Romantic Music" />
        <DoorSign position={[0, 4.5, -7.7]} text="↑ Rooftop Terrace" />
        <Chandelier position={[0, 6.5, -3]} radius={1.3} />
        <Chandelier position={[0, 6.5, 3]} radius={1.0} />
        <pointLight position={[0, 6.5, 0]} intensity={6} color="#fff5e0" />
      </Room>
      </VisibleRoom>

      {/* ── Rooftop Terrace ─────────────────────────────────────────────── */}
      <VisibleRoom roomId="rooftop">
      <Room
        position={[0, 0, -48]}
        size={[16, 5, 16]}
        wallColor="#c0b8a0"
        floorColor="#a09080"
        ceilingColor="#87CEEB"
        wallRoughness={0.6}
        envMapIntensity={1.5}
        doors={[]}
        omitWalls={['south']}
      >
        <Balustrade position={[0, 0, -7.8]} length={15} />
        <Balustrade position={[-7.8, 0, 0]} length={15} rotation={[0, Math.PI / 2, 0]} />
        <Balustrade position={[7.8, 0, 0]} length={15} rotation={[0, Math.PI / 2, 0]} />
        <Bench position={[-3, 0, -4]} />
        <Bench position={[3, 0, -4]} />
        <Bench position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Pedestal position={[-7, 0, -7]} size={[0.5, 0.8, 0.5]} />
        <Urn position={[-7, 0.85, -7]} />
        <Pedestal position={[7, 0, -7]} size={[0.5, 0.8, 0.5]} />
        <Urn position={[7, 0.85, -7]} />
        <Text position={[0, 4.0, -7.7]} fontSize={0.3} color="#5a4a3a" anchorX="center" anchorY="middle">
          Rooftop Terrace
        </Text>
        <Text position={[0, 2.5, -7.5]} fontSize={0.09} color="#6a5a4a" anchorX="center" anchorY="middle" maxWidth={10} textAlign="center">
          {"You've spent time with the hands and minds of 22 artists\nacross 500 years. What stays with you?"}
        </Text>
        <pointLight position={[0, 4.5, 0]} intensity={8} color="#ffd4a0" />
        <pointLight position={[6, 2, -5]} intensity={3} color="#ff9060" />
      </Room>
      </VisibleRoom>

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT COLUMN — Music Halls (10w × 16d × 6h, center x=+12)
          ════════════════════════════════════════════════════════════════════ */}

      {/* ── Hall 1: Baroque Music ───────────────────────────────────────── */}
      <VisibleRoom roomId="hall1">
      <Room
        position={[12, 0, 0]}
        size={[10, 6, 16]}
        wallColor="#5c4033"
        floorColor="#9a7a55"
        ceilingColor="#4a3828"
        wallRoughness={0.6}
        wallMetalness={0.05}
        envMapIntensity={0.7}
        doors={[
          { wall: 'north', width: 2.8, height: 3.5 },
        ]}
        omitWalls={['west']}
      >
        <OrganPipes position={[0, 0, -7.5]} count={19} color="#c0b0a0" />
        <Bench position={[-2, 0, -2]} color="#5c4033" />
        <Bench position={[2, 0, -2]} color="#5c4033" />
        <Bench position={[-2, 0, 1]} color="#5c4033" />
        <Bench position={[2, 0, 1]} color="#5c4033" />
        <Bench position={[-2, 0, 4]} color="#5c4033" />
        <Bench position={[2, 0, 4]} color="#5c4033" />
        <Candelabra position={[-4, 0, -4]} height={1.8} />
        <Candelabra position={[4, 0, -4]} height={1.8} />
        <Candelabra position={[-4, 0, 3]} height={1.8} />
        <Candelabra position={[4, 0, 3]} height={1.8} />
        <Text position={[0, 5.2, -7.7]} fontSize={0.22} color="#c0a878" anchorX="center" anchorY="middle">
          Hall I — Baroque Music
        </Text>
        <Text position={[0, 4.8, -7.7]} fontSize={0.1} color="#806848" anchorX="center" anchorY="middle">
          Bach · Vivaldi · Handel
        </Text>
        <DoorSign position={[0, 3.8, -7.9]} text="→ Hall II" subtitle="Classical Music" />
        <pointLight position={[0, 5, 0]} intensity={4} color="#ffe0b0" />
      </Room>
      </VisibleRoom>

      {/* ── Hall 2: Classical Music ─────────────────────────────────────── */}
      <VisibleRoom roomId="hall2">
      <Room
        position={[12, 0, -16]}
        size={[10, 6, 16]}
        wallColor="#f0ece0"
        floorColor="#c8b898"
        ceilingColor="#faf5ea"
        wallRoughness={0.8}
        envMapIntensity={1.0}
        doors={[
          { wall: 'north', width: 2.8, height: 3.5 },
        ]}
        omitWalls={['west', 'south']}
      >
        <GrandPiano position={[0, 0, -3]} rotation={[0, -Math.PI / 4, 0]} />
        <Chandelier position={[0, 5.8, 0]} radius={1.2} />
        <Bench position={[-3, 0, 2]} rotation={[0, 0.3, 0]} />
        <Bench position={[0, 0, 3]} />
        <Bench position={[3, 0, 2]} rotation={[0, -0.3, 0]} />
        <Bench position={[-3, 0, 5]} rotation={[0, 0.3, 0]} />
        <Bench position={[3, 0, 5]} rotation={[0, -0.3, 0]} />
        <WindowFrame position={[4.9, 2.8, -5]} size={[1.2, 2.4]} rotation={[0, -Math.PI / 2, 0]} />
        <WindowFrame position={[4.9, 2.8, -1]} size={[1.2, 2.4]} rotation={[0, -Math.PI / 2, 0]} />
        <WindowFrame position={[4.9, 2.8, 3]} size={[1.2, 2.4]} rotation={[0, -Math.PI / 2, 0]} />
        <WindowFrame position={[4.9, 2.8, 6]} size={[1.2, 2.4]} rotation={[0, -Math.PI / 2, 0]} />
        <Text position={[0, 5.2, -7.7]} fontSize={0.22} color="#8B7355" anchorX="center" anchorY="middle">
          Hall II — Classical Music
        </Text>
        <Text position={[0, 4.8, -7.7]} fontSize={0.1} color="#806848" anchorX="center" anchorY="middle">
          Mozart · Beethoven
        </Text>
        <DoorSign position={[0, 3.8, -7.9]} text="→ Hall III" subtitle="Romantic Music" />
      </Room>
      </VisibleRoom>

      {/* ── Hall 3: Romantic Music ──────────────────────────────────────── */}
      <VisibleRoom roomId="hall3">
      <Room
        position={[12, 0, -32]}
        size={[10, 6, 16]}
        wallColor="#2a2018"
        floorColor="#7a5a3a"
        ceilingColor="#3a2e22"
        wallRoughness={0.65}
        wallMetalness={0.1}
        envMapIntensity={0.4}
        doors={[]}
        omitWalls={['west', 'south']}
      >
        <GrandPiano position={[1.5, 0, -3]} rotation={[0, Math.PI / 6, 0]} />
        <Candelabra position={[-4, 0, -6]} height={1.8} />
        <Candelabra position={[4, 0, -6]} height={1.8} />
        <Candelabra position={[-4, 0, 0]} height={1.8} />
        <Candelabra position={[4, 0, 0]} height={1.8} />
        <Candelabra position={[-4, 0, 6]} height={1.8} />
        <Candelabra position={[4, 0, 6]} height={1.8} />
        <WindowFrame position={[4.9, 2.8, -5]} size={[1.2, 2.8]} rotation={[0, -Math.PI / 2, 0]} />
        <WindowFrame position={[4.9, 2.8, 0]} size={[1.2, 2.8]} rotation={[0, -Math.PI / 2, 0]} />
        <WindowFrame position={[4.9, 2.8, 5]} size={[1.2, 2.8]} rotation={[0, -Math.PI / 2, 0]} />
        <Bench position={[-2.5, 0, 2]} rotation={[0, Math.PI / 2, 0]} color="#3a2818" />
        <Bench position={[-2.5, 0, 5]} rotation={[0, Math.PI / 2, 0]} color="#3a2818" />
        <Text position={[0, 5.2, -7.7]} fontSize={0.22} color="#c0a070" anchorX="center" anchorY="middle">
          Hall III — Romantic Music
        </Text>
        <Text position={[0, 4.8, -7.7]} fontSize={0.1} color="#806848" anchorX="center" anchorY="middle">
          Chopin · Tchaikovsky · Debussy · Rachmaninoff · Schubert
        </Text>
      </Room>
      </VisibleRoom>

      {/* ════════════════════════════════════════════════════════════════════
          MUSIC STATIONS — culled per hall visibility
          ════════════════════════════════════════════════════════════════════ */}
      {/* Hall 1 (Baroque): 5 stations, staggered left/right along the hall */}
      <VisibleRoom roomId="hall1">
        {musicFor('hall1').map((m, i) => {
          const side = i % 2 === 0 ? -3 : 3
          const z = -5 + Math.floor(i / 2) * 4.5
          return <group key={m.id} position={[12 + side, 0, z]} rotation={[0, side > 0 ? -0.3 : 0.3, 0]}><MusicStation data={m} /></group>
        })}
      </VisibleRoom>
      {/* Hall 2 (Classical): 4 stations, staggered */}
      <VisibleRoom roomId="hall2">
        {musicFor('hall2').map((m, i) => {
          const side = i % 2 === 0 ? -3 : 3
          const z = -21 + Math.floor(i / 2) * 5
          return <group key={m.id} position={[12 + side, 0, z]} rotation={[0, side > 0 ? -0.3 : 0.3, 0]}><MusicStation data={m} /></group>
        })}
      </VisibleRoom>
      {/* Hall 3 (Romantic): 6 stations, staggered */}
      <VisibleRoom roomId="hall3">
        {musicFor('hall3').map((m, i) => {
          const side = i % 2 === 0 ? -3 : 3
          const z = -38 + Math.floor(i / 2) * 4
          return <group key={m.id} position={[12 + side, 0, z]} rotation={[0, side > 0 ? -0.3 : 0.3, 0]}><MusicStation data={m} /></group>
        })}
      </VisibleRoom>
    </group>
  )
}
