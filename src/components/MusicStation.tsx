import { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Text } from '@react-three/drei'
import { Mesh, DoubleSide } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { MusicData } from '../data/music'
import { useMuseum } from '../stores/useMuseum'

// ── Floating portrait image ─────────────────────────────────────────────────

function ComposerPortrait({ composerId, size = 0.7 }: { composerId: string; size?: number }) {
  const texture = useTexture(`/artists/${composerId}.webp`)
  const meshRef = useRef<Mesh>(null)

  // Gentle float: bob up/down + slow Y rotation
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.position.y = 1.55 + Math.sin(t * 0.8) * 0.04
    meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.12
  })

  return (
    <mesh ref={meshRef} position={[0, 1.55, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture} side={DoubleSide} transparent toneMapped={false} />
    </mesh>
  )
}

// ── Fallback while portrait loads ───────────────────────────────────────────

function PortraitFallback() {
  const meshRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.position.y = 1.55 + Math.sin(clock.getElapsedTime() * 0.8) * 0.04
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.5
  })

  return (
    <mesh ref={meshRef} position={[0, 1.55, 0]}>
      <octahedronGeometry args={[0.25]} />
      <meshStandardMaterial color="#c8a86e" wireframe />
    </mesh>
  )
}

// ── Main MusicStation ───────────────────────────────────────────────────────

interface MusicStationProps {
  data: MusicData
}

export default function MusicStation({ data }: MusicStationProps) {
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    useMuseum.getState().setPlayingMusic(data.id)
  }

  return (
    <group onClick={handleClick}>
      {/* ── Pedestal base ─────────────────────────────── */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.08, 0.7]} />
        <meshStandardMaterial color="#2a2420" roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.55, 0]} receiveShadow>
        <cylinderGeometry args={[0.15, 0.22, 0.9, 12]} />
        <meshStandardMaterial color="#3d3530" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 16]} />
        <meshStandardMaterial
          color="#8a8070"
          roughness={0.2}
          metalness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* ── Floating composer portrait ────────────────── */}
      <Suspense fallback={<PortraitFallback />}>
        <ComposerPortrait composerId={data.composerId} />
      </Suspense>

      {/* ── Glow ring under the portrait ──────────────── */}
      <mesh position={[0, 1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.32, 32]} />
        <meshBasicMaterial color="#e8c870" transparent opacity={0.25} />
      </mesh>

      {/* ── Warm accent light (no shadow — keeps GPU budget under 16 units) */}
      <pointLight
        position={[0, 2.5, 0]}
        intensity={8}
        color="#fff5e0"
        distance={4}
        decay={2}
      />

      {/* ── Text labels ───────────────────────────────── */}
      <Text
        position={[0, 0.6, 0.24]}
        fontSize={0.065}
        color="#f5e6c8"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.8}
        textAlign="center"
      >
        {data.composer}
      </Text>
      <Text
        position={[0, 0.42, 0.24]}
        fontSize={0.045}
        color="#a09070"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.8}
        textAlign="center"
      >
        {data.title}
      </Text>
      <Text
        position={[0, 0.28, 0.24]}
        fontSize={0.035}
        color="#706050"
        anchorX="center"
        anchorY="middle"
      >
        {data.era} · {data.year}
      </Text>
    </group>
  )
}
