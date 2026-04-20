"""Scan images/ and generate images.json for the gallery."""

import json
from pathlib import Path

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg', '.heic'}
EXCLUDE_DIRS = {'thumbs', 'dynamic'}


def find_images(images_dir: Path) -> list[dict[str, str]]:
    entries = []

    for path in sorted(images_dir.rglob('*')):
        if not path.is_file():
            continue
        if path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        # Skip files inside excluded directories
        if any(part in EXCLUDE_DIRS for part in path.relative_to(images_dir).parts):
            continue

        rel_full = str(path.relative_to(images_dir.parent))

        # Look for a matching thumbnail
        thumb_name = f"thumbs_{path.name.lower()}"
        thumb_path = path.parent / 'thumbs' / thumb_name
        if thumb_path.is_file():
            rel_thumb = str(thumb_path.relative_to(images_dir.parent))
        else:
            rel_thumb = rel_full

        entries.append({'thumb': rel_thumb, 'full': rel_full})

    return entries


def main():
    root = Path(__file__).resolve().parent.parent
    images_dir = root / 'images'
    output = root / 'images.json'

    if not images_dir.is_dir():
        print('Error: images/ directory not found')
        raise SystemExit(1)

    entries = find_images(images_dir)

    output.write_text(json.dumps(entries, indent=2) + '\n')
    print(f'Generated images.json with {len(entries)} image(s)')


if __name__ == '__main__':
    main()
