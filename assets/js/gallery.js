/* ============================================================
   S&A INSTALLS & JOINERY — gallery.js
   Handles: category filter tabs, lightbox (open/close/nav),
   keyboard navigation, touch swipe support.
============================================================ */

(function initGallery() {

  /* ----------------------------------------------------------
     STATE
  ---------------------------------------------------------- */
  const allItems = Array.from(document.querySelectorAll('.gallery-item'));
  let filteredItems = [...allItems]; // items visible in current filter
  let currentIndex = 0;             // index within filteredItems

  /* ----------------------------------------------------------
     FILTER TABS
  ---------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.gallery-filter');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;

      // Update tab state
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      applyFilter(category);
    });
  });

  function applyFilter(category) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // No animation — just show/hide
      allItems.forEach(item => {
        const match = category === 'all' || item.dataset.category === category;
        item.classList.toggle('hidden', !match);
      });
      filteredItems = allItems.filter(item => !item.classList.contains('hidden'));
      return;
    }

    // Step 1: fade out all visible items
    allItems.forEach(item => {
      if (!item.classList.contains('hidden')) {
        item.classList.add('filtering');
      }
    });

    // Step 2: after fade-out, show/hide and fade in
    setTimeout(() => {
      allItems.forEach(item => {
        item.classList.remove('filtering');
        const match = category === 'all' || item.dataset.category === category;
        item.classList.toggle('hidden', !match);
        if (match) {
          item.classList.add('filter-in');
        }
      });

      filteredItems = allItems.filter(item => !item.classList.contains('hidden'));

      // Clean up transition class after animation completes
      setTimeout(() => {
        allItems.forEach(item => item.classList.remove('filter-in'));
      }, 400);
    }, 200);
  }

  /* ----------------------------------------------------------
     LIGHTBOX — open
  ---------------------------------------------------------- */
  const lightbox    = document.getElementById('lightbox');
  const lbImage     = document.getElementById('lightbox-image');
  const lbTitle     = document.getElementById('lightbox-title');
  const lbCat       = document.getElementById('lightbox-cat');
  const lbClose     = document.getElementById('lightbox-close');
  const lbPrev      = document.getElementById('lightbox-prev');
  const lbNext      = document.getElementById('lightbox-next');
  const lbBackdrop  = document.getElementById('lightbox-backdrop');

  function openLightbox(item) {
    currentIndex = filteredItems.indexOf(item);
    renderLightbox();
    lightbox.hidden = false;
    // Allow display to apply before removing hidden so transition fires
    requestAnimationFrame(() => {
      lightbox.removeAttribute('hidden');
    });
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    // Return focus to the gallery item that opened the lightbox
    const openedFrom = filteredItems[currentIndex];
    if (openedFrom) openedFrom.focus();
  }

  function renderLightbox() {
    const item = filteredItems[currentIndex];
    if (!item) return;

    const title    = item.dataset.title    || 'Project';
    const category = item.dataset.label    || item.dataset.category || '';

    lbTitle.textContent = title;
    lbCat.textContent   = category;

    // Re-create the placeholder content (swap for <img> when real photos are added)
    lbImage.innerHTML = `
      <div class="lightbox-image-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        <span>${title}</span>
      </div>
    `;

    // Update prev/next button states
    lbPrev.disabled = currentIndex <= 0;
    lbNext.disabled = currentIndex >= filteredItems.length - 1;
    lbPrev.style.opacity = lbPrev.disabled ? '0.3' : '1';
    lbNext.style.opacity = lbNext.disabled ? '0.3' : '1';
  }

  function showPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      renderLightbox();
    }
  }

  function showNext() {
    if (currentIndex < filteredItems.length - 1) {
      currentIndex++;
      renderLightbox();
    }
  }

  /* ----------------------------------------------------------
     GALLERY ITEM CLICK & KEYBOARD EVENTS
  ---------------------------------------------------------- */
  allItems.forEach(item => {
    item.addEventListener('click', () => {
      if (!item.classList.contains('hidden')) openLightbox(item);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!item.classList.contains('hidden')) openLightbox(item);
      }
    });
  });

  /* ----------------------------------------------------------
     LIGHTBOX CONTROLS
  ---------------------------------------------------------- */
  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);

  /* ----------------------------------------------------------
     KEYBOARD NAVIGATION IN LIGHTBOX
  ---------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;

    switch (e.key) {
      case 'Escape':      closeLightbox(); break;
      case 'ArrowLeft':   showPrev();      break;
      case 'ArrowRight':  showNext();      break;
    }
  });

  /* ----------------------------------------------------------
     TOUCH SWIPE SUPPORT (mobile)
  ---------------------------------------------------------- */
  let touchStartX = 0;
  let touchStartY = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    // Only register horizontal swipes (> 50px, less than 100px vertical)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
      if (deltaX < 0) showNext(); // swipe left → next
      else            showPrev(); // swipe right → prev
    }
  }, { passive: true });

  /* ----------------------------------------------------------
     FOCUS TRAP IN LIGHTBOX (accessibility)
     Keeps Tab key cycling within the lightbox when it's open.
  ---------------------------------------------------------- */
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  lightbox.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || lightbox.hidden) return;

    const focusable = Array.from(lightbox.querySelectorAll(focusableSelectors))
      .filter(el => !el.disabled && el.offsetParent !== null);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

})(); // end initGallery
