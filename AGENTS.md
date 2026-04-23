# The Silent Camera — Agent Instructions

## Project Overview

Static photography showcase site hosted on GitHub Pages. Pure vanilla HTML/CSS/JS — no frameworks, no build tools, no bundlers. The only tooling is Python (via `uv`) for image manifest generation and local dev serving.

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (no frameworks)
- **Fonts:** Cormorant Garamond (loaded from Google Fonts)
- **Tooling:** Python 3.12+, managed via `uv`
- **Hosting:** GitHub Pages (static files served from repo root)

## Project Structure

```
index.html              — Single-page gallery
css/style.css           — All styles (dark theme, responsive grid, lightbox)
js/app.js               — Image loading, shuffle, infinite scroll, lightbox
images/                 — Image assets (albums in subfolders)
images/<album>/         — Full-size images
images/<album>/thumbs/  — Thumbnails (thumbs_<lowercase_name>.jpg)
logos/                  — SVG and PNG logo/favicon assets
scripts/                — Python package for tooling
  generate_manifest.py  — Scans images/ → writes images.json
  serve.py              — Local HTTP dev server
images.json             — Generated manifest (DO NOT edit by hand)
pyproject.toml          — uv/Python project config
uv.lock                 — Dependency lockfile
```

## Common Commands

```bash
# Install/sync dependencies (first time or after pyproject.toml changes)
uv sync

# Regenerate image manifest after adding/removing images
uv run generate-manifest

# Start local dev server (default port 8080)
uv run serve
uv run serve 3000    # custom port
```

## Key Conventions

### Images

- `images.json` is **generated** — never edit it by hand. Run `uv run generate-manifest` instead.
- The manifest generator recursively scans `images/`, skips `thumbs/` and `dynamic/` subdirectories, and pairs each full-size image with its thumbnail.
- Thumbnails follow the naming pattern: `thumbs/thumbs_<lowercase_original_name>.jpg`
- Supported formats: jpg, jpeg, png, webp, avif, gif, svg, heic.
- The gallery grid loads **thumbnails** for performance; the lightbox loads **full-size** images.

### Styling

- Dark theme: pure black (`#000`) background.
- Brand colors from logo: gold `#b8953f`, dark `#2a2a2a`, cream `#e8dcc0`, off-white `#f5f5f0`.
- Font: Cormorant Garamond (display/serif). Weights: 300, 400, 300 italic.
- Responsive breakpoints: 3 columns > 1024px, 2 columns > 640px, 1 column mobile.
- CSS uses custom properties defined in `:root` — use those, don't hardcode colors.

### JavaScript

- Vanilla JS, IIFE-wrapped, `'use strict'`. No modules, no transpilation.
- Images are Fisher-Yates shuffled on each page load for random order.
- Infinite scroll loads batches of 6, wraps around when all images are shown.
- Lightbox supports: click, keyboard (Escape/Arrow keys), and touch swipe on mobile.

### No Build Step for Frontend

The HTML/CSS/JS is served as-is. There is no transpilation, minification, or bundling. Keep it that way — this is a static site for GitHub Pages.

## Before Committing

1. If you touched anything in `images/`, run `uv run generate-manifest` and include the updated `images.json`.
2. Verify `images.json` is valid: `python3 -c "import json; json.load(open('images.json'))"`.
3. Do not commit `.DS_Store`, `.venv/`, or `__pycache__/` (already in `.gitignore`).

## Committing rules on this repo

This is a solo project repo that does not require PRs or reviews from other humans or other agents. It is okay to merge to main.
