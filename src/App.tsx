import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { KeyboardControls, Environment, Lightformer } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import {
  EffectComposer,
  Bloom,
  ToneMapping,
  Vignette,
  SMAA,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { ACESFilmicToneMapping, SRGBColorSpace, AmbientLight } from 'three'
import { getMaxApproachIntensity } from './lib/approachState'

import Player from './components/Player'
import Museum from './components/Museum'
import Exterior from './components/Exterior'
import InfoPanel from './components/InfoPanel'
import HUD from './components/HUD'
import Minimap from './components/Minimap'
import DeepZoom from './components/DeepZoom'

const keyMap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'slow', keys: ['Digit1'] },
  { name: 'normal', keys: ['Digit2'] },
  { name: 'fast', keys: ['Digit3'] },
]

const BASE_AMBIENT = 0.4

/**
 * Ambient light that dims when the player approaches a painting.
 * Reads approach intensity from module-level state each frame (no re-renders).
 */
function DimmableAmbientLight() {
  const lightRef = useRef<AmbientLight>(null)

  useFrame(() => {
    if (!lightRef.current) return
    // Dim from 100% to 35% based on max approach intensity (matches reference)
    const dim = 1 - 0.65 * getMaxApproachIntensity()
    lightRef.current.intensity = BASE_AMBIENT * dim
  })

  return <ambientLight ref={lightRef} intensity={BASE_AMBIENT} />
}

export default function App() {
  return (
    <KeyboardControls map={keyMap}>
      <Canvas
        shadows
        gl={{
          antialias: false,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
        camera={{
          fov: 65,
          near: 0.1,
          far: 300,
          position: [0, 1.65, 0],
        }}
        dpr={[1, 1.5]}
        style={{ position: 'fixed', top: 0, left: 0 }}
      >
        {/* Indoor museum environment — warm Lightformers replace outdoor HDRI */}
        <Environment resolution={256} background={false}>
          {/* Ceiling — broad warm fill from above */}
          <Lightformer
            form="rect"
            intensity={0.8}
            color="#fff5e0"
            position={[0, 5, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[20, 20, 1]}
          />
          {/* Floor bounce — subtle warm uplight */}
          <Lightformer
            form="rect"
            intensity={0.15}
            color="#d4c8a8"
            position={[0, -1, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[20, 20, 1]}
          />
          {/* Side walls — gentle neutral fill from each direction */}
          <Lightformer
            form="rect"
            intensity={0.25}
            color="#e8e0d4"
            position={[-8, 2.5, 0]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[12, 5, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.25}
            color="#e8e0d4"
            position={[8, 2.5, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[12, 5, 1]}
          />
          {/* Back wall — cooler tint for depth */}
          <Lightformer
            form="rect"
            intensity={0.2}
            color="#c8d0e0"
            position={[0, 2.5, -10]}
            rotation={[0, 0, 0]}
            scale={[16, 5, 1]}
          />
          {/* Accent highlight — simulates a skylight hotspot */}
          <Lightformer
            form="circle"
            intensity={1.2}
            color="#fffaf0"
            position={[0, 5, -2]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={3}
          />
        </Environment>

        {/* Dimmable ambient light — darkens when approaching paintings */}
        <DimmableAmbientLight />

        <directionalLight
          position={[0, 10, -15]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-50}
          shadow-camera-far={80}
        />

        {/* Fog — lighter for indoor/outdoor, pushed back for exterior views */}
        <fog attach="fog" args={['#b8c8d8', 40, 180]} />

        {/* Physics world */}
        <Physics gravity={[0, -9.81, 0]}>
          <Suspense fallback={null}>
            <Museum />
            <Exterior />
          </Suspense>
          <Player />
        </Physics>

        {/* Post-processing — order matters */}
        <EffectComposer multisampling={0}>
          <SMAA />
          <Bloom
            intensity={0.3}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.025}
            mipmapBlur
          />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette
            offset={0.3}
            darkness={0.6}
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>
      </Canvas>

      {/* HTML overlay UI */}
      <InfoPanel />
      <HUD />
      <Minimap />
      <DeepZoom />
    </KeyboardControls>
  )
}
