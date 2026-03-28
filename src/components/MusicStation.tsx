import { Text } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { MusicData } from '../data/music'
import { useMuseum } from '../stores/useMuseum'

interface MusicStationProps {
  data: MusicData
}

export default function MusicStation({ data }: MusicStationProps) {
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    useMuseum.getState().setPlayingMusic(data.id)
  }

  return (
    <group>
      {/* Podium */}
      <mesh onClick={handleClick}>
        <cylinderGeometry args={[0.3, 0.4, 0.8, 16]} />
        <meshStandardMaterial color="#4a3728" roughness={0.6} />
      </mesh>

      {/* Composer name above the podium */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.15}
        color="#f5e6c8"
        anchorX="center"
        anchorY="bottom"
        maxWidth={1.2}
        textAlign="center"
      >
        {data.composer}
      </Text>

      {/* Piece title just above the composer name */}
      <Text
        position={[0, 1.05, 0]}
        fontSize={0.1}
        color="#c8b89a"
        anchorX="center"
        anchorY="bottom"
        maxWidth={1.4}
        textAlign="center"
      >
        {data.title}
      </Text>
    </group>
  )
}
