The stack

bashnpm create vite@latest echoes-museum -- --template react-ts

cd echoes-museum

npm install three @react-three/fiber @react-three/drei @react-three/postprocessing @react-three/rapier zustand leva

npm install -D @types/three

What each package does and why it's here:

three — The renderer. Everything draws through this. No alternative.

@react-three/fiber (R3F) — React reconciler for Three.js. Lets you write <mesh> instead of new THREE.Mesh(). Handles the render loop, resize, disposal automatically. You never call renderer.render() manually.

@react-three/drei — The toolbox. This is where 80% of your quality comes from:



Environment — loads HDRI for realistic ambient light + reflections on every PBR surface

MeshReflectorMaterial — real-time planar reflections for your marble floors

ContactShadows — soft baked-looking shadows under objects

Lightformer — custom area lights for studio-quality lighting

PointerLockControls — FPS mouse look

KeyboardControls — WASD input abstraction

useGLTF — loads .glb models

Text — 3D text for room signs (uses Troika under the hood)

useTexture — loads painting images as textures

Bvh — bounding volume hierarchy for fast raycasting (click on paintings)



@react-three/postprocessing — The polish layer. Without this it looks like a WebGL demo. With it, it looks like a game engine:



EffectComposer — chains effects together

SSAO — screen-space ambient occlusion (darkens corners and crevices)

Bloom — glow on bright surfaces and emissive materials

ToneMapping — ACESFilmic tone mapping for cinematic color

Vignette — darkens edges, focuses attention center

ChromaticAberration — subtle color fringing at edges (use VERY sparingly)

SMAA — anti-aliasing that doesn't kill performance like MSAA



@react-three/rapier — Rapier physics via WASM. Gives you wall collision, floor gravity, capsule collider for the player. Without physics, WASD movement clips through walls.

zustand — State management. Tracks which paintings the user has viewed, which music is playing, current room, UI panel state. Tiny, no boilerplate.

leva — Debug UI. Gives you sliders and toggles in a panel to tweak every value in real time — light intensity, SSAO radius, bloom strength, fog density, camera height. You delete it before shipping. Essential during development.



Canvas configuration

tsx<Canvas

&#x20; shadows

&#x20; gl={{

&#x20;   antialias: false,        // Let SMAA handle it instead — cheaper

&#x20;   toneMapping: THREE.ACESFilmicToneMapping,

&#x20;   toneMappingExposure: 1.0,

&#x20;   outputColorSpace: THREE.SRGBColorSpace,

&#x20;   powerPreference: "high-performance",

&#x20;   stencil: false,          // Not needed — saves memory

&#x20;   depth: true,

&#x20; }}

&#x20; camera={{

&#x20;   fov: 65,                 // Wider than default 75 — feels less fisheye

&#x20;   near: 0.1,

&#x20;   far: 100,

&#x20;   position: \[0, 1.65, 0], // Eye height \~1.65m

&#x20; }}

&#x20; dpr={\[1, 1.5]}            // Cap pixel ratio — 2x kills performance

>

shadows enables shadow maps globally. antialias: false because SMAA in postprocessing is cheaper and looks better than WebGL's native MSAA. dpr={\[1, 1.5]} caps device pixel ratio — on a Retina display, rendering at 2x doubles the fragment workload for minimal visual gain. 1.5 is the sweet spot.



Environment and lighting

tsximport { Environment, Lightformer } from "@react-three/drei"



<Environment resolution={256} preset={null}>

&#x20; <Lightformer

&#x20;   form="rect"

&#x20;   intensity={2}

&#x20;   position={\[0, 4, 0]}

&#x20;   scale={\[10, 1, 1]}

&#x20;   rotation-x={Math.PI / 2}

&#x20; />

&#x20; <Lightformer

&#x20;   form="rect"

&#x20;   intensity={0.5}

&#x20;   position={\[-5, 2, -1]}

&#x20;   scale={\[3, 3, 1]}

&#x20;   color="#ffe0c0"

&#x20; />

</Environment>

This replaces ALL ambient lights and most directional lights. The Environment component generates a PMREM (prefiltered radiance environment map) that every PBR material in the scene uses for reflections and indirect light. Custom Lightformer elements inside it act as area lights in the environment map — a large rect overhead simulates a ceiling light panel, a warm one on the side simulates a window. This is the single biggest quality jump you can make.

For painting spotlights, add individual <spotLight> components:

tsx<spotLight

&#x20; position={\[2, 3.5, -1]}

&#x20; target-position={\[2, 1.5, -3]}  // Aim at painting center

&#x20; angle={0.4}

&#x20; penumbra={0.8}                   // Soft edge falloff

&#x20; intensity={50}

&#x20; castShadow

&#x20; shadow-mapSize={\[512, 512]}

&#x20; shadow-bias={-0.001}

&#x20; color="#fff5e0"                   // Warm white

/>



Postprocessing chain

tsximport {

&#x20; EffectComposer, SSAO, Bloom,

&#x20; ToneMapping, Vignette, SMAA

} from "@react-three/postprocessing"

import { BlendFunction, ToneMappingMode } from "postprocessing"



