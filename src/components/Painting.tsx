import { useRef, useEffect, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture, Text } from '@react-three/drei'
import { SpotLight, Object3D, Vector3, Group } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { PaintingData } from '../data/paintings'
import { useMuseum } from '../stores/useMuseum'
import {
  setApproachIntensity,
  APPROACH_INNER,
  APPROACH_OUTER,
  APPROACH_SCALE_MAX,
  APPROACH_LERP_SPEED,
} from '../lib/approachState'

interface PaintingProps {
  data: PaintingData
}

// Reusable vector to avoid per-frame allocation
const _paintingPos = new Vector3()

function handleClick(data: PaintingData) {
  return (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    useMuseum.getState().setDeepZoomPainting(data.id)
  }
}

/** Placeholder shown while texture is loading */
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

function PaintingCanvas({ data }: PaintingProps) {
  return (
    <Suspense fallback={<PlaceholderCanvas data={data} />}>
      <TexturedCanvas data={data} />
    </Suspense>
  )
}

export default function Painting({ data }: PaintingProps) {
  const groupRef = useRef<Group>(null)
  const lightRef = useRef<SpotLight>(null)
  const targetRef = useRef<Object3D>(null)
  const { camera } = useThree()

  const approachRef = useRef(0)

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current
      lightRef.current.target.updateMatrixWorld()
    }
  }, [])

  useEffect(() => {
    return () => setApproachIntensity(data.id, 0)
  }, [data.id])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    _paintingPos.set(data.position[0], data.position[1], data.position[2])
    const dist = camera.position.distanceTo(_paintingPos)

    const nx = Math.sin(data.rotation[1])
    const nz = Math.cos(data.rotation[1])
    const toPlayerX = camera.position.x - data.position[0]
    const toPlayerZ = camera.position.z - data.position[2]
    const onFrontSide = toPlayerX * nx + toPlayerZ * nz > 0

    let target = 0
    if (onFrontSide) {
      if (dist <= APPROACH_INNER) {
        target = 1
      } else if (dist < APPROACH_OUTER) {
        target = (APPROACH_OUTER - dist) / (APPROACH_OUTER - APPROACH_INNER)
      }
    }

    approachRef.current += (target - approachRef.current) * APPROACH_LERP_SPEED

    const scale = 1 + (APPROACH_SCALE_MAX - 1) * approachRef.current
    group.scale.setScalar(scale)

    setApproachIntensity(data.id, approachRef.current)

    if (lightRef.current) {
      lightRef.current.visible = approachRef.current > 0.01
      lightRef.current.intensity = 50 * approachRef.current
    }
  })

  return (
    <group ref={groupRef} position={data.position} rotation={data.rotation}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[data.size[0] + 0.1, data.size[1] + 0.1, 0.05]} />
        <meshStandardMaterial color="#8B7355" roughness={0.3} metalness={0.6} />
      </mesh>

      <PaintingCanvas data={data} />

      {/* ── Label plate below painting ── */}
      <group position={[0, -(data.size[1] / 2 + 0.18), 0.03]}>
        <mesh>
          <planeGeometry args={[Math.min(data.size[0], 1.6), 0.22]} />
          <meshStandardMaterial color="#1a1816" roughness={0.4} metalness={0.2} />
        </mesh>
        <Text
          position={[0, 0.04, 0.005]}
          fontSize={0.05}
          color="#e8dcc0"
          anchorX="center"
          anchorY="middle"
          maxWidth={Math.min(data.size[0], 1.5)}
          textAlign="center"
        >
          {data.title}
        </Text>
        <Text
          position={[0, -0.05, 0.005]}
          fontSize={0.035}
          color="#a09880"
          anchorX="center"
          anchorY="middle"
          maxWidth={Math.min(data.size[0], 1.5)}
          textAlign="center"
        >
          {`${data.artist}, ${data.year}`}
        </Text>
      </group>

      {/* Spotlight target */}
      <object3D ref={targetRef} position={[0, 0, 0]} />

      {/* Spotlight — starts hidden/zero so useFrame controls it from frame 1 */}
      <spotLight
        ref={lightRef}
        position={[0, 1.5, 1]}
        angle={0.4}
        penumbra={0.8}
        intensity={0}
        visible={false}
        color="#fff5e0"
      />
    </group>
  )
}
