# Echoes & Visions

**A Virtual Classical Museum — React Three Fiber Edition**

Step into a 3D browser-based museum spanning 500 years of Western art and music. Walk through Renaissance, Baroque, and Romantic wings, experience curated masterpieces up close, and let classical compositions guide your journey.

---

## Features

### Core Experience
- 3D WebGL museum with first-person navigation (WASD + mouse)
- 14 curated classical paintings (Renaissance, Baroque, Neoclassical/Romantic)
- 3 themed art wings with period-appropriate lighting
- Physics-based movement with wall collision (Rapier WASM)
- Pointer lock FPS controls

### Audio & Music
- Wing-based ambient classical music (Bach, Vivaldi, Beethoven)
- Music player with 14 classical compositions across 3 halls
- Per-painting audio companion
- Mute/unmute with persistence

### UI & Navigation
- HUD system with room title and progress tracker
- Minimap with 2D floor plan overlay
- Info panel with painting metadata

### Art Interaction
- Deep zoom overlay with painting metadata (artist bio, analysis, description)
- Approach effects (painting scales up on proximity)
- Spotlight per painting (warm white, penumbra)
- Info panel with expandable artist biography
- Favorites system

### Museum Layout
- 10 connected rooms with portal navigation
- Entrance lobby with dome
- Central atrium hub
- 3 art wings (Renaissance, Baroque, Neoclassical/Romantic)
- 3 music halls (Baroque Chapel, Classical Salon, Romantic Salon)
- Immersive Chamber
- Rooftop Terrace

### Special Experiences
- Caravaggio Spotlight (dynamic chiaroscuro lighting)
- Deaf Beethoven Mode (audio low-pass filter simulation)
- Inside the Fugue (4-voice sinusoidal visualization)
- Rain Room (particle Chopin effect)

### Performance
- Cinematic postprocessing (SMAA, SSAO, Bloom, ACES tonemapping, Vignette)
- HDRI environment lighting with custom Lightformers
- Reflective floors (MeshReflectorMaterial)
- DPR capped at 1.5 for performance
- Native antialiasing disabled in favor of SMAA

---

## Tech Stack

| Technology | Role |
|---|---|
| [React](https://react.dev) | UI framework |
| [Three.js](https://threejs.org) | 3D rendering engine |
| [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) | Declarative Three.js via React |
| [Drei](https://docs.pmnd.rs/drei) | R3F helpers (Environment, Text, Controls, etc.) |
| [Rapier](https://rapier.rs) | WASM physics (collision, gravity) |
| [Postprocessing](https://github.com/pmndrs/postprocessing) | SMAA, SSAO, Bloom, Vignette |
| [Zustand](https://zustand-demo.pmnd.rs) | State management |
| [Vite](https://vite.dev) | Build tooling & dev server |
| [TypeScript](https://www.typescriptlang.org) | Type safety |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Project Team

| Name | ID | Field |
|------|-----|-------|
| Mahmoud Refaat Mohamed Badr | 25100559 | Engineering |
| Nour Mabrok Atia | 21100366 | Interior Design |
| Bassant Ahmed Outa | 24101348 | Pharmacy |
| Mohamed Hussien Mohamed | 25102156 | Basic Science |
| Ibrahim Elsayed Ibrahim Mahmoud | 21100370 | Interior Design |

---

## License

MIT