<EffectComposer multisampling={0}>

&#x20; <SMAA />

&#x20; <SSAO

&#x20;   radius={0.05}

&#x20;   intensity={30}

&#x20;   luminanceInfluence={0.5}

&#x20;   color="black"

&#x20; />

&#x20; <Bloom

&#x20;   intensity={0.3}

&#x20;   luminanceThreshold={0.9}

&#x20;   luminanceSmoothing={0.025}

&#x20;   mipmapBlur

&#x20; />

&#x20; <ToneMapping mode={ToneMappingMode.ACES\_FILMIC} />

&#x20; <Vignette

&#x20;   offset={0.3}

&#x20;   darkness={0.6}

&#x20;   blendFunction={BlendFunction.NORMAL}

&#x20; />

</EffectComposer>

Order matters. SMAA first (anti-alias the raw render), SSAO second (darken crevices), Bloom third (glow on bright spots), ToneMapping fourth (compress HDR to display range), Vignette last (darken edges). SSAO radius: 0.05 with intensity: 30 gives subtle corner darkening — crank intensity higher for more visible AO. Bloom luminanceThreshold: 0.9 means only very bright surfaces bloom — your painting spotlights will glow slightly, walls won't.



Floor reflections

tsximport { MeshReflectorMaterial } from "@react-three/drei"



<mesh rotation={\[-Math.PI / 2, 0, 0]} position={\[0, 0, 0]}>

&#x20; <planeGeometry args={\[50, 50]} />

&#x20; <MeshReflectorMaterial

&#x20;   blur={\[400, 100]}

&#x20;   resolution={1024}

&#x20;   mixBlur={1}

&#x20;   mixStrength={15}

&#x20;   roughness={0.7}

&#x20;   depthScale={1.2}

&#x20;   minDepthThreshold={0.4}

&#x20;   maxDepthThreshold={1.4}

&#x20;   color="#1a1a1a"

&#x20;   metalness={0.5}

&#x20;   mirror={0}

&#x20; />

</mesh>

resolution: 1024 — renders a reflection texture at 1024px. Higher = sharper reflection, more GPU cost. 1024 is fine for polished stone floors. blur: \[400, 100] — horizontal and vertical blur on the reflection. Higher = softer, more realistic. mixStrength: 15 — how much the reflection blends into the base color. roughness: 0.7 — the floor isn't a perfect mirror, it's polished stone.



Physics and FPS controller

tsximport { Physics, RigidBody, CuboidCollider } from "@react-three/rapier"

import { PointerLockControls, KeyboardControls } from "@react-three/drei"



const keyMap = \[

&#x20; { name: "forward", keys: \["KeyW", "ArrowUp"] },

&#x20; { name: "backward", keys: \["KeyS", "ArrowDown"] },

&#x20; { name: "left", keys: \["KeyA", "ArrowLeft"] },

&#x20; { name: "right", keys: \["KeyD", "ArrowRight"] },

]



<KeyboardControls map={keyMap}>

&#x20; <Canvas ...>

&#x20;   <Physics gravity={\[0, -9.81, 0]}>

&#x20;     {/\* Player capsule \*/}

&#x20;     <RigidBody

&#x20;       type="dynamic"

&#x20;       colliders={false}

&#x20;       lockRotations

&#x20;       position={\[0, 2, 0]}

&#x20;     >

&#x20;       <CuboidCollider args={\[0.3, 0.8, 0.3]} />

&#x20;     </RigidBody>



&#x20;     {/\* Floor \*/}

&#x20;     <RigidBody type="fixed">

&#x20;       <CuboidCollider args={\[25, 0.1, 25]} position={\[0, -0.1, 0]} />

&#x20;     </RigidBody>



&#x20;     {/\* Walls — one per wall segment \*/}

&#x20;     <RigidBody type="fixed">

&#x20;       <CuboidCollider args={\[0.1, 2, 10]} position={\[-5, 2, 0]} />

&#x20;     </RigidBody>

&#x20;   </Physics>



&#x20;   <PointerLockControls />

&#x20; </Canvas>

</KeyboardControls>

The player is a dynamic RigidBody with a cuboid collider (capsule shape approximated). lockRotations prevents the physics body from tumbling — only the camera rotates via PointerLockControls. Every wall and floor is a fixed RigidBody with a CuboidCollider matching its geometry. The player physically can't walk through them.

Your movement hook reads keyboard state each frame and applies velocity to the rigid body:

tsximport { useKeyboardControls } from "@react-three/drei"

import { useFrame } from "@react-three/fiber"



const \[, getKeys] = useKeyboardControls()

const bodyRef = useRef()



