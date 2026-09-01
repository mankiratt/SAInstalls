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

/** All photos for a project, in the order the lightbox shows them. */
const photosOf = (p) => [p.afterImage, ...(p.gallery || [])].filter(Boolean);

function renderProjects(categoryKey) {
  const list = ALL_PROJECTS.filter((p) => p.category === categoryKey);
  if (!list.length) return '';

  return list
    .map((p) => {
      const photos = photosOf(p);
      const hasBefore = Boolean(p.beforeImage);

      const slider = hasBefore
        ? `
          <div class="ba">
            <div class="ba-frame" data-ba-frame>
              <img class="ba-img" src="${esc(p.afterImage)}" alt="${esc(p.alt)}"
                   width="800" height="535" loading="lazy" decoding="async" draggable="false">
              <div class="ba-clip">
                <img class="ba-img" src="${esc(p.beforeImage)}" alt="${esc(p.alt)} — before the renovation"
                     width="800" height="535" loading="lazy" decoding="async" draggable="false">
              </div>
              <span class="ba-label ba-label--before" aria-hidden="true">Before</span>
              <span class="ba-label ba-label--after" aria-hidden="true">After</span>
              <div class="ba-handle" data-ba-handle role="slider" tabindex="0"
                   aria-label="Before and after comparison for ${esc(p.title)}"
                   aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"
                   aria-valuetext="50% before, 50% after">
                <span class="ba-handle-grip" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="10 8 6 12 10 16"/><polyline points="14 8 18 12 14 16"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>`
        : '';

      /* When the slider is shown the finished photo is already on screen,
         so the thumbnails start from the extra photos instead of repeating it. */
      const thumbs = photos
        .map((src, i) => ({ src, i }))
        .slice(hasBefore ? 1 : 0)
        .map(
          ({ src, i }) => `
            <button type="button" class="project-thumb" data-photo="${i}"
                    aria-label="View photo ${i + 1} of ${photos.length} — ${esc(p.title)}">
              <img src="${esc(src)}" alt="${esc(p.alt)}" width="800" height="535" loading="lazy" decoding="async">
            </button>`
        )
        .join('');

      const gallery = thumbs ? `\n          <div class="project-gallery">${thumbs}\n          </div>` : '';

      return `        <article class="project animate-element" id="${esc(p.id)}"
                 data-title="${esc(p.title)}" data-alt="${esc(p.alt)}"
                 data-photos="${esc(JSON.stringify(photos))}">
          <div class="project-head">
            <h2 class="project-title">${esc(p.title)}</h2>
            ${p.description ? `<p class="project-desc">${esc(p.description)}</p>` : ''}
          </div>${slider}${gallery}
        </article>`;
    })
    .join('\n\n');
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
      extraScripts: '  <script src="/assets/js/project-showcase.js" defer></script>',
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
