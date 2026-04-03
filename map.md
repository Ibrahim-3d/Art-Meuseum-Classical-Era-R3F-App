# Feature Checklist: Echoes & Visions Museum

## Phase 0: The Door (Landing Page)
- Stone doorway with warm golden light spilling through gap
- Floating particle dust motes in light shaft
- Ambient sound: distant echoes, stone resonance, faint strings
- Title text materializes: "Echoes & Visions"
- Parallax light shift on mouse movement
- Progressive loading bar disguised as light filling doorway

## Phase 1: Entrance Lobby
- Grand circular room with domed ceiling
- Dome fresco (stylized composite of featured artists)
- Interactive 3D globe with artist birthplace pins (hover → name)
- Floor mosaic timeline: 1400→1900 with artist icons
- Two glowing archways: "Paintings" (left) / "Music" (right)
- Click globe pins → mini bio card popup
- Footstep sounds change based on floor material (marble)
- Ambient reverb for large stone space

## Phase 2A: Wing A — Renaissance Paintings
- High ceilings with skylights
- Warm stone walls, wooden floors, Florentine architecture
- Paintings at eye level with dramatic picture lighting
- Benches in front of major works
- 6 paintings mounted:
  - Mona Lisa
  - Last Supper
  - Creation of Adam
  - School of Athens
  - Birth of Venus
  - Girl with Pearl Earring
- Approach → painting scales up, room darkens
- Info panel (artist, date, medium, dimensions)
- Analysis card (one-line insight)
- Deep zoom to brushstroke level
- Audio companion (matched era music)
- "Story" mode — 30s narrated story (text or TTS)
- Ambient music: Bach Cello Suite No. 1

## Phase 2B: Wing B — Baroque Paintings
- Dark room: deep red walls, candlelight simulation
- Heavy gilt frames, dramatic shadow sconces
- Dark marble floor
- Theatrical architecture (arches, columns, drapes)
- 5 paintings mounted:
  - Calling of St Matthew
  - Judith Beheading
  - Night Watch
  - Las Meninas
  - Art of Painting
- Caravaggio Spotlight — dynamic chiaroscuro lighting near his paintings
- "Artist's Eye" toggle: annotated light paths on painting
- Ambient music: Vivaldi Four Seasons "Winter"

## Phase 2C: Wing C — Neoclassical & Romantic Paintings
- 3 paintings:
  - Death of Marat
  - Liberty Leading the People
  - Saturn Devouring His Son
- Distinct room atmosphere per era

## Phase 3: Immersive Chamber
- Dark circular planetarium-style room
- Walls as projection surfaces
- Surround-sound audio
- 3-min generative experience: paintings dissolve/reform on walls
- Music plays in spatial audio, visuals react to it (brushstrokes pulse with bass, colors shift with melody)
- Procedurally unique each visit
- Skip button
- Two exits: "Continue to Music" / "Return to Paintings"

## Phase 4A: Hall 1 — Baroque Music
- Wooden concert hall with vaulted ceiling (Baroque chapel)
- Organ pipes on back wall
- Virtual musicians (3D figures or silhouettes)
- Period instruments displayed (harpsichord, viola da gamba)
- 3 pieces:
  - Bach: Toccata & Fugue + Cello Suite
  - Vivaldi: Spring
  - Handel: Hallelujah
- Play/pause audio
- Waveform visualizer (real-time frequency bars)
- Score follower (simplified scrolling notation)
- Composer bio on portrait click
- Instrument spotlight (click to hear isolated)
- "Inside the Fugue" — Bach's voices as colored 3D ribbons

## Phase 4B: Hall 2 — Classical Music
- Bright Viennese salon: white walls, crystal chandelier, parquet floors
- Grand piano center-stage
- Portraits of Mozart and Beethoven on opposing walls
- 4 pieces:
  - Mozart: Symphony 40 + Requiem
  - Beethoven: Symphony 5 + Moonlight
- "Deaf Beethoven Mode" — muffled/distorted audio simulating hearing loss + explanatory text

## Phase 4C: Hall 3 — Romantic Music
- Intimate salon: velvet curtains, candlelight, dark wood paneling
- Steinway grand piano
- Rain on tall windows (ambient)
- Impressionist lighting: soft, diffused, warm
- 5 pieces:
  - Chopin: Nocturne + Ballade
  - Tchaikovsky: Swan Lake
  - Debussy: Clair de Lune
  - Rachmaninoff: Concerto 2
  - Schubert: Ave Maria
- "Rain Room" — rain intensifies and candles flicker during Chopin, synced to music

## Phase 5: Central Atrium (Hub)
- Dome fresco fully "unlocked" with all artists visible/glowing
- Globe shows connections between painters and composers
- Interactive 3D minimap (visited rooms glow)
- Favorites bar (hearted paintings/music collected here)
- Timeline scrubber on floor (walk along to teleport to any era)
- Gift shop: high-res downloads, Spotify playlists, further reading

## Phase 6: Rooftop Terrace
- Open-air terrace with classical balustrade
- Stylized landscape vista (mountains, rivers from Renaissance backgrounds)
- Sunset lighting
- A single bench facing the view
- Final reflection text
- Guestbook (type and save/share a reflection)
- User's most-listened piece replays softly
- Share button → "Museum Visit Card" with favorites + stats
- "Visit Again" → return to lobby, all rooms unlocked

## Cross-Cutting / Technical
- 14 painting textures loaded from Wikimedia (public domain)
- 14 music pieces streamed (YouTube or self-hosted)
- Progressive loading / texture LOD (4096 → 512)
- < 5s initial load on 4G
- 60fps desktop, 30fps mobile
- < 500K tris per room
- Optional WebXR/VR support
