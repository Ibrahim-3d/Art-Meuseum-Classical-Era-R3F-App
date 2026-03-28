#!/usr/bin/env python3
"""
Asset downloader for Echoes & Visions virtual museum.

Downloads:
  1. Music audio from YouTube (via yt-dlp)
  2. Artist portraits from Wikipedia (via Scrapling)
  3. Missing painting images from Google Images (via Scrapling)

Usage:
  python scripts/download_assets.py              # Run everything
  python scripts/download_assets.py --audio      # Only download audio
  python scripts/download_assets.py --artists    # Only scrape artist photos
  python scripts/download_assets.py --paintings  # Only scrape missing paintings
  python scripts/download_assets.py --data       # Only save JSON data
"""

import json
import os
import sys
import subprocess
import time
import urllib.request
import ssl
from pathlib import Path
from urllib.parse import quote

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT = Path(__file__).resolve().parent.parent
PUBLIC = PROJECT / "public"
AUDIO_DIR = PUBLIC / "audio"
ARTISTS_DIR = PUBLIC / "artists"
PAINTINGS_DIR = PUBLIC / "paintings"
DATA_DIR = PROJECT / "src" / "data"

# ---------------------------------------------------------------------------
# Music data — 15 tracks with YouTube URLs
# ---------------------------------------------------------------------------
MUSIC = [
    # ── HALL 1: Baroque ──────────────────────────────
    {
        "id": "bach-toccata",
        "title": "Toccata and Fugue in D minor, BWV 565",
        "composer": "Johann Sebastian Bach",
        "composerId": "bach",
        "era": "Baroque",
        "year": "c. 1704",
        "youtubeUrl": "https://www.youtube.com/watch?v=ho9rZjlsyYY",
        "description": "Dramatic organ work. Cascading toccata launches into complex three-voice fugue. The definitive pipe organ sound.",
        "analysis": "The opening is free-fall \u2014 Bach drops you from top to bottom, establishing vertigo that the fugue rationalizes into order.",
        "room": "hall1",
    },
    {
        "id": "bach-cello",
        "title": "Cello Suite No. 1 in G major, BWV 1007",
        "composer": "Johann Sebastian Bach",
        "composerId": "bach",
        "era": "Baroque",
        "year": "c. 1720",
        "youtubeUrl": "https://www.youtube.com/watch?v=1prweT95Mo0",
        "description": "Six movements for solo cello. The Prelude \u2014 flowing arpeggios that seem to breathe on their own.",
        "analysis": "One cello, no accompaniment, yet it sounds like an ensemble \u2014 Bach implies harmony through melody alone.",
        "room": "hall1",
    },
    {
        "id": "vivaldi-spring",
        "title": 'The Four Seasons \u2014 "Spring" (RV 269)',
        "composer": "Antonio Vivaldi",
        "composerId": "vivaldi",
        "era": "Baroque",
        "year": "1725",
        "youtubeUrl": "https://www.youtube.com/watch?v=ZPdk5GaIDjo",
        "description": "First of four violin concertos depicting seasons. Birdsong, brooks, and storms rendered through instruments.",
        "analysis": "Program music two centuries before Hollywood \u2014 Vivaldi hands you a script and makes the violins act it out.",
        "room": "hall1",
    },
    {
        "id": "pachelbel-canon",
        "title": "Canon in D",
        "composer": "Johann Pachelbel",
        "composerId": "pachelbel",
        "era": "Baroque",
        "year": "c. 1680\u20131706",
        "youtubeUrl": "https://www.youtube.com/watch?v=JvNQLJ1_HQ0",
        "description": "Canon for three violins and basso continuo. Eight-note ground bass repeats while violin lines spiral upward.",
        "analysis": "Same eight notes 28 times and never boring \u2014 variation over constraint is music's most powerful emotional engine.",
        "room": "hall1",
    },
    {
        "id": "handel-hallelujah",
        "title": 'Messiah \u2014 "Hallelujah Chorus"',
        "composer": "George Frideric Handel",
        "composerId": "handel",
        "era": "Baroque",
        "year": "1741",
        "youtubeUrl": "https://www.youtube.com/watch?v=IUZEtVbJT5c",
        "description": "Part II finale of Handel's oratorio. Audience traditionally stands. King George II allegedly rose at the premiere.",
        "analysis": "Handel writes 'Hallelujah' 71 times, each hitting differently \u2014 through dynamics and texture, repetition becomes escalation.",
        "room": "hall1",
    },

    # ── HALL 2: Classical ────────────────────────────
    {
        "id": "mozart-requiem",
        "title": "Requiem in D minor, K. 626",
        "composer": "Wolfgang Amadeus Mozart",
        "composerId": "mozart",
        "era": "Classical",
        "year": "1791",
        "youtubeUrl": "https://www.youtube.com/watch?v=sPlhKP0nZII",
        "description": "Mozart's final, unfinished mass for the dead. The Lacrimosa is devastatingly beautiful. Completed by S\u00fcssmayr.",
        "analysis": "A dying man writing about death \u2014 the Lacrimosa breaks off mid-measure where Mozart's life broke off.",
        "room": "hall2",
    },
    {
        "id": "mozart-eine-kleine",
        "title": "Eine kleine Nachtmusik, K. 525",
        "composer": "Wolfgang Amadeus Mozart",
        "composerId": "mozart",
        "era": "Classical",
        "year": "1787",
        "youtubeUrl": "https://www.youtube.com/watch?v=oy2zDJPIgwc",
        "description": "Serenade in four movements for strings. Opening allegro is one of the most recognizable melodies in classical music.",
        "analysis": "Mozart makes perfection sound easy \u2014 every phrase lands exactly where it should, as if no other note were possible.",
        "room": "hall2",
    },
    {
        "id": "beethoven-symphony5",
        "title": "Symphony No. 5 in C minor, Op. 67",
        "composer": "Ludwig van Beethoven",
        "composerId": "beethoven",
        "era": "Classical / Early Romantic",
        "year": "1808",
        "youtubeUrl": "https://www.youtube.com/watch?v=fOk8Tm815lE",
        "description": "Four movements opening with the most famous four notes in music. Journeys from C minor struggle to C major triumph.",
        "analysis": "The opening motif is a seed \u2014 four notes grow an entire universe of conflict and resolution. Constraint births invention.",
        "room": "hall2",
    },
    {
        "id": "beethoven-moonlight",
        "title": "Moonlight Sonata (Op. 27 No. 2)",
        "composer": "Ludwig van Beethoven",
        "composerId": "beethoven",
        "era": "Classical / Early Romantic",
        "year": "1801",
        "youtubeUrl": "https://www.youtube.com/watch?v=4Tr0otuiQuU",
        "description": "Three movements. Famous first movement: slow hypnotic arpeggiated figure over sustained bass evoking moonlit water.",
        "analysis": "Beethoven breaks convention by opening with a slow movement \u2014 grief first, storm saved for the finale.",
        "room": "hall2",
    },

    # ── HALL 3: Romantic ─────────────────────────────
    {
        "id": "chopin-ballade",
        "title": "Ballade No. 1 in G minor, Op. 23",
        "composer": "Fr\u00e9d\u00e9ric Chopin",
        "composerId": "chopin",
        "era": "Romantic",
        "year": "1835",
        "youtubeUrl": "https://www.youtube.com/watch?v=RR7eUSFEn5I",
        "description": "Large-scale solo piano work. Narrative arc from questioning opening to devastating virtuosic coda.",
        "analysis": "Chopin invents a form that works like a novel \u2014 protagonist theme, crisis, false resolution, catastrophic ending.",
        "room": "hall3",
    },
    {
        "id": "chopin-nocturne",
        "title": "Nocturne in E-flat major, Op. 9 No. 2",
        "composer": "Fr\u00e9d\u00e9ric Chopin",
        "composerId": "chopin",
        "era": "Romantic",
        "year": "1832",
        "youtubeUrl": "https://www.youtube.com/watch?v=YGRO05WcNDk",
        "description": "Gentle singing melody over rocking left-hand accompaniment. Epitomizes the nocturne 'night piece' form.",
        "analysis": "The melody is a human voice trapped in a piano \u2014 each repetition ornamented more, as if the singer can't stop.",
        "room": "hall3",
    },
    {
        "id": "tchaikovsky-swan-lake",
        "title": "Swan Lake Suite, Op. 20",
        "composer": "Pyotr Ilyich Tchaikovsky",
        "composerId": "tchaikovsky",
        "era": "Late Romantic",
        "year": "1876",
        "youtubeUrl": "https://www.youtube.com/watch?v=9cNQFB0TDfY",
        "description": "Ballet music. The 'Scene' theme \u2014 descending oboe over harp arpeggios \u2014 synonymous with classical ballet.",
        "analysis": "The oboe theme is longing made physical \u2014 it descends like a swan touching water, and every dancer chases it.",
        "room": "hall3",
    },
    {
        "id": "tchaikovsky-1812",
        "title": "1812 Overture, Op. 49",
        "composer": "Pyotr Ilyich Tchaikovsky",
        "composerId": "tchaikovsky",
        "era": "Late Romantic",
        "year": "1880",
        "youtubeUrl": "https://www.youtube.com/watch?v=VbxgYlcNxE8",
        "description": "Festival overture commemorating Russia vs. Napoleon. Calls for real cannons and church bells in the climax.",
        "analysis": "Tchaikovsky scores literal weapons as instruments \u2014 when cannons fire, the line between music and power dissolves.",
        "room": "hall3",
    },
    {
        "id": "debussy-clair-de-lune",
        "title": "Clair de Lune (Suite bergamasque)",
        "composer": "Claude Debussy",
        "composerId": "debussy",
        "era": "Impressionism",
        "year": "1905",
        "youtubeUrl": "https://www.youtube.com/watch?v=CvFH_6DNRCY",
        "description": "Third movement of Suite bergamasque for solo piano. Arpeggiated figures evoke moonlight on water.",
        "analysis": "Debussy doesn't depict moonlight \u2014 he depicts what moonlight does to your thoughts: chords shift like reflections.",
        "room": "hall3",
    },
    {
        "id": "schubert-ave-maria",
        "title": "Ave Maria (D. 839)",
        "composer": "Franz Schubert",
        "composerId": "schubert",
        "era": "Early Romantic",
        "year": "1825",
        "youtubeUrl": "https://www.youtube.com/watch?v=2bosouX_d8Y",
        "description": "Song from Walter Scott's 'The Lady of the Lake.' Rippling piano beneath sustained vocal. Later adapted to Latin prayer.",
        "analysis": "The accompaniment is a cradle rocking beneath the vocal \u2014 the melody floats above without ever breaking the stillness.",
        "room": "hall3",
    },
]

