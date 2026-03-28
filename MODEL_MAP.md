# Primitive → Model Replacement Map

Every 3D primitive in the museum is listed below with its current geometry, intended real-world object, and suggested model/texture replacements.

## Room Structure (Room.tsx)

| Primitive | Current Geometry | Replace With | Notes |
|-----------|-----------------|--------------|-------|
| **Floor** | `planeGeometry` + wood texture | Tiled marble/stone floor model or PBR tileable textures | Per-room material: warm stone (wings), polished marble (lobby/atrium), dark slate (immersive) |
| **Ceiling** | `planeGeometry` | Coffered ceiling panels, vaulted ceiling, or painted ceiling model | Lobby/Atrium: coffered or domed. Wings: flat with crown molding. Immersive: dark void |
| **Walls** | `boxGeometry` (0.2m thick) | Textured wall panels with wainscoting/molding | Per-wing: plaster (A), dark wood paneling (B), marble (C) |
| **Door openings** | Gap in wall segments + lintel box | Ornate door frame model with arch/keystone | Classical stone archway or gilded doorframe |

## Decorations (Decorations.tsx)

| Component | Current Geometry | Replace With (GLTF/GLB) | Suggested Source |
|-----------|-----------------|------------------------|-----------------|
| **Bench** | 3× `boxGeometry` (seat + 2 legs) | Museum bench model — wooden slat bench, backless | Sketchfab: "museum bench", "gallery bench" |
| **Column** | `cylinderGeometry` + cap/base boxes | Doric/Ionic/Corinthian column model | Wing A: Ionic. Wing B: Corinthian (ornate). Atrium: Doric |
| **Pedestal** | `boxGeometry` | Classical display pedestal with molding | Marble pedestal with beveled edges |
| **GrandPiano** | 5× `boxGeometry` (body + lid + legs + keys) | Grand piano GLTF model | Steinway-style concert grand, black lacquer |
| **OrganPipes** | Array of `cylinderGeometry` (varying height) | Baroque pipe organ model | Gilded pipes with wooden case |
| **Candelabra** | `cylinderGeometry` + `coneGeometry` arms + `pointLight` | Standing candelabra model with candle flames | Bronze/brass 5-arm floor candelabra |
| **Chandelier** | `torusGeometry` ring + `coneGeometry` drops | Crystal chandelier model | Lobby: large tiered crystal. Atrium: matching |
| **Balustrade** | Array of `cylinderGeometry` posts + `boxGeometry` rail | Classical balustrade with turned balusters | Stone balustrade for rooftop terrace |
| **WindowFrame** | 4× `boxGeometry` frame + `planeGeometry` glass | Arched window with mullions + glass pane | Tall arched window, stone surround |
| **ArchFrame** | 2× `boxGeometry` columns + curved arch box | Stone archway with keystone | Classical round arch |
| **Sconce** | `cylinderGeometry` + `coneGeometry` + `pointLight` | Wall sconce/torch model | Baroque gilt wall sconce with candle |
| **Urn** | `cylinderGeometry` body + handles | Decorative classical urn/amphora | Terracotta or marble urn on pedestal |
| **Globe** (Lobby) | `sphereGeometry` | Antique globe on stand | Brass-mounted terrestrial globe |
| **Fountain** (Atrium) | 2× `cylinderGeometry` | Classical tiered fountain | Marble fountain with basin |
| **Platform** (Immersive) | `cylinderGeometry` (flat disc) | Circular stage platform | Dark stone or metal disc platform |

## Painting Components (Painting.tsx)

| Primitive | Current Geometry | Replace With | Notes |
|-----------|-----------------|--------------|-------|
| **Frame** | `boxGeometry` (flat box) | Ornate picture frame model | Wing A: simple gilded. Wing B: heavy baroque gilt. Wing C: neoclassical |
| **Canvas** | `planeGeometry` + texture | Keep as-is (texture plane) | The painting image itself — no model needed |
| **Spotlight** | `spotLight` | Keep as-is (Three.js light) | Optionally add a track light fixture model above |

## Music Stations (MusicStation.tsx)

| Primitive | Current Geometry | Replace With | Notes |
|-----------|-----------------|--------------|-------|
| **Podium** | `cylinderGeometry` | Display podium/lectern model | Dark wood or acrylic music stand |

---

## Required Textures & Materials

