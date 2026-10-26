import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const root = fileURLToPath(new URL("../", import.meta.url));
const temp = mkdtempSync(path.join(tmpdir(), "blog-test-"));
const output = name => path.join(temp, name);
const read = (directory, file) => readFileSync(path.join(directory, file), "utf8");
const html = (directory, file) => load(read(directory, file));
const files = directory => readdirSync(directory, { recursive: true }).filter(file => file.endsWith(".html")).sort();
const posts = [
  "2022-12-22-santa-susana-state-park",
  "2023-01-21-enabling-lerc-in-homebrew-gdal",
  "2023-01-22-yet-another-hypergeometric-calculator",
  "2023-01-25-enabling-e57-in-homebrew-pdal",
  "firstpost", "secondpost", "thirdpost", "fourthpost",
];
const tags = ["another-tag", "card-games", "hiking", "homebrew", "number-2", "outdoors", "posts-with-two-tags", "probability", "second-tag", "web"];
const publicPages = ["index.html", "404.html", ...["about", "blog", "books", "games", "software", "page-list", "tags", ...tags.map(tag => `tags/${tag}`)].map(page => `${page}/index.html`)];

function build(name, { cwd = root, development = false, prefix = "" } = {}) {
  const result = spawnSync(process.execPath, [path.join(root, "node_modules/@11ty/eleventy/cmd.cjs"), `--output=${output(name)}`, `--pathprefix=${prefix}`, "--quiet"], {
    cwd,
    env: { ...process.env, ELEVENTY_ENV: development ? "development" : "production" },
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return output(name);
}

before(() => {
  build("production");
  build("development", { development: true });
  build("prefix", { development: true, prefix: "/preview/" });
});
after(() => rmSync(temp, { recursive: true, force: true }));

test("production keeps every existing HTML route and publishes no drafts or starter examples", () => {
  assert.deepEqual(files(output("production")), publicPages.toSorted());
  assert.equal(html(output("production"), "blog/index.html")(".postlist-item").length, 0);
  const feed = JSON.parse(read(output("production"), "feed/feed.json"));
  assert.equal(feed.items.length, 0);
  assert.equal(load(read(output("production"), "feed/feed.xml"), { xml: true })("entry").length, 0);
  assert.doesNotMatch(read(output("production"), "sitemap.xml"), /\/posts\//);
  assert.doesNotMatch(read(output("production"), "sitemap.xml"), /\/feed\//);
});

test("development keeps all eight draft URLs, dates, feeds, and previous/next links", () => {
  assert.deepEqual(files(output("development")), [...publicPages, "page-list/1/index.html", ...posts.map(post => `posts/${post}/index.html`)].toSorted());
  const feed = JSON.parse(read(output("development"), "feed/feed.json"));
  assert.equal(feed.items.length, posts.length);
  assert.deepEqual(feed.items.map(item => new URL(item.url).pathname).sort(), posts.map(post => `/posts/${post}/`).sort());
  for (const post of posts) {
    const $ = html(output("development"), `posts/${post}/index.html`);
    assert.ok($("main h1").text());
    assert.match($("main time").attr("datetime"), /^\d{4}-\d{2}-\d{2}$/);
    assert.ok($("main a[href^='/posts/']").length > 0, `${post}: next/previous links`);
  }
  assert.ok(html(output("development"), "posts/2023-01-21-enabling-lerc-in-homebrew-gdal/index.html")("pre code .token").length > 0);
});

test("identity, navigation, social icons, art assets, and metadata survive the upgrade", () => {
  for (const file of publicPages) {
    const $ = html(output("production"), file);
    assert.equal($(".home").text(), "Justin Shrake");
    assert.deepEqual($(".nav a").map((_, node) => [[$(node).text(), $(node).attr("href")]]).get(), [["Art", "/"], ["Blog", "/blog/"], ["About", "/about/"]]);
    assert.equal($(".social-nav a[aria-label] svg.social-icon path").length, 5);
    assert.equal($(".social-nav a[rel='me']").attr("href"), "https://mastodon.social/@jshrake");
    assert.equal($("link[rel='icon']").attr("href"), "/img/favicon.ico");
    assert.equal($("#skip-link").attr("href"), "#main");
    assert.equal($("main#main").length, 1);
    assert.doesNotMatch($("main").text(), /Your Name|Edit.*metadata|naval navel-gazer/);
  }
  const $ = html(output("production"), "index.html");
  assert.equal($("title").text(), "Justin Shrake | Art");
  assert.equal($(".art-grid-item").length, 6);
  for (const image of ["cube-curve-follow.webp", "cube-surface-flow.webp", "curl-noise-bubbles.webp", "afterlight.webp", "pressure-radial-flow.webp", "particle-shader-machine-static.webp"]) {
    assert.deepEqual(readFileSync(path.join(output("production"), "img/art", image)), readFileSync(path.join(root, "public/img/art", image)));
  }
});

test("all local links, assets, and fragments resolve, including subdirectory builds", () => {
  for (const [name, prefix] of [["production", ""], ["development", ""], ["prefix", "/preview"]]) {
    const directory = output(name);
    for (const file of files(directory)) {
      const pagePath = file === "404.html" ? "/404.html" : `/${file.replace(/index\.html$/, "")}`;
      const $ = html(directory, file);
      for (const element of $("[href], [src], [srcset]").toArray()) {
        const values = [$(element).attr("href"), $(element).attr("src"), ...($(element).attr("srcset") || "").split(",").map(value => value.trim().split(/\s+/)[0])].filter(Boolean);
        for (const value of values) {
          const url = new URL(value, `https://jshrake.com${prefix}${pagePath}`);
          if (url.origin !== "https://jshrake.com") continue;
          assert.ok(url.pathname.startsWith(`${prefix}/`), `${name}/${file}: missing prefix in ${value}`);
          const pathname = decodeURIComponent(url.pathname.slice(prefix.length));
          const relative = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
          let target = path.join(directory, relative);
          if (existsSync(path.join(target, "index.html"))) target = path.join(target, "index.html");
          assert.ok(existsSync(target), `${name}/${file}: broken ${value}`);
          if (url.hash && target.endsWith(".html")) {
            const fragment = decodeURIComponent(url.hash.slice(1));
            const destination = load(readFileSync(target, "utf8"));
            assert.ok(destination("[id]").toArray().some(node => destination(node).attr("id") === fragment), `${name}/${file}: missing ${value}`);
          }
        }
      }
    }
  }
});

test("Atom, JSON Feed, sitemap, and Apache feed routing retain public URLs", () => {
  for (const [name, prefix] of [["production", ""], ["development", ""], ["prefix", "/preview"]]) {
    const directory = output(name);
    const feed = JSON.parse(read(directory, "feed/feed.json"));
    assert.equal(feed.title, "Justin Shrake");
    assert.equal(feed.author.url, "https://jshrake.com/about");
    assert.equal(feed.feed_url, `https://jshrake.com${prefix}/feed/feed.json`);
    const atom = load(read(directory, "feed/feed.xml"), { xml: true });
    assert.equal(atom("feed > title").text(), "Justin Shrake");
    assert.equal(atom("feed > link[rel='self']").attr("href"), `https://jshrake.com${prefix}/feed/feed.xml`);
    assert.equal(atom("entry").length, feed.items.length);
    assert.match(read(directory, "feed/.htaccess"), /DirectoryIndex feed\.xml/);
    const sitemap = load(read(directory, "sitemap.xml"), { xml: true });
    assert.ok(sitemap("loc").length > 0);
    for (const node of sitemap("loc").toArray()) {
      assert.ok(sitemap(node).text().startsWith(`https://jshrake.com${prefix}/`));
    }
  }
});

test("new published posts reach both feeds while drafts stay private and invalid draft flags fail", () => {
  const fixture = output("fixture-project");
  for (const file of ["_config", "_data", "_includes", "content", "css", "public", "eleventy.config.js", "package.json"]) {
    cpSync(path.join(root, file), path.join(fixture, file), { recursive: true });
  }
  symlinkSync(path.join(root, "node_modules"), path.join(fixture, "node_modules"), "dir");
  const published = path.join(fixture, "content/blog/2026-01-01-regression.md");
  cpSync(path.join(root, "public/img/art/pressure-radial-flow.webp"), path.join(fixture, "content/blog/regression.webp"));
  writeFileSync(published, '---\ntitle: \'A "quoted" title & more\'\ndate: 2026-01-01\ndraft: false\ntags: regression\n---\n## Heading\n\n[About](/about/)\n\n![Test art](./regression.webp)\n');
  const directory = build("fixture-production", { cwd: fixture });
  const feed = JSON.parse(read(directory, "feed/feed.json"));
  assert.equal(feed.items.length, 1);
  assert.equal(feed.items[0].title, 'A "quoted" title & more');
  assert.equal(feed.items[0].url, "https://jshrake.com/posts/2026-01-01-regression/");
  assert.match(feed.items[0].content_html, /href="https:\/\/jshrake\.com\/about\/"/);
  const atom = load(read(directory, "feed/feed.xml"), { xml: true });
  assert.equal(atom("entry > title").text(), feed.items[0].title);
  assert.equal(atom("entry").length, 1);
  const $ = html(directory, "posts/2026-01-01-regression/index.html");
  assert.ok(Number($("main img").attr("width")) > 0, "image transform supplies dimensions");
  const imagePath = $("main img").attr("src");
  assert.notEqual(imagePath, "./regression.webp", "image transform emits an optimized image");
  assert.ok(existsSync(path.join(directory, imagePath)), "optimized image is written to the output");
  writeFileSync(published, '---\ntitle: Invalid draft\ndraft: "false"\n---\nNever silently publish.\n');
  const invalid = spawnSync(process.execPath, [path.join(root, "node_modules/@11ty/eleventy/cmd.cjs"), `--output=${output("invalid")}`], { cwd: fixture, encoding: "utf8", env: { ...process.env, ELEVENTY_ENV: "production" } });
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stdout + invalid.stderr, /draft|boolean/);
});
