# HUG3D Project Page

Static project page for **HUG3D: Human Interaction-Aware 3D Reconstruction from a Single Image**.

## Structure

- `docs/index.html`: page content
- `docs/assets/css/style.css`: styles
- `docs/assets/js/main.js`: interactions (theme toggle, lightbox, BibTeX copy)
- `docs/assets/img`, `docs/assets/vid`: media assets

## Deployment

This repo includes `.github/workflows/deploy-pages.yml` for automatic GitHub Pages deployment.

1. Push to `main`.
2. In GitHub repo settings, set **Pages > Source** to **GitHub Actions**.
3. The workflow deploys `docs/` as the published site.

## Update checklist

- Replace `Paper / arXiv / Code` placeholder links in `docs/index.html`.
- Update author list, venue text, and URL metadata if needed.
- Replace or extend media under `docs/assets`.
