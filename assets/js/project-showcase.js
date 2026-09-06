/* ============================================================
   S&A JOINERY — project-showcase.js
   ============================================================
   Behaviour for the Our Work gallery:

     A) Category filter chips (Our Work index only)
     B) The project viewer — a full-screen panel showing one
        project's photos, with Escape to close, a focus trap and
        the page scroll locked while it is open.

   The tiles and viewers are already in the HTML, written in at
   build time from assets/js/projects.js (see build.mjs). That
   keeps the photos readable by Google and means nothing moves
   around as the page loads. This file only adds the interaction.

   No libraries. Nothing runs unless the page has project tiles.
============================================================ */

(function initProjectShowcase() {
  const tiles = Array.from(document.querySelectorAll('[data-project-tile]'));
  if (!tiles.length) return; // not a gallery page

  /* ----------------------------------------------------------
     A) CATEGORY FILTER
     Tiles are hidden rather than removed, so switching back is
     instant and the viewers stay wired up.
  ---------------------------------------------------------- */
  const chips = Array.from(document.querySelectorAll('[data-filter]'));
  const empty = document.querySelector('[data-empty]');

  if (chips.length) {
    const apply = (slug) => {
      let shown = 0;
      tiles.forEach((tile) => {
        const match = slug === 'all' || tile.dataset.category === slug;
        tile.hidden = !match;
        if (match) shown++;
      });
      chips.forEach((chip) => {
        const active = chip.dataset.filter === slug;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (empty) empty.hidden = shown > 0;
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => apply(chip.dataset.filter || 'all'));
    });

    /* /our-work/#kitchens opens straight into a filtered view, which is
       handy for ad landing pages and links from elsewhere on the site. */
    const fromHash = window.location.hash.replace('#', '');
    if (fromHash && chips.some((c) => c.dataset.filter === fromHash)) {
      apply(fromHash);
    }
  }

  /* ----------------------------------------------------------
     B) PROJECT VIEWER
  ---------------------------------------------------------- */
  const modals = Array.from(document.querySelectorAll('[data-project-modal]'));
  if (!modals.length) return;

  const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let active = null;
  let lastFocused = null;
  let prevOverflow = '';

  function onKeydown(e) {
    if (!active) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;

    const dialog = active.querySelector('[data-pm-dialog]');
    if (!dialog) return;
    const items = Array.from(dialog.querySelectorAll(FOCUSABLE))
      .filter((el) => el.offsetParent !== null);
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function open(id, opener) {
    const modal = modals.find((m) => m.dataset.projectModal === id);
    if (!modal) return;

    /* Remember what to focus on the way out. We prefer the element that was
       actually clicked: Safari does not focus a button when you click it, so
       document.activeElement would be the page body there. */
    lastFocused = opener || document.activeElement;
    active = modal;
    modal.hidden = false;

    // Lock scrolling, remembering whatever was set before.
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown);

    // Always start at the top, even if it was scrolled last time.
    const scroller = modal.querySelector('[data-pm-scroll]');
    if (scroller) scroller.scrollTop = 0;

    const closeBtn = modal.querySelector('.pm-close');
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    if (!active) return;
    active.hidden = true;
    active = null;
    document.body.style.overflow = prevOverflow; // restore, don't assume ''
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    lastFocused = null;
  }

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open-project]');
    if (opener && opener.dataset.openProject) {
      e.preventDefault();
      open(opener.dataset.openProject, opener);
      return;
    }
    if (e.target.closest('[data-pm-close]')) {
      e.preventDefault();
      close();
    }
  });
})();
