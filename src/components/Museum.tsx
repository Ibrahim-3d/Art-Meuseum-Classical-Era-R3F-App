import Room from './Room'
import Painting from './Painting'
import MusicStation from './MusicStation'
import { Text } from '@react-three/drei'
import { paintings } from '../data/paintings'
import { music } from '../data/music'

function musicFor(roomId: string) {
  return music.filter((m) => m.room === roomId)
}

/*
  Layout — 3-column grid, all rooms connected via walkable doors:

  Left (x=-6, w=4)      Center (x=0, w=8)      Right (x=6, w=4)
  X: -8 to -4           X: -4 to +4            X: +4 to +8

  Row 1 (z=0):    Wing A  ←→  Lobby    ←→  Hall 1
  Row 2 (z=-10):  Wing B  ←→  Immersive ←→  Hall 2
  Row 3 (z=-20):  Wing C  ←→  Atrium   ←→  Hall 3
  Row 4 (z=-30):              Rooftop

  Paintings/MusicStations use WORLD positions and render as siblings
  of Room (not children), since Room wraps children in a positioned group.
  Only room-local decorations (Text labels, lights) go as Room children.
*/

export default function Museum() {
  return (
    <group>
      {/* ════════════════════════════════════════════════════════════════════
          LEFT COLUMN — Painting Wings
          ════════════════════════════════════════════════════════════════════ */}

      {/* Wing A: Renaissance */}
      <Room
        position={[-6, 0, 0]}
        size={[4, 4, 10]}
        wallColor="#e8e0d0"
        floorColor="#2a2218"
        ceilingColor="#f5f0e8"
        wallRoughness={0.85}
        envMapIntensity={0.8}
        doors={[
          { wall: 'north', width: 1.6, height: 2.4 },
          { wall: 'east', width: 1.6, height: 2.4 },
        ]}
      />

      {/* Wing B: Baroque */}
      <Room
        position={[-6, 0, -10]}
        size={[4, 4, 10]}
        wallColor="#3d1c1c"
        floorColor="#1a1010"
        ceilingColor="#2a1a1a"
        wallRoughness={0.7}
        wallMetalness={0.05}
        envMapIntensity={0.6}
        doors={[
          { wall: 'south', width: 1.6, height: 2.4 },
          { wall: 'north', width: 1.6, height: 2.4 },
          { wall: 'east', width: 1.6, height: 2.4 },
        ]}
      />

      {/* Wing C: Neoclassical & Romantic */}
      <Room
        position={[-6, 0, -20]}
        size={[4, 4, 10]}
        wallColor="#f0ebe0"
        floorColor="#1e1c18"
        ceilingColor="#faf7f2"
        wallRoughness={0.9}
        envMapIntensity={1.0}
        doors={[
          { wall: 'south', width: 1.6, height: 2.4 },
          { wall: 'east', width: 1.6, height: 2.4 },
        ]}
      />

      {/* All paintings — world-space positions */}
      {paintings.map((p) => (
        <Painting key={p.id} data={p} />
      ))}

      {/* ════════════════════════════════════════════════════════════════════
          CENTER COLUMN — Shared Spaces
          ════════════════════════════════════════════════════════════════════ */}

      {/* Lobby — Grand entrance hall */}
      <Room
        position={[0, 0, 0]}
        size={[8, 4, 10]}
        wallColor="#d4cbb8"
        floorColor="#1a1815"
        ceilingColor="#ece6d8"
        wallRoughness={0.75}
        envMapIntensity={1.0}
        doors={[
          { wall: 'west', width: 1.6, height: 2.4 },
          { wall: 'east', width: 1.6, height: 2.4 },
          { wall: 'north', width: 2.0, height: 2.8 },
        ]}
      >
        <Text
          position={[0, 3.2, -4.8]}
          fontSize={0.3}
          color="#8B7355"
          anchorX="center"
          anchorY="middle"
        >
          Echoes & Visions
        </Text>
        <Text
          position={[0, 2.8, -4.8]}
          fontSize={0.12}
          color="#666"
          anchorX="center"
          anchorY="middle"
        >
          A Virtual Classical Museum
        </Text>
        <Text
          position={[-3.8, 2.6, 0]}
          fontSize={0.1}
          color="#997755"
          anchorX="center"
          rotation={[0, Math.PI / 2, 0]}
        >
          {'← Paintings'}
        </Text>
        <Text
          position={[3.8, 2.6, 0]}
          fontSize={0.1}
          color="#997755"
          anchorX="center"
          rotation={[0, -Math.PI / 2, 0]}
        >
          {'Music →'}
        </Text>
        <pointLight position={[0, 3.5, 0]} intensity={5} color="#fff5e0" />
      </Room>

      {/* Immersive Chamber — Dark audiovisual room */}
      <Room
        position={[0, 0, -10]}
        size={[8, 4, 10]}
        wallColor="#0e0e12"
        floorColor="#080810"
        ceilingColor="#060608"
        wallRoughness={0.95}
        envMapIntensity={0.2}
        doors={[
          { wall: 'south', width: 2.0, height: 2.8 },
          { wall: 'north', width: 2.0, height: 2.8 },
          { wall: 'west', width: 1.6, height: 2.4 },
          { wall: 'east', width: 1.6, height: 2.4 },
        ]}
      >
        <Text
          position={[0, 3.2, -4.8]}
          fontSize={0.2}
          color="#334"
          anchorX="center"
          anchorY="middle"
        >
          Immersive Chamber
        </Text>
        <pointLight position={[0, 3, 0]} intensity={2} color="#1a1a3a" />
      </Room>

      {/* Central Atrium — Hub */}
      <Room
        position={[0, 0, -20]}
        size={[8, 5, 10]}
        wallColor="#c8bfa8"
        floorColor="#1c1a16"
        ceilingColor="#e0d8c8"
        wallRoughness={0.7}
        envMapIntensity={1.2}
        doors={[
          { wall: 'south', width: 2.0, height: 2.8 },
          { wall: 'north', width: 2.0, height: 2.8 },
          { wall: 'west', width: 1.6, height: 2.4 },
          { wall: 'east', width: 1.6, height: 2.4 },
        ]}
      >
        <Text
          position={[0, 4.0, -4.8]}
          fontSize={0.25}
          color="#8B7355"
          anchorX="center"
          anchorY="middle"
        >
          Central Atrium
        </Text>
        <Text
          position={[0, 3.6, -4.8]}
          fontSize={0.1}
          color="#666"
          anchorX="center"
          anchorY="middle"
        >
          Explore all eras of human genius
        </Text>
        <pointLight position={[0, 4.5, 0]} intensity={5} color="#fff5e0" />
      </Room>

      {/* Rooftop Terrace */}
      <Room
        position={[0, 0, -30]}
        size={[10, 4, 10]}
        wallColor="#c0b8a0"
        floorColor="#3a3630"
        ceilingColor="#87CEEB"
        wallRoughness={0.6}
        envMapIntensity={1.5}
        doors={[
          { wall: 'south', width: 2.0, height: 2.8 },
        ]}
      >
        <Text
          position={[0, 3.2, -4.8]}
          fontSize={0.2}
          color="#5a4a3a"
          anchorX="center"
          anchorY="middle"
        >
          Rooftop Terrace
        </Text>
        <Text
          position={[0, 2.0, -4.5]}
          fontSize={0.08}
          color="#6a5a4a"
          anchorX="center"
          anchorY="middle"
          maxWidth={6}
          textAlign="center"
        >
          {"You've spent time with the hands and minds of 22 artists\nacross 500 years. What stays with you?"}
        </Text>
        <pointLight position={[0, 3.5, 0]} intensity={8} color="#ffd4a0" />
        <pointLight position={[4, 2, -3]} intensity={3} color="#ff9060" />
      </Room>

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT COLUMN — Music Halls
          ════════════════════════════════════════════════════════════════════ */}

      {/* Hall 1: Baroque Music */}
      <Room
        position={[6, 0, 0]}
        size={[4, 4, 10]}
        wallColor="#5c4033"
        floorColor="#2a1f15"
        ceilingColor="#4a3828"
        wallRoughness={0.6}
        wallMetalness={0.05}
        envMapIntensity={0.7}
        doors={[
          { wall: 'west', width: 1.6, height: 2.4 },
          { wall: 'north', width: 1.6, height: 2.4 },
        ]}
      >
        <Text
          position={[0, 3.2, -4.8]}
          fontSize={0.15}
          color="#c0a878"
          anchorX="center"
          anchorY="middle"
        >
          Baroque Music Hall
        </Text>
        <pointLight position={[0, 3, 0]} intensity={4} color="#ffe0b0" />
      </Room>

      {/* Hall 2: Classical Music */}
      <Room
        position={[6, 0, -10]}
        size={[4, 4, 10]}
        wallColor="#f0ece0"
        floorColor="#3a3020"
        ceilingColor="#faf5ea"
        wallRoughness={0.8}
        envMapIntensity={1.0}
        doors={[
          { wall: 'west', width: 1.6, height: 2.4 },
          { wall: 'south', width: 1.6, height: 2.4 },
          { wall: 'north', width: 1.6, height: 2.4 },
        ]}
      >
        <Text
          position={[0, 3.2, -4.8]}
          fontSize={0.15}
          color="#8B7355"
          anchorX="center"
          anchorY="middle"
        >
          Classical Music Hall
        </Text>
        <pointLight position={[0, 3, 0]} intensity={5} color="#fffef0" />
      </Room>

      {/* Hall 3: Romantic Music */}
      <Room
        position={[6, 0, -20]}
        size={[4, 4, 10]}
        wallColor="#2a2018"
        floorColor="#1a1510"
        ceilingColor="#3a2e22"
        wallRoughness={0.65}
        wallMetalness={0.1}
        envMapIntensity={0.5}
        doors={[
          { wall: 'west', width: 1.6, height: 2.4 },
          { wall: 'south', width: 1.6, height: 2.4 },
        ]}
      >
        <Text
          position={[0, 3.2, -4.8]}
          fontSize={0.15}
          color="#c0a070"
          anchorX="center"
          anchorY="middle"
        >
          Romantic Music Hall
        </Text>
        <pointLight position={[-1, 2.5, 0]} intensity={3} color="#ff9050" />
        <pointLight position={[1, 2.5, 0]} intensity={3} color="#ffa060" />
      </Room>

      {/* Music stations — world-space positions */}
      {musicFor('hall1').map((m, i) => (
        <group key={m.id} position={[5 + i * 1.2, 0, 0]}>
          <MusicStation data={m} />
        </group>
      ))}
      {musicFor('hall2').map((m, i) => (
        <group key={m.id} position={[5 + i * 1.2, 0, -10]}>
          <MusicStation data={m} />
        </group>
      ))}
      {musicFor('hall3').map((m, i) => (
        <group key={m.id} position={[5 + i * 1.0, 0, -20]}>
          <MusicStation data={m} />
        </group>
      ))}
    </group>
  )
}
