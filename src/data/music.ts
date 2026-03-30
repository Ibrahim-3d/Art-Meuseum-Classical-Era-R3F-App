import type { RoomId } from './paintings'

export interface MusicData {
  id: string
  title: string
  composer: string
  composerId: string
  era: string
  year: string
  youtubeUrl: string
  audioFile: string
  description: string
  analysis: string
  bio: string
  room: RoomId
}

export const music: MusicData[] = [
  // ── HALL 1: Baroque ──────────────────────────────
  {
    id: 'bach-toccata',
    title: 'Toccata and Fugue in D Minor, BWV 565',
    composer: 'Johann Sebastian Bach',
    composerId: 'bach',
    era: 'Baroque',
    year: 'c. 1704',
    youtubeUrl: 'https://www.youtube.com/watch?v=ho9rZjlsyYY',
    audioFile: '/audio/bach-toccata.ogg',
    description:
      'Dramatic organ work. Cascading toccata launches into complex three-voice fugue. The definitive pipe organ sound.',
    analysis:
      'The opening is free-fall — Bach drops you from top to bottom, establishing vertigo that the fugue rationalizes into order.',
    bio: 'The supreme architect of sound. Bach treated music as mathematics made audible — his fugues are labyrinths where multiple voices chase each other through impossible geometries.',
    room: 'hall1',
  },
  {
    id: 'bach-cello',
    title: 'Cello Suite No. 1 in G Major, BWV 1007',
    composer: 'Johann Sebastian Bach',
    composerId: 'bach',
    era: 'Baroque',
    year: 'c. 1720',
    youtubeUrl: 'https://www.youtube.com/watch?v=1prweT95Mo0',
    audioFile: '/audio/bach-cello.ogg',
    description:
      'Six movements for solo cello. The Prelude — flowing arpeggios that seem to breathe on their own.',
    analysis:
      'One cello, no accompaniment, yet it sounds like an ensemble — Bach implies harmony through melody alone.',
    bio: 'The supreme architect of sound.',
    room: 'hall1',
  },
  {
    id: 'vivaldi-spring',
    title: 'The Four Seasons — "Spring" (RV 269)',
    composer: 'Antonio Vivaldi',
    composerId: 'vivaldi',
    era: 'Baroque',
    year: '1725',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZPdk5GaIDjo',
    audioFile: '/audio/vivaldi-spring.ogg',
    description:
      'First of four violin concertos depicting seasons. Birdsong, brooks, and storms rendered through instruments.',
    analysis:
      'Program music two centuries before Hollywood — Vivaldi hands you a script and makes the violins act it out.',
    bio: 'The "Red Priest" of Venice. Vivaldi wrote over 500 concertos — many for the orphaned girls he taught at the Ospedale della Pietà.',
    room: 'hall1',
  },
  {
    id: 'pachelbel-canon',
    title: 'Canon in D',
    composer: 'Johann Pachelbel',
    composerId: 'pachelbel',
    era: 'Baroque',
    year: 'c. 1680–1706',
    youtubeUrl: 'https://www.youtube.com/watch?v=JvNQLJ1_HQ0',
    audioFile: '/audio/pachelbel-canon.ogg',
    description:
      'Canon for three violins and basso continuo. Eight-note ground bass repeats while violin lines spiral upward.',
    analysis:
      "Same eight notes 28 times and never boring — variation over constraint is music's most powerful emotional engine.",
    bio: 'German Baroque composer and organist. Pachelbel mastered the variation form — his Canon in D proves that simplicity, given time and patience, can become transcendence.',
    room: 'hall1',
  },
  {
    id: 'handel-hallelujah',
    title: 'Messiah — "Hallelujah" Chorus, HWV 56',
    composer: 'George Frideric Handel',
    composerId: 'handel',
    era: 'Baroque',
    year: '1741',
    youtubeUrl: 'https://www.youtube.com/watch?v=IUZEtVbJT5c',
    audioFile: '/audio/handel-hallelujah.ogg',
    description:
      "Part II finale of Handel's oratorio. Audience traditionally stands. King George II allegedly rose at the premiere.",
    analysis:
      "Handel writes 'Hallelujah' 71 times, each hitting differently — through dynamics and texture, repetition becomes escalation.",
    bio: "Bach's contemporary, opposite temperament. While Bach served God in churches, Handel served audiences in theaters.",
    room: 'hall1',
  },

  // ── HALL 2: Classical ────────────────────────────
  {
    id: 'mozart-requiem',
    title: 'Requiem in D Minor, K. 626',
    composer: 'Wolfgang Amadeus Mozart',
    composerId: 'mozart',
    era: 'Classical',
    year: '1791',
    youtubeUrl: 'https://www.youtube.com/watch?v=sPlhKP0nZII',
    audioFile: '/audio/mozart-requiem.ogg',
    description:
      "Mozart's final, unfinished mass for the dead. The Lacrimosa is devastatingly beautiful. Completed by Süssmayr.",
    analysis:
      "A dying man writing about death — the Lacrimosa breaks off mid-measure where Mozart's life broke off.",
    bio: "A child prodigy who composed from age 5 and died at 35 with 600+ works. Mozart's music sounds effortless, which conceals the extraordinary complexity underneath.",
    room: 'hall2',
  },
  {
    id: 'mozart-eine-kleine',
    title: 'Eine kleine Nachtmusik, K. 525',
    composer: 'Wolfgang Amadeus Mozart',
    composerId: 'mozart',
    era: 'Classical',
    year: '1787',
    youtubeUrl: 'https://www.youtube.com/watch?v=oy2zDJPIgwc',
    audioFile: '/audio/mozart-eine-kleine.ogg',
    description:
      'Serenade in four movements for strings. Opening allegro is one of the most recognizable melodies in classical music.',
    analysis:
      'Mozart makes perfection sound easy — every phrase lands exactly where it should, as if no other note were possible.',
    bio: 'A child prodigy who composed from age 5 and died at 35 with 600+ works.',
    room: 'hall2',
  },
  {
    id: 'beethoven-symphony5',
    title: 'Symphony No. 5 in C Minor, Op. 67',
    composer: 'Ludwig van Beethoven',
    composerId: 'beethoven',
    era: 'Classical / Early Romantic',
    year: '1808',
    youtubeUrl: 'https://www.youtube.com/watch?v=fOk8Tm815lE',
    audioFile: '/audio/beethoven-symphony5.ogg',
    description:
      'Four movements opening with the most famous four notes in music. Journeys from C minor struggle to C major triumph.',
    analysis:
      'The opening motif is a seed — four notes grow an entire universe of conflict and resolution. Constraint births invention.',
    bio: 'The bridge between Classical order and Romantic fury. Beethoven went deaf mid-career and kept composing — his late works, created in total silence, are among the most profound in Western music.',
    room: 'hall2',
  },
  {
    id: 'beethoven-moonlight',
    title: 'Moonlight Sonata (Op. 27 No. 2)',
    composer: 'Ludwig van Beethoven',
    composerId: 'beethoven',
    era: 'Classical / Early Romantic',
    year: '1801',
    youtubeUrl: 'https://www.youtube.com/watch?v=4Tr0otuiQuU',
    audioFile: '/audio/beethoven-moonlight.ogg',
    description:
      'Three movements. Famous first movement: slow hypnotic arpeggiated figure over sustained bass evoking moonlit water.',
    analysis:
      'Beethoven breaks convention by opening with a slow movement — grief first, storm saved for the finale.',
    bio: 'Beethoven went deaf mid-career and kept composing in total silence.',
    room: 'hall2',
  },

  // ── HALL 3: Romantic ─────────────────────────────
  {
    id: 'chopin-ballade',
    title: 'Ballade No. 1 in G Minor, Op. 23',
    composer: 'Frédéric Chopin',
    composerId: 'chopin',
    era: 'Romantic',
    year: '1835',
    youtubeUrl: 'https://www.youtube.com/watch?v=RR7eUSFEn5I',
    audioFile: '/audio/chopin-ballade.ogg',
    description:
      'Large-scale solo piano work. Narrative arc from questioning opening to devastating virtuosic coda.',
    analysis:
      'Chopin invents a form that works like a novel — protagonist theme, crisis, false resolution, catastrophic ending.',
    bio: 'The poet of the piano. Chopin wrote almost exclusively for solo piano and transformed it from a percussive instrument into a vehicle for vocal-like melody.',
    room: 'hall3',
  },
  {
    id: 'chopin-nocturne',
    title: 'Nocturne in E-flat Major, Op. 9 No. 2',
    composer: 'Frédéric Chopin',
    composerId: 'chopin',
    era: 'Romantic',
    year: '1832',
    youtubeUrl: 'https://www.youtube.com/watch?v=YGRO05WcNDk',
    audioFile: '/audio/chopin-nocturne.ogg',
    description:
      "Gentle singing melody over rocking left-hand accompaniment. Epitomizes the nocturne 'night piece' form.",
    analysis:
      "The melody is a human voice trapped in a piano — each repetition ornamented more, as if the singer can't stop.",
    bio: 'Chopin died of tuberculosis at 39.',
    room: 'hall3',
  },
  {
    id: 'tchaikovsky-swan-lake',
    title: 'Swan Lake Suite, Op. 20',
    composer: 'Pyotr Ilyich Tchaikovsky',
    composerId: 'tchaikovsky',
    era: 'Late Romantic',
    year: '1876',
    youtubeUrl: 'https://www.youtube.com/watch?v=9cNQFB0TDfY',
    audioFile: '/audio/tchaikovsky-swan-lake.ogg',
    description:
      "Ballet music. The 'Scene' theme — descending oboe over harp arpeggios — synonymous with classical ballet.",
    analysis:
      'The oboe theme is longing made physical — it descends like a swan touching water, and every dancer chases it.',
    bio: "Russia's most emotionally transparent composer. Tchaikovsky wore his anguish on his sleeve — depression, hidden sexuality, loneliness — and transmuted it all into music of staggering beauty.",
    room: 'hall3',
  },
  {
    id: 'tchaikovsky-1812',
    title: '1812 Overture, Op. 49',
    composer: 'Pyotr Ilyich Tchaikovsky',
    composerId: 'tchaikovsky',
    era: 'Late Romantic',
    year: '1880',
    youtubeUrl: 'https://www.youtube.com/watch?v=VbxgYlcNxE8',
    audioFile: '/audio/tchaikovsky-1812.ogg',
    description:
      'Festival overture commemorating Russia vs. Napoleon. Calls for real cannons and church bells in the climax.',
    analysis:
      'Tchaikovsky scores literal weapons as instruments — when cannons fire, the line between music and power dissolves.',
    bio: 'Tchaikovsky wore his anguish on his sleeve and transmuted it all into music of staggering beauty.',
    room: 'hall3',
  },
  {
    id: 'debussy-clair-de-lune',
    title: 'Clair de Lune (Suite Bergamasque)',
    composer: 'Claude Debussy',
    composerId: 'debussy',
    era: 'Impressionism',
    year: '1905',
    youtubeUrl: 'https://www.youtube.com/watch?v=CvFH_6DNRCY',
    audioFile: '/audio/debussy-clair-de-lune.ogg',
    description:
      'Third movement of Suite bergamasque for solo piano. Arpeggiated figures evoke moonlight on water.',
    analysis:
      "Debussy doesn't depict moonlight — he depicts what moonlight does to your thoughts: chords shift like reflections.",
    bio: 'The painter of sound. Debussy dissolved traditional harmony into washes of color — he was closer to the Impressionist painters than to any musician.',
    room: 'hall3',
  },
  {
    id: 'schubert-ave-maria',
    title: 'Ave Maria (D. 839)',
    composer: 'Franz Schubert',
    composerId: 'schubert',
    era: 'Early Romantic',
    year: '1825',
    youtubeUrl: 'https://www.youtube.com/watch?v=2bosouX_d8Y',
    audioFile: '/audio/schubert-ave-maria.ogg',
    description:
      "Song from Walter Scott's 'The Lady of the Lake.' Rippling piano beneath sustained vocal. Later adapted to Latin prayer.",
    analysis:
      'The accompaniment is a cradle rocking beneath the vocal — the melody floats above without ever breaking the stillness.',
    bio: 'Died at 31 with over 1,000 works. Schubert was the supreme melodist.',
    room: 'hall3',
  },
]
