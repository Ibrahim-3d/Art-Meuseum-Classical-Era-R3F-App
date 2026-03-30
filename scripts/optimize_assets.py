#!/usr/bin/env python3
"""
Asset optimizer for Echoes & Visions virtual museum.

Steps:
  1. Delete 3D-app junk (.blend, .mtlx, .tres, .usdc, .zip, preview PNGs)
  2. Convert audio  MP3  → Opus (.ogg)  using ffmpeg  — ~65 % smaller
  3. Convert images JPG/PNG → WebP      using Pillow  — ~30 % smaller

Usage:
  python scripts/optimize_assets.py            # run all steps
  python scripts/optimize_assets.py --clean    # only delete junk
  python scripts/optimize_assets.py --audio    # only convert audio
  python scripts/optimize_assets.py --images   # only convert images
  python scripts/optimize_assets.py --dry-run  # preview actions, no changes
"""

import subprocess
import sys
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
PROJECT = Path(__file__).resolve().parent.parent
PUBLIC  = PROJECT / "public"

# ── Quality settings ─────────────────────────────────────────────────────────
# Opus bitrates  (kbps) — classical music needs ≥ 96 kbps for transparency
MUSIC_KBPS     = 96   # full musical compositions
AMBIENT_KBPS   = 64   # looping atmosphere
FOOTSTEP_KBPS  = 48   # short SFX clicks

# WebP quality (0-100)
PAINTING_Q     = 90   # art — preserve fine detail
GENERIC_Q      = 85   # artist portraits, UI images
TEXTURE_Q      = 82   # PBR material maps (compression artefacts invisible in 3D)

# ── Junk extensions to delete from Materials/ ────────────────────────────────
JUNK_SUFFIXES = {".blend", ".mtlx", ".tres", ".usdc", ".zip"}
# Also delete the large PNG preview files inside each material folder
# (the ones named exactly like the folder, e.g. Grass008.png)
JUNK_PREVIEW_NAMES = {
    "Grass008.png", "Marble021.png",
    "OfficeCeiling001.png", "Plaster002.png", "Wood083A.png",
}

# ── SFX file stems (get lower bitrate) ───────────────────────────────────────
FOOTSTEP_STEMS = {
    "footstep-marble", "footstep-wood", "footstep-stone",
    "footstep-single", "footstep-heels", "footstep-forest",
    "footstep-tunnel",
}
AMBIENT_STEMS = {
    "ambient-cave", "ambient-nature",
    "ambient-wind-light", "ambient-wind-gentle", "ambient-wind-soft",
}

DRY_RUN = "--dry-run" in sys.argv


# ═════════════════════════════════════════════════════════════════════════════
# Helpers
# ═════════════════════════════════════════════════════════════════════════════

def fmt_mb(n_bytes: int) -> str:
    return f"{n_bytes / 1_048_576:.1f} MB"

def dir_size(path: Path) -> int:
    return sum(f.stat().st_size for f in path.rglob("*") if f.is_file()) if path.exists() else 0

def total_public_size() -> int:
    return dir_size(PUBLIC)

def delete(path: Path, label: str = "") -> None:
    tag = f"  [delete] {path.relative_to(PROJECT)}  {label}"
    if DRY_RUN:
        print(f"  [dry]    would delete {path.relative_to(PROJECT)}")
        return
    path.unlink()
    print(tag)


# ═════════════════════════════════════════════════════════════════════════════
# Step 1 — Delete junk files
# ═════════════════════════════════════════════════════════════════════════════

def clean_junk() -> int:
    """Remove 3D-app project files that serve no purpose in a browser."""
    print("\n── Step 1: Cleaning 3D-app junk ────────────────────────────────────")
    freed = 0
    materials = PUBLIC / "Materials"
    if not materials.exists():
        print("  Materials/ not found, skipping.")
        return 0

    for path in sorted(materials.rglob("*")):
        if not path.is_file():
            continue
        size = path.stat().st_size
        if path.suffix in JUNK_SUFFIXES or path.name in JUNK_PREVIEW_NAMES:
            freed += size
            delete(path, f"({fmt_mb(size)})")

    print(f"\n  Freed: {fmt_mb(freed)}")
    return freed


# ═════════════════════════════════════════════════════════════════════════════
# Step 2 — Convert audio: MP3 → Opus (.ogg)
# ═════════════════════════════════════════════════════════════════════════════

def audio_bitrate(stem: str) -> int:
    if stem in FOOTSTEP_STEMS:
        return FOOTSTEP_KBPS
    if stem in AMBIENT_STEMS:
        return AMBIENT_KBPS
    return MUSIC_KBPS

def source_bitrate_kbps(path: Path) -> int:
    """Ask ffprobe for the audio stream bitrate (kbps). Returns 0 on failure."""
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0",
         "-show_entries", "stream=bit_rate", "-of", "default=noprint_wrappers=1:nokey=1",
         str(path)],
        capture_output=True, text=True,
    )
    try:
        return int(result.stdout.strip()) // 1000
    except (ValueError, AttributeError):
        return 0