useFrame((state) => {

&#x20; const { forward, backward, left, right } = getKeys()

&#x20; const speed = 4

&#x20; const direction = new THREE.Vector3()



&#x20; const frontVector = new THREE.Vector3(

&#x20;   0, 0, (forward ? -1 : 0) + (backward ? 1 : 0)

&#x20; )

&#x20; const sideVector = new THREE.Vector3(

&#x20;   (left ? -1 : 0) + (right ? 1 : 0), 0, 0

&#x20; )



&#x20; direction

&#x20;   .subVectors(frontVector, sideVector)

&#x20;   .normalize()

&#x20;   .multiplyScalar(speed)

&#x20;   .applyEuler(state.camera.rotation)



&#x20; bodyRef.current?.setLinvel(

&#x20;   { x: direction.x, y: bodyRef.current.linvel().y, z: direction.z },

&#x20;   true

&#x20; )



&#x20; // Sync camera to body position

&#x20; const pos = bodyRef.current?.translation()

&#x20; if (pos) state.camera.position.set(pos.x, pos.y + 0.8, pos.z)

})



PBR materials for walls

tsximport { useTexture } from "@react-three/drei"



function Wall({ position, size, color = "#e8e0d0" }) {

&#x20; // Optional: load roughness/normal maps for realism

&#x20; // const \[roughMap, normalMap] = useTexture(\[

&#x20; //   "/textures/plaster\_rough.jpg",

&#x20; //   "/textures/plaster\_normal.jpg",

&#x20; // ])



&#x20; return (

&#x20;   <mesh position={position}>

&#x20;     <boxGeometry args={size} />

&#x20;     <meshStandardMaterial

&#x20;       color={color}

&#x20;       roughness={0.85}

&#x20;       metalness={0.0}

&#x20;       // roughnessMap={roughMap}

&#x20;       // normalMap={normalMap}

&#x20;       envMapIntensity={0.8}

&#x20;     />

&#x20;   </mesh>

&#x20; )

}

roughness: 0.85 for plaster walls (matte), roughness: 0.3 for polished marble, roughness: 0.6 for wood panels. envMapIntensity controls how much the HDRI environment reflects — lower for matte surfaces, higher for glossy ones. Adding a roughness texture map from Poly Haven (like plaster\_rough\_001) takes it from "solid color box" to "actual wall surface" — that's a big quality jump for very little effort.



Painting frames

tsxfunction Painting({ imageUrl, position, size = \[1.2, 0.9], title }) {

&#x20; const texture = useTexture(imageUrl)



&#x20; return (

&#x20;   <group position={position}>

&#x20;     {/\* Frame \*/}

&#x20;     <mesh>

&#x20;       <boxGeometry args={\[size\[0] + 0.1, size\[1] + 0.1, 0.05]} />

&#x20;       <meshStandardMaterial

&#x20;         color="#8B7355"

&#x20;         roughness={0.3}

&#x20;         metalness={0.6}

&#x20;       />

&#x20;     </mesh>

&#x20;     {/\* Canvas \*/}

&#x20;     <mesh position={\[0, 0, 0.026]}>

&#x20;       <planeGeometry args={size} />

&#x20;       <meshBasicMaterial map={texture} />

&#x20;     </mesh>

&#x20;   </group>

&#x20; )

}

meshBasicMaterial on the painting itself — not meshStandardMaterial. Paintings should not react to lighting the way 3D objects do. They're flat printed surfaces. Using BasicMaterial ensures the painting looks exactly like the source image, with the spotlight adding a subtle sheen on the frame (which IS StandardMaterial with metalness).



Room signs

tsximport { Text } from "@react-three/drei"



<Text

&#x20; position={\[0, 2.8, -4.99]}

&#x20; fontSize={0.15}

&#x20; color="#333"

&#x20; anchorX="center"

&#x20; anchorY="middle"

&#x20; font="/fonts/PlayfairDisplay-Bold.ttf"

>

&#x20; Italian Renaissance I

</Text>

```



\---



\## File structure

```

src/

&#x20; main.tsx

&#x20; App.tsx              — Canvas, Physics, PostProcessing, Environment

&#x20; components/

&#x20;   Player.tsx         — RigidBody + movement hook + PointerLockControls

&#x20;   Museum.tsx         — Room geometry, walls, floors, ceilings

&#x20;   Room.tsx           — Reusable room component (walls + door openings)

&#x20;   Painting.tsx       — Frame + texture + spotlight + info trigger

&#x20;   MusicStation.tsx   — Audio source + interaction trigger

&#x20;   InfoPanel.tsx      — HTML overlay for painting details

&#x20;   Minimap.tsx        — 2D HTML overlay showing floor plan

&#x20;   HUD.tsx            — Room title, progress tracker

&#x20; data/

&#x20;   paintings.ts       — Array of {title, artist, image, position, room}

&#x20;   music.ts           — Array of {title, composer, audioUrl, position, room}

&#x20; stores/

&#x20;   useMuseum.ts       — Zustand store for visited rooms, active panel, etc.

&#x20; textures/            — Wall roughness maps, floor textures from Poly Haven

&#x20; models/              — Any .glb models (optional frames, benches, etc.)

&#x20; audio/               — Music files



This is the complete bundle. Every piece is justified, nothing is decorative. The postprocessing chain alone (SSAO + Bloom + ToneMapping + Vignette + SMAA) will take your scene from "WebGL demo" to "this looks like Unreal Engine in a browser." The Environment component with Lightformers handles all indirect lighting. MeshReflectorMaterial handles floor reflections. Rapier handles collision. Everything else is geometry and textures.

