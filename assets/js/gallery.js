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
  let showAll = false;              // whether "see all" is expanded

  const DESKTOP_LIMIT = 6;
  const MOBILE_LIMIT  = 3;

  function getLimit() {
    return window.innerWidth <= 600 ? MOBILE_LIMIT : DESKTOP_LIMIT;
  }

  /* ----------------------------------------------------------
     SHOW MORE / SEE ALL BUTTON
  ---------------------------------------------------------- */
  const showMoreWrap = document.getElementById('gallery-show-more');
  const seeAllBtn    = document.getElementById('gallery-see-all');

  function applyLimit() {
    const limit = showAll ? Infinity : getLimit();
    const visible = filteredItems.filter(i => !i.classList.contains('hidden'));

    visible.forEach((item, i) => {
      item.classList.toggle('limit-hidden', i >= limit);
    });

    const hasMore = visible.length > getLimit();
    showMoreWrap.classList.toggle('hidden', !hasMore);
    if (seeAllBtn) {
      seeAllBtn.textContent = showAll ? 'Show Less' : 'See All Projects';
    }
  }

  if (seeAllBtn) {
    seeAllBtn.addEventListener('click', () => {
      showAll = !showAll;
      applyLimit();
      if (!showAll) {
        // scroll back up to the gallery section when collapsing
        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

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

      showAll = false; // reset expand state on filter change
      applyFilter(category);
    });
  });

  function applyFilter(category) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      allItems.forEach(item => {
        const match = category === 'all' || item.dataset.category === category;
        item.classList.toggle('hidden', !match);
        item.classList.remove('limit-hidden');
      });
      filteredItems = allItems.filter(item => !item.classList.contains('hidden'));
      applyLimit();
      return;
    }

    // Step 1: fade out all visible items
    allItems.forEach(item => {
      if (!item.classList.contains('hidden') && !item.classList.contains('limit-hidden')) {
        item.classList.add('filtering');
      }
    });

    // Step 2: after fade-out, show/hide and fade in
    setTimeout(() => {
      allItems.forEach(item => {
        item.classList.remove('filtering', 'limit-hidden');
        const match = category === 'all' || item.dataset.category === category;
        item.classList.toggle('hidden', !match);
        if (match) item.classList.add('filter-in');
      });

      filteredItems = allItems.filter(item => !item.classList.contains('hidden'));
      applyLimit();

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

    const imgEl = item.querySelector('img');
    if (imgEl) {
      lbImage.innerHTML = `<img src="${imgEl.src}" alt="${imgEl.alt}" style="width:100%;height:100%;object-fit:cover;display:block;">`;
    } else {
      lbImage.innerHTML = `<div class="lightbox-image-placeholder"><span>${title}</span></div>`;
    }

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
      if (!item.classList.contains('hidden') && !item.classList.contains('limit-hidden')) openLightbox(item);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!item.classList.contains('hidden') && !item.classList.contains('limit-hidden')) openLightbox(item);
      }
    });
  });

  // Run on load
  applyLimit();

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
