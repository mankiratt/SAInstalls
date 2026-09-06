# S&A Installs & Joinery — Website Guide

A complete editing guide for everyone involved in maintaining this site.
No coding experience required for most tasks — just follow the steps below.

The site is plain HTML, CSS and JavaScript. There is no framework and no
dependencies to install. The only tool it uses is one small script,
`build.mjs`, which stitches the shared header and footer into every page
so you only have to edit them once.

---

## Contents

- [Previewing the site](#previewing-the-site)
- [The build step — read this first](#the-build-step--read-this-first)
- [File structure](#file-structure)
- [**Adding or editing a project**](#adding-or-editing-a-project) ← the common task
- [How the gallery works](#how-the-gallery-works)
- [Editing the menu, footer or contact details](#editing-the-menu-footer-or-contact-details)
- [Adding a review](#adding-a-review)
- [Changing brand colours](#changing-brand-colours)
- [The enquiry form](#the-enquiry-form)
- [**Google Ads conversion tracking — action needed**](#google-ads-conversion-tracking--action-needed)
- [Deploying](#deploying)
- [What changed in the multi-page refactor](#what-changed-in-the-multi-page-refactor)

---

## Previewing the site

The site now has real pages in folders, so you can't just double-click
`index.html` any more — links like `/about/` need a proper web server.

You need [Node.js](https://nodejs.org) installed. Then, in this folder:

```bash
node build.mjs
```

```bash
npx serve .
```

Then open the address it prints (usually <http://localhost:3000>).

Any static server works. If you have Python instead of Node's `serve`:

```bash
python -m http.server 3000
```

---

## The build step — read this first

**After editing anything in `src/` or `assets/js/projects.js`, run:**

```bash
node build.mjs
```

That command regenerates the finished pages and `sitemap.xml`.

| You edit… | Do you need to run the build? |
|---|---|
| `src/partials/header.html` or `footer.html` | **Yes** |
| `src/pages/*.html` (page content) | **Yes** |
| `assets/js/projects.js` (the project list) | **Yes** |
| `assets/css/*.css` | No |
| `assets/js/main.js`, `project-showcase.js` | No |
| Photos in `assets/images/` | No (unless you also edited `projects.js`) |

**Never edit the generated pages directly** — `index.html`, `about/index.html`,
`our-work/kitchens/index.html` and so on. They are overwritten every build.
Edit the matching file in `src/` instead.

---

## File structure

```
build.mjs                  ← run this after editing src/ or projects.js
src/
  partials/
    header.html            ← the menu. EDIT ONCE, applies to every page
    footer.html            ← the footer. EDIT ONCE, applies to every page
    shell.html             ← the page wrapper (meta tags, fonts, scripts)
    tail.html              ← the floating Call button
    schema-*.html          ← Google structured data
  pages/                   ← the unique content of each page
    index.html             → /
    our-work.html          → /our-work/
    about.html             → /about/
    reviews.html           → /reviews/
    get-a-quote.html       → /get-a-quote/
    thank-you.html         → /thank-you/
  templates/
    category.html          ← the layout shared by all six category pages
assets/
  css/styles.css           ← all visual styles (colours, fonts, layout)
  css/animations.css       ← motion
  js/projects.js           ← THE PROJECT LIST — edit this to change Our Work
  js/main.js               ← nav, form, hero animation
  js/project-showcase.js   ← before/after slider + photo lightbox
  images/                  ← all photos (.webp)

  ↓ everything below is GENERATED — do not edit ↓
index.html, about/, reviews/, get-a-quote/, thank-you/,
our-work/ (+ kitchens/, wardrobes/, bathrooms/, bedrooms/,
           living-spaces/, commercial/), sitemap.xml
```

### The pages

| Page | URL |
|---|---|
| Home | `/` |
| Our Work (all projects, filterable) | `/our-work/` |
| Kitchens | `/our-work/kitchens/` |
| Wardrobes | `/our-work/wardrobes/` |
| Bathrooms | `/our-work/bathrooms/` |
| Bedrooms | `/our-work/bedrooms/` |
| Living Spaces | `/our-work/living-spaces/` |
| Commercial | `/our-work/commercial/` |
| About | `/about/` |
| Reviews | `/reviews/` |
| Get a Quote | `/get-a-quote/` |
| Thank You (after the form is sent) | `/thank-you/` |

---

## Adding or editing a project

Everything on the Our Work pages comes from **one file**:
`assets/js/projects.js`. You never edit the category pages themselves.

**1. Add your photos** to `assets/images/`, named clearly:

```
kitchen13.webp          ← the finished photo  ("after")
kitchen13-before.webp   ← the "before" photo  (optional)
kitchen13-b.webp        ← any extra photos    (optional)
```

**2. Copy an existing block** in `projects.js` into the right category and
edit it:

```js
{
  id: 'kitchen-13',
  title: 'Galley Kitchen — Pakenham',
  category: 'kitchens',
  beforeImage: '/assets/images/kitchen13-before.webp',  // or null
  afterImage: '/assets/images/kitchen13.webp',
  gallery: ['/assets/images/kitchen13-b.webp'],         // extra photos, or []
  alt: 'Custom galley kitchen renovation Pakenham',
  description: 'Optional one-line description.',
},
```

**3. Run the build and reload:**

```bash
node build.mjs
```

### The fields

| Field | What it does |
|---|---|
| `id` | Unique short name, used internally. |
| `title` | Shown above the project. Keep the "What — Suburb" shape; it reads well and helps local search. |
| `category` | One of: `kitchens`, `wardrobes`, `bathrooms`, `bedrooms`, `living-spaces`, `commercial`. |
| `beforeImage` | The "before" photo, or `null` if you don't have one. |
| `afterImage` | The finished photo. **Required.** |
| `gallery` | *Extra* photos beyond `afterImage`. Can be `[]`. |
| `alt` | Plain description of the photo, for screen readers and Google. **Required.** |
| `description` | Optional one-liner under the title. |

> **Photo sizes.** Photos are displayed in a 3:2 box and cropped to fill it,
> so landscape shots work best. Keep them as `.webp` and around 800px wide —
> that's what the existing ones are, and it's why the site loads fast.

---

## How the gallery works

There are two ways into the work:

- **`/our-work/`** shows every project in one grid, with filter chips along
  the top (All work, Kitchens, Wardrobes, …) that show a running count.
  Filtering happens instantly in the browser — nothing reloads.
- **The six category pages** (`/our-work/kitchens/` and friends) show just
  that category. These have their own headings and SEO copy, which makes
  them good Google Ads landing pages.

Clicking any project opens a **project viewer**: a full-screen panel with
the finished photo, the description and any extra photos, plus a "Get a
Quote" button at the bottom. Escape closes it, so does the backdrop or the
X, and the page behind it does not scroll while it is open.

### Deep links

`/our-work/#kitchens` opens the gallery already filtered to kitchens. Handy
for ad landing pages, or links from elsewhere on the site.

### The before/after sliders are currently switched OFF

The gallery can show a draggable before/after comparison on each project.
It is turned off because we have no real "before" photos yet, so every
project shows just its finished photo.

To turn it back on, in `assets/js/projects.js`:

1. Add the before photos to `/assets/images/`.
2. Fill in `beforeImage` on the projects that have one.
3. Set `beforeAfter: true` in the `SA_FEATURES` block at the top.
4. Run `node build.mjs`.

Projects without a `beforeImage` carry on showing just the finished photo,
so it is safe to switch on before every project has one.

> For the comparison to look right, the before and after need to be shot
> from roughly the same spot.

## Editing the menu, footer or contact details

The menu and footer are shared across every page. Edit them **once**:

- Menu → `src/partials/header.html`
- Footer → `src/partials/footer.html`

Then run `node build.mjs`.

### Phone number and email

The phone number `0478 671 407` appears in:

| Where | File |
|---|---|
| Footer | `src/partials/footer.html` |
| Floating "Call Now" button | `src/partials/tail.html` |
| Contact section + closing CTAs | `src/pages/get-a-quote.html`, and the `CTA` blocks in the other `src/pages/*.html` |
| Structured data (for Google) | `src/partials/schema-business.html` |

Search the `src/` folder for `0478671407` and `0478 671 407` to catch them all,
then run the build.

Email `info@sajoinery.com.au` lives in `src/partials/footer.html`,
`src/pages/get-a-quote.html` and `src/partials/schema-business.html`.

---

## Adding a review

Reviews appear on the home page and on `/reviews/`. Both come from
`src/pages/index.html` and `src/pages/reviews.html`. Paste this inside
`<div class="reviews-grid">` in whichever you're updating:

```html
<article class="review-card animate-element" aria-label="Review by Full Name">
  <div class="review-stars" aria-label="5 stars">★★★★★</div>
  <blockquote class="review-text">"Paste the review text here."</blockquote>
  <footer class="review-author">
    <div class="review-avatar" aria-hidden="true">AB</div>  <!-- initials -->
    <div>
      <cite class="review-name">Full Name</cite>
      <span class="review-source">Google Review</span>
    </div>
  </footer>
</article>
```

If you change the number of reviews, also update the `reviewCount` in
`src/partials/schema-business.html` and `src/partials/schema-reviews.html`
so Google is told the truth. Then run the build.

---

## Changing brand colours

All colours are defined at the top of `assets/css/styles.css`.
**Edit the `:root` block only** — changes apply to the whole site.

```css
:root {
  --color-accent:  #E8500A;   /* the orange */
  --color-bg:      #0d0d0d;   /* main background */
  /* etc. */
}
```

No rebuild needed for CSS changes — just reload.

> **Careful with the orange.** Buttons use dark text on the orange because
> white text on it fails accessibility contrast. If you make the orange
> much darker, re-check the buttons.

---

## The enquiry form

The form on `/get-a-quote/` sends to **Formspree**
(`https://formspree.io/f/mwvzwapj`). On success it now redirects the
visitor to `/thank-you/`.

Nothing about how the form sends has changed — same endpoint, same fields
(`first_name`, `last_name`, `phone`, `email`, `service`, `suburb`,
`message`). Only the "what happens next" changed, so there's a real page
load for conversion tracking.

The redirect lives in `assets/js/main.js`, in the contact-form section.

---

## Google Ads conversion tracking — action needed

> **⚠️ One decision is waiting for you. Nothing is broken right now.**

**How it works today (unchanged and working):** when the form submits
successfully, `assets/js/main.js` fires the "Submit lead form" conversion
directly, then redirects to `/thank-you/`. Click-to-call conversions fire
from the phone links. Both are live and tested.

**What's new:** `/thank-you/` is a real page now, so you *can* move the
conversion to fire on that page's load instead — which is the setup Google
Ads describes in its own instructions. There's a clearly marked slot for it
in `src/pages/thank-you.html`:

```html
<!-- GOOGLE ADS CONVERSION SNIPPET GOES HERE — fires on this page's load -->
```

**I deliberately did NOT remove the existing tracking.** If I had removed it
and the new snippet wasn't pasted in yet, you'd have stopped counting leads
without noticing.

### If you want to switch to page-load tracking

Do both of these **at the same time**:

1. Paste the "Submit lead form" event snippet into the slot in
   `src/pages/thank-you.html`, then run `node build.mjs`.
2. Delete the conversion block in `assets/js/main.js` — search for
   `Google Ads conversion tracking`. Keep the redirect itself.

If you do step 1 without step 2, **every lead is counted twice.**

Either setup works. The current one is already verified, so switching is
optional.

---

## Deploying

**Do not deploy this branch until you've reviewed it.** To review:

```bash
node build.mjs
```

then serve the folder and click through every page.

Once you're happy, deploy the whole folder as a static site. The generated
HTML *is* the site — there is no separate build output folder.

| Host | Cost | Notes |
|---|---|---|
| Netlify | Free | Drag-and-drop the folder to app.netlify.com/drop |
| Vercel | Free | Also fine. Connect the repo or drag the folder. |
| Cloudflare Pages | Free | Very fast globally. |
| cPanel / FTP | Varies | Upload the folder contents to your web root. |

**Important:** make sure the host serves `/about/` from `about/index.html`.
Netlify, Vercel and Cloudflare Pages all do this automatically.

**Also make sure text compression (gzip or Brotli) is switched on** — the
speed scores below depend on it. The three hosts above do it automatically.

---

## What changed in the multi-page refactor

### Kept exactly as it was

Colours, fonts, spacing, dark theme, every component's styling; the hero
rotating-word animation, hero photo slideshow and scroll animations; the
custom cursor, sticky nav, mobile menu, floating Call button and
back-to-top; all copy and business facts (30+ years, 500+ projects, 5.0
Google rating, Hallam address, phone, service list, testimonials, socials);
the Formspree endpoint and field names; the Google Ads tag and both
conversions; WebP photos, lazy loading and image dimensions.

### What's new

- An Our Work gallery with filter chips and a full-screen project viewer,
  plus six category pages for the ad landing pages.
- A before/after comparison slider, built and ready but switched off
  until there are real before photos (see above).
- One project list (`assets/js/projects.js`) driving all of it.
- A shared header and footer, edited in one place.
- A real `/thank-you/` page.
- Per-page titles, descriptions, canonicals and breadcrumbs; a regenerated
  `sitemap.xml`.

### Speed and accessibility after the change

Measured with Lighthouse, mobile, with compression on:

| Page | Performance | Accessibility | SEO |
|---|---|---|---|
| Home | 99 | 100 | 100 |
| Our Work | 100 | 100 | 100 |
| Kitchens (category) | 100 | 100 | 100 |
| About | 100 | 100 | 100 |
| Reviews | 100 | 100 | 100 |
| Get a Quote | 100 | 100 | 100 |
| Thank You | 98 | 100 | n/a — deliberately hidden from Google |

Two notes:

- **Best Practices scores 79 on every page.** This is the Google Ads tag
  setting third-party cookies, not the refactor — the current live site
  scores 79 too. It's unavoidable while Ads conversion tracking is on.
- **The `/thank-you/` page has a `noindex` tag** so it never shows up in
  search results, which is what you want. Lighthouse's SEO score flags that
  as a problem; here it's intentional.

### One known rough edge

On `/thank-you/` the layout-shift score is 0.09. Everywhere else it's
effectively zero. The cause is the web font swapping in and reflowing the
heading, which is more noticeable on a short page. It's still inside
Google's "good" range (under 0.10). Self-hosting the fonts would remove it
entirely — worth doing one day, not urgent.
