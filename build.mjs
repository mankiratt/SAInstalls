/**
 * S&A JOINERY — static site build
 * ================================
 * Assembles the multi-page site from shared partials into plain static HTML.
 *
 *   node build.mjs
 *
 * WHY A BUILD STEP?
 * The site is still plain HTML/CSS/JS — no framework, no dependencies.
 * This script only exists so the header and footer live in ONE file each
 * (src/partials/) instead of being copy-pasted into 12 pages. It writes
 * real, complete HTML to disk, which means:
 *   - nav links are real <a> tags in the source (good for SEO)
 *   - no JavaScript needed to render the page shell (no layout shift)
 *   - the built files are exactly what gets deployed
 *
 * WHAT YOU EDIT:
 *   src/partials/header.html   ← nav (edit once, applies everywhere)
 *   src/partials/footer.html   ← footer (edit once, applies everywhere)
 *   src/pages/*.html           ← the unique content of each page
 *   assets/js/projects.js      ← the project list (drives Our Work pages)
 *
 * WHAT YOU DO NOT EDIT:
 *   index.html, about/index.html, our-work/... etc. — these are GENERATED.
 *   Any change you make there is overwritten the next time you run the build.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const SITE = 'https://sajoinery.com.au';

const read = (...p) => readFileSync(join(...p), 'utf8');

/* ------------------------------------------------------------------
   Shared pieces
------------------------------------------------------------------ */
const shell = read(SRC, 'partials', 'shell.html');
const header = read(SRC, 'partials', 'header.html');
const footer = read(SRC, 'partials', 'footer.html');
const tail = read(SRC, 'partials', 'tail.html');

/* Structured data blocks — reused across pages by key. */
const schema = {
  business: read(SRC, 'partials', 'schema-business.html'),
  faq: read(SRC, 'partials', 'schema-faq.html'),
  reviews: read(SRC, 'partials', 'schema-reviews.html'),
};

/* ------------------------------------------------------------------
   Project categories — drives the six Our Work category pages.
   `key` must match the `category` field in assets/js/projects.js.
------------------------------------------------------------------ */
const CATEGORIES = [
  {
    key: 'kitchens',
    name: 'Kitchens',
    slug: 'kitchens',
    cover: 'kitchen1',
    eyebrow: 'CUSTOM KITCHENS',
    heading: 'Custom kitchens,<br><em>built around you.</em>',
    intro:
      'Every kitchen we build is designed and handcrafted to suit the way you actually cook and live — from compact galley renovations through to full open-plan rebuilds with butler\'s pantries.',
    title: 'Custom Kitchens Melbourne | Kitchen Cabinet Makers | S&A Joinery',
    description:
      'Custom kitchen renovations across Melbourne by S&A Joinery. Handcrafted cabinetry, stone benchtops and scullery joinery. 30+ years experience. Call 0478 671 407.',
  },
  {
    key: 'wardrobes',
    name: 'Wardrobes',
    slug: 'wardrobes',
    cover: 'wadrobe1',
    eyebrow: 'BUILT-IN WARDROBES',
    heading: 'Built-in wardrobes,<br><em>every centimetre used.</em>',
    intro:
      'Built-in wardrobes, walk-in robes and sliding systems designed around your storage — shelving, hanging space and drawers laid out to fit what you actually own.',
    title: 'Built-In Wardrobes Melbourne | Custom Robes | S&A Joinery',
    description:
      'Custom built-in wardrobes and walk-in robes across Melbourne. Floor-to-ceiling storage, sliding and mirrored doors, handcrafted by S&A Joinery. Call 0478 671 407.',
  },
  {
    key: 'bathrooms',
    name: 'Bathrooms',
    slug: 'bathrooms',
    cover: 'bathroom1',
    eyebrow: 'BATHROOM VANITIES',
    heading: 'Bathroom vanities,<br><em>finished to last.</em>',
    intro:
      'Handcrafted vanities and bathroom storage built from moisture-resistant materials and premium hardware — the finishing touch that makes a bathroom renovation feel complete.',
    title: 'Custom Bathroom Vanities Melbourne | S&A Joinery',
    description:
      'Custom bathroom vanities and storage across Melbourne. Floating, wall-hung and shaker-style vanities handcrafted by S&A Joinery. Call 0478 671 407.',
  },
  {
    key: 'bedrooms',
    name: 'Bedrooms',
    slug: 'bedrooms',
    cover: 'bedroom1',
    eyebrow: 'BEDROOM JOINERY',
    heading: 'Bedroom joinery,<br><em>made to measure.</em>',
    intro:
      'Built-in bedheads, bedside units, dressers and bedroom storage — joinery that turns awkward corners and alcoves into usable, beautiful space.',
    title: 'Custom Bedroom Joinery Melbourne | S&A Joinery',
    description:
      'Custom bedroom joinery across Melbourne — built-in bedheads, bedsides, dressers and storage, handcrafted by S&A Joinery. Call 0478 671 407.',
  },
  {
    key: 'living-spaces',
    name: 'Living Spaces',
    slug: 'living-spaces',
    cover: 'living1',
    eyebrow: 'LIVING SPACES',
    heading: 'Living spaces,<br><em>brought together.</em>',
    intro:
      'Entertainment units, media walls, bookcases and study nooks — custom joinery that makes a living area feel considered rather than furnished piece by piece.',
    title: 'Custom Living Room Joinery & Entertainment Units | S&A Joinery',
    description:
      'Custom entertainment units, media walls, bookcases and study nooks across Melbourne, handcrafted by S&A Joinery. Call 0478 671 407.',
  },
  {
    key: 'commercial',
    name: 'Commercial',
    slug: 'commercial',
    cover: 'commercial1',
    eyebrow: 'COMMERCIAL FITOUTS',
    heading: 'Commercial fitouts,<br><em>built to the same standard.</em>',
    intro:
      'Offices, retail and hospitality joinery built to the same exacting standard as our residential work — on programme, and to the specification you signed off.',
    title: 'Commercial Joinery & Shopfitting Melbourne | S&A Joinery',
    description:
      'Commercial joinery and fitouts across Melbourne — office, retail and hospitality cabinetry by S&A Joinery. Call 0478 671 407.',
  },
];

