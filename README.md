# S&A Installs & Joinery — Website Guide

A complete editing guide for everyone involved in maintaining this site.
No coding experience required for most tasks — just follow the steps below.

---

## File Structure

```
index.html              ← The entire website (open this in a browser to preview)
assets/
  css/
    styles.css          ← All visual styles (colours, fonts, layout)
    animations.css      ← Motion and animation styles
  js/
    main.js             ← Navigation, cursor, form, scroll effects
    gallery.js          ← Gallery filter tabs and lightbox
  images/               ← All photos go here (see images/README.md for full list)
    README.md           ← Photo naming guide
README.md               ← This file
```

---

## How to Preview the Site

1. Double-click `index.html` to open it in a browser, OR
2. For live reloading while editing, use a local server (VS Code → Live Server extension → "Go Live").

---

## Changing Brand Colours

All colours are defined as variables at the top of `assets/css/styles.css`.
**Edit the `:root` block only** — changes apply to the entire site automatically.

```css
:root {
  --color-accent:  #ff6b2b;   /* ← Change this to update the orange throughout */
  --color-bg:      #0d0d0d;   /* ← Main background */
  /* etc. */
}
```

---

## Replacing Placeholder Photos

### 1. Add your photo
Copy the photo into `assets/images/gallery/` with the correct filename.
See `assets/images/README.md` for the full list of required files.

### 2. Replace the placeholder in index.html
Find the gallery item you want to update. Each one looks like this:

```html
<!-- BEFORE (placeholder): -->
<div class="gallery-item" data-category="kitchen" data-title="Kitchen Project 01" ...>
  <div class="gallery-placeholder gallery-placeholder--kitchen">
    <svg ...></svg>
    <span>Kitchen Project 01</span>
  </div>
  <div class="gallery-overlay">...</div>
</div>

<!-- AFTER (real photo): -->
<div class="gallery-item" data-category="kitchen" data-title="Kitchen Project 01" ...>
  <img src="assets/images/kitchen-01.jpg"
       alt="Custom kitchen — white cabinetry with stone benchtop"
       loading="lazy">
  <div class="gallery-overlay">...</div>
</div>
```

**Important:** Keep the `<div class="gallery-overlay">` block — it's the hover effect.

### 3. Add this CSS for real images (add to styles.css)

```css
.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

---

## Adding a New Gallery Item

Copy this HTML block and paste it inside the `<div class="gallery-grid">`:

```html
<div class="gallery-item" 
     data-category="kitchen"
     data-title="Kitchen Project 09"
     data-label="Kitchens"
     tabindex="0"
     role="button"
     aria-label="View Kitchen Project 09">
  <img src="assets/images/kitchen-09.jpg"
       alt="Describe the photo here"
       loading="lazy">
  <div class="gallery-overlay">
    <span class="gallery-overlay-cat">Kitchens</span>
    <span class="gallery-overlay-title">Kitchen Project 09</span>
  </div>
</div>
```

**data-category options:** `kitchen` / `wardrobe` / `bathroom` / `bedroom` / `commercial`

**To make an item taller** (spans 2 rows), add the class `gallery-item--tall`:
```html
<div class="gallery-item gallery-item--tall" ...>
```

---

## Adding a New Review

Copy this HTML block and paste it inside the `<div class="reviews-grid">`:

```html
<article class="review-card animate-element" aria-label="Review by Full Name">
  <div class="review-stars" aria-label="5 stars">★★★★★</div>
  <blockquote class="review-text">"Paste the review text here."</blockquote>
  <footer class="review-author">
    <div class="review-avatar" aria-hidden="true">AB</div>  <!-- Use initials -->
    <div>
      <cite class="review-name">Full Name</cite>
      <span class="review-source">Google Review</span>
    </div>
  </footer>
</article>
```

---

## Updating Contact Details

The phone number and email appear in **multiple places**. Update all of them:

### Phone number (0478 671 407)
Search `index.html` for `0478671407` and `0478 671 407` — update each instance:

| Section            | What to change                                      |
|--------------------|-----------------------------------------------------|
| Contact section    | `<a href="tel:0478671407">0478 671 407</a>`         |
| Footer             | `<a href="tel:0478671407">0478 671 407</a>`         |
| FAB (Call button)  | `<a href="tel:0478671407" class="fab fab-call">`    |
| WhatsApp FAB       | `<a href="https://wa.me/61478671407" ...>`          |

**WhatsApp format:** `61` + number without leading zero = `61478671407`

### Email address (info@sainstalls.com.au)
Search for `info@sainstalls.com.au` — update both the `href` and visible text:

| Section            | What to change                                                |
|--------------------|---------------------------------------------------------------|
| Contact section    | `<a href="mailto:info@sainstalls.com.au">info@sainstalls.com.au</a>` |
| Footer             | `<a href="mailto:info@sainstalls.com.au">info@sainstalls.com.au</a>` |

---

## Wiring Up the Contact Form

The form currently shows a success message without sending anything.
To actually receive enquiries, connect one of these services:

### Option A: Netlify Forms (if hosted on Netlify — free)
Add `data-netlify="true"` and `name="contact"` to the `<form>` tag:
```html
<form class="contact-form" id="contact-form" data-netlify="true" name="contact" novalidate>
```

### Option B: Formspree (works anywhere — free tier available)
1. Sign up at formspree.io
2. Create a form and get your endpoint URL
3. Change the form's action: `<form ... action="https://formspree.io/f/YOUR_ID" method="POST">`
4. Remove the JS `e.preventDefault()` from main.js (or replace with Formspree's AJAX approach)

### Option C: EmailJS (sends email without a backend)
Follow the EmailJS documentation at emailjs.com

---

## Changing the Google Review Link

Find `https://g.page/r/review` in index.html and replace with your actual Google Business review URL.
It appears in the reviews section CTA and the footer Google icon link.

---

## Updating Service Area / Hours

These appear in the **Contact section** and **Footer**. Search for:
- `Melbourne's Eastern &amp; South Eastern suburbs` — to change service area
- `Mon–Fri 9am–5pm` — to change hours

---

## Hosting Options

| Option      | Cost  | Notes                                              |
|-------------|-------|----------------------------------------------------|
| Netlify     | Free  | Drag-and-drop deploy. Best for static sites.       |
| Vercel      | Free  | Similarly easy. Good performance.                  |
| Cloudflare Pages | Free | Very fast global delivery.                    |
| cPanel / FTP | Varies | Upload files via FTP to your web host folder.  |

For Netlify: drag the entire project folder to app.netlify.com/drop

---

## Questions?

Any changes beyond what's covered here (new sections, integrations, SEO) — contact your web developer.