# ---------------------------------------------------------------------------
# All artists — composers + painters — with Wikipedia page names
# ---------------------------------------------------------------------------
ALL_ARTISTS = [
    # Composers
    {"id": "beethoven",   "name": "Ludwig van Beethoven",       "wiki": "Ludwig_van_Beethoven"},
    {"id": "mozart",      "name": "Wolfgang Amadeus Mozart",    "wiki": "Wolfgang_Amadeus_Mozart"},
    {"id": "bach",        "name": "Johann Sebastian Bach",      "wiki": "Johann_Sebastian_Bach"},
    {"id": "chopin",      "name": "Fr\u00e9d\u00e9ric Chopin",  "wiki": "Fr%C3%A9d%C3%A9ric_Chopin"},
    {"id": "vivaldi",     "name": "Antonio Vivaldi",            "wiki": "Antonio_Vivaldi"},
    {"id": "tchaikovsky", "name": "Pyotr Ilyich Tchaikovsky",   "wiki": "Pyotr_Ilyich_Tchaikovsky"},
    {"id": "debussy",     "name": "Claude Debussy",             "wiki": "Claude_Debussy"},
    {"id": "pachelbel",   "name": "Johann Pachelbel",           "wiki": "Johann_Pachelbel"},
    {"id": "handel",      "name": "George Frideric Handel",     "wiki": "George_Frideric_Handel"},
    {"id": "schubert",    "name": "Franz Schubert",             "wiki": "Franz_Schubert"},
    # Painters
    {"id": "da-vinci",     "name": "Leonardo da Vinci",         "wiki": "Leonardo_da_Vinci"},
    {"id": "botticelli",   "name": "Sandro Botticelli",         "wiki": "Sandro_Botticelli"},
    {"id": "raphael",      "name": "Raphael Sanzio",            "wiki": "Raphael"},
    {"id": "michelangelo", "name": "Michelangelo Buonarroti",   "wiki": "Michelangelo"},
    {"id": "vermeer",      "name": "Jan Vermeer",               "wiki": "Johannes_Vermeer"},
    {"id": "caravaggio",   "name": "Caravaggio",                "wiki": "Caravaggio"},
    {"id": "rembrandt",    "name": "Rembrandt van Rijn",        "wiki": "Rembrandt"},
    {"id": "velazquez",    "name": "Diego Vel\u00e1zquez",      "wiki": "Diego_Vel%C3%A1zquez"},
    {"id": "david",        "name": "Jacques-Louis David",       "wiki": "Jacques-Louis_David"},
    {"id": "goya",         "name": "Francisco Goya",            "wiki": "Francisco_Goya"},
    {"id": "delacroix",    "name": "Eug\u00e8ne Delacroix",     "wiki": "Eug%C3%A8ne_Delacroix"},
]

