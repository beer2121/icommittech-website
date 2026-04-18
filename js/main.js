/* ============================================================
   COMMIT CO., LTD. — Main JavaScript
   js/main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── 1. SMOOTH SCROLL ─────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        // Close mobile menu if open
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ── 2. NAVBAR SCROLL EFFECT ──────────────────────── */
  var nav = document.querySelector('nav');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      nav.style.background = 'rgba(11,24,41,0.99)';
      nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.25)';
    } else {
      nav.style.background = 'rgba(11,24,41,0.96)';
      nav.style.boxShadow = 'none';
    }
  });

  /* ── 3. HAMBURGER MOBILE MENU ─────────────────────── */
  var hamburger  = document.querySelector('.hamburger');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen.toString());
    });
  }

  /* ── 4. SCROLL FADE-IN ANIMATION ─────────────────── */
  var fadeEls = document.querySelectorAll(
    '.service-card, .project-card, .news-card, .course-item, .about-block'
  );

  fadeEls.forEach(function (el) {
    el.style.opacity  = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity  = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.1 });

  fadeEls.forEach(function (el) { observer.observe(el); });

  /* ── 5. ACTIVE NAV LINK HIGHLIGHT ON SCROLL ───────── */
  var sections  = document.querySelectorAll('section[id], footer[id]');
  var navAnchors = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', function () {
    var scrollPos = window.scrollY + 100;
    sections.forEach(function (sec) {
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        navAnchors.forEach(function (a) { a.classList.remove('active'); });
        var active = document.querySelector('.nav-links a[href="#' + sec.id + '"]');
        if (active) active.classList.add('active');
      }
    });
  });

  /* ── 6. NAV LINK ACTIVE STYLE ──────────────────────── */
  var styleTag = document.createElement('style');
  styleTag.textContent = '.nav-links a.active { color: #00D4FF; }';
  document.head.appendChild(styleTag);

});
