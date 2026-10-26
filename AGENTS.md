# Agents

Use Node 24 (`.nvmrc`). For art publication, GIFs, covers, or changes to a featured
sketch, load `skills/blog-publish-art/SKILL.md` first.

## Canonical Files

- `_data/art.json`: homepage artwork, public config links, static covers, selected GIFs.
- `public/img/art/`: published assets; `gifs/manifest.json` tracks selected exports.
- `content/index.njk`, `_includes/art-previews.js`, `css/index.css`: grid and hover behavior.
- `test/site.test.js`: production/prefix builds, archive integrity, and initial asset loading.
- `README.md`, `package.json`, `eleventy.config.js`: project workflow and build behavior.

## Publication Rules

- Keep one selected GIF for each featured deployed config; leave capture variants
  outside the public site. Preserve existing public asset URLs when possible.
- Generate the static cover from frame zero of that exact GIF as a lossless WebP
  with identical dimensions. Verify decoded pixels, not just filenames or aspect ratio.
- GIF URLs stay in `data-gif` until hover. `loading="lazy"` on a GIF is insufficient.
- Update the artwork entry, assets, and archive metadata together. Keep original
  captures intact and document missing capture settings honestly.

## Checks and Previews

- `npm run check` runs the offline regression suite and production build. Use it
  before publishing; check first-frame cover equality separately as described in the skill.
- Keep work offline by default. A new task does not authorize a server or browser;
  reuse an existing preview only when live verification is in scope.
- `_site/` is generated and Eleventy does not remove stale assets. When removing
  archived exports, clean their generated copies before verifying the final build.
- Inspect the current branch and incoming remote changes before an authorized
  push. Report push and deployment status separately.
