# blog

Source for [jshrake.com](https://jshrake.com), based on
[eleventy-base-blog](https://github.com/11ty/eleventy-base-blog).

## Development

Use Node 24 (see `.nvmrc`). Install the exact dependency versions with `npm ci`.

- `npm run build` generates the production site in `_site`.
- `npm start` starts the development server when a preview is wanted.
- `npm run watch` rebuilds on changes.
- `npm test` runs the regression suite without starting a server.
- `npm run check` runs the tests and a production build.

`serve`, `dev`, `bench`, and the upstream debug/build scripts remain available.
Netlify publishes `_site` using `npm run build`.

## Content and URLs

- `content/index.njk` is the art homepage; `_data/art.json` contains its artwork.
- `content/pages/` contains About, Books, Games, Software, and the 404 page.
- `content/blog/` contains posts. Their URLs remain `/posts/<filename>/`,
  including date prefixes, regardless of the new source directory.
- `_data/metadata.js` contains site identity, social links, and feed addresses.
- `public/` is copied to the site root; images remain available under `/img/`.
- `_includes/` contains layouts and `css/` contains the existing site theme.
- `eleventy.config.js` and `_config/` configure Eleventy and the shared filters.

`draft: true` prevents a post from appearing in production pages, feeds, and the
sitemap. Drafts are visible during `--serve`/`--watch`, or when explicitly building
with `ELEVENTY_ENV=development`. Draft values must be booleans. The existing empty
tag URLs are preserved. Use a fresh output directory when switching from a draft
preview to a production build, because Eleventy does not remove stale output files.

The Atom and JSON feeds remain at `/feed/feed.xml` and `/feed/feed.json`.
JSON Feed keeps the legacy `author` field alongside the current `authors` field.
For subdirectory hosting, pass `--pathprefix=/your-prefix/`; HTML URL rewriting is
handled by Eleventy's HTML base plugin rather than applying the `url` filter twice.

## GIF archive and hover previews

Use [`blog-publish-art`](skills/blog-publish-art/SKILL.md) for the publication
workflow and the repeatable first-frame cover generation/verification commands.

Selected GIF exports for the featured deployed configs live in `public/img/art/`.
New exports and config snapshots are grouped by source capture under `gifs/`;
Line Art 03 retains its existing `/img/art/line-art-03-trying.gif` URL.
Keep one GIF per artwork, matching the homepage selection in `_data/art.json`.
[`manifest.json`](public/img/art/gifs/manifest.json) indexes these exports. Each entry
records the sketch/config, published sketch URL, source capture and commit when
known, dimensions, frame count, encoded duration, loop count (`0` means infinite),
file size, and SHA-256. Saved capture configs or configs recovered from the capture
commit are kept alongside the GIFs. Missing settings are explicitly documented;
a current preset is not substituted for missing history.
The archive contains five GIFs (69.0 MB) from five captures. Original captures and
alternate exports remain in `~/Documents/j2rgb`.

When featuring a new deployed config, add its selected GIF's original bytes and
metadata to the archive and update the homepage's `gif` path. Remove any replaced
GIF and its unused config snapshot from the blog archive. Record the source
filename, capture, and checksum so the chosen export can be traced back later.
Keep an exact config snapshot when available; otherwise leave `configSnapshot`
and `configSource` null with an explanatory note. `npm test` checks the inventory,
file hashes, dimensions, config snapshots, and exact agreement with homepage selections.

Set an artwork's optional `gif` in `_data/art.json` to an archived GIF's public
path to use it on the homepage. Only the still image loads initially. The GIF URL
stays in `data-gif` until pointer hover; `_includes/art-previews.js` loads the GIF
then overlays it once ready. Leaving the card removes it and restores the still.
Generate each cover from frame zero of its selected GIF as a lossless WebP at the
same dimensions, so the still and animation have identical framing and pixels.
Repeat hovers can reuse the browser cache. Touch and reduced-motion visitors keep
the still image. GIFs are never automatically preloaded.

## Upgrade verification

Rebased onto upstream `main` at
[`cf0cc1f`](https://github.com/11ty/eleventy-base-blog/commit/cf0cc1f1b5972d9d7d06b9a0f0488e61839f3207)
on October 23, 2026. The 292 upstream commits are included. The original local
history is retained on `codex/blog-before-upstream-2026-10-23` and `dev`.

Every direct npm dependency is at its latest stable release as of that date.
Transitive dependencies are refreshed within their parents' supported ranges;
`package-lock.json` is committed for reproducible installs. The old icon wrappers
were replaced with current official Font Awesome packages. `npm outdated` checks
direct dependencies; `npm audit` checks the installed dependency tree.

The tests cover production and draft routes, navigation, social icons, original
art assets, links and fragments, subdirectory builds, feeds, sitemap, syntax
highlighting, image processing, and publication of a test post. Test builds use
and clean up temporary directories; they never start a preview server. GitHub
Actions runs these checks with Node 24.

## Resources

- [Eleventy documentation](https://www.11ty.dev/docs/)
- [Pannellum documentation](https://pannellum.org/documentation/reference/)
