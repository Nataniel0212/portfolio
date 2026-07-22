/* ============================================================
   Nataniel Ataseven — portfolio (redesign v3.2, juli 2026)
   Intro-loader (curtain), orbit-karusell med levande scener
   (foton / video / data-rain), nav-state, mobilmeny, reveals.
   Fokuserat klot öppnar kategorins egen sida.
   ============================================================ */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ Intro-loader: namn in, sedan dras ridån upp ============ */
  var loader = document.getElementById('loader');
  if (loader) {
    if (reducedMotion) {
      loader.classList.add('gone');
    } else {
      window.setTimeout(function () {
        loader.classList.add('done');
        window.setTimeout(function () { loader.classList.add('gone'); }, 800);
      }, 1300);
    }
  }

  /* ============ Data-rain: fallande guldsiffror (research-scenen) ============ */
  /* Fyller varje [data-rain]-container med N kolumner av siffror.
     Antalet styrs av attributvärdet. Hoppas över vid reduced motion. */
  function seedRain() {
    if (reducedMotion) return;
    var containers = document.querySelectorAll('[data-rain]');
    containers.forEach(function (box) {
      var count = parseInt(box.getAttribute('data-rain'), 10) || 12;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < count; i++) {
        var col = document.createElement('span');
        var len = 6 + Math.floor(Math.random() * 8);
        var digits = '';
        for (var j = 0; j < len; j++) digits += Math.floor(Math.random() * 10);
        col.textContent = digits;
        col.style.left = (Math.random() * 96) + '%';
        col.style.fontSize = (10 + Math.random() * 5) + 'px';
        col.style.opacity = (0.35 + Math.random() * 0.65).toFixed(2);
        var dur = 9 + Math.random() * 14;
        col.style.animationDuration = dur + 's';
        col.style.animationDelay = (-Math.random() * dur) + 's';
        frag.appendChild(col);
      }
      box.appendChild(frag);
    });
  }
  seedRain();

  /* ============ Orbit: kategorikarusell ============ */
  /* Ringens ordning är cyklisk: center = ORDER[i], höger = nästa, vänster = föregående. */
  var ORDER = ['research', 'websites', 'apps'];
  var CATS = {
    research: { label: 'Research', desc: "Master's thesis · fraud detection in 5.4M invoices", url: 'research.html' },
    apps: { label: 'Apps', desc: 'Privera · Video Processor Pro', url: 'apps.html' },
    websites: { label: 'Websites', desc: 'STANEK, with more in progress', url: 'websites.html' }
  };

  var stage = document.querySelector('.orbit__stage');
  var sub = document.getElementById('orbitSub');
  var prevBtn = document.getElementById('orbitPrev');
  var nextBtn = document.getElementById('orbitNext');

  if (stage && sub) {
    var orbs = Array.prototype.slice.call(stage.querySelectorAll('.orb'));
    var scenes = Array.prototype.slice.call(document.querySelectorAll('.scene__layer'));
    var sceneVideo = document.querySelector('.scene__video');
    /* Startläge: Websites i fokus. Deep-link (#research/#apps) kan överstyra. */
    var focus = ORDER.indexOf('websites');
    var hashIdx = ORDER.indexOf(window.location.hash.replace('#', ''));
    if (hashIdx >= 0) focus = hashIdx;

    var subTimer = null;

    function apply(withFade) {
      var center = ORDER[focus];
      var right = ORDER[(focus + 1) % ORDER.length];
      var left = ORDER[(focus + 2) % ORDER.length];

      orbs.forEach(function (orb) {
        var cat = orb.dataset.cat;
        orb.classList.toggle('orb--center', cat === center);
        orb.classList.toggle('orb--left', cat === left);
        orb.classList.toggle('orb--right', cat === right);
        if (cat === center) {
          orb.setAttribute('aria-label', CATS[cat].label + ' — open category page');
        } else {
          orb.setAttribute('aria-label', CATS[cat].label + ' — rotate into focus');
        }
      });

      /* Bakgrundsfärg + glöd via CSS (body[data-category]) */
      document.body.dataset.category = center;

      /* Scenlagren: foton (websites), video (apps), data-rain (research) */
      scenes.forEach(function (layer) {
        layer.classList.toggle('is-active', layer.dataset.scene === center);
      });
      if (sceneVideo) {
        if (center === 'apps' && !reducedMotion) {
          var p = sceneVideo.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          sceneVideo.pause();
        }
      }

      /* Undertexten byts med kort fade */
      var swap = function () {
        sub.innerHTML = '<strong>' + CATS[center].label + '</strong> · ' + CATS[center].desc;
        sub.classList.remove('is-swap');
      };
      if (withFade && !reducedMotion) {
        window.clearTimeout(subTimer);
        sub.classList.add('is-swap');
        subTimer = window.setTimeout(swap, 180);
      } else {
        swap();
      }
    }

    function rotate(step) {
      focus = (focus + step + ORDER.length) % ORDER.length;
      apply(true);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { rotate(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { rotate(1); });

    orbs.forEach(function (orb) {
      orb.addEventListener('click', function () {
        var cat = orb.dataset.cat;
        if (cat === ORDER[focus]) {
          /* Fokuserat klot: öppna kategorins egen sida */
          window.location.href = CATS[cat].url;
        } else if (orb.classList.contains('orb--left')) {
          rotate(-1);
        } else {
          rotate(1);
        }
      });
    });

    /* Piltangenter roterar också klotet */
    document.addEventListener('keydown', function (e) {
      if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') rotate(-1);
      if (e.key === 'ArrowRight') rotate(1);
    });

    apply(false);
  }

  /* ============ Nav: border när sidan scrollats ============ */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============ Mobilmeny ============ */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============ Scroll-reveals (opt-in via prefers-reduced-motion) ============ */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }
})();