/* ------------------------------------------------------------------
   Projects
   The project list lives in assets/js/projects.js so there is one
   place to edit. We read it HERE, at build time, and write the
   project markup straight into the page. That means:
     - the photos and titles are in the HTML (good for search engines)
     - nothing jumps around as the page loads (no layout shift)
   The JavaScript that ships to the browser only adds behaviour to
   markup that is already there.
------------------------------------------------------------------ */
const projectsSource = read(ROOT, 'assets', 'js', 'projects.js');
const projectsScope = { window: {} };
new Function('window', projectsSource)(projectsScope.window);
const ALL_PROJECTS = projectsScope.window.SA_PROJECTS || [];

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** All photos for a project, in the order the modal shows them. */
const photosOf = (p) => [p.afterImage, ...(p.gallery || [])].filter(Boolean);

/** Human label for a category key, e.g. "living-spaces" -> "Living Spaces". */
const categoryName = (key) => (CATEGORIES.find((c) => c.key === key) || {}).name || key;

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/* Photos are shown in a 4:3 frame: one column on a phone, two on a
   tablet, three on a desktop. */
const TILE_SIZES = '(min-width: 1080px) 360px, (min-width: 700px) 44vw, 92vw';

/** Builds the srcset for one of our WebP photos (we ship 400w and 800w). */
function srcsetFor(src) {
  const small = src.replace(/\.webp$/, '-400.webp');
  return `${esc(small)} 400w, ${esc(src)} 800w`;
}

/* ------------------------------------------------------------------
   Real image dimensions
   The photos are not all the same shape — some are landscape, some
   portrait. Guessing a size makes the browser reserve the wrong box
   (and Lighthouse flags the mismatch), so we read the actual width
   and height out of each WebP file at build time.
------------------------------------------------------------------ */
function readWebpSize(b) {
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const fourcc = b.toString('ascii', 12, 16);
  if (fourcc === 'VP8 ') {
    return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  }
  if (fourcc === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (fourcc === 'VP8X') {
    return {
      w: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)),
      h: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)),
    };
  }
  return null;
}