# ---------------------------------------------------------------------------
# SSL context for urllib (Windows sometimes needs this)
# ---------------------------------------------------------------------------
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


def download_file(url: str, dest: Path) -> bool:
    """Download a file from URL to dest path."""
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        with urllib.request.urlopen(req, context=SSL_CTX) as resp:
            dest.write_bytes(resp.read())
        return True
    except Exception as e:
        print(f"    Download failed: {e}")
        return False


# ═══════════════════════════════════════════════════════════════════════════
# Phase 1: YouTube Audio
# ═══════════════════════════════════════════════════════════════════════════
def download_audio(track: dict) -> bool:
    """Download audio from YouTube using yt-dlp."""
    output = AUDIO_DIR / f"{track['id']}.mp3"
    if output.exists():
        print(f"  [skip] {track['id']}.mp3 already exists")
        return True

    print(f"  [downloading] {track['title']}...")

    # yt-dlp: extract audio, convert to mp3, medium quality
    cmd = [
        "yt-dlp",
        "--no-playlist",
        "-x",                       # extract audio only
        "--audio-format", "mp3",
        "--audio-quality", "5",     # ~128kbps — good enough for museum
        "--embed-thumbnail",        # embed cover art if available
        "-o", str(AUDIO_DIR / f"{track['id']}.%(ext)s"),
        track["youtubeUrl"],
    ]

    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=300
        )
        # yt-dlp may output to .mp3 or need a rename
        if output.exists():
            size_mb = output.stat().st_size / (1024 * 1024)
            print(f"  [done] {track['id']}.mp3 ({size_mb:.1f} MB)")
            return True
        else:
            # Sometimes yt-dlp writes with different extension during conversion
            for f in AUDIO_DIR.glob(f"{track['id']}.*"):
                if f.suffix != ".mp3":
                    f.rename(output)
                    print(f"  [done] {track['id']}.mp3 (renamed from {f.suffix})")
                    return True
            print(f"  [fail] {track['id']}: file not created")
            if result.stderr:
                print(f"    stderr: {result.stderr[:300]}")
            return False
    except subprocess.TimeoutExpired:
        print(f"  [fail] {track['id']}: download timed out (5 min)")
        return False
    except FileNotFoundError:
        print(f"  [fail] yt-dlp not found! Install: winget install yt-dlp")
        return False


