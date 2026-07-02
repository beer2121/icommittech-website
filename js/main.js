/* ============================================================
   COMMIT CO., LTD. — Main JavaScript
   js/main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  var hamburger  = document.querySelector('.hamburger');
  var mobileMenu = document.querySelector('.mobile-menu');

  /* ── 0. HERO SLIDER ───────────────────────────────── */
  (function () {
    var slides   = document.querySelectorAll('.hero-slide');
    var dots     = document.querySelectorAll('.hero-dot');
    var prevBtn  = document.querySelector('.hero-arrow--prev');
    var nextBtn  = document.querySelector('.hero-arrow--next');
    if (!slides.length) return;

    var current  = 0;
    var total    = slides.length;
    var autoplay = null;
    var INTERVAL = 6000;

    function goTo(index) {
      current = (index + total) % total;
      slides.forEach(function (s, i) {
        s.classList.toggle('active', i === current);
        s.setAttribute('aria-label', (i + 1) + ' จาก ' + total);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoplay() {
      stopAutoplay();
      autoplay = setInterval(next, INTERVAL);
    }
    function stopAutoplay() {
      if (autoplay) { clearInterval(autoplay); autoplay = null; }
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); startAutoplay(); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.getAttribute('data-slide'), 10));
        startAutoplay();
      });
    });

    var slider = document.querySelector('.hero-slider');
    if (slider) {
      slider.addEventListener('mouseenter', stopAutoplay);
      slider.addEventListener('mouseleave', startAutoplay);

      var touchStartX = 0;
      slider.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
      }, { passive: true });
      slider.addEventListener('touchend', function (e) {
        var diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
        startAutoplay();
      }, { passive: true });
    }

    goTo(0);
    startAutoplay();
  })();

  /* ── 1. SMOOTH SCROLL ─────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        if (mobileMenu) mobileMenu.classList.remove('open');
        if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
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
