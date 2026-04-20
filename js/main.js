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


  /* ── Contact form: Formspree submission ──────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const successEl = document.getElementById('formSuccess');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      try {
        const response = await fetch('https://formspree.io/f/mqewlrgb', {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          contactForm.reset();
          successEl.removeAttribute('hidden');
          submitBtn.textContent = 'Sent!';
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
          alert('Something went wrong. Please try again or email John.Walsh@LSCRMA.com directly.');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        alert('Something went wrong. Please try again or email John.Walsh@LSCRMA.com directly.');
      }
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