def download_all_audio():
    """Download audio for all tracks."""
    print("\n" + "=" * 60)
    print("  PHASE 1: Downloading Music Audio (yt-dlp)")
    print("=" * 60)
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    success, fail = 0, 0
    for track in MUSIC:
        if download_audio(track):
            success += 1
        else:
            fail += 1
        time.sleep(2)  # rate limit

    print(f"\n  Audio: {success} downloaded, {fail} failed")
    return success, fail


# ═══════════════════════════════════════════════════════════════════════════
# Phase 2: Artist Portraits (Wikipedia via Scrapling)
# ═══════════════════════════════════════════════════════════════════════════
def scrape_wikipedia_portrait(artist: dict) -> bool:
    """Scrape artist portrait from Wikipedia using Scrapling's Fetcher."""
    from scrapling import Fetcher
    import re as _re

    output = ARTISTS_DIR / f"{artist['id']}.jpg"
    if output.exists():
        print(f"  [skip] {artist['id']}.jpg already exists")
        return True

    wiki_page = artist["wiki"]
    url = f"https://en.wikipedia.org/wiki/{wiki_page}"
    print(f"  [scraping] {artist['name']} from Wikipedia...")

    try:
        page = Fetcher.get(url)

        # Strategy 1: infobox-image class (modern Wikipedia layout)
        img_url = None
        results = page.css(".infobox-image img")
        if results:
            img_url = results[0].attrib.get("src", "")

        # Strategy 2: any img inside an infobox table
        if not img_url:
            results = page.css("table.infobox img")
            if results:
                img_url = results[0].attrib.get("src", "")

        # Strategy 3: first wikimedia image in main content
        if not img_url:
            for img in page.css("#mw-content-text img"):
                src = img.attrib.get("src", "")
                if "upload.wikimedia.org" in src and "icon" not in src.lower():
                    img_url = src
                    break

        if not img_url:
            print(f"  [miss] No portrait found for {artist['name']}")
            return False

        # Fix protocol-relative URLs
        if img_url.startswith("//"):
            img_url = "https:" + img_url

        # Request a larger thumbnail (500px instead of default 220px)
        if "/thumb/" in img_url:
            parts = img_url.rsplit("/", 1)
            if len(parts) == 2:
                filename = _re.sub(r"^\d+px-", "500px-", parts[1])
                img_url = parts[0] + "/" + filename

        if download_file(img_url, output):
            size_kb = output.stat().st_size / 1024
            print(f"  [done] {artist['id']}.jpg ({size_kb:.0f} KB)")
            return True
        return False

    except Exception as e:
        print(f"  [fail] {artist['name']}: {e}")
        return False


