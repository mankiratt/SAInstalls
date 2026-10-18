/**
 * LANDING PAGE IMAGES
 * ===================
 * Generates the responsive WebP derivatives used by the Google Ads landing
 * pages into /lp/img/.
 *
 *   cd lp/tools
 *   npm install
 *   node build-images.mjs
 *
 * WHAT THIS DOES AND DOES NOT TOUCH
 * It only ever writes into /lp/img/. The main site's images in
 * /assets/images/ are read, never modified.
 *
 * WHY ONLY THE HEROES ARE REGENERATED
 * The gallery photos in /assets/images/ already exist at 800px and 400px wide
 * and are 13–48KB each — comfortably inside the 80KB gallery budget. They are
 * already WebP, so re-encoding them here would throw away quality for no size
 * win. The landing pages point their gallery <img srcset> straight at those
 * files instead.
 *
 * The heroes DO need regenerating, because they are displayed much larger and
 * no 640/960/1440 variants exist.
 *
 * WHEN SIMON SENDS REAL PHOTOS
 * Drop the full-resolution originals somewhere, add an entry to SOURCES below
 * pointing `src` at the original, and re-run. Anything listed in SOURCES gets
 * the full 640/960/1440 treatment, so once the originals are big enough the
 * widths stop being capped (see NO UPSCALING).
 *
 * NO UPSCALING
 * A requested width larger than the source is skipped, not upscaled. Blowing
 * an 800px photo up to 1440px produces a soft image that weighs more and looks
 * worse, so the script refuses and tells you which widths it skipped.
 */

import sharp from 'sharp';
import { mkdirSync, statSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');          // repo root
const SRC_DIR = join(ROOT, 'assets', 'images');
const OUT_DIR = join(ROOT, 'lp', 'img');

/* The widths each hero is emitted at. `sizes` in the HTML must agree. */
const HERO_WIDTHS = [640, 960, 1440];

/* Budgets from the build brief, in KB. Exceeding one is a warning, not a
   failure — it is a prompt to lower the quality or crop tighter. */
const HERO_BUDGET_KB = 120;   // measured at the 960px variant

/* ------------------------------------------------------------------
   The heroes. One per landing page.

   `src`     file in /assets/images/ (or an absolute path to an original)
   `out`     basename written into /lp/img/
   `quality` WebP quality. These sources are already lossy WebP, so a high
             value keeps the second encode from compounding artefacts.
------------------------------------------------------------------ */
const SOURCES = [
  {
    page: 'kitchens',
    src: 'heroimage4-1600.webp',
    out: 'hero-kitchens',
    quality: 80,
  },
  // wardrobes and cabinet-maker heroes are added when those pages are built
];

/* ------------------------------------------------------------------ */

mkdirSync(OUT_DIR, { recursive: true });

const kb = (p) => statSync(p).size / 1024;
const pad = (s, n) => String(s).padEnd(n);

let warnings = 0;

for (const item of SOURCES) {
  const srcPath = item.src.includes(':') || item.src.startsWith('/')
    ? item.src
    : join(SRC_DIR, item.src);

  const meta = await sharp(srcPath).metadata();
  console.log(`\n${item.page}  ←  ${item.src}  (${meta.width}×${meta.height})`);

  // Clear stale variants for this basename so a shrinking source cannot leave
  // an orphaned oversized file behind that the HTML still references.
  for (const f of readdirSync(OUT_DIR)) {
    if (f.startsWith(item.out + '-') && f.endsWith('.webp')) {
      unlinkSync(join(OUT_DIR, f));
    }
  }

  const skipped = [];

  for (const w of HERO_WIDTHS) {
    if (w > meta.width) { skipped.push(w); continue; }

    const outPath = join(OUT_DIR, `${item.out}-${w}.webp`);
    const info = await sharp(srcPath)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: item.quality, effort: 6 })
      .toFile(outPath);

    const size = kb(outPath);
    const overBudget = w === 960 && size > HERO_BUDGET_KB;
    if (overBudget) warnings++;

    console.log(
      `  ${pad(`${w}w`, 6)} ${pad(`${info.width}×${info.height}`, 11)}` +
      `${pad(size.toFixed(1) + 'KB', 9)}${overBudget ? `  ⚠ over ${HERO_BUDGET_KB}KB budget` : ''}`
    );
  }

  if (skipped.length) {
    warnings++;
    console.log(
      `  skipped ${skipped.join(', ')}w — source is only ${meta.width}px wide. ` +
      `Not upscaling. Supply a larger original to fill these in.`
    );
  }
}

console.log(
  warnings
    ? `\nDone, with ${warnings} thing${warnings === 1 ? '' : 's'} to look at above.\n`
    : '\nDone. Every variant is inside budget.\n'
);
