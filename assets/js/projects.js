/* ============================================================
   S&A JOINERY — PROJECTS  (single source of truth)
   ============================================================

   This is the ONLY file you edit to add, remove or rename a
   project. Every "Our Work" category page is built from this list.

   ------------------------------------------------------------
   TO ADD A PROJECT
   ------------------------------------------------------------
   1. Drop the photos into /assets/images/ using clear names, e.g.
        kitchen13.webp            ← the finished photo ("after")
        kitchen13-before.webp     ← the "before" photo (optional)
        kitchen13-b.webp          ← any extra photos (optional)
   2. Copy one of the blocks below, paste it into the right
      category, and update the fields.
   3. Run `node build.mjs` and reload the page.

      ^ Don't skip step 3. The project list is written into the
        pages when you build, which is what keeps them fast and
        readable by Google. Editing this file alone changes nothing
        on the site until you build.

   ------------------------------------------------------------
   THE FIELDS
   ------------------------------------------------------------
   id           Unique short name. Used internally only.
   title        Shown above the project. Keep the "What — Suburb"
                shape; it reads well and helps local search.
   category     Must be one of:
                  kitchens | wardrobes | bathrooms |
                  bedrooms | living-spaces | commercial
   beforeImage  The "before" photo. Set to null if you don't have
                one — the project then shows the photo gallery on
                its own, with no before/after slider. Add the photo
                later and the slider appears automatically.
   afterImage   The finished photo. REQUIRED.
   gallery      EXTRA photos, beyond afterImage. Can be [].
                The lightbox shows afterImage first, then these.
   alt          Plain description of the finished photo, for screen
                readers and search engines. REQUIRED.
   description  Optional one-liner shown under the title.

   ------------------------------------------------------------
   THE BEFORE/AFTER SLIDERS ARE CURRENTLY OFF
   ------------------------------------------------------------
   See SA_FEATURES below. Every project shows its finished photo
   only. When you have real "before" photos, fill in `beforeImage`
   and flip the switch — nothing else needs to change.
============================================================ */

/* ============================================================
   FEATURE SWITCHES
============================================================ */
window.SA_FEATURES = {
  /* Before/after comparison sliders.
     OFF because we do not have real "before" photos yet. To turn
     them back on:
       1. add the before photos to /assets/images/
       2. set `beforeImage` on the projects that have one
       3. change this to true
       4. run `node build.mjs`
     Projects without a `beforeImage` keep showing just their
     finished photo, so it is safe to switch on part-way through. */
  beforeAfter: false,
};

