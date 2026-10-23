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