def scrape_google_image(query: str, output: Path) -> bool:
    """Fallback: scrape first Google Images result using Scrapling's StealthyFetcher."""
    if output.exists():
        return True

    print(f"  [google] Searching: {query}...")

    try:
        from scrapling import StealthyFetcher

        search_url = f"https://www.google.com/search?q={quote(query)}&tbm=isch"
        page = StealthyFetcher.fetch(search_url, headless=True, disable_resources=False)

        # Google Images embeds image URLs in the page source
        for img in page.css("img"):
            src = img.attrib.get("data-src") or img.attrib.get("src", "")
            if src.startswith("http") and "gstatic" not in src and "google" not in src:
                if download_file(src, output):
                    print(f"  [done] {output.name} from Google Images")
                    return True

        print(f"  [miss] No Google Image result for: {query}")
        return False

    except Exception as e:
        print(f"  [fail] Google Images: {e}")
        return False


def scrape_all_artists():
    """Scrape portraits for all artists."""
    print("\n" + "=" * 60)
    print("  PHASE 2: Scraping Artist Portraits (Scrapling + Wikipedia)")
    print("=" * 60)
    ARTISTS_DIR.mkdir(parents=True, exist_ok=True)

    success, fail = 0, 0

    for artist in ALL_ARTISTS:
        # Try Wikipedia first, Google Images as fallback
        if scrape_wikipedia_portrait(artist):
            success += 1
        else:
            query = f"{artist['name']} portrait painting composer artist"
            if scrape_google_image(query, ARTISTS_DIR / f"{artist['id']}.jpg"):
                success += 1
            else:
                fail += 1
        time.sleep(1.5)  # rate limit

    print(f"\n  Artists: {success} downloaded, {fail} failed")
    return success, fail


# ═══════════════════════════════════════════════════════════════════════════
# Phase 3: Missing Painting Images
# ═══════════════════════════════════════════════════════════════════════════

# Paintings that should exist in public/paintings/
EXPECTED_PAINTINGS = [
    {"id": "mona-lisa",             "query": "Mona Lisa Leonardo da Vinci painting"},
    {"id": "birth-of-venus",       "query": "Birth of Venus Botticelli painting"},
    {"id": "last-supper",          "query": "Last Supper Leonardo da Vinci painting"},
    {"id": "school-of-athens",     "query": "School of Athens Raphael fresco"},
    {"id": "creation-of-adam",     "query": "Creation of Adam Michelangelo Sistine Chapel"},
    {"id": "girl-pearl-earring",   "query": "Girl with a Pearl Earring Vermeer"},
    {"id": "calling-st-matthew",   "query": "Calling of Saint Matthew Caravaggio"},
    {"id": "art-of-painting",      "query": "Art of Painting Vermeer"},
    {"id": "judith-beheading",     "query": "Judith Beheading Holofernes Caravaggio"},
    {"id": "night-watch",          "query": "Night Watch Rembrandt painting"},
    {"id": "las-meninas",          "query": "Las Meninas Velazquez painting"},
    {"id": "death-of-marat",       "query": "Death of Marat Jacques-Louis David"},
    {"id": "saturn-devouring",     "query": "Saturn Devouring His Son Goya"},
    {"id": "liberty-leading",      "query": "Liberty Leading the People Delacroix"},
]