window.SA_PROJECTS = [

  /* ---------- KITCHENS ---------- */
  {
    id: 'kitchen-1',
    title: 'Stone Benchtop Kitchen — Melbourne',
    category: 'kitchens',
    beforeImage: null,
    afterImage: '/assets/images/kitchen1.webp',
    gallery: [],
    alt: 'Custom kitchen renovation Melbourne with stone benchtop',
    description: 'Full kitchen rebuild with a stone benchtop and integrated appliances.',
  },
  {
    id: 'kitchen-2',
    title: 'Modern White Kitchen — Berwick',
    category: 'kitchens',
    beforeImage: null,
    afterImage: '/assets/images/kitchen2.webp',
    gallery: [],
    alt: 'Modern white custom kitchen cabinetry Berwick',
    description: '',
  },
  {
    id: 'kitchen-3',
    title: 'Timber Kitchen Joinery — Clyde North',
    category: 'kitchens',
    beforeImage: null,
    afterImage: '/assets/images/kitchen3.webp',
    gallery: [],
    alt: 'Handcrafted timber kitchen joinery Clyde North',
    description: '',
  },
  {
    id: 'kitchen-4',
    title: 'Contemporary Kitchen — Hallam',
    category: 'kitchens',
    beforeImage: null,
    afterImage: '/assets/images/kitchen4.webp',
    gallery: [],
    alt: 'Contemporary custom kitchen design Hallam',
    description: '',
  },
  {
    id: 'kitchen-5',
    title: 'Shaker-Style Kitchen — Cranbourne',
    category: 'kitchens',
    beforeImage: null,
    afterImage: '/assets/images/kitchen5.webp',
    gallery: [],
    alt: 'Shaker-style custom kitchen Cranbourne',
    description: '',
  },
  {
    id: 'kitchen-6',
    title: 'Two-Tone Cabinetry — Narre Warren',
    category: 'kitchens',
    beforeImage: null,
    afterImage: '/assets/images/kitchen6.webp',
    gallery: [],
    alt: 'Two-tone custom kitchen cabinetry Narre Warren',
    description: '',
  },
  {
    id: 'kitchen-7',
    title: 'Handleless Kitchen — South East Melbourne',
    category: 'kitchens',
    beforeImage: null,
    afterImage: '/assets/images/kitchen7.webp',
    gallery: [],
    alt: 'Dark handleless kitchen renovation south east Melbourne',
    description: '',
  },
  {
    id: 'kitchen-8',
    title: 'Open-Plan Kitchen — Berwick',
    category: 'kitchens',
    beforeImage: null,
    afterImage: '/assets/images/kitchen8.webp',
    gallery: [],
    alt: 'Open-plan custom kitchen joinery Berwick',
    description: '',
  },
  {
    id: 'kitchen-9',
    title: 'Island Kitchen — Cranbourne',
    category: 'kitchens',
    beforeImage: null,
    afterImage: '/assets/images/kitchen9.webp',
    gallery: [],
    alt: 'Custom island kitchen with stone top Cranbourne',
    description: '',
  },
  {
    id: 'kitchen-10',
    title: 'Scullery & Kitchen — South East Melbourne',
    category: 'kitchens',
    beforeImage: null,
    afterImage: '/assets/images/kitchen10.webp',
    gallery: [],
    alt: 'Scullery kitchen renovation Melbourne south east',
    description: '',
  },
  {
    id: 'kitchen-11',
    title: 'Overhead Cabinetry Kitchen — Hallam',
    category: 'kitchens',
    beforeImage: null,
    afterImage: '/assets/images/kitchen11.webp',
    gallery: [],
    alt: 'Custom overhead cabinetry kitchen Hallam',
    description: '',
  },
  {
    id: 'kitchen-12',
    title: 'Timber Veneer Kitchen — Clyde North',
    category: 'kitchens',
    beforeImage: null,
    afterImage: '/assets/images/kitchen12.webp',
    gallery: [],
    alt: 'Timber veneer custom kitchen Clyde North',
    description: '',
  },

  /* ---------- WARDROBES ---------- */
  {
    id: 'wardrobe-1',
    title: 'Built-In Wardrobe — Melbourne',
    category: 'wardrobes',
    beforeImage: null,
    afterImage: '/assets/images/wadrobe1.webp',
    gallery: [],
    alt: 'Custom built-in wardrobe Melbourne bedroom storage',
    description: 'Floor-to-ceiling storage built into an existing bedroom recess.',
  },
  {
    id: 'wardrobe-2',
    title: 'Walk-In Wardrobe — Berwick',
    category: 'wardrobes',
    beforeImage: null,
    afterImage: '/assets/images/wadrobe2.webp',
    gallery: [],
    alt: 'Walk-in wardrobe joinery Berwick',
    description: '',
  },
  {
    id: 'wardrobe-3',
    title: 'Floor-to-Ceiling Wardrobe — Narre Warren',
    category: 'wardrobes',
    beforeImage: null,
    afterImage: '/assets/images/wadrobe3.webp',
    gallery: [],
    alt: 'Floor-to-ceiling built-in wardrobe Narre Warren',
    description: '',
  },
  {
    id: 'wardrobe-5',
    title: 'Sliding Mirrored Wardrobe — Cranbourne',
    category: 'wardrobes',
    beforeImage: null,
    afterImage: '/assets/images/wadrobe5.webp',
    gallery: [],
    alt: 'Custom sliding wardrobe with mirror Cranbourne',
    description: '',
  },
  {
    id: 'wardrobe-6',
    title: 'Timber Wardrobe System — Clyde North',
    category: 'wardrobes',
    beforeImage: null,
    afterImage: '/assets/images/wadrobe6.webp',
    gallery: [],
    alt: 'Timber built-in wardrobe system Clyde North',
    description: '',
  },
  {
    id: 'wardrobe-7',
    title: 'Wardrobe with Integrated Drawers — Hallam',
    category: 'wardrobes',
    beforeImage: null,
    afterImage: '/assets/images/wadrobe7.webp',
    gallery: [],
    alt: 'Custom wardrobe with integrated drawers Hallam',
    description: '',
  },

  /* ---------- BATHROOMS ---------- */
  {
    id: 'bathroom-1',
    title: 'Custom Vanity — Melbourne',
    category: 'bathrooms',
    beforeImage: null,
    afterImage: '/assets/images/bathroom1.webp',
    gallery: [],
    alt: 'Custom bathroom vanity Melbourne',
    description: '',
  },
  {
    id: 'bathroom-2',
    title: 'Floating Timber Vanity — Clyde North',
    category: 'bathrooms',
    beforeImage: null,
    afterImage: '/assets/images/bathroom2.webp',
    gallery: [],
    alt: 'Floating timber vanity Clyde North',
    description: '',
  },
  {
    id: 'bathroom-3',
    title: 'Dual Sink Vanity — Berwick',
    category: 'bathrooms',
    beforeImage: null,
    afterImage: '/assets/images/bathroom3.webp',
    gallery: [],
    alt: 'Custom dual sink bathroom vanity Berwick',
    description: '',
  },
  {
    id: 'bathroom-4',
    title: 'Shaker-Style Vanity — Cranbourne',
    category: 'bathrooms',
    beforeImage: null,
    afterImage: '/assets/images/bathroom4.webp',
    gallery: [],
    alt: 'Shaker-style bathroom vanity Cranbourne',
    description: '',
  },
  {
    id: 'bathroom-5',
    title: 'Built-In Bathroom Storage — Narre Warren',
    category: 'bathrooms',
    beforeImage: null,
    afterImage: '/assets/images/bathroom5.webp',
    gallery: [],
    alt: 'Built-in bathroom storage and vanity Narre Warren',
    description: '',
  },
  {
    id: 'bathroom-6',
    title: 'Wall-Hung Vanity — South East Melbourne',
    category: 'bathrooms',
    beforeImage: null,
    afterImage: '/assets/images/bathroom6.webp',
    gallery: [],
    alt: 'Custom wall-hung vanity south east Melbourne',
    description: '',
  },

  /* ---------- BEDROOMS ---------- */
  {
    id: 'bedroom-1',
    title: 'Bedroom Joinery & Storage — Melbourne',
    category: 'bedrooms',
    beforeImage: null,
    afterImage: '/assets/images/bedroom1.webp',
    gallery: [],
    alt: 'Custom bedroom joinery and storage Melbourne',
    description: '',
  },
  {
    id: 'bedroom-2',
    title: 'Built-In Bedhead & Bedsides — Berwick',
    category: 'bedrooms',
    beforeImage: null,
    afterImage: '/assets/images/bedroom2.webp',
    gallery: [],
    alt: 'Built-in bedhead and side tables Berwick',
    description: '',
  },
  {
    id: 'bedroom-3',
    title: 'Bedroom Cabinetry & Shelving — Clyde North',
    category: 'bedrooms',
    beforeImage: null,
    afterImage: '/assets/images/bedroom3.webp',
    gallery: [],
    alt: 'Custom bedroom cabinetry and shelving Clyde North',
    description: '',
  },
  {
    id: 'bedroom-4',
    title: 'Bespoke Bedroom Joinery — Cranbourne',
    category: 'bedrooms',
    beforeImage: null,
    afterImage: '/assets/images/bedroom4.webp',
    gallery: [],
    alt: 'Bespoke bedroom joinery Cranbourne',
    description: '',
  },
  {
    id: 'bedroom-5',
    title: 'Floating Bedside & Dresser — Narre Warren',
    category: 'bedrooms',
    beforeImage: null,
    afterImage: '/assets/images/bedroom5.webp',
    gallery: [],
    alt: 'Custom floating bedside and dresser Narre Warren',
    description: '',
  },
  {
    id: 'bedroom-6',
    title: 'Timber Bedroom Suite — Hallam',
    category: 'bedrooms',
    beforeImage: null,
    afterImage: '/assets/images/bedroom6.webp',
    gallery: [],
    alt: 'Timber bedroom joinery suite Hallam',
    description: '',
  },

  /* ---------- LIVING SPACES ---------- */
  {
    id: 'living-1',
    title: 'Entertainment Unit — Melbourne',
    category: 'living-spaces',
    beforeImage: null,
    afterImage: '/assets/images/living1.webp',
    gallery: [],
    alt: 'Custom entertainment unit joinery Melbourne',
    description: '',
  },
  {
    id: 'living-2',
    title: 'Built-In Shelving — Hallam',
    category: 'living-spaces',
    beforeImage: null,
    afterImage: '/assets/images/living2.webp',
    gallery: [],
    alt: 'Built-in shelving living room Hallam',
    description: '',
  },
  {
    id: 'living-3',
    title: 'Floor-to-Ceiling Bookcase — South East Melbourne',
    category: 'living-spaces',
    beforeImage: null,
    afterImage: '/assets/images/living3.webp',
    gallery: [],
    alt: 'Floor-to-ceiling custom bookcase Melbourne south east',
    description: '',
  },
  {
    id: 'living-4',
    title: 'Media Wall Joinery — Berwick',
    category: 'living-spaces',
    beforeImage: null,
    afterImage: '/assets/images/living4.webp',
    gallery: [],
    alt: 'Custom media wall joinery Berwick',
    description: '',
  },
  {
    id: 'living-5',
    title: 'Built-In Study Nook — Cranbourne',
    category: 'living-spaces',
    beforeImage: null,
    afterImage: '/assets/images/living5.webp',
    gallery: [],
    alt: 'Built-in study nook joinery Cranbourne',
    description: '',
  },
  {
    id: 'living-6',
    title: 'Display Shelving — Narre Warren',
    category: 'living-spaces',
    beforeImage: null,
    afterImage: '/assets/images/living6.webp',
    gallery: [],
    alt: 'Custom display shelving and joinery Narre Warren',
    description: '',
  },

  /* ---------- COMMERCIAL ---------- */
  {
    id: 'commercial-1',
    title: 'Commercial Fitout — Melbourne CBD',
    category: 'commercial',
    beforeImage: null,
    afterImage: '/assets/images/commercial1.webp',
    gallery: [],
    alt: 'Commercial joinery fitout Melbourne CBD',
    description: '',
  },
  {
    id: 'commercial-2',
    title: 'Retail Shopfitting — South East Melbourne',
    category: 'commercial',
    beforeImage: null,
    afterImage: '/assets/images/commercial2.webp',
    gallery: [],
    alt: 'Retail shopfitting Melbourne south east',
    description: '',
  },
  {
    id: 'commercial-3',
    title: 'Commercial Cabinetry — Melbourne',
    category: 'commercial',
    beforeImage: null,
    afterImage: '/assets/images/commercial3.webp',
    gallery: [],
    alt: 'Custom commercial cabinetry Melbourne',
    description: '',
  },
  {
    id: 'commercial-5',
    title: 'Office Joinery & Fitout — Melbourne',
    category: 'commercial',
    beforeImage: null,
    afterImage: '/assets/images/commercial5.webp',
    gallery: [],
    alt: 'Office joinery and fitout Melbourne',
    description: '',
  },
];
