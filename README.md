# the Silent Camera

*Silentium est aureum*

A dark-themed photography portfolio showcasing work by Kinan Faham. The site renders a randomized, infinite-scroll grid of images with a fullscreen lightbox carousel. Built as a static site for GitHub Pages — no frameworks, no build tools, no nonsense.

**Live:** [thesilentcamera.com](https://thesilentcamera.com)

## Features

- Randomized image grid (Fisher-Yates shuffle on every page load)
- CSS Grid layout with dense packing — ~15% of images randomly promoted to featured (3-col × 2-row)
- Infinite scroll with lazy loading
- Fullscreen lightbox with keyboard (Escape, Arrow keys) and touch/swipe navigation
- Responsive: 3 columns desktop, 2 tablet, 1 mobile
- Dark theme with Fraunces (headings) + Sora (body) typography
- Zero dependencies — vanilla HTML, CSS, JS

## Quick Start

```bash
# Install Python tooling
uv sync

# Regenerate the image manifest (after adding/removing images)
uv run generate-manifest

# Start local dev server
uv run serve          # default port 8080
uv run serve 3000     # custom port
```

## Adding Images

1. Drop image files into `images/` (root level or in a subfolder)
2. Run `uv run generate-manifest`
3. Commit the new images and the updated `images.json`

The manifest generator recursively scans `images/`, skipping `thumbs/` and `dynamic/` subdirectories. Supported formats: jpg, jpeg, png, webp, avif, gif, svg, heic.

## Project Structure

```
index.html              — Single-page gallery
css/style.css           — Styles (dark theme, grid, lightbox)
js/app.js               — Image loading, shuffle, scroll, lightbox
images/                 — Photo albums in subfolders
images.json             — Generated manifest (do not edit by hand)
logos/                  — SVG and PNG logo/favicon assets
scripts/                — Python tooling (manifest generator, dev server)
pyproject.toml          — uv/Python project config
AGENTS.md               — Coding agent instructions
CLAUDE.md               — Symlink to AGENTS.md
```

## Socials

- [YouTube](https://www.youtube.com/@Thesilentcamera)
- [Instagram](https://instagram.com/thesilentcamera)
- [Facebook](https://facebook.com/theSilentCamera)
- [LinkedIn](https://www.linkedin.com/company/the-silent-camera)

## Powered by

[Farty Bobo](https://fartybobo.com)
