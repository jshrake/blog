---
name: blog-publish-art
description: Add or update a j2rgb piece on the art blog, including the featured config link, one selected GIF, its matching first-frame cover, archive metadata, hover-only loading, and publication checks.
---

# Publish Art on the Blog

Use this workflow for an art homepage release or a correction to its media. Honor
an explicitly narrower request, such as replacing only a cover. Keep existing
static-only entries unless the task includes adding their animations.

## Match the Deployed Piece

Read `_data/art.json` and `public/img/art/gifs/manifest.json` before adding assets.
In the j2rgb checkout (normally `../j2rgb`), inspect the sketch's `package.json` and
saved config. `j2rgb.deploy` and `j2rgb.config` identify the featured piece; do not
import every bundled config or every GIF found in capture folders.

Resolve its public path from nonempty `j2rgb.path`, package `name`, then workspace
folder. Match the link's `?config=` to the featured preset (`default` needs no
query). Preserve an existing card's public title and URL unless the task changes
them. For a new deployment or config change, coordinate with
[`j2rgb-publish-sketch`](../../../j2rgb/skills/j2rgb-publish-sketch/SKILL.md).

## Required Assets for an Animated Listing

- **One selected GIF:** the final export for this featured config. Reuse an
  existing approved file and public URL when possible. Keep original bytes and
  verify their SHA-256; re-encoding is a separate export decision. Experimental,
  superseded, and alternate-quality versions stay in the capture archive.
- **A matching static cover:** decode frame zero of the selected GIF to a
  lossless single-frame WebP at exactly the GIF's dimensions. Do not resize, crop,
  or use a gallery thumbnail/source PNG/another export's poster. GIF palette
  conversion can change pixels even when the composition looks similar.
- **An archive entry:** record provenance and encoded metadata, with an exact
  config snapshot when available. A current preset is not evidence of the
  settings used by an older capture.
- **An artwork entry:** set `title`, `link`, `image` (the static WebP), and `gif`
  (the selected GIF's public path) in `_data/art.json`. Do not put the GIF in
  `image`. Every selected GIF must have a matching archive entry and config URL.

If a required export is missing, identify it and finish independent preparation;
do not silently substitute a different config or publish an incomplete animated
card. An explicitly requested static listing may omit `gif`.

## Generate and Verify the Cover

The j2rgb repo supplies a Node 24/Sharp helper. From the blog root, substitute the
chosen paths for these examples:

```bash
node ../j2rgb/scripts/make-gif-cover.mjs public/img/art/example.gif public/img/art/example.webp
node ../j2rgb/scripts/make-gif-cover.mjs --check public/img/art/example.gif public/img/art/example.webp
```

It verifies decoded RGBA equality, dimensions, and single-frame WebP format before
writing. `--check` is read-only. The helper resolves Sharp from j2rgb's installed
dependencies; it does not require adding an image dependency to the blog. If the
checkout is elsewhere, locate it and use that path.

Regenerate the cover whenever the selected GIF changes. Verify the actual pair,
even if both filenames remain the same. `npm run check` does not currently compare
cover pixels to GIF frame zero; the helper's check is a separate release check.

## Archive and Data Updates

New exports and config snapshots normally go under
`public/img/art/gifs/<source-capture>/`. Existing public GIF URLs, such as Line Art
03's path outside `gifs/`, can be indexed directly without copying the file again.
The manifest indexes only GIFs selected by `_data/art.json`, one per piece.

Follow the existing `version: 1` manifest shape:

| Fields                                                                    | Source                                                                                                   |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `file`, `sketch`, `config`, `sketchUrl`                                   | Public asset path, workspace, featured config, and matching public link.                                 |
| `sourceCapture`, `sourceFile`, `sourceCommit`                             | Original capture and filename; commit when known, otherwise null.                                        |
| `configSnapshot`, `configSource`                                          | Archived config path and sidecar or capture-commit provenance; null with a note when unavailable.        |
| `bytes`, `sha256`, `width`, `height`, `frames`, `durationMs`, `loopCount` | Measure the selected encoded file; loop count zero means infinite and duration sums actual frame delays. |
| `notes`                                                                   | Material quality/timing tradeoffs or missing evidence.                                                   |

When replacing a selection, remove its obsolete blog GIF and any config snapshot
no longer referenced by another retained entry. Preserve original captures in
`~/Documents/j2rgb`. Do not bulk-delete unrelated public assets. Clean the obsolete
generated copies in `_site/` before rebuilding so removed exports do not linger.
Update README inventory counts/sizes and gallery test expectations when they change.

## Preserve Hover-Only Loading

`content/index.njk` puts the GIF URL in `data-gif`, using `htmlBaseUrl` for
subdirectory builds. `_includes/art-previews.js` creates its image on pointer
hover, keeps the still visible while loading, and removes the animation on leave.
Retain the still on failure, touch, and reduced-motion preferences.

Do not add the GIF to initial `src`, `srcset`, CSS backgrounds, preload links, or
eager JavaScript image creation. `loading="lazy"` still loads near the viewport;
it does not satisfy hover-only loading. Preserve the overlay geometry in
`css/index.css` so equal-sized covers and GIFs align.

## Release Checks

1. Verify each changed cover/GIF pair with the helper. Confirm archive hashes,
   config links, and one selected GIF per piece; leave the originals intact.
2. Run `npm run check` with Node 24. The suite covers production and subdirectory
   output, inventory integrity, and no initial GIF loading attributes. Update
   counts for new artwork without weakening those checks.
3. If live preview is authorized, reuse an existing preview. Confirm no GIF request
   before hover, only the hovered GIF loads, no framing jump, and pointer exit or
   a failed download restores the cover. Do not start a server/browser by default.
4. For an authorized commit/push, inspect the current branch, upstream, and newer
   remote work; preserve other publication changes and avoid duplicate cards.
   Use existing authorization without asking again. Verify the target j2rgb config
   is deployed before releasing a new blog link, and check hosting status when
   deployment verification is requested. A push alone is not proof the site is live.

The blog's production output is `_site/`; Netlify's build settings are in
`netlify.toml`. Report selected config/media, checks, and actual publication status.