def convert_audio() -> tuple[int, int]:
    """Convert all MP3 files to Opus inside .ogg container."""
    print("\n── Step 2: Converting audio MP3 → Opus (.ogg) ──────────────────────")
    audio_dir = PUBLIC / "audio"
    if not audio_dir.exists():
        print("  audio/ not found, skipping.")
        return 0, 0

    before = after = 0
    for mp3 in sorted(audio_dir.glob("*.mp3")):
        ogg = mp3.with_suffix(".ogg")
        target = audio_bitrate(mp3.stem)
        src_kbps = source_bitrate_kbps(mp3)
        # Never target higher than the source — that just makes the file larger
        bitrate = min(target, src_kbps) if src_kbps > 0 else target
        before += mp3.stat().st_size

        if ogg.exists():
            print(f"  [skip]    {mp3.name} → already have {ogg.name}")
            after += ogg.stat().st_size
            if not DRY_RUN:
                delete(mp3)
            continue

        size_before = mp3.stat().st_size
        tag = f"{mp3.name} → {ogg.name}  @ {bitrate} kbps"

        if DRY_RUN:
            print(f"  [dry]     would convert {tag}")
            after += size_before  # pessimistic estimate
            continue

        result = subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(mp3),
                "-c:a", "libopus",
                "-b:a", f"{bitrate}k",
                "-vbr", "on",
                "-compression_level", "10",
                "-application", "audio",   # best for music (vs voip / lowdelay)
                str(ogg),
            ],
            capture_output=True, text=True,
        )

        if result.returncode != 0:
            print(f"  [error]   {tag}")
            print(f"            {result.stderr[-200:]}")
            after += size_before
            continue

        size_after = ogg.stat().st_size
        after += size_after
        ratio = (1 - size_after / size_before) * 100
        print(f"  [ok]      {tag}  {fmt_mb(size_before)} → {fmt_mb(size_after)}  (−{ratio:.0f}%)")
        delete(mp3)

    saved = before - after
    print(f"\n  Audio total: {fmt_mb(before)} → {fmt_mb(after)}  (saved {fmt_mb(saved)})")
    return before, after


# ═════════════════════════════════════════════════════════════════════════════
# Step 3 — Convert images: JPG/PNG → WebP
# ═════════════════════════════════════════════════════════════════════════════

def image_quality(path: Path) -> int:
    parts = path.parts
    if "paintings" in parts:
        return PAINTING_Q
    if "Materials" in parts:
        return TEXTURE_Q
    return GENERIC_Q

def convert_images() -> tuple[int, int]:
    """Convert all JPG/PNG assets to WebP."""
    try:
        from PIL import Image
    except ImportError:
        print("  Pillow not installed. Run: pip install Pillow")
        return 0, 0

    print("\n── Step 3: Converting images JPG/PNG → WebP ─────────────────────────")

    # Directories containing images used at runtime
    # (skip .hdr — Three.js EXR/HDR loaders need the original format)
    image_dirs = [
        PUBLIC / "paintings",
        PUBLIC / "artists",
        PUBLIC / "Materials",
    ]
    # Also handle root-level jpegs
    root_jpgs = list(PUBLIC.glob("*.jpg")) + list(PUBLIC.glob("*.png"))

    before = after = 0
    all_files: list[Path] = root_jpgs[:]
    for d in image_dirs:
        if d.exists():
            all_files += list(d.rglob("*.jpg")) + list(d.rglob("*.png"))

    for img_path in sorted(all_files):
        webp = img_path.with_suffix(".webp")
        quality = image_quality(img_path)
        size_before = img_path.stat().st_size
        before += size_before

        if webp.exists():
            print(f"  [skip]    {img_path.relative_to(PUBLIC)} → already have .webp")
            after += webp.stat().st_size
            if not DRY_RUN:
                delete(img_path)
            continue

        tag = f"{img_path.relative_to(PUBLIC)} → .webp  (q{quality})"

        if DRY_RUN:
            print(f"  [dry]     would convert {tag}")
            after += size_before
            continue

        try:
            with Image.open(img_path) as im:
                # Preserve ICC profile and EXIF if present
                exif = im.info.get("exif", b"")
                save_kwargs = {"quality": quality, "method": 6}
                if exif:
                    save_kwargs["exif"] = exif
                im.save(webp, "WEBP", **save_kwargs)
        except Exception as e:
            print(f"  [error]   {tag}: {e}")
            after += size_before
            continue

        size_after = webp.stat().st_size
        after += size_after
        ratio = (1 - size_after / size_before) * 100
        print(f"  [ok]      {tag}  {fmt_mb(size_before)} → {fmt_mb(size_after)}  (−{ratio:.0f}%)")
        delete(img_path)

    saved = before - after
    print(f"\n  Image total: {fmt_mb(before)} → {fmt_mb(after)}  (saved {fmt_mb(saved)})")
    return before, after


# ═════════════════════════════════════════════════════════════════════════════
# Main
# ═════════════════════════════════════════════════════════════════════════════

def main():
    args = set(sys.argv[1:]) - {"--dry-run"}
    run_all = not args or args == {"--all"}

    if DRY_RUN:
        print("\n  ★  DRY RUN — no files will be changed")

    size_start = total_public_size()
    print(f"\n  Echoes & Visions — Asset Optimizer")
    print(f"  public/ size before: {fmt_mb(size_start)}")
    print(f"  {'─' * 50}")

    if run_all or "--clean"  in args: clean_junk()
    if run_all or "--audio"  in args: convert_audio()
    if run_all or "--images" in args: convert_images()

    size_end = total_public_size()
    saved    = size_start - size_end
    pct      = saved / size_start * 100 if size_start else 0

    print(f"\n  {'═' * 50}")
    print(f"  public/ size after:  {fmt_mb(size_end)}")
    print(f"  Total saved:         {fmt_mb(saved)}  (−{pct:.0f}%)")
    if not DRY_RUN:
        print(f"\n  Next: update code refs (.mp3 → .ogg, .jpg → .webp)")
        print(f"        then: vercel --yes   or   git push (GitHub Pages)")
    print()


if __name__ == "__main__":
    main()