def check_and_scrape_paintings():
    """Find missing painting images and try to scrape them."""
    print("\n" + "=" * 60)
    print("  PHASE 3: Checking Painting Images")
    print("=" * 60)
    PAINTINGS_DIR.mkdir(parents=True, exist_ok=True)

    missing = []
    for p in EXPECTED_PAINTINGS:
        path = PAINTINGS_DIR / f"{p['id']}.jpg"
        if not path.exists():
            missing.append(p)
            print(f"  [missing] {p['id']}.jpg")
        else:
            print(f"  [ok]      {p['id']}.jpg")

    if not missing:
        print("\n  All painting images present!")
        return 0, 0

    print(f"\n  {len(missing)} missing painting(s). Scraping from Google Images...")
    success, fail = 0, 0

    for p in missing:
        output = PAINTINGS_DIR / f"{p['id']}.jpg"
        if scrape_google_image(p["query"] + " high resolution", output):
            success += 1
        else:
            fail += 1
        time.sleep(2)

    print(f"\n  Paintings: {success} downloaded, {fail} failed")
    return success, fail


# ═══════════════════════════════════════════════════════════════════════════
# Phase 4: Save data files
# ═══════════════════════════════════════════════════════════════════════════
def save_data():
    """Save music data as JSON for reference / app consumption."""
    print("\n" + "=" * 60)
    print("  PHASE 4: Saving Data Files")
    print("=" * 60)

    # Music JSON with audio file paths
    music_export = []
    for track in MUSIC:
        entry = {**track}
        audio_path = AUDIO_DIR / f"{track['id']}.mp3"
        entry["audioFile"] = f"/audio/{track['id']}.mp3"
        entry["audioExists"] = audio_path.exists()
        entry["composerImage"] = f"/artists/{track['composerId']}.jpg"
        music_export.append(entry)

    music_json = DATA_DIR / "music_data.json"
    with open(music_json, "w", encoding="utf-8") as f:
        json.dump(music_export, f, indent=2, ensure_ascii=False)
    print(f"  [saved] {music_json.relative_to(PROJECT)}")

    # Artists JSON
    artists_export = []
    for artist in ALL_ARTISTS:
        photo_path = ARTISTS_DIR / f"{artist['id']}.jpg"
        artists_export.append({
            **artist,
            "image": f"/artists/{artist['id']}.jpg",
            "imageExists": photo_path.exists(),
        })

    artists_json = DATA_DIR / "artists_data.json"
    with open(artists_json, "w", encoding="utf-8") as f:
        json.dump(artists_export, f, indent=2, ensure_ascii=False)
    print(f"  [saved] {artists_json.relative_to(PROJECT)}")

    # Summary
    audio_count = len(list(AUDIO_DIR.glob("*.mp3"))) if AUDIO_DIR.exists() else 0
    artist_count = len(list(ARTISTS_DIR.glob("*.jpg"))) if ARTISTS_DIR.exists() else 0
    painting_count = len(list(PAINTINGS_DIR.glob("*.jpg"))) if PAINTINGS_DIR.exists() else 0

    print(f"\n  Asset summary:")
    print(f"    Audio files:    {audio_count}/15")
    print(f"    Artist photos:  {artist_count}/21")
    print(f"    Paintings:      {painting_count}/14")


# ═══════════════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════════════
def main():
    args = set(sys.argv[1:])
    run_all = not args or args == {"--all"}

    print("\n  Echoes & Visions \u2014 Asset Downloader")
    print("  " + "\u2500" * 40)

    if run_all or "--audio" in args:
        download_all_audio()

    if run_all or "--artists" in args:
        scrape_all_artists()

    if run_all or "--paintings" in args:
        check_and_scrape_paintings()

    if run_all or "--data" in args:
        save_data()

    print("\n  Done!\n")


if __name__ == "__main__":
    main()
