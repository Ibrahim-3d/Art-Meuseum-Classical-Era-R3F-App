# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Echoes & Visions** — A 3D virtual classical art and music museum built with React Three Fiber. Visitors walk through themed wings (Renaissance, Baroque, Neoclassical/Romantic), music halls, an immersive chamber, and a rooftop terrace. 14 curated paintings, 14 classical compositions, and interactive special modes (Caravaggio Spotlight, Deaf Beethoven, Rain Room, Inside the Fugue).

Planning docs live in the project root: `prd.md` (full art/music collection + room descriptions), `techstack.md` (implementation recipes), `map.md` (feature map), `todo.md` (feature checklist).

## Commands

```bash
npm run dev        # Vite dev server (auto-opens browser, runs genList first)
npm run build      # Production build to dist/ (runs genList first)
npm run preview    # Preview production build locally
npm run genList    # Regenerate image manifest (images/generateList.cjs)
```

No test runner or linter is configured. Verification is `npm run build` + manual browser testing.

## Tech Stack

- **React + TypeScript** (Vite template `react-ts`)
- **Three.js** via **@react-three/fiber** (R3F) — declarative `<mesh>`, `<group>`, etc.
- **@react-three/drei** — Environment, MeshReflectorMaterial, PointerLockControls, KeyboardControls, Text, useTexture, useGLTF, Bvh
- **@react-three/postprocessing** — EffectComposer, SSAO, Bloom, ToneMapping, Vignette, SMAA
- **@react-three/rapier** — WASM physics (wall collision, floor gravity, player capsule)
- **zustand** — state management (visited rooms, active panel, current music, favorites)
- **leva** — dev-only debug UI for tweaking values (remove before shipping)
- **troika-three-text** — SDF text rendering (via drei's `<Text>`)

## Architecture

### Planned File Structure

```
src/
  main.tsx              # React entry point
  App.tsx               # <Canvas>, <Physics>, <EffectComposer>, <Environment>
  components/
    Player.tsx          # RigidBody + WASD movement hook + PointerLockControls
    Museum.tsx          # Room layout, walls, floors, ceilings
    Room.tsx            # Reusable room (walls + door openings)
    Painting.tsx        # Frame mesh + texture + spotlight + click handler
    MusicStation.tsx    # Audio source + interaction trigger
    InfoPanel.tsx       # HTML overlay for painting details
    Minimap.tsx         # 2D HTML overlay showing floor plan
    HUD.tsx             # Room title, progress tracker
  data/
    paintings.ts        # Array of {title, artist, image, position, room, bio, analysis}
    music.ts            # Array of {title, composer, audioUrl, position, room, bio}
  stores/
    useMuseum.ts        # Zustand store
```

### Rendering Pipeline

The `<Canvas>` disables native antialiasing (`antialias: false`) because SMAA handles it cheaper in post-processing. Key settings: `ACESFilmicToneMapping`, `SRGBColorSpace`, `dpr={[1, 1.5]}` (caps pixel ratio for performance).

**Post-processing order matters:**
1. SMAA (anti-alias raw render)
2. SSAO (darken crevices, radius 0.05, intensity 30)
3. Bloom (glow on bright spots, threshold 0.9)
4. ToneMapping (ACES Filmic)
5. Vignette (darken edges)

### Lighting Strategy

- **Environment + Lightformer** (drei) replaces all ambient/directional lights. Generates PMREM for PBR reflections.
- **SpotLight per painting** — warm white (#fff5e0), angle 0.4, penumbra 0.8, intensity 50, castShadow
- Paintings use `meshBasicMaterial` (not Standard) — they should show the source image exactly, unaffected by scene lighting. Frames use `meshStandardMaterial` with metalness.

### Physics & Movement

- Player: dynamic `RigidBody` with `CuboidCollider` [0.3, 0.8, 0.3], `lockRotations`
- Walls/floors: fixed `RigidBody` with matching `CuboidCollider`
- Movement: `useKeyboardControls` + `useFrame` loop applies velocity to rigid body via `setLinvel()`
- Camera syncs to body position each frame: `camera.position.set(pos.x, pos.y + 0.8, pos.z)`
- Eye height: ~1.65m (`position={[0, 1.65, 0]}`)

### Museum Layout

10 rooms in a connected layout:
- **Lobby** — circular entry with dome, globe, timeline mosaic
- **Wing A** (Renaissance) — 6 paintings, skylights, warm stone
- **Wing B** (Baroque) — 5 paintings, dark red walls, candlelight, heavy gilt frames
- **Wing C** (Neoclassical/Romantic) — 3 paintings, distinct per-era atmosphere
- **Halls 1-3** (Baroque/Classical/Romantic music) — each with period instruments and unique ambience
- **Immersive Chamber** — dark planetarium room, generative audiovisual experience
- **Central Atrium** — hub connecting all areas, favorites bar, timeline scrubber
- **Rooftop Terrace** — open air, sunset, guestbook, share card

### Floor Reflections

`MeshReflectorMaterial` from drei: resolution 1024, blur [400, 100], mixStrength 15, roughness 0.7. This is one of the highest-impact visual features — polished stone floors reflecting the environment.

### Data Sources

All painting/music metadata lives in `prd.md` — 14 paintings with Wikimedia image URLs, artist bios, descriptions, and analysis lines. 14 compositions with composer bios, YouTube links, instrument info. Copy structured data from there into `data/paintings.ts` and `data/music.ts`.

## Key Patterns

- **R3F declarative style**: Write `<mesh>`, `<spotLight>`, `<group>` — never call `new THREE.Mesh()` or `renderer.render()` manually. R3F handles the render loop, resize, and disposal.
- **drei over raw Three.js**: Use `useTexture` (not TextureLoader), `<Text>` (not troika directly), `<Environment>` (not manual HDRI loading).
- **Zustand for cross-component state**: Current room, visited paintings, playing music, UI panel visibility. No prop drilling.
- **Wall materials**: roughness 0.85 (plaster), 0.3 (polished marble), 0.6 (wood). `envMapIntensity` controls HDRI reflection strength.
- **Performance budget**: <500K tris per room, 60fps desktop, 30fps mobile. Use texture LOD (4096 near, 512 far). Cap DPR at 1.5.

## Verification

- `npm run build` must pass — TypeScript errors cascade
- Check browser console for Three.js warnings (missing textures, disposed objects)
- Test FPS controls: WASD movement shouldn't clip through walls
- Painting interactions: approach scaling, info panel, deep zoom
- Post-processing: bloom on spotlights, SSAO in corners, no visual artifacts
- Audio: music plays/pauses, switches by room, mute persists

## Agentic Workflow

### Task Management
1. Write plan to `tasks/todo.md` with checkable items
2. Check in with user before starting implementation
3. Mark items complete as you go — never batch
4. Update `tasks/lessons.md` after any correction
5. End sessions with a testing checklist grouped by feature/fix

### Parallel Subagent Development

The parent orchestrator (Opus) plans and coordinates. Subagents (Sonnet) execute in isolated worktrees. This is the core development loop.

**Orchestrator responsibilities:**
- Break work into independent, non-overlapping tasks before dispatching
- Write detailed prompts for each subagent — include exact file paths, function signatures, expected behavior, and acceptance criteria. Never dispatch a vague prompt like "build the player component." Instead: "Create `src/components/Player.tsx` that renders a dynamic `RigidBody` with a `CuboidCollider` [0.3, 0.8, 0.3] and `lockRotations`. Use `useKeyboardControls` from drei to read WASD input. In `useFrame`, apply velocity via `setLinvel()` and sync camera to body position at y+0.8. Export as default. Must compile with `npm run build`."
- Assign each subagent to files/directories that don't overlap with other subagents. If two tasks touch the same file, they must be sequential, not parallel.
- After all subagents complete, the orchestrator reviews diffs and resolves any merge conflicts between worktrees.

**Dispatching rules:**
- Always use `model: "sonnet"` for subagents — Opus stays as orchestrator only
- Always use `isolation: "worktree"` so each subagent gets its own copy of the repo
- Launch all independent subagents in a single message (parallel dispatch)
- Each prompt must be self-contained — subagents don't share context with each other

**Conflict resolution:**
- When merging worktree branches back, check for conflicts in shared files (imports in `App.tsx`, store shape in `useMuseum.ts`, barrel exports in `index.ts`)
- If conflicts arise, the orchestrator resolves them directly — don't dispatch another subagent for a 5-line merge fix
- Run `npm run build` after merging to catch type errors from interface mismatches between subagent outputs

**Example dispatch pattern:**
```
Subagent 1 (worktree): "Create src/components/Room.tsx — reusable room with walls, floor, ceiling, door openings..."
Subagent 2 (worktree): "Create src/data/paintings.ts — typed array of 14 paintings from prd.md..."
Subagent 3 (worktree): "Create src/stores/useMuseum.ts — Zustand store with currentRoom, visitedRooms, activePainting..."
```
All three touch different files → safe to parallelize. The orchestrator merges all three, then wires them together in `App.tsx` itself.

### Core Principles
- **Simplicity First**: Make every change as simple as possible
- **No Laziness**: Find root causes, no temporary fixes
- **Minimal Impact**: Only touch what's necessary
