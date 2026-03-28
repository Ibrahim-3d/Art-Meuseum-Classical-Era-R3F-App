import type { RoomId } from './paintings'

export interface MusicData {
  id: string
  title: string
  composer: string
  era: string
  description: string
  analysis: string
  bio: string
  room: RoomId
  youtubeSearch: string
}

export const music: MusicData[] = [
  // ── HALL 1: Baroque ──────────────────────────────
  {
    id: 'bach-toccata',
    title: 'Toccata and Fugue in D Minor, BWV 565',
    composer: 'Johann Sebastian Bach',
    era: 'Baroque',
    description:
      'A thundering organ piece. The opening three-note descending motif is the most recognizable phrase in classical music. The fugue section weaves the theme through escalating complexity.',
    analysis:
      "This is what a cathedral sounds like when it's thinking — the organ doesn't play music, it thinks out loud in counterpoint.",
    bio: 'The supreme architect of sound. Bach treated music as mathematics made audible — his fugues are labyrinths where multiple voices chase each other through impossible geometries.',
    room: 'hall1',
    youtubeSearch: 'Bach+Toccata+Fugue+D+Minor+BWV+565+organ',
  },
  {
    id: 'bach-cello',
    title: 'Cello Suite No. 1 in G Major, BWV 1007 — Prelude',
    composer: 'Johann Sebastian Bach',
    era: 'Baroque',
    description:
      'Solo cello. An arpeggiated melody that seems to breathe — each phrase rises and falls like a tide. Written for a single instrument, it sounds like a conversation between three voices.',
    analysis:
      'Bach wrote a piece for one instrument that sounds like three — the cello simultaneously sings the bass, the harmony, and the melody.',
    bio: 'The supreme architect of sound.',
    room: 'hall1',
    youtubeSearch: 'Bach+Cello+Suite+No+1+G+Major+Prelude',
  },
  {
    id: 'vivaldi-spring',
    title: 'The Four Seasons — "Spring" (La Primavera), RV 269',
    composer: 'Antonio Vivaldi',
    era: 'Baroque',
    description:
      'Violin concerto. Birdsong in the violins, a thunderstorm in the cellos, a sleeping shepherd in the slow movement. Vivaldi attached sonnets describing each scene.',
    analysis:
      "Vivaldi doesn't describe spring — he builds it from the ground up, bird by bird, until the orchestra becomes a landscape.",
    bio: 'The "Red Priest" of Venice. Vivaldi wrote over 500 concertos — many for the orphaned girls he taught at the Ospedale della Pietà.',
    room: 'hall1',
    youtubeSearch: 'Vivaldi+Four+Seasons+Spring+La+Primavera',
  },
  {
    id: 'handel-hallelujah',
    title: 'Messiah — "Hallelujah" Chorus, HWV 56',
    composer: 'George Frideric Handel',
    era: 'Baroque',
    description:
      "For choir and orchestra. King George II allegedly stood during the premiere and the audience followed — the tradition of standing for the Hallelujah chorus continues today.",
    analysis:
      "Handel layers the word 'Hallelujah' into a wall of sound so structurally perfect it makes disbelief feel irrational — it's evangelism through architecture.",
    bio: "Bach's contemporary, opposite temperament. While Bach served God in churches, Handel served audiences in theaters.",
    room: 'hall1',
    youtubeSearch: 'Handel+Messiah+Hallelujah+Chorus',
  },

  // ── HALL 2: Classical ────────────────────────────
  {
    id: 'mozart-symphony40',
    title: 'Symphony No. 40 in G Minor, K. 550',
    composer: 'Wolfgang Amadeus Mozart',
    era: 'Classical',
    description:
      'One of only two Mozart symphonies in a minor key. The opening theme — restless, anxious, cascading — has been called the first modern expression of existential dread in music.',
    analysis:
      'Mozart in a minor key is Mozart with the mask off — the 40th Symphony is where charm breaks down and something raw and urgent takes over.',
    bio: "A child prodigy who composed from age 5 and died at 35 with 600+ works. Mozart's music sounds effortless, which conceals the extraordinary complexity underneath.",
    room: 'hall2',
    youtubeSearch: 'Mozart+Symphony+40+G+Minor+K550',
  },
  {
    id: 'mozart-requiem',
    title: 'Requiem in D Minor, K. 626 — Lacrimosa',
    composer: 'Wolfgang Amadeus Mozart',
    era: 'Classical',
    description:
      "Mozart's final, unfinished work — a mass for the dead, rumored to have been commissioned anonymously. He died before completing it, making it his own funeral music.",
    analysis:
      "The Lacrimosa is eight bars of Mozart and then someone else's best guess — the most devastating unfinished sentence in music history.",
    bio: 'A child prodigy who composed from age 5 and died at 35 with 600+ works.',
    room: 'hall2',
    youtubeSearch: 'Mozart+Requiem+Lacrimosa+D+Minor',
  },
  {
    id: 'beethoven-5th',
    title: 'Symphony No. 5 in C Minor, Op. 67',
    composer: 'Ludwig van Beethoven',
    era: 'Classical',
    description:
      '"Da-da-da-DAAAH" — four notes that Beethoven allegedly called "Fate knocking at the door." The entire symphony develops from this single rhythmic cell.',
    analysis:
      "Beethoven builds a 33-minute argument from four notes — the 5th Symphony is proof that limitation breeds genius.",
    bio: 'The bridge between Classical order and Romantic fury. Beethoven went deaf mid-career and kept composing — his late works, created in total silence, are among the most profound in Western music.',
    room: 'hall2',
    youtubeSearch: 'Beethoven+Symphony+5+C+Minor+full',
  },
  {
    id: 'beethoven-moonlight',
    title: 'Moonlight Sonata (Piano Sonata No. 14), Op. 27 No. 2',
    composer: 'Ludwig van Beethoven',
    era: 'Classical',
    description:
      "Triplet arpeggios over a slow bass melody. It wasn't called \"Moonlight\" by Beethoven — a critic compared it to moonlight on Lake Lucerne.",
    analysis:
      'The first movement is grief walking slowly — Beethoven holds back everything, and the restraint is what makes it devastating.',
    bio: 'Beethoven went deaf mid-career and kept composing in total silence.',
    room: 'hall2',
    youtubeSearch: 'Beethoven+Moonlight+Sonata+first+movement',
  },

  // ── HALL 3: Romantic ─────────────────────────────
  {
    id: 'chopin-nocturne',
    title: 'Nocturne in E-flat Major, Op. 9 No. 2',
    composer: 'Frédéric Chopin',
    era: 'Romantic',
    description:
      'A singing right-hand melody floats over a rocking left-hand accompaniment. The ornamental turns grow more elaborate with each repetition.',
    analysis:
      'Chopin writes a melody so simple it sounds like humming, then decorates each return with increasingly complex filigree — the nocturne teaches itself to dream.',
    bio: 'The poet of the piano. Chopin wrote almost exclusively for solo piano and transformed it from a percussive instrument into a vehicle for vocal-like melody.',
    room: 'hall3',
    youtubeSearch: 'Chopin+Nocturne+Op+9+No+2+Eb+Major',
  },
  {
    id: 'chopin-ballade',
    title: 'Ballade No. 1 in G Minor, Op. 23',
    composer: 'Frédéric Chopin',
    era: 'Romantic',
    description:
      'A 10-minute narrative arc for solo piano. Opens with a questioning introduction, builds through lyrical themes, and explodes into a virtuosic coda.',
    analysis:
      "This is a novel compressed into ten minutes — Chopin tells a story with no words, and the ending hits like a building collapsing.",
    bio: 'Chopin died of tuberculosis at 39.',
    room: 'hall3',
    youtubeSearch: 'Chopin+Ballade+No+1+G+Minor+Op+23',
  },
  {
    id: 'tchaikovsky-swan-lake',
    title: 'Swan Lake — Scene (Act II)',
    composer: 'Pyotr Ilyich Tchaikovsky',
    era: 'Romantic',
    description:
      "The oboe melody over harp arpeggios is one of the most recognized pieces of ballet music ever written. It accompanies Odette's first appearance as a swan transformed by sorcery.",
    analysis:
      "The oboe line is the sound of someone trapped in the wrong body — Tchaikovsky knew that feeling, and the music carries it without ever naming it.",
    bio: "Russia's most emotionally transparent composer. Tchaikovsky wore his anguish on his sleeve — depression, hidden sexuality, loneliness — and transmuted it all into music of staggering beauty.",
    room: 'hall3',
    youtubeSearch: 'Tchaikovsky+Swan+Lake+Scene+Act+II',
  },
  {
    id: 'debussy-clair-de-lune',
    title: 'Clair de Lune (Suite Bergamasque)',
    composer: 'Claude Debussy',
    era: 'Romantic',
    description:
      'Solo piano. The title means "Moonlight" (from a Verlaine poem). Arpeggios shimmer like light on water.',
    analysis:
      "Debussy doesn't play notes — he plays the spaces between notes, and 'Clair de Lune' is made almost entirely of air and suggestion.",
    bio: 'The painter of sound. Debussy dissolved traditional harmony into washes of color — he was closer to the Impressionist painters than to any musician.',
    room: 'hall3',
    youtubeSearch: 'Debussy+Clair+de+Lune+piano',
  },
  {
    id: 'rachmaninoff-concerto2',
    title: 'Piano Concerto No. 2 in C Minor, Op. 18',
    composer: 'Sergei Rachmaninoff',
    era: 'Romantic',
    description:
      'Written after a severe depression treated by hypnotherapy. The opening bell-like piano chords swell into one of the most emotionally overwhelming melodies in the repertoire.',
    analysis:
      "This concerto is what recovery sounds like — Rachmaninoff climbed out of a creative death and wrote a piece so alive it became the sound of survival itself.",
    bio: "The last great Romantic pianist-composer. Rachmaninoff's hands could span 12 keys — his music exploits this impossible reach.",
    room: 'hall3',
    youtubeSearch: 'Rachmaninoff+Piano+Concerto+No+2+C+Minor+full',
  },
  {
    id: 'schubert-ave-maria',
    title: 'Ave Maria (Ellens dritter Gesang), D. 839',
    composer: 'Franz Schubert',
    era: 'Romantic',
    description:
      "Originally a setting of Sir Walter Scott's \"The Lady of the Lake.\" The opening piano arpeggios create a cushion of sound over which the voice floats.",
    analysis:
      'The melody is so pure it erases everything around it — Schubert wrote the sound of prayer before it became one.',
    bio: 'Died at 31 with over 1,000 works. Schubert was the supreme melodist.',
    room: 'hall3',
    youtubeSearch: 'Schubert+Ave+Maria+Ellens+Gesang',
  },
]
