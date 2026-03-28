import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Environment, Lightformer } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import {
  EffectComposer,
  Bloom,
  ToneMapping,
  Vignette,
  SMAA,
  SSAO,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'

import Player from './components/Player'
import Museum from './components/Museum'
import InfoPanel from './components/InfoPanel'
import HUD from './components/HUD'
import Minimap from './components/Minimap'

const keyMap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
]

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
          stencil: false,
          depth: true,
        }}
        camera={{
          fov: 65,
          near: 0.1,
          far: 100,
          position: [0, 1.65, 0],
        }}
        dpr={[1, 1.5]}
        style={{ position: 'fixed', top: 0, left: 0 }}
      >
        {/* Lighting environment — replaces all ambient/directional lights */}
        <Environment resolution={256}>
          <Lightformer
            form="rect"
            intensity={2}
            position={[0, 4, 0]}
            scale={[10, 1, 1]}
            rotation-x={Math.PI / 2}
          />
          <Lightformer
            form="rect"
            intensity={0.5}
            position={[-5, 2, -1]}
            scale={[3, 3, 1]}
            color="#ffe0c0"
          />
          <Lightformer
            form="rect"
            intensity={0.3}
            position={[5, 3, -10]}
            scale={[4, 2, 1]}
            color="#e0e8ff"
          />
        </Environment>

        {/* Direct lighting for room interiors */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[0, 10, -15]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-camera-far={50}
        />

        {/* Fog for depth */}
        <fog attach="fog" args={['#0a0a0a', 20, 80]} />

        {/* Physics world */}
        <Physics gravity={[0, -9.81, 0]}>
          <Suspense fallback={null}>
            <Museum />
          </Suspense>
          <Player />
        </Physics>

        {/* Post-processing — order matters */}
        <EffectComposer multisampling={0}>
          <SMAA />
          <SSAO
            radius={0.05}
            intensity={30}
            luminanceInfluence={0.6}
            color="black"
          />
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
    </KeyboardControls>
  )
}
