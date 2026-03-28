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

/*
  Room layout:

  Wings:  center x=-13, size [12, 6, 16] → W=-19  E=-7   N=z-8  S=z+8
  Center: center x=0,   size [14, ?, 16] → W=-7   E=+7   N=z-8  S=z+8
  Halls:  center x=+12, size [10, 6, 16] → W=+7   E=+17  N=z-8  S=z+8

  Row 0: z=0,  Row 1: z=-16,  Row 2: z=-32,  Row 3: z=-48
  Paintings inset 0.1 from wall. Rotation faces INTO the room.
*/

export const paintings: PaintingData[] = [
  // ══════════════════════════════════════════════════════════════════════
  // WING A: Renaissance — [-13, 0, 0], W=-19 E=-7 N=-8 S=+8
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'mona-lisa',
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    year: 'c. 1503–1519',
    medium: 'Oil on poplar panel',
    image: '/paintings/mona-lisa.jpg',
    description: 'Portrait of Lisa Gherardini. The landscape behind her dissolves into geological time.',
    analysis: "The painting's power isn't the smile — it's the sfumato fog between viewer and subject that makes certainty impossible.",
    bio: 'Polymath artist-engineer whose sfumato technique dissolved hard edges into atmospheric mystery.',
    room: 'wingA',
    position: [-18.9, 1.8, -5],
    rotation: [0, Math.PI / 2, 0],
    size: [1.0, 1.4],
  },
  {
    id: 'birth-of-venus',
    title: 'The Birth of Venus',
    artist: 'Sandro Botticelli',
    year: 'c. 1484–1486',
    medium: 'Tempera on canvas',
    image: '/paintings/birth-of-venus.jpg',
    description: 'Venus arrives on shore via a giant scallop shell, blown by the Winds.',
    analysis: "Botticelli paints beauty arriving in the world and the world not being ready for it.",
    bio: 'Court painter of the Medici who wove classical mythology with Neoplatonic spirituality.',
    room: 'wingA',
    position: [-18.9, 1.8, 0],
    rotation: [0, Math.PI / 2, 0],
    size: [2.0, 1.3],
  },
  {
    id: 'last-supper',
    title: 'The Last Supper',
    artist: 'Leonardo da Vinci',
    year: '1495–1498',
    medium: 'Tempera and oil on gesso/plaster',
    image: '/paintings/last-supper.jpg',
    description: 'Depicts the moment Christ announces his betrayal. Each apostle reacts with a distinct emotional shockwave.',
    analysis: 'Leonardo turns twelve reactions to betrayal into a study of human nature.',
    bio: 'Polymath artist-engineer whose sfumato technique dissolved hard edges into atmospheric mystery.',
    room: 'wingA',
    position: [-18.9, 1.8, 5],
    rotation: [0, Math.PI / 2, 0],
    size: [2.4, 1.2],
  },
  {
    id: 'school-of-athens',
    title: 'The School of Athens',
    artist: 'Raphael Sanzio',
    year: '1509–1511',
    medium: 'Fresco',
    image: '/paintings/school-of-athens.jpg',
    description: 'Plato points skyward, Aristotle gestures earthward. Fifty philosophers share a single impossible room.',
    analysis: "This is not a painting of philosophy — it's philosophy as architecture.",
    bio: 'Master of compositional harmony.',
    room: 'wingA',
    position: [-15.5, 1.8, 7.9],
    rotation: [0, Math.PI, 0],
    size: [2.4, 1.6],
  },
  {
    id: 'creation-of-adam',
    title: 'The Creation of Adam',
    artist: 'Michelangelo Buonarroti',
    year: 'c. 1508–1512',
    medium: 'Fresco',
    image: '/paintings/creation-of-adam.jpg',
    description: 'God reaches toward Adam across a gap that neither hand closes.',
    analysis: 'The gap between the two fingers holds all the tension of a species reaching for meaning.',
    bio: 'Sculptor-first who painted with the volumetric force of carved marble.',
    room: 'wingA',
    position: [-11, 1.8, 7.9],
    rotation: [0, Math.PI, 0],
    size: [2.4, 1.2],
  },
  {
    id: 'girl-with-pearl-earring',
    title: 'Girl with a Pearl Earring',
    artist: 'Jan Vermeer',
    year: 'c. 1665',
    medium: 'Oil on canvas',
    image: '/paintings/girl-pearl-earring.jpg',
    description: 'A girl turns toward the viewer from absolute darkness. The pearl catches light like a tiny sun.',
    analysis: 'This is a portrait of light itself, which happens to be wearing a turban.',
    bio: 'Painter of silence. Vermeer worked at microscopic scale.',
    room: 'wingA',
    position: [-16, 1.8, -7.9],
    rotation: [0, 0, 0],
    size: [0.9, 1.2],
  },

  // ══════════════════════════════════════════════════════════════════════
  // WING B: Baroque — [-13, 0, -16], W=-19 E=-7 N=-24 S=-8
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'calling-of-st-matthew',
    title: 'The Calling of Saint Matthew',
    artist: 'Caravaggio',
    year: '1599–1600',
    medium: 'Oil on canvas',
    image: '/paintings/calling-st-matthew.jpg',
    description: "Christ points at Matthew in a dark tax-collector's office.",
    analysis: "Caravaggio stages divine grace as a break-in.",
    bio: 'Revolutionary who dragged painting into the gutter.',
    room: 'wingB',
    position: [-18.9, 1.8, -20],
    rotation: [0, Math.PI / 2, 0],
    size: [2.0, 1.5],
  },
  {
    id: 'art-of-painting',
    title: 'The Art of Painting',
    artist: 'Johannes Vermeer',
    year: 'c. 1666–1668',
    medium: 'Oil on canvas',
    image: '/paintings/art-of-painting.jpg',
    description: 'Vermeer paints a painter at work in an immaculate studio.',
    analysis: "This is Vermeer's thesis statement — art is the entire room.",
    bio: 'Painter of silence who captured how light transforms domestic life.',
    room: 'wingB',
    position: [-18.9, 1.8, -16],
    rotation: [0, Math.PI / 2, 0],
    size: [1.4, 1.6],
  },
  {
    id: 'judith-beheading',
    title: 'Judith Beheading Holofernes',
    artist: 'Caravaggio',
    year: 'c. 1598–1599',
    medium: 'Oil on canvas',
    image: '/paintings/judith-beheading.jpg',
    description: "Judith saws through a general's neck while her maid holds a sack for the head.",
    analysis: "The brilliance is in Judith's face — determined disgust.",
    bio: 'Revolutionary who weaponized shadow.',
    room: 'wingB',
    position: [-18.9, 1.8, -12],
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
    description: 'A militia company surges forward in chaotic formation.',
    analysis: 'Rembrandt turns a group portrait into a study of organized chaos.',
    bio: 'Master of inner light.',
    room: 'wingB',
    position: [-16.5, 1.8, -23.9],
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
    description: 'Velázquez paints himself painting the King and Queen.',
    analysis: "It's a painting about painting, a mirror reflecting a mirror.",
    bio: 'Court painter to Philip IV. His brushwork predicted Impressionism.',
    room: 'wingB',
    position: [-10, 1.8, -23.9],
    rotation: [0, 0, 0],
    size: [2.0, 1.8],
  },

  // ══════════════════════════════════════════════════════════════════════
  // WING C: Neoclassical & Romantic — [-13, 0, -32], W=-19 E=-7 N=-40 S=-24
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'death-of-marat',
    title: 'The Death of Marat',
    artist: 'Jacques-Louis David',
    year: '1793',
    medium: 'Oil on canvas',
    image: '/paintings/death-of-marat.jpg',
    description: 'Marat assassinated in his medicinal bath. David paints him as a secular Christ.',
    analysis: 'David turns political murder into religious iconography.',
    bio: "The painter who designed the French Revolution's visual identity.",
    room: 'wingC',
    position: [-18.9, 1.8, -35],
    rotation: [0, Math.PI / 2, 0],
    size: [1.3, 1.6],
  },
  {
    id: 'saturn-devouring',
    title: 'Saturn Devouring His Son',
    artist: 'Francisco Goya',
    year: 'c. 1819–1823',
    medium: 'Oil mural (transferred to canvas)',
    image: '/paintings/saturn-devouring.jpg',
    description: "Saturn eats his own child. Painted on Goya's private dining room wall.",
    analysis: "It's a man staring at the thing inside himself he can't stop seeing.",
    bio: 'Started as a court painter of light, ended as a prophet of darkness.',
    room: 'wingC',
    position: [-18.9, 1.8, -29],
    rotation: [0, Math.PI / 2, 0],
    size: [1.2, 1.8],
  },
  {
    id: 'liberty-leading',
    title: 'Liberty Leading the People',
    artist: 'Eugène Delacroix',
    year: '1830',
    medium: 'Oil on canvas',
    image: '/paintings/liberty-leading.jpg',
    description: 'Liberty strides over barricades and bodies, tricolor flag raised.',
    analysis: 'Liberty is both goddess and street fighter.',
    bio: 'Leader of French Romanticism.',
    room: 'wingC',
    position: [-13, 1.8, -39.9],
    rotation: [0, 0, 0],
    size: [2.4, 1.8],
  },
]
