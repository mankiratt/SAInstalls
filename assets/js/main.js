/* ============================================================
   S&A INSTALLS & JOINERY — main.js
   Handles: navigation, custom cursor, scroll animations,
   smooth scroll, hamburger menu, hero parallax, back-to-top,
   footer year, form validation, hero word cycling.
============================================================ */

/* ============================================================
   0. HERO CYCLING WORDS
   Words slide up from below (in) and exit to the top (out),
   matching framer-motion spring physics via CSS keyframes.
   Starts after the hero has fully faded in (~1s delay).
============================================================ */
(function initHeroWords() {
  const words = Array.from(document.querySelectorAll('.hero-word'));
  if (!words.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let current = 0;
  let intervalId = null;
  const IN_DURATION  = 750;
  const OUT_DURATION = 200;
  const HOLD_TIME    = 2500;

  function resetToWord(idx) {
    words.forEach((w, i) => {
      w.classList.remove('active', 'word-in', 'word-out');
      if (i === idx) w.classList.add('active');
    });
  }

  function cycleToNext() {
    const outEl = words[current];
    outEl.classList.remove('active');
    outEl.classList.add('word-out');
    setTimeout(() => outEl.classList.remove('word-out'), OUT_DURATION);

    current = (current + 1) % words.length;
    const inEl = words[current];
    inEl.classList.add('word-in');
    setTimeout(() => {
      inEl.classList.remove('word-in');
      inEl.classList.add('active');
    }, IN_DURATION);
  }

  function start() {
    intervalId = setInterval(cycleToNext, HOLD_TIME);
  }

  function stop() {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Pause when tab is hidden, reset cleanly when it becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      resetToWord(current);
      start();
    }
  });

  setTimeout(start, 1200);
})();

/* ============================================================
   1. NAVIGATION — scroll behaviour & active links
============================================================ */
(function initNav() {
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id], header[id]');

  // Add .scrolled class when user scrolls past 60px
  function onScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    updateActiveLink();
  }

  // Highlight the nav link whose section is currently in view
  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      const target = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', target === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ============================================================
   2. HAMBURGER MENU
============================================================ */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link, .nav-mobile-cta');

  function toggleMenu() {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ============================================================
   3. SMOOTH SCROLL — anchor links
============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.getElementById('nav').offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   4. CUSTOM CURSOR
   Only active on pointer devices (not touch screens).
============================================================ */
(function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  const hoverTargets = 'a, button, [role="button"], input, select, textarea, .gallery-item, .service-card';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();


/* ============================================================
   5. INTERSECTION OBSERVER — scroll-triggered animations
============================================================ */
(function initScrollAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // All elements already visible via CSS fallback

  const elements = document.querySelectorAll('.animate-element');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // animate once only
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));

  // Trigger hero elements immediately (they're in view on load)
  const heroElements = document.querySelectorAll('.hero .animate-element');
  heroElements.forEach(el => {
    el.classList.add('in-view');
    observer.unobserve(el);
  });
})();


/* ============================================================
   6. HERO SLIDESHOW — rotates the three hero background photos
============================================================ */
(function initHeroSlideshow() {
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  if (slides.length < 2) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = 0;
  const HOLD = prefersReduced ? 999999 : 6000; // pause indefinitely if reduced motion

  function nextSlide() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }

  setInterval(nextSlide, HOLD);
})();


/* ============================================================
   7. BACK TO TOP BUTTON
============================================================ */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   8. FOOTER YEAR — auto-updates copyright year
============================================================ */
(function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ============================================================
   9. CONTACT FORM — validation & submission
============================================================ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  // Field-level validation rules
  const validators = {
    'first-name': (v) => v.trim() ? '' : 'Please enter your first name.',
    'last-name':  (v) => v.trim() ? '' : 'Please enter your last name.',
    'phone':      (v) => /^[\d\s\+\-\(\)]{6,15}$/.test(v.trim()) ? '' : 'Please enter a valid phone number.',
    'email':      (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.'
  };

  // Show/clear error on a single field
  function validateField(input) {
    const id = input.id;
    const errorEl = document.getElementById(id + '-error');
    if (!validators[id]) return true;

    const message = validators[id](input.value);
    if (errorEl) errorEl.textContent = message;
    input.classList.toggle('error', !!message);
    return !message;
  }

  // Live validation on blur
  Object.keys(validators).forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        // Clear error as user types (once they've had a failed submit)
        if (input.classList.contains('error')) validateField(input);
      });
    }
  });

  // Submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all required fields
    let isValid = true;
    Object.keys(validators).forEach(id => {
      const input = document.getElementById(id);
      if (input && !validateField(input)) isValid = false;
    });

    if (!isValid) {
      // Focus first error field
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const formData = new FormData(form);
    fetch('https://formspree.io/f/mwvzwapj', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
      .then(res => {
        if (res.ok) {
          form.hidden = true;
          if (success) success.hidden = false;
        } else {
          res.json().then(data => {
            const msg = (data.errors || []).map(e => e.message).join(', ') || 'Something went wrong. Please try again.';
            alert(msg);
          });
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Enquiry';
        }
      })
      .catch(() => {
        alert('Could not send your message. Please check your connection and try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Enquiry';
      });
  });
})();


/* ============================================================
   10. SCROLL INDICATOR — hide after first scroll
============================================================ */
(function initScrollIndicator() {
  const indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;

  function hideIndicator() {
    if (window.scrollY > 80) {
      indicator.style.opacity = '0';
      indicator.style.pointerEvents = 'none';
      window.removeEventListener('scroll', hideIndicator);
    }
  }

  window.addEventListener('scroll', hideIndicator, { passive: true });
})();
