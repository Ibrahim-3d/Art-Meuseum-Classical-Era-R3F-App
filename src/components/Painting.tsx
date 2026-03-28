import { useRef, useEffect, useState, Suspense } from 'react'
import { useTexture } from '@react-three/drei'
import { SpotLight, Object3D } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { PaintingData } from '../data/paintings'
import { useMuseum } from '../stores/useMuseum'

interface PaintingProps {
  data: PaintingData
}

type LoadState = 'checking' | 'ready' | 'failed'

function handleClick(data: PaintingData) {
  return (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    useMuseum.getState().setActivePainting(data.id)
  }
}

/** Placeholder shown while checking or if image is missing */
function PlaceholderCanvas({ data }: PaintingProps) {
  return (
    <mesh position={[0, 0, 0.026]} onClick={handleClick(data)}>
      <planeGeometry args={data.size} />
      <meshBasicMaterial color="#2a2420" />
    </mesh>
  )
}

/** Loads the actual texture — must be inside Suspense */
function TexturedCanvas({ data }: PaintingProps) {
  const texture = useTexture(data.image)
  return (
    <mesh position={[0, 0, 0.026]} onClick={handleClick(data)}>
      <planeGeometry args={data.size} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

/** Probes the image URL first, only mounts TexturedCanvas if it exists */
function PaintingCanvas({ data }: PaintingProps) {
  const [loadState, setLoadState] = useState<LoadState>('checking')

  useEffect(() => {
    const img = new Image()
    img.onload = () => setLoadState('ready')
    img.onerror = () => setLoadState('failed')
    img.src = data.image
  }, [data.image])

  if (loadState !== 'ready') {
    return <PlaceholderCanvas data={data} />
  }

  return (
    <Suspense fallback={<PlaceholderCanvas data={data} />}>
      <TexturedCanvas data={data} />
    </Suspense>
  )
}

export default function Painting({ data }: PaintingProps) {
  const lightRef = useRef<SpotLight>(null)
  const targetRef = useRef<Object3D>(null)

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current
      lightRef.current.target.updateMatrixWorld()
    }
  }, [])

  return (
    <group position={data.position} rotation={data.rotation}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[data.size[0] + 0.1, data.size[1] + 0.1, 0.05]} />
        <meshStandardMaterial color="#8B7355" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Painting canvas — probes image, shows placeholder if missing */}
      <PaintingCanvas data={data} />

      {/* Spotlight target */}
      <object3D ref={targetRef} position={[0, 0, 0]} />

      {/* Spotlight above and in front */}
      <spotLight
        ref={lightRef}
        position={[0, 1.5, 1]}
        angle={0.4}
        penumbra={0.8}
        intensity={50}
        castShadow
        shadow-mapSize={[512, 512]}
        color="#fff5e0"
      />
    </group>
  )
}
