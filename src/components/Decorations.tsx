/**
 * Blockout furniture & decoration primitives for the museum.
 * Every piece is built from basic Three.js geometry — no models needed.
 */

// ── Bench ────────────────────────────────────────────────────────────────────

interface BenchProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
}

export function Bench({ position, rotation = [0, 0, 0], color = '#8B7355' }: BenchProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.05, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.5, 0.22, 0]} castShadow>
        <boxGeometry args={[0.05, 0.44, 0.35]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.5, 0.22, 0]} castShadow>
        <boxGeometry args={[0.05, 0.44, 0.35]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  )
}

// ── Column ───────────────────────────────────────────────────────────────────

interface ColumnProps {
  position: [number, number, number]
  height?: number
  radius?: number
  color?: string
}

export function Column({ position, height = 4, radius = 0.2, color = '#d4cbb8' }: ColumnProps) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[radius * 3, 0.2, radius * 3]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Shaft */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 0.85, radius, height - 0.4, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Capital */}
      <mesh position={[0, height - 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[radius * 3.2, 0.2, radius * 3.2]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

// ── Pedestal ─────────────────────────────────────────────────────────────────

interface PedestalProps {
  position: [number, number, number]
  size?: [number, number, number]
  color?: string
}

export function Pedestal({ position, size = [0.6, 1, 0.6], color = '#c8bfa8' }: PedestalProps) {
  const [w, h, d] = size
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 1.2, 0.1, d * 1.2]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Body */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Top slab */}
      <mesh position={[0, h + 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 1.1, 0.05, d * 1.1]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

// ── Grand Piano ──────────────────────────────────────────────────────────────

interface GrandPianoProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
}

export function GrandPiano({ position, rotation = [0, 0, 0], color = '#1a1a1a' }: GrandPianoProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.15, 1.0]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Lid (tilted open) */}
      <mesh position={[0, 0.95, -0.3]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[1.45, 0.03, 0.7]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Keyboard face */}
      <mesh position={[0, 0.7, 0.5]}>
        <boxGeometry args={[1.2, 0.05, 0.08]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.4} />
      </mesh>
      {/* Front-left leg */}
      <mesh position={[-0.6, 0.35, 0.4]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.7, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Front-right leg */}
      <mesh position={[0.6, 0.35, 0.4]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.7, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Back leg */}
      <mesh position={[0, 0.35, -0.4]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.7, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  )
}

// ── Organ Pipes ──────────────────────────────────────────────────────────────

interface OrganPipesProps {
  position: [number, number, number]
  count?: number
  color?: string
}

export function OrganPipes({ position, count = 13, color = '#c0b0a0' }: OrganPipesProps) {
  const pipes = []
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    // Tallest in center, shorter at edges
    const h = 1.5 + Math.sin(t * Math.PI) * 2.5
    const x = (i - (count - 1) / 2) * 0.25
    const r = 0.06 + Math.sin(t * Math.PI) * 0.03
    pipes.push(
      <mesh key={i} position={[x, h / 2, 0]} castShadow>
        <cylinderGeometry args={[r, r, h, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>,
    )
  }
  return <group position={position}>{pipes}</group>
}

// ── Candelabra ───────────────────────────────────────────────────────────────

interface CandelabraProps {
  position: [number, number, number]
  height?: number
  color?: string
}

export function Candelabra({ position, height = 1.5, color = '#b8962e' }: CandelabraProps) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.1, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, height, 6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Center candle */}
      <mesh position={[0, height + 0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.8} />
      </mesh>
      {/* Left arm + candle */}
      <mesh position={[-0.15, height - 0.1, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[-0.25, height + 0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 6]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.8} />
      </mesh>
      {/* Right arm + candle */}
      <mesh position={[0.15, height - 0.1, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.02]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0.25, height + 0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 6]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.8} />
      </mesh>
      {/* Warm glow */}
      <pointLight position={[0, height + 0.2, 0]} intensity={3} color="#ff9040" distance={6} decay={2} />
    </group>
  )
}

// ── Chandelier ───────────────────────────────────────────────────────────────

interface ChandelierProps {
  position: [number, number, number]
  radius?: number
  color?: string
}

export function Chandelier({ position, radius = 0.8, color = '#d4b44a' }: ChandelierProps) {
  const arms = 6
  return (
    <group position={position}>
      {/* Chain / drop rod */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.8, 4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Central hub */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Arms with candles */}
      {Array.from({ length: arms }).map((_, i) => {
        const angle = (i / arms) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        return (
          <group key={i}>
            {/* Arm */}
            <mesh position={[x / 2, -0.05, z / 2]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[radius, 0.02, 0.02]} />
              <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Candle */}
            <mesh position={[x, 0, z]}>
              <cylinderGeometry args={[0.02, 0.02, 0.12, 6]} />
              <meshStandardMaterial color="#f5f0e0" roughness={0.8} />
            </mesh>
            {/* Flame glow */}
            <mesh position={[x, 0.08, z]}>
              <sphereGeometry args={[0.015, 4, 4]} />
              <meshStandardMaterial color="#ffcc44" emissive="#ffaa22" emissiveIntensity={3} />
            </mesh>
          </group>
        )
      })}
      {/* Central warm light */}
      <pointLight position={[0, -0.1, 0]} intensity={8} color="#ffe0b0" distance={12} decay={2} />
    </group>
  )
}

// ── Balustrade ───────────────────────────────────────────────────────────────

interface BalustradeProps {
  position: [number, number, number]
  length?: number
  color?: string
  rotation?: [number, number, number]
}