### Floor Materials (PBR — Color + Normal + Roughness + AO)
| Room | Material | Texture Set |
|------|----------|-------------|
| **Wing A** | Warm sandstone / travertine tile | `floor_sandstone_{color,normal,roughness,ao}.jpg` |
| **Wing B** | Dark hardwood (walnut/ebony) | `floor_dark_wood_{color,normal,roughness,ao}.jpg` |
| **Wing C** | Light marble (Carrara) | `floor_marble_light_{color,normal,roughness,ao}.jpg` |
| **Lobby** | Polished cream marble with veining | `floor_marble_cream_{color,normal,roughness,ao}.jpg` |
| **Immersive** | Dark slate / basalt | `floor_slate_dark_{color,normal,roughness,ao}.jpg` |
| **Atrium** | Warm marble mosaic | `floor_marble_warm_{color,normal,roughness,ao}.jpg` |
| **Rooftop** | Weathered stone / terracotta tile | `floor_terracotta_{color,normal,roughness,ao}.jpg` |
| **Hall 1** | Rich wood parquet | `floor_parquet_dark_{color,normal,roughness,ao}.jpg` |
| **Hall 2** | Light oak parquet | `floor_parquet_light_{color,normal,roughness,ao}.jpg` |
| **Hall 3** | Dark walnut herringbone | `floor_herringbone_{color,normal,roughness,ao}.jpg` |

### Wall Materials (PBR)
| Room | Material | Texture Set |
|------|----------|-------------|
| **Wing A** | Warm plaster / stucco | `wall_plaster_warm_{color,normal,roughness}.jpg` |
| **Wing B** | Dark red damask / velvet wallpaper | `wall_damask_red_{color,normal,roughness}.jpg` |
| **Wing C** | White marble panels | `wall_marble_white_{color,normal,roughness}.jpg` |
| **Lobby** | Cream limestone blocks | `wall_limestone_{color,normal,roughness}.jpg` |
| **Immersive** | Dark acoustic panel / void black | `wall_acoustic_dark_{color,normal,roughness}.jpg` |
| **Atrium** | Warm stone with trim | `wall_stone_warm_{color,normal,roughness}.jpg` |
| **Rooftop** | Weathered stone parapet | `wall_stone_weathered_{color,normal,roughness}.jpg` |
| **Halls** | Wood paneling / plaster (per era) | `wall_wood_panel_{color,normal,roughness}.jpg` |

### Ceiling Materials
| Room | Material | Texture Set |
|------|----------|-------------|
| **Wings A/C** | White plaster with crown molding | `ceiling_plaster_{color,normal}.jpg` |
| **Wing B** | Dark wood coffer | `ceiling_wood_dark_{color,normal}.jpg` |
| **Lobby/Atrium** | Coffered stone/plaster | `ceiling_coffered_{color,normal}.jpg` |
| **Immersive** | Near-black void | Flat color, no texture needed |
| **Rooftop** | Open sky (emissive or skybox) | HDR environment map |

### Glass Material
| Usage | Properties |
|-------|-----------|
| **Window glass** | Transparent, slight blue-green tint, low roughness, refractive |
| **Skylight glass** | Frosted/diffuse, warm white, slight opacity |

### Metal Materials
| Usage | Material |
|-------|----------|
| **Picture frames** | Brushed gold (Wing A), burnished gold (B), matte silver (C) |
| **Chandelier** | Polished brass or crystal |
| **Candelabra/Sconce** | Antique bronze or brass |
| **Balustrade** | White marble or stone |

### Fabric Materials
| Usage | Material |
|-------|----------|
| **Bench seats** | Dark leather (brown, black) |
| **Bench fabric** | Velvet (Wing B only) |

---

## GLTF Models Shopping List

Priority order for visual impact:

1. `grand_piano.glb` — Concert grand piano (Halls 2 & 3)
2. `chandelier_crystal.glb` — Crystal chandelier (Lobby, Hall 2, Atrium)
3. `column_ionic.glb` / `column_corinthian.glb` — Classical columns
4. `bench_museum.glb` — Gallery bench
5. `candelabra_floor.glb` — Standing candelabra
6. `organ_pipes.glb` — Baroque pipe organ
7. `picture_frame_baroque.glb` / `picture_frame_gilded.glb` — Ornate frames
8. `window_arched.glb` — Tall arched window with mullions
9. `fountain_tiered.glb` — Classical fountain
10. `urn_classical.glb` — Decorative urn
11. `sconce_wall.glb` — Wall-mounted candle sconce
12. `balustrade_section.glb` — Stone balustrade section
13. `pedestal_marble.glb` — Display pedestal
14. `globe_antique.glb` — Mounted globe
15. `arch_stone.glb` — Doorway arch