const sizeCache = new Map();
function imageSize(webPath) {
  if (sizeCache.has(webPath)) return sizeCache.get(webPath);
  let dims = { w: 800, h: 600 };
  try {
    dims = readWebpSize(readFileSync(join(ROOT, webPath.replace(/^\//, '')))) || dims;
  } catch {
    console.warn(`  ! could not read size of ${webPath} — falling back to 800x600`);
  }
  sizeCache.set(webPath, dims);
  return dims;
}

const ICON_EXPAND =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
const ICON_ARROW =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
const ICON_LAYERS =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';
const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

/** One tile in the project grid. */
function renderTile(p, i) {
  const photos = photosOf(p);
  const cat = categoryName(p.category);
  const d = imageSize(p.afterImage);
  return `          <article class="tile animate-element" data-project-tile data-category="${esc(p.category)}">
            <div class="tile-media">
              <div class="tile-photo">
                <img src="${esc(p.afterImage)}" srcset="${srcsetFor(p.afterImage)}" sizes="${TILE_SIZES}"
                     alt="${esc(p.alt)}" width="${d.w}" height="${d.h}"
                     loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async">
              </div>
              <button type="button" class="tile-expand" data-open-project="${esc(p.id)}"
                      aria-label="Open ${esc(p.title)}, ${plural(photos.length, 'photo')}">${ICON_EXPAND}</button>
            </div>
            <div class="tile-body">
              <p class="tile-cat">${ICON_LAYERS}${esc(cat)}</p>
              <h3 class="tile-title">
                <button type="button" class="tile-open" data-open-project="${esc(p.id)}">${esc(p.title)}</button>
              </h3>
              ${p.description ? `<p class="tile-desc">${esc(p.description)}</p>` : ''}
              <p class="tile-foot">
                <span class="tile-count">${plural(photos.length, 'photo')}</span>
                <span class="tile-cue">View project${ICON_ARROW}</span>
              </p>
            </div>
          </article>`;
}

/** The full-screen viewer for one project. Rendered up front, hidden. */
function renderModal(p) {
  const photos = photosOf(p);
  const extra = photos.slice(1);
  const cat = categoryName(p.category);
  const lead = imageSize(p.afterImage);

  return `      <div class="pm" data-project-modal="${esc(p.id)}" hidden>
        <div class="pm-backdrop" data-pm-close></div>
        <div class="pm-dialog" role="dialog" aria-modal="true" aria-labelledby="pm-title-${esc(p.id)}" data-pm-dialog>
          <header class="pm-bar">
            <div class="pm-heading">
              <p class="pm-cat">${esc(cat)}</p>
              <h2 class="pm-title" id="pm-title-${esc(p.id)}">${esc(p.title)}</h2>
            </div>
            <button type="button" class="pm-close" data-pm-close>
              <span class="visually-hidden">Close project</span>${ICON_CLOSE}
            </button>
          </header>
          <div class="pm-scroll" data-pm-scroll>
            <div class="pm-inner">
              <figure class="pm-lead">
                <img src="${esc(p.afterImage)}" srcset="${srcsetFor(p.afterImage)}"
                     sizes="(min-width: 1100px) 960px, 94vw" alt="${esc(p.alt)}"
                     width="${lead.w}" height="${lead.h}" loading="lazy" decoding="async">
              </figure>
              ${p.description ? `<p class="pm-desc">${esc(p.description)}</p>` : ''}
              ${
                extra.length
                  ? `<div class="pm-gallery">
                <h3 class="pm-sub">More from this project</h3>
                <div class="pm-photos">
                  ${extra
                    .map(
                      (src, i) => `<figure class="pm-figure">${''}
                    <img src="${esc(src)}" srcset="${srcsetFor(src)}" sizes="(min-width: 1100px) 960px, 94vw"
                         alt="${esc(p.title)}, photo ${i + 2} of ${photos.length}"
                         width="${imageSize(src).w}" height="${imageSize(src).h}" loading="lazy" decoding="async">
                  </figure>`
                    )
                    .join('\n                  ')}
                </div>
              </div>`
                  : ''
              }
              <div class="pm-cta">
                <h3 class="pm-cta-title">Want something like this?</h3>
                <p class="pm-cta-text">Tell us about your space. We'll come to you, measure up and put together a clear, itemised quote.</p>
                <a class="btn btn-accent" href="/get-a-quote/">Get a Quote</a>
              </div>
            </div>
          </div>
        </div>
      </div>`;
}

/** Filter chips for the Our Work index. */
function renderFilters() {
  const chips = [
    `            <button type="button" class="chip is-active" data-filter="all" aria-pressed="true">All work<span class="chip-count">${ALL_PROJECTS.length}</span></button>`,
    ...CATEGORIES.map((c) => {
      const n = ALL_PROJECTS.filter((p) => p.category === c.key).length;
      return `            <button type="button" class="chip" data-filter="${c.key}" aria-pressed="false">${esc(c.name)}<span class="chip-count">${n}</span></button>`;
    }),
  ];
  return chips.join('\n');
}

/** The grid + hidden modals for a set of projects. */
function renderGrid(list) {
  if (!list.length) return '';
  const grid = list.map(renderTile).join('\n');
  const modals = list.map(renderModal).join('\n');
  return (
    `        <div class="tile-grid">\n${grid}\n        </div>\n\n` +
    `        <div class="project-modals">\n${modals}\n        </div>`
  );
}

function renderProjects(categoryKey) {
  return renderGrid(ALL_PROJECTS.filter((p) => p.category === categoryKey));
}

/* ------------------------------------------------------------------
   Page assembly
------------------------------------------------------------------ */

/** Marks the current nav item as active in the header markup. */
function markActiveNav(html, navKey) {
  if (!navKey) return html;
  return html.replace(
    new RegExp(`(<a [^>]*data-nav="${navKey}"[^>]*class="[^"]*)`, 'g'),
    '$1 active'
  ).replace(
    new RegExp(`(<a [^>]*data-nav="${navKey}"[^>]*)(>)`, 'g'),
    '$1 aria-current="page"$2'
  );
}

function buildPage({ out, url, title, description, body, navKey, schemas = ['business'], extraHead = '', extraScripts = '', noindex = false }) {
  const canonical = url === '/' ? `${SITE}/` : `${SITE}${url}`;
  const structured = schemas.map((k) => schema[k]).join('\n');

  // Tokens a page can use to drop in the whole project gallery.
  body = body
    .replace(/{{FILTERS}}/g, renderFilters())
    .replace(/{{ALL_PROJECTS}}/g, renderGrid(ALL_PROJECTS))
    .replace(/{{PROJECT_COUNT}}/g, String(ALL_PROJECTS.length));

  /* Any page that ended up with project tiles needs the gallery behaviour
     (filter chips + the project viewer). Detected from the finished markup
     so a new gallery page can never be built without its script. */
  if (body.includes('data-project-tile') && !extraScripts.includes('project-showcase')) {
    extraScripts +=
      (extraScripts ? '\n' : '') +
      '  <script src="/assets/js/project-showcase.js" defer></script>';
  }

  const html = shell
    .replace(/{{ROBOTS}}/g, noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large')
    .replace(/{{TITLE}}/g, title)
    .replace(/{{DESCRIPTION}}/g, description)
    .replace(/{{CANONICAL}}/g, canonical)
    .replace(/{{STRUCTURED_DATA}}/g, structured)
    .replace(/{{EXTRA_HEAD}}/g, extraHead)
    .replace(/{{HEADER}}/g, markActiveNav(header, navKey))
    .replace(/{{BODY}}/g, body)
    .replace(/{{FOOTER}}/g, footer)
    .replace(/{{TAIL}}/g, tail)
    .replace(/{{EXTRA_SCRIPTS}}/g, extraScripts);

  const dest = join(ROOT, out);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html, 'utf8');
  return url;
}

/** Reads a source page and its <!--PAGE {json} PAGE--> config block. */
function loadPage(file) {
  const raw = read(SRC, 'pages', file);
  const match = raw.match(/<!--PAGE([\s\S]*?)PAGE-->/);
  if (!match) throw new Error(`${file}: missing <!--PAGE ... PAGE--> config block`);
  const config = JSON.parse(match[1]);
  const body = raw.slice(match.index + match[0].length).trim();
  return { config, body };
}

/* ------------------------------------------------------------------
   Build
------------------------------------------------------------------ */
const built = [];

// 1. Standalone pages, each with its own source file in src/pages/
for (const file of readdirSync(join(SRC, 'pages')).filter((f) => f.endsWith('.html'))) {
  const { config, body } = loadPage(file);
  built.push(buildPage({ ...config, body }));
}

// 2. The six category pages, generated from one shared template
const categoryTemplate = read(SRC, 'templates', 'category.html');
for (const cat of CATEGORIES) {
  const projectsHtml = renderProjects(cat.key);
  const body = categoryTemplate
    .replace(/{{CATEGORY_KEY}}/g, cat.key)
    .replace(/{{CATEGORY_NAME}}/g, cat.name)
    .replace(/{{EYEBROW}}/g, cat.eyebrow)
    .replace(/{{HEADING}}/g, cat.heading)
    .replace(/{{INTRO}}/g, cat.intro)
    .replace(/{{PROJECTS}}/g, projectsHtml)
    .replace(/{{EMPTY_HIDDEN}}/g, projectsHtml ? ' hidden' : '');

  const breadcrumb = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
{"@type":"ListItem","position":1,"name":"Home","item":"${SITE}/"},
{"@type":"ListItem","position":2,"name":"Our Work","item":"${SITE}/our-work/"},
{"@type":"ListItem","position":3,"name":"${cat.name}","item":"${SITE}/our-work/${cat.slug}/"}]}
</script>`;

  built.push(
    buildPage({
      out: `our-work/${cat.slug}/index.html`,
      url: `/our-work/${cat.slug}/`,
      title: cat.title,
      description: cat.description,
      navKey: 'our-work',
      body,
      extraHead: breadcrumb,
      // Behaviour for the before/after slider and the lightbox. The project
      // markup itself is already in the HTML (rendered above), so this only
      // needs to attach interactivity — no data file ships to the browser.

    })
  );
}

/* 3. sitemap.xml — regenerated so it always matches the pages that exist. */
const today = new Date().toISOString().slice(0, 10);
const priority = (u) => (u === '/' ? '1.0' : u === '/get-a-quote/' || u === '/our-work/' ? '0.9' : '0.8');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${built
  .filter((u) => u !== '/thank-you/') // no-index page, kept out of the sitemap
  .sort()
  .map(
    (u) =>
      `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority(u)}</priority>\n  </url>`
  )
  .join('\n')}
</urlset>
`;
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

console.log(`Built ${built.length} pages + sitemap.xml`);
built.sort().forEach((u) => console.log(`  ${u}`));
