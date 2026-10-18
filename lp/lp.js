/* ============================================================
   S&A JOINERY — GOOGLE ADS LANDING PAGES
   Shared behaviour for /kitchens, /wardrobes and /cabinet-maker.

   Does five things:
     - carries the click id (gclid) and utm tags into the enquiry
     - validates and submits the form without a page reload
     - fires the two Google Ads conversions, correctly
     - runs the Microsoft Clarity tag
     - fills the footer year and the review count

   No framework, no dependencies. Loaded with `defer`.
============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     CONFIG — every id lives here. Changing an id is one edit.

     NOTE: the Google tag loader (`gtag/js?id=...`) also has to sit
     in the <head> of each page so it starts downloading early, so
     `adsId` appears in the HTML too. If you change it here, change
     it in the three page <head>s as well.
  ========================================================== */
  var LP_CONFIG = {
    adsId:      'AW-17979716484',           // live, from the main site
    formLabel:  '3ZkrCP3p2-gcEITnsv1C',     // conversion: Submit lead form
    callLabel:  'EuIHCIHH5ugcEITnsv1C',     // conversion: Click to call
    clarityId:  'XXXXXXXXXX',               // PLACEHOLDER — Clarity project id
    reviewCount: 6,                          // the count shows only at >= 20
    endpoint:   'https://formspree.io/f/mwvzwapj',  // same as the main site
    phone:      '0478 671 407',
    gclidDays:  90
  };

  /* Append ?lp_test=1 to any landing page URL to rehearse the form:
     the submission still reaches Formspree with a [TEST] subject, but
     conversions are logged to the console instead of being sent, so
     the Ads data stays clean. */
  var TEST = /[?&]lp_test=1\b/.test(location.search);

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ==========================================================
     STORAGE — never let a blocked or full localStorage throw.
  ========================================================== */
  function storeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storeSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  /* ==========================================================
     CLICK ID
     Google appends ?gclid=... to the ad click. It is the only way
     to tie a job that gets won months later back to the click that
     produced it, so it is kept for 90 days and travels with every
     enquiry — including one from a visitor who comes back later
     by typing the address in directly.
  ========================================================== */
  var GCLID_KEY = 'sa_lp_gclid';

  function readGclid() {
    var params = new URLSearchParams(location.search);
    var fresh = params.get('gclid');

    if (fresh) {
      storeSet(GCLID_KEY, JSON.stringify({ v: fresh, t: Date.now() }));
      return fresh;
    }

    var saved = storeGet(GCLID_KEY);
    if (!saved) return '';

    try {
      var parsed = JSON.parse(saved);
      var age = Date.now() - parsed.t;
      if (age < LP_CONFIG.gclidDays * 86400000) return parsed.v;
    } catch (e) { /* corrupt value — treat as absent */ }

    return '';
  }

  /* ==========================================================
     CONVERSIONS
  ========================================================== */
  function fireConversion(label, extra) {
    var payload = { send_to: LP_CONFIG.adsId + '/' + label };
    if (extra) {
      for (var k in extra) { if (extra.hasOwnProperty(k)) payload[k] = extra[k]; }
    }

    if (TEST) {
      console.log('[lp_test] conversion withheld:', payload);
      return;
    }
    if (typeof window.gtag !== 'function') return;  // tag blocked — never throw
    window.gtag('event', 'conversion', payload);
  }

  /* Phone clicks, delegated once so this covers the top bar, the hero,
     the mid-page block, the final block and the sticky bar.

     The click is deliberately NOT intercepted. gtag sends conversions
     with sendBeacon, which survives the navigation to the dialer, so
     there is nothing to wait for — and a missed call costs far more
     than a missed data point. */
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href^="tel:"]');
    if (!link) return;
    fireConversion(LP_CONFIG.callLabel, { value: 1.0, currency: 'AUD' });
  });

  /* ==========================================================
     MICROSOFT CLARITY — after first render, so it never competes
     with the hero image for bandwidth.
  ========================================================== */
  function loadClarity(page) {
    var id = LP_CONFIG.clarityId;
    if (!id || id.indexOf('X') !== -1) return;   // still a placeholder

    (function (c, l, a, r, i) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      var t = l.createElement(r); t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      var y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', id);

    if (page) window.clarity('set', 'page', page);
  }

  /* ==========================================================
     SMALL PAGE FURNITURE
  ========================================================== */
  function initChrome() {
    var year = $('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());

    /* The review count is only persuasive once there are enough of
       them. Below the threshold the badge says "5.0 on Google" and
       stops there. */
    var count = $('[data-review-count]');
    if (count && LP_CONFIG.reviewCount >= 20) {
      count.textContent = 'from ' + LP_CONFIG.reviewCount + ' Google reviews';
      count.hidden = false;
    }

    /* The team photo slot stays out of the DOM entirely until a real
       photograph exists. No placeholder, no empty frame. */
    var slot = $('[data-photo]');
    if (slot) {
      var src = slot.getAttribute('data-src');
      if (src) {
        var img = new Image();
        img.src = src;
        img.alt = slot.getAttribute('data-alt') || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.className = 'lp-about__photoImg';
        var w = slot.getAttribute('data-w'), h = slot.getAttribute('data-h');
        if (w) img.width = w;
        if (h) img.height = h;
        slot.appendChild(img);
      } else {
        slot.remove();
      }
    }
  }

  /* ==========================================================
     FORM
  ========================================================== */

  /* Loose Australian check: 8–10 digits once spacing, brackets and a
     +61 country code are taken off. Loose on purpose — a landline, a
     mobile and a number typed with or without the leading zero all
     need to get through. Rejecting a real customer costs more than
     accepting a typo. */
  function phoneLooksReal(value) {
    var digits = value.replace(/[\s\-().]/g, '').replace(/^(\+?61|0061)/, '');
    return /^\d{8,10}$/.test(digits);
  }

  var RULES = {
    suburb: function (v) { return v.trim() ? '' : 'Please tell us your suburb.'; },
    project: function (v) { return v ? '' : 'Please choose what you need.'; },
    budget: function (v) { return v ? '' : 'Please choose a rough budget.'; },
    name: function (v) { return v.trim() ? '' : 'Please enter your name.'; },
    phone: function (v) {
      if (!v.trim()) return 'Please enter your phone number.';
      return phoneLooksReal(v) ? '' : 'Please check your phone number.';
    }
  };

  function initForm() {
    var form = $('#enquire');
    if (!form) return;

    var page = form.getAttribute('data-page') || '';
    var fail = $('[data-fail]', form);

    /* --- hidden fields ------------------------------------ */
    var params = new URLSearchParams(location.search);
    var setHidden = function (name, value) {
      var input = form.elements[name];
      if (input) input.value = value || '';
    };

    setHidden('page', page);
    setHidden('gclid', readGclid());
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term'].forEach(function (key) {
      setHidden(key, params.get(key) || '');
    });

    /* --- validation --------------------------------------- */
    function fieldError(name, message) {
      var input = form.elements[name];
      var slot = $('[data-error="' + name + '"]', form);
      if (slot) slot.textContent = message;
      if (input) {
        if (message) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      }
      return !message;
    }

    function checkField(name) {
      var input = form.elements[name];
      if (!input || !RULES[name]) return true;
      return fieldError(name, RULES[name](input.value));
    }

    Object.keys(RULES).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener('blur', function () { checkField(name); });
      /* Once a field has been marked wrong, clear the mark as soon as
         it becomes right — don't make people submit again to find out. */
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid')) checkField(name);
      });
      input.addEventListener('change', function () {
        if (input.getAttribute('aria-invalid')) checkField(name);
      });
    });

    /* --- submit ------------------------------------------- */
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var firstBad = null;
      Object.keys(RULES).forEach(function (name) {
        if (!checkField(name) && !firstBad) firstBad = form.elements[name];
      });
      if (firstBad) { firstBad.focus(); return; }

      if (fail) fail.hidden = true;

      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      var suburb = form.elements.suburb.value.trim();

      setHidden('_subject',
        (TEST ? '[TEST] ' : '') + 'New ' + page + ' enquiry – ' + suburb);

      var button = $('[data-submit]', form);
      var buttonLabel = button ? button.textContent : '';
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }

      fetch(LP_CONFIG.endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          showThanks(form, name, phone);
          /* Only now, on a confirmed 2xx. Never on the click. */
          fireConversion(LP_CONFIG.formLabel);
        })
        .catch(function (error) {
          if (TEST) console.warn('[lp_test] submission failed:', error);
          if (button) { button.disabled = false; button.textContent = buttonLabel; }
          if (fail) {
            fail.hidden = false;
            fail.focus();
          }
        });
    });
  }

  /* Replaces the form with the confirmation. Everything the visitor
     typed is written with textContent, never innerHTML. */
  function showThanks(form, name, phone) {
    var done = document.createElement('div');
    done.className = 'lp-form__done';
    done.setAttribute('role', 'status');
    done.setAttribute('tabindex', '-1');

    done.innerHTML =
      '<svg class="lp-form__doneIcon" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' +
      '<h2 class="lp-form__head"></h2>' +
      '<p class="lp-form__doneText"></p>';

    done.querySelector('.lp-form__head').textContent = 'Thanks, ' + name + '.';
    done.querySelector('.lp-form__doneText').textContent =
      "We've got your details and will call you on " + phone +
      ' to book your free measure.';

    form.replaceWith(done);
    done.focus();
  }

  /* ==========================================================
     GO
  ========================================================== */
  initChrome();
  initForm();

  var page = (document.body && document.body.getAttribute('data-lp-page')) || '';
  if (document.readyState === 'complete') loadClarity(page);
  else window.addEventListener('load', function () { loadClarity(page); });

  if (TEST) {
    console.log('[lp_test] test mode on. Conversions are logged, not sent. ' +
                'Form submissions still reach Formspree, subject-prefixed [TEST].');
  }
})();
