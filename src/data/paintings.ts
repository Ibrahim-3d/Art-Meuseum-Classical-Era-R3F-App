export type RoomId =
  | 'lobby'
  | 'wingA'
  | 'wingB'
  | 'wingC'
  | 'hall1'
  | 'hall2'
  | 'hall3'
  | 'immersive'
  | 'atrium'
  | 'rooftop'

export interface PaintingData {
  id: string
  title: string
  artist: string
  year: string
  medium: string
  image: string
  description: string
  analysis: string
  bio: string
  room: RoomId
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
}

export const paintings: PaintingData[] = [
  // ── WING A: Renaissance ──────────────────────────
  {
    id: 'mona-lisa',
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    year: 'c. 1503–1519',
    medium: 'Oil on poplar panel',
    image: '/paintings/mona-lisa.jpg',
    description:
      'Portrait of Lisa Gherardini, wife of a Florentine merchant. The landscape behind her dissolves into geological time — rivers, mountains, mist — as if her body is a bridge between civilization and wilderness.',
    analysis:
      "The painting's power isn't the smile — it's the sfumato fog between viewer and subject that makes certainty impossible, turning a portrait into a philosophical problem.",
    bio: 'Polymath artist-engineer whose sfumato technique dissolved hard edges into atmospheric mystery. Obsessed with anatomy, optics, and nature, he treated painting as scientific inquiry.',
    room: 'wingA',
    position: [-7.9, 1.8, -2],
    rotation: [0, Math.PI / 2, 0],
    size: [1.0, 1.4],
  },
  {
    id: 'last-supper',
    title: 'The Last Supper',
    artist: 'Leonardo da Vinci',
    year: '1495–1498',
    medium: 'Tempera and oil on gesso/plaster',
    image: '/paintings/last-supper.jpg',
    description:
      'Depicts the moment Christ announces his betrayal. Each apostle reacts with a distinct emotional shockwave — Leonardo staged psychology itself.',
    analysis:
      'Leonardo turns twelve reactions to betrayal into a study of human nature, where gesture becomes language and architecture becomes stage.',
    bio: 'Polymath artist-engineer whose sfumato technique dissolved hard edges into atmospheric mystery.',
    room: 'wingA',
    position: [-7.9, 1.8, 2],
    rotation: [0, Math.PI / 2, 0],
    size: [2.4, 1.2],
  },
  {
    id: 'creation-of-adam',
    title: 'The Creation of Adam',
    artist: 'Michelangelo Buonarroti',
    year: 'c. 1508–1512',
    medium: 'Fresco',
    image: '/paintings/creation-of-adam.jpg',
    description:
      'God reaches toward Adam across a gap that neither hand closes — the most famous almost-touch in art history. The red cloak around God resembles a cross-section of the human brain.',
    analysis:
      'The gap between the two fingers is the entire painting — it holds all the tension of a species reaching for meaning and never quite grasping it.',
    bio: 'Sculptor-first who painted with the volumetric force of carved marble. His bodies twist with terribilità — a raw, almost violent grandeur that made flesh look divine.',
    room: 'wingA',
    position: [-4, 1.8, -4.9],
    rotation: [0, 0, 0],
    size: [2.4, 1.2],
  },
  {
    id: 'school-of-athens',
    title: 'The School of Athens',
    artist: 'Raphael Sanzio',
    year: '1509–1511',
    medium: 'Fresco',
    image: '/paintings/school-of-athens.jpg',
    description:
      'Plato points skyward (the ideal), Aristotle gestures earthward (the empirical). Fifty philosophers across 2,000 years of thought share a single impossible room.',
    analysis:
      "This is not a painting of philosophy — it's philosophy as architecture, where every thinker occupies the exact spatial position their ideas deserve.",
    bio: 'Master of compositional harmony. Where Leonardo probed and Michelangelo struggled, Raphael made complexity look effortless — balance as ideology.',
    room: 'wingA',
    position: [-6, 1.8, 4.9],
    rotation: [0, Math.PI, 0],
    size: [2.4, 1.6],
  },
  {
    id: 'birth-of-venus',
    title: 'The Birth of Venus',
    artist: 'Sandro Botticelli',
    year: 'c. 1484–1486',
    medium: 'Tempera on canvas',
    image: '/paintings/birth-of-venus.jpg',
    description:
      'Venus arrives on shore via a giant scallop shell, blown by the Winds. Her body references the classical Venus Pudica pose but floats with impossible lightness.',
    analysis:
      "Botticelli paints beauty arriving in the world and the world not being ready for it — the wind, the roses, the reaching hands all respond to a force they can't contain.",
    bio: 'Court painter of the Medici who wove classical mythology with Neoplatonic spirituality. His line is hypnotic — flowing, rhythmic, almost calligraphic.',
    room: 'wingA',
    position: [-4, 1.8, 4.9],
    rotation: [0, Math.PI, 0],
    size: [2.0, 1.3],
  },
  {
    id: 'girl-with-pearl-earring',
    title: 'Girl with a Pearl Earring',
    artist: 'Jan Vermeer',
    year: 'c. 1665',
    medium: 'Oil on canvas',
    image: '/paintings/girl-pearl-earring.jpg',
    description:
      'A girl turns toward the viewer from absolute darkness. The pearl catches light like a tiny sun. Her turban is ultramarine — made from crushed lapis lazuli, more expensive than gold.',
    analysis:
      'This is a portrait of light itself, which happens to be wearing a turban — the pearl is both subject and metaphor for how Vermeer sees the world.',
    bio: 'Painter of silence. Vermeer worked at microscopic scale — perhaps 2–3 paintings per year — capturing how light enters a room and transforms ordinary domestic life into something sacred.',
    room: 'wingA',
    position: [-6, 1.8, -4.9],
    rotation: [0, 0, 0],
    size: [0.9, 1.2],
  },

  // ── WING B: Baroque ──────────────────────────────
  {
    id: 'calling-of-st-matthew',
    title: 'The Calling of Saint Matthew',
    artist: 'Caravaggio',
    year: '1599–1600',
    medium: 'Oil on canvas',
    image: '/paintings/calling-st-matthew.jpg',
    description:
      "Christ points at Matthew in a dark tax-collector's office. A beam of light enters from the right, slashing across the scene diagonally. Matthew points at himself — \"Me?\"",
    analysis:
      "Caravaggio stages divine grace as a break-in — a shaft of light forcing its way into a room of men who weren't looking for God.",
    bio: "Revolutionary who dragged painting into the gutter — literally. He used street people as models for saints and weaponized shadow (chiaroscuro on steroids = tenebrism) to make holy scenes feel like crime dramas.",
    room: 'wingB',
    position: [-7.9, 1.8, -12],
    rotation: [0, Math.PI / 2, 0],
    size: [2.0, 1.5],
  },
  {
    id: 'judith-beheading',
    title: 'Judith Beheading Holofernes',
    artist: 'Caravaggio',
    year: 'c. 1598–1599',
    medium: 'Oil on canvas',
    image: '/paintings/judith-beheading.jpg',
    description:
      "Judith saws through a general's neck while her maid holds a sack for the head. The violence is not stylized — Caravaggio painted the biological reality.",
    analysis:
      "The brilliance is in Judith's face — not rage, not triumph, but determined disgust. She is repulsed by what she must do and does it anyway.",
    bio: 'Revolutionary who weaponized shadow to make holy scenes feel like crime dramas.',
    room: 'wingB',
    position: [-7.9, 1.8, -8],
    rotation: [0, Math.PI / 2, 0],
    size: [1.6, 1.3],
  },
  {
    id: 'night-watch',
    title: 'The Night Watch',
    artist: 'Rembrandt van Rijn',
    year: '1642',
    medium: 'Oil on canvas',
    image: '/paintings/night-watch.jpg',
    description:
      'A militia company surges forward in chaotic formation. The girl in golden light at center has no clear narrative reason to be there — she is a ghost of meaning in the noise.',
    analysis:
      "Rembrandt turns a group portrait commission into a study of organized chaos — the light doesn't explain the scene, it destabilizes it.",
    bio: "Master of inner light. Rembrandt could paint darkness that glows and faces that hold entire biographies. His late self-portraits are the most honest autobiography in art.",
    room: 'wingB',
    position: [-4, 1.8, -14.9],
    rotation: [0, 0, 0],
    size: [2.4, 1.8],
  },
  {
    id: 'las-meninas',
    title: 'Las Meninas',
    artist: 'Diego Velázquez',
    year: '1656',
    medium: 'Oil on canvas',
    image: '/paintings/las-meninas.jpg',
    description:
      'Velázquez paints himself painting the King and Queen (visible only in a mirror). The Infanta Margarita is flanked by her maids. The real subject is the act of looking itself.',
    analysis:
      "Every analysis of this painting opens a new trapdoor — it's a painting about painting, a mirror reflecting a mirror, and four centuries later nobody agrees on who's watching whom.",
    bio: 'Court painter to Philip IV of Spain. Velázquez painted truth inside the gilded cage of monarchy — his brushwork was so loose it predicted Impressionism by 200 years.',
    room: 'wingB',
    position: [-6, 1.8, -6.1],
    rotation: [0, Math.PI, 0],
    size: [2.0, 1.8],
  },
  {
    id: 'art-of-painting',
    title: 'The Art of Painting',
    artist: 'Johannes Vermeer',
    year: 'c. 1666–1668',
    medium: 'Oil on canvas',
    image: '/paintings/art-of-painting.jpg',
    description:
      'Vermeer paints a painter (likely himself) at work in an immaculate studio. The heavy curtain pulled aside invites the viewer into the scene as voyeur.',
    analysis:
      "This is Vermeer's thesis statement — art is not the painting on the easel, it's the entire room: the light, the silence, the act of sustained attention.",
    bio: 'Painter of silence who captured how light enters a room and transforms ordinary domestic life into something sacred.',
    room: 'wingB',
    position: [-4, 1.8, -6.1],
    rotation: [0, Math.PI, 0],
    size: [1.4, 1.6],
  },

  // ── WING C: Neoclassical & Romantic ──────────────
  {
    id: 'death-of-marat',
    title: 'The Death of Marat',
    artist: 'Jacques-Louis David',
    year: '1793',
    medium: 'Oil on canvas',
    image: '/paintings/death-of-marat.jpg',
    description:
      'Marat — revolutionary journalist — assassinated in his medicinal bath by Charlotte Corday. David paints him as a secular Christ, slumped with a quill still in hand.',
    analysis:
      'David turns political murder into religious iconography — the bathtub becomes a tomb, the letter becomes scripture, and a dead radical becomes a saint of the republic.',
    bio: "The painter who designed the French Revolution's visual identity. David weaponized ancient Roman aesthetics to legitimize political violence as virtue.",
    room: 'wingC',
    position: [-7.9, 1.8, -22],
    rotation: [0, Math.PI / 2, 0],
    size: [1.3, 1.6],
  },
  {
    id: 'liberty-leading',
    title: 'Liberty Leading the People',
    artist: 'Eugène Delacroix',
    year: '1830',
    medium: 'Oil on canvas',
    image: '/paintings/liberty-leading.jpg',
    description:
      'Allegorical female figure of Liberty strides over barricades and bodies, tricolor flag raised. The dead and living occupy the same ground — revolution romanticized and brutalized simultaneously.',
    analysis:
      "The genius is the contradiction — Liberty is both goddess and street fighter, the revolution is both glorious and gruesome, and Delacroix refuses to resolve either.",
    bio: 'Leader of French Romanticism. Where David drew with a ruler, Delacroix exploded with color and emotion — prioritizing feeling over form, chaos over order.',
    room: 'wingC',
    position: [-4, 1.8, -24.9],
    rotation: [0, 0, 0],
    size: [2.4, 1.8],
  },
  {
    id: 'saturn-devouring',
    title: 'Saturn Devouring His Son',
    artist: 'Francisco Goya',
    year: 'c. 1819–1823',
    medium: 'Oil mural (transferred to canvas)',
    image: '/paintings/saturn-devouring.jpg',
    description:
      "Saturn — wild-eyed, naked — eats his own child. Originally painted directly on the wall of Goya's private dining room. No commission. No audience. Pure confrontation with horror.",
    analysis:
      "Goya painted this on his own wall, for himself — which means this isn't art for viewers, it's a man staring at the thing inside himself he can't stop seeing.",
    bio: 'Started as a court painter of light and charm, ended as a prophet of darkness. His "Black Paintings" are the most terrifying works in Western art.',
    room: 'wingC',
    position: [-6, 1.8, -20.1],
    rotation: [0, Math.PI, 0],
    size: [1.2, 1.8],
  },
]
