/* ============================================================
   S&A JOINERY — project-showcase.js
   ============================================================
   Adds behaviour to the project markup that is already in the page.

     A) Before/After slider — draggable divider, works with mouse,
        touch and keyboard.
     B) Project lightbox    — arrows, swipe, keyboard, ESC, focus
        trap and body-scroll lock.

   The projects themselves are written into the HTML at build time
   from assets/js/projects.js (see build.mjs), so the page renders
   fully without JavaScript and nothing shifts as it loads. This
   file only makes it interactive.

   No libraries. Nothing runs unless the page contains projects.
============================================================ */

(function initProjectShowcase() {
  const mount = document.querySelector('[data-projects]');
  if (!mount) return; // not a category page — do nothing

  /* ----------------------------------------------------------
     A) BEFORE / AFTER SLIDER
     Left of the divider is the BEFORE photo, right is the AFTER —
     the arrangement people expect. Dragging left reveals more of
     the finished result.
  ---------------------------------------------------------- */
  mount.querySelectorAll('[data-ba-frame]').forEach((frame) => {
    const handle = frame.querySelector('[data-ba-handle]');
    if (!handle) return;
    let pos = 50;

    function setPos(next) {
      pos = Math.max(0, Math.min(100, next));
      const rounded = Math.round(pos);
      frame.style.setProperty('--ba-pos', pos + '%');
      handle.setAttribute('aria-valuenow', String(rounded));
      handle.setAttribute('aria-valuetext', `${rounded}% before, ${100 - rounded}% after`);
    }

    function posFromEvent(e) {
      const rect = frame.getBoundingClientRect();
      if (!rect.width) return pos;
      return ((e.clientX - rect.left) / rect.width) * 100;
    }

    let dragging = false;

    frame.addEventListener('pointerdown', (e) => {
      dragging = true;
      if (frame.setPointerCapture) frame.setPointerCapture(e.pointerId);
      frame.classList.add('is-dragging');
      setPos(posFromEvent(e));
    });

    frame.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      e.preventDefault(); // stop the image being "picked up" mid-drag
      setPos(posFromEvent(e));
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      frame.classList.remove('is-dragging');
      if (e && e.pointerId != null && frame.hasPointerCapture && frame.hasPointerCapture(e.pointerId)) {
        frame.releasePointerCapture(e.pointerId);
      }
    }
    frame.addEventListener('pointerup', endDrag);
    frame.addEventListener('pointercancel', endDrag);

    // Keyboard — the handle is a real slider control.
    handle.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 2;
      let handled = true;
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          setPos(pos - step);
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          setPos(pos + step);
          break;
        case 'Home':
          setPos(0);
          break;
        case 'End':
          setPos(100);
          break;
        default:
          handled = false;
      }
      if (handled) e.preventDefault();
    });

    setPos(50);
  });

  /* ----------------------------------------------------------
     B) LIGHTBOX
     Built once, on first use, reusing the site's existing
     .lightbox styling so it matches everything else.
  ---------------------------------------------------------- */
  const FOCUSABLE =
    'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  let lb = null;
  let lbImg = null;
  let lbTitle = null;
  let lbCount = null;
  let lbPrev = null;
  let lbNext = null;
  let photos = [];
  let meta = { title: '', alt: '' };
  let index = 0;
  let openerEl = null;
  let prevOverflow = '';

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Project image viewer');
    lb.hidden = true;
    lb.innerHTML = `
      <div class="lightbox-backdrop" data-lb-close></div>
      <div class="lightbox-container">
        <button type="button" class="lightbox-close" data-lb-close aria-label="Close image viewer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <button type="button" class="lightbox-nav lightbox-prev" data-lb-prev aria-label="Previous photo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="lightbox-content">
          <div class="lightbox-image"><img alt=""></div>
          <div class="lightbox-info">
            <span class="lightbox-cat" data-lb-count></span>
            <h2 class="lightbox-title" data-lb-title></h2>
          </div>
        </div>
        <button type="button" class="lightbox-nav lightbox-next" data-lb-next aria-label="Next photo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>`;
    document.body.appendChild(lb);

    lbImg = lb.querySelector('.lightbox-image img');
    lbTitle = lb.querySelector('[data-lb-title]');
    lbCount = lb.querySelector('[data-lb-count]');
    lbPrev = lb.querySelector('[data-lb-prev]');
    lbNext = lb.querySelector('[data-lb-next]');

    lb.querySelectorAll('[data-lb-close]').forEach((el) => el.addEventListener('click', close));
    lbPrev.addEventListener('click', () => step(-1));
    lbNext.addEventListener('click', () => step(1));

    // Swipe (touch)
    let sx = 0;
    let sy = 0;
    lb.addEventListener('touchstart', (e) => {
      sx = e.changedTouches[0].clientX;
      sy = e.changedTouches[0].clientY;
    }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dy) < 100) step(dx < 0 ? 1 : -1);
    }, { passive: true });

    // Keyboard: ESC, arrows, and a Tab focus trap
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowLeft') { step(-1); return; }
      if (e.key === 'ArrowRight') { step(1); return; }
      if (e.key !== 'Tab') return;

      const items = Array.from(lb.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
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
    });
  }

  function render() {
    const src = photos[index];
    if (!src) return;
    lbImg.src = src;
    lbImg.alt = meta.alt;
    lbTitle.textContent = meta.title;
    lbCount.textContent = photos.length > 1 ? `Photo ${index + 1} of ${photos.length}` : 'Project';

    const single = photos.length <= 1;
    lbPrev.hidden = single;
    lbNext.hidden = single;
    lbPrev.disabled = index === 0;
    lbNext.disabled = index === photos.length - 1;
    lbPrev.style.opacity = lbPrev.disabled ? '0.3' : '1';
    lbNext.style.opacity = lbNext.disabled ? '0.3' : '1';
  }

  function step(delta) {
    const next = index + delta;
    if (next < 0 || next >= photos.length) return;
    index = next;
    render();
  }

  function open(article, photoIndex, opener) {
    if (!lb) buildLightbox();

    try {
      photos = JSON.parse(article.dataset.photos || '[]');
    } catch (err) {
      photos = [];
    }
    if (!photos.length) return;

    meta = { title: article.dataset.title || '', alt: article.dataset.alt || '' };
    index = Math.min(Math.max(photoIndex, 0), photos.length - 1);
    openerEl = opener;

    render();
    lb.hidden = false;

    // Lock body scroll, remembering whatever was there before.
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    lb.querySelector('.lightbox-close').focus();
  }

  function close() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.body.style.overflow = prevOverflow; // restore, don't assume ''
    if (openerEl && document.contains(openerEl)) openerEl.focus();
    openerEl = null;
  }

  // Thumbnails open the lightbox (delegated).
  mount.addEventListener('click', (e) => {
    const thumb = e.target.closest('.project-thumb');
    if (!thumb) return;
    const article = thumb.closest('.project');
    if (!article) return;
    open(article, Number(thumb.dataset.photo) || 0, thumb);
  });
})();
