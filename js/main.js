/* =============================================================
   LIFE SCIENCES CRM ADVISORS — main.js
   Progressive enhancement only — core content works without JS
   ============================================================= */

(function () {
  'use strict';

  /* ── Smooth scroll for all anchor links ──────────────────── */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();

    const nav = document.getElementById('nav');
    const navHeight = nav ? nav.offsetHeight : 72;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    // Close mobile overlay if open
    closeOverlay();
  });


  /* ── Scroll-triggered fade-in animations ─────────────────── */
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeEls.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const siblings = entry.target.parentElement
              ? Array.from(entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)'))
              : [];
            const idx = siblings.indexOf(entry.target);
            const delay = idx >= 0 ? Math.min(idx * 80, 400) : 0;

            setTimeout(function () {
              entry.target.classList.add('visible');
            }, delay);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }


  /* ── Nav: scrolled class + active link highlighting ──────── */
  var nav = document.getElementById('nav');
  var navLinks = document.querySelectorAll('.nav__link[data-section]');

  var sections = Array.from(navLinks).map(function (link) {
    return {
      link: link,
      section: document.getElementById(link.dataset.section)
    };
  }).filter(function (item) { return item.section !== null; });

  function updateNav() {
    var scrollY = window.scrollY;
    var navHeight = nav ? nav.offsetHeight : 72;

    if (nav) {
      nav.classList.toggle('scrolled', scrollY > 10);
    }

    var current = '';
    sections.forEach(function (item) {
      if (scrollY >= item.section.offsetTop - navHeight - 60) {
        current = item.link.dataset.section;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();


  /* ── Mobile hamburger menu ────────────────────────────────── */
  var hamburger = document.getElementById('hamburger');
  var overlay   = document.getElementById('navOverlay');

  function openOverlay() {
    if (!overlay || !hamburger) return;
    overlay.classList.add('open');
    overlay.removeAttribute('aria-hidden');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay() {
    if (!overlay || !hamburger) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger && overlay) {
    hamburger.addEventListener('click', function () {
      overlay.classList.contains('open') ? closeOverlay() : openOverlay();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeOverlay();
        hamburger.focus();
      }
    });
  }


  /* ── Contact form: inline success message ─────────────────── */
  var form        = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');

  if (form && formSuccess) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var requiredFields = form.querySelectorAll('[required]');
      var allValid = true;

      requiredFields.forEach(function (field) {
        if (!field.value.trim()) {
          allValid = false;
          field.style.borderColor = '#E53E3E';
          field.addEventListener('input', function () { field.style.borderColor = ''; }, { once: true });
        }
      });

      var emailField = form.querySelector('[type="email"]');
      if (emailField && emailField.value.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
          allValid = false;
          emailField.style.borderColor = '#E53E3E';
          emailField.addEventListener('input', function () { emailField.style.borderColor = ''; }, { once: true });
        }
      }

      if (!allValid) return;

      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Message Sent';
        submitBtn.style.opacity = '0.7';
      }

      formSuccess.removeAttribute('hidden');
      formSuccess.style.display = 'block';
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      form.reset();
    });
  }


  /* ── Process section scroll UX ───────────────────────────── */
  var processFlow  = document.getElementById('processFlow');
  var prevBtn      = document.getElementById('processPrev');
  var nextBtn      = document.getElementById('processNext');
  var progressFill = document.getElementById('processProgressFill');
  var processHint  = document.getElementById('processHint');

  if (processFlow) {

    // Card scroll step = first card width + connector width (approx)
    function getScrollStep() {
      var firstCard = processFlow.querySelector('.process__step');
      var firstConn = processFlow.querySelector('.process__connector');
      var cardW = firstCard ? firstCard.offsetWidth : 260;
      var connW = firstConn ? firstConn.offsetWidth : 60;
      return cardW + connW;
    }

    // Update arrow disabled states + progress bar
    function updateScrollUI() {
      var scrollLeft = processFlow.scrollLeft;
      var maxScroll  = processFlow.scrollWidth - processFlow.clientWidth;

      if (prevBtn) prevBtn.disabled = scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = scrollLeft >= maxScroll - 2;

      if (progressFill && maxScroll > 0) {
        var pct = (scrollLeft / maxScroll) * 100;
        progressFill.style.width = pct + '%';
      }
    }

    processFlow.addEventListener('scroll', updateScrollUI, { passive: true });
    updateScrollUI(); // init state

    // Arrow button clicks
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        processFlow.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        processFlow.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      });
    }

    // Drag-to-scroll
    var isDragging  = false;
    var dragStartX  = 0;
    var scrollStart = 0;

    processFlow.addEventListener('mousedown', function (e) {
      // Ignore if clicking a button inside
      if (e.target.closest('button')) return;
      isDragging  = true;
      dragStartX  = e.pageX;
      scrollStart = processFlow.scrollLeft;
      processFlow.classList.add('is-dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.pageX - dragStartX;
      processFlow.scrollLeft = scrollStart - dx;
    });

    document.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      processFlow.classList.remove('is-dragging');
    });

    // Hint fade-out after 3 seconds
    if (processHint) {
      setTimeout(function () {
        processHint.classList.add('faded');
      }, 3000);
    }

    // Re-check arrow state on window resize
    window.addEventListener('resize', updateScrollUI, { passive: true });
  }

})();