export function Balustrade({
  position,
  length = 4,
  color = '#c8bfa8',
  rotation = [0, 0, 0],
}: BalustradeProps) {
  const spacing = 0.4
  const count = Math.floor(length / spacing)
  const balusters = []
  for (let i = 0; i <= count; i++) {
    const x = -length / 2 + i * spacing
    balusters.push(
      <mesh key={i} position={[x, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.7, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>,
    )
  }
  return (
    <group position={position} rotation={rotation}>
      {/* Bottom rail */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.06, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Top rail */}
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.06, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Balusters */}
      {balusters}
    </group>
  )
}

// ── Window Frame ─────────────────────────────────────────────────────────────

interface WindowFrameProps {
  position: [number, number, number]
  size?: [number, number]
  color?: string
  rotation?: [number, number, number]
}

export function WindowFrame({
  position,
  size = [1.2, 2.0],
  color = '#8B7355',
  rotation = [0, 0, 0],
}: WindowFrameProps) {
  const [w, h] = size
  const t = 0.08 // frame thickness
  const mullion = 0.04 // cross-bar thickness
  return (
    <group position={position} rotation={rotation}>
      {/* Frame — left, right, top, bottom */}
      <mesh position={[-w / 2, 0, 0]} castShadow>
        <boxGeometry args={[t, h, t]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[w / 2, 0, 0]} castShadow>
        <boxGeometry args={[t, h, t]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w + t, t, t]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, -h / 2, 0]} castShadow>
        <boxGeometry args={[w + t, t, t]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Horizontal mullion (cross-bar) */}
      <mesh position={[0, h * 0.15, 0]}>
        <boxGeometry args={[w - t, mullion, mullion]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Vertical mullion */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[mullion, h - t, mullion]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Glass pane — transparent with slight tint and environment reflections */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[w - t, h - t]} />
        <meshPhysicalMaterial
          color="#cce8f0"
          transparent
          opacity={0.18}
          roughness={0.05}
          metalness={0.1}
          transmission={0.92}
          thickness={0.1}
          envMapIntensity={1.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      {/* Faint glow behind glass (simulates exterior light) */}
      <pointLight position={[0, 0, -0.5]} intensity={1.5} color="#e8dcc0" distance={4} decay={2} />
    </group>
  )
}

// ── Skylight ─────────────────────────────────────────────────────────────────

interface SkylightProps {
  position: [number, number, number]
  size?: [number, number]
  color?: string
}

/** Ceiling skylight — glass panel with frame and warm overhead light */
export function Skylight({
  position,
  size = [2, 2],
  color = '#8B7355',
}: SkylightProps) {
  const [w, d] = size
  const t = 0.06
  return (
    <group position={position}>
      {/* Frame edges */}
      <mesh position={[0, 0, -d / 2]}>
        <boxGeometry args={[w + t, t, t]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, d / 2]}>
        <boxGeometry args={[w + t, t, t]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[-w / 2, 0, 0]}>
        <boxGeometry args={[t, t, d + t]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[w / 2, 0, 0]}>
        <boxGeometry args={[t, t, d + t]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Cross mullions */}
      <mesh>
        <boxGeometry args={[w - t, t * 0.6, t * 0.6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh>
        <boxGeometry args={[t * 0.6, t * 0.6, d - t]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Glass pane — frosted, warm diffuse */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - t, d - t]} />
        <meshPhysicalMaterial
          color="#f0e8d0"
          transparent
          opacity={0.25}
          roughness={0.3}
          transmission={0.8}
          thickness={0.15}
          envMapIntensity={0.8}
        />
      </mesh>
      {/* Warm overhead light through the skylight */}
      <pointLight position={[0, -0.3, 0]} intensity={4} color="#fff5e0" distance={8} decay={2} />
    </group>
  )
}

// ── Sconce ────────────────────────────────────────────────────────────────────

interface SconceProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
}

export function Sconce({ position, rotation = [0, 0, 0], color = '#b8962e' }: SconceProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wall plate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.1, 0.12, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Arm */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.03, 0.03, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Cup */}
      <mesh position={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.04, 0.03, 0.04, 6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Flame */}
      <mesh position={[0, 0.04, 0.2]}>
        <sphereGeometry args={[0.015, 4, 4]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ffaa22" emissiveIntensity={4} />
      </mesh>
      <pointLight position={[0, 0.05, 0.25]} intensity={2} color="#ff9040" distance={5} decay={2} />
    </group>
  )
}

// ── Urn ──────────────────────────────────────────────────────────────────────

interface UrnProps {
  position: [number, number, number]
  color?: string
}

export function Urn({ position, color = '#a09080' }: UrnProps) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.1, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.18, 0.4, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.1, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 0.63, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.08, 0.06, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

// ── Arch Frame ───────────────────────────────────────────────────────────────

interface ArchFrameProps {
  position: [number, number, number]
  width?: number
  height?: number
  color?: string
  rotation?: [number, number, number]
}

export function ArchFrame({
  position,
  width = 2,
  height = 3,
  color = '#c8bfa8',
  rotation = [0, 0, 0],
}: ArchFrameProps) {
  const pillarW = 0.2
  return (
    <group position={position} rotation={rotation}>
      {/* Left pillar */}
      <mesh position={[-width / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[pillarW, height, pillarW]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Right pillar */}
      <mesh position={[width / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[pillarW, height, pillarW]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Lintel */}
      <mesh position={[0, height + 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + pillarW * 2, 0.25, pillarW]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}
