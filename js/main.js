/* ============================================================
   Nataniel Ataseven — portfolio (redesign v3.2, juli 2026;
   projekt-orbit november 2026)
   Intro-loader (curtain), orbit-karusell med levande scener
   (foton / video / data-rain), nav-state, mobilmeny, reveals.
   Startsidan: kloten är kategorierna. Kategorisidorna: kloten är
   projekten. Fokuserat klot öppnar nästa nivå.
   ============================================================ */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ Intro-loader: namn in, sedan dras ridån upp ============ */
  /* Visas en gång per besök. Den som går fram och tillbaka mellan
     kategorierna ska inte vänta på ridån varje gång (se även inline-
     skriptet i index.html som döljer den före första renderingen). */
  /* Flaggan sätts på alla sidor: den som kommer in via t.ex. apps.html och
     sedan går till startsidan ska inte få ridån mitt i sidövergången. */
  var introSeen = false;
  try {
    introSeen = window.sessionStorage.getItem('na-intro') === '1';
    window.sessionStorage.setItem('na-intro', '1');
  } catch (e) { /* privat läge: visa ridån som vanligt */ }
  var loader = document.getElementById('loader');
  if (loader) {
    if (reducedMotion || introSeen) {
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

  /* ============ Rosetta-scenen: okända kolumner får namn ============ */
  /* Kolumner med hex-bytes rullar förbi. Med jämna mellanrum "löses" en
     kolumns rubrik från ett okänt ID till en riktig EC-Lab-storhet, precis
     som verktyget gör. Körs bara när scenen syns och fliken är aktiv. */
  var HEX_NAMES = ['time/s', 'Ewe/V', '<I>/mA', 'control/V', '(Q-Qo)/mA.h', 'cycle number',
    'Ns changes', 'Energy/W.h', 'P/W', '|Z|/Ohm', 'freq/Hz', 'Ece/V', 'Capacitance/uF', 'Re(Z)/Ohm'];
  var HEX_CHARS = '0123456789ABCDEF';

  function hexByte() {
    return HEX_CHARS[Math.floor(Math.random() * 16)] + HEX_CHARS[Math.floor(Math.random() * 16)];
  }
  function unknownId() {
    return 'ID 0x' + hexByte() + hexByte().charAt(0) + ' ?';
  }

  function initHexScene(box) {
    var count = Math.max(5, Math.min(12, Math.floor(window.innerWidth / 130)));
    var cols = [];
    for (var i = 0; i < count; i++) {
      var col = document.createElement('div');
      col.className = 'hexcol';
      var name = document.createElement('span');
      name.className = 'hexcol__name';
      name.textContent = unknownId();
      var bytes = document.createElement('span');
      bytes.className = 'hexcol__bytes';
      var rows = [];
      for (var r = 0; r < 34; r++) rows.push(hexByte() + ' ' + hexByte() + ' ' + hexByte() + ' ' + hexByte());
      /* Dubblerat innehåll ger en sömlös loop (animationen flyttar -50 %) */
      bytes.textContent = rows.concat(rows).join('\n');
      bytes.style.animationDuration = (30 + Math.random() * 24) + 's';
      bytes.style.animationDelay = (-Math.random() * 40) + 's';
      var body = document.createElement('span');
      body.className = 'hexcol__body';
      body.appendChild(bytes);
      col.appendChild(name);
      col.appendChild(body);
      box.appendChild(col);
      cols.push({ el: col, name: name, label: HEX_NAMES[i % HEX_NAMES.length] });
    }

    if (reducedMotion) {
      cols.forEach(function (c, k) {
        if (k % 2 === 0) { c.el.classList.add('is-named'); c.name.textContent = c.label; }
      });
      return null;
    }

    var timer = null;
    function scramble(c, done) {
      var steps = 0;
      var iv = window.setInterval(function () {
        steps++;
        var out = '';
        for (var k = 0; k < c.label.length; k++) {
          out += k < steps / 2 ? c.label.charAt(k) : HEX_CHARS[Math.floor(Math.random() * 16)];
        }
        c.name.textContent = out;
        if (steps / 2 >= c.label.length) { window.clearInterval(iv); c.name.textContent = c.label; done(); }
      }, 45);
    }
    function tick() {
      var named = cols.filter(function (c) { return c.el.classList.contains('is-named'); });
      var open = cols.filter(function (c) { return !c.el.classList.contains('is-named'); });
      if (named.length > count * 0.6 || !open.length) {
        var back = named[Math.floor(Math.random() * named.length)];
        back.el.classList.remove('is-named');
        back.name.textContent = unknownId();
        return;
      }
      var c = open[Math.floor(Math.random() * open.length)];
      scramble(c, function () { c.el.classList.add('is-named'); });
    }
    return {
      start: function () { if (!timer) { tick(); timer = window.setInterval(tick, 1700); } },
      stop: function () { window.clearInterval(timer); timer = null; }
    };
  }

  var hexScenes = [];
  document.querySelectorAll('[data-hexscene]').forEach(function (box) {
    var ctl = initHexScene(box);
    if (ctl) hexScenes.push({ layer: box.closest('.scene__layer'), ctl: ctl });
  });
  function syncHexScenes() {
    hexScenes.forEach(function (h) {
      var visible = !document.hidden && (!h.layer || h.layer.classList.contains('is-active'));
      if (visible) h.ctl.start(); else h.ctl.stop();
    });
  }
  document.addEventListener('visibilitychange', syncHexScenes);

  /* ============ Orbit: klotkarusellen ============ */
  /* Allt läses från HTML: varje .orb har data-key, data-label, data-desc,
     data-action och data-theme. Startsidan: data-orbit="category" (kloten är
     kategorierna). Kategorisidorna: data-orbit="project" (kloten är projekten).
     Ringen är cyklisk: center = fokus, höger = nästa, vänster = föregående. */
  var orbit = document.querySelector('[data-orbit]');
  var stage = orbit && orbit.querySelector('.orbit__stage');

  if (stage) {
    var orbs = Array.prototype.slice.call(stage.querySelectorAll('.orb'));
    var keys = orbs.map(function (o) { return o.dataset.key; });
    var n = keys.length;
    var scenes = Array.prototype.slice.call(orbit.querySelectorAll('.scene__layer'));
    var panels = Array.prototype.slice.call(orbit.querySelectorAll('.orbit__panel'));
    var sub = orbit.querySelector('.orbit__sub');
    var prevBtn = orbit.querySelector('.orbit__arrow--prev');
    var nextBtn = orbit.querySelector('.orbit__arrow--next');
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    var bodyAttr = orbit.dataset.orbit === 'project' ? 'data-project' : 'data-category';

    /* Startläge från data-start; en deep-link (#apps, #vpp ...) överstyr */
    var focus = Math.max(0, keys.indexOf(orbit.dataset.start));
    var hashKey = window.location.hash.replace('#', '');
    if (keys.indexOf(hashKey) >= 0) focus = keys.indexOf(hashKey);

    var lastDir = 0;
    var offsets = [];
    var subTimer = null;
    var POS = { '-2': 'orb--far-left', '-1': 'orb--left', '0': 'orb--center', '1': 'orb--right', '2': 'orb--far-right' };
    var POS_ALL = ['orb--far-left', 'orb--left', 'orb--center', 'orb--right', 'orb--far-right', 'orb--hidden'];

    /* Var på ringen ligger klot i? 0 = mitten, -1 vänster, +1 höger.
       Med två klot står det andra på den sida man inte just kom ifrån. */
    function offsetOf(i) {
      var d = ((i - focus) % n + n) % n;
      if (n === 2) return d === 0 ? 0 : (lastDir > 0 ? -1 : 1);
      if (d > n / 2) d -= n;
      return d;
    }

    function place(orb, off) {
      POS_ALL.forEach(function (c) { orb.classList.remove(c); });
      orb.classList.add(POS[off] || 'orb--hidden');
    }

    /* Flytta ett klot till plats p. Ett klot som måste byta sida (t.ex.
       vänster -> höger vid "nästa") eller dyker upp från ingenstans glider
       inte tvärs över mitten: det hoppar osynligt ut till ringens bortre
       kant och rullar in därifrån, som ett löpband. */
    function jump(el, p) {
      el.classList.add('orb--instant');
      place(el, p);
      void el.offsetWidth;
      el.classList.remove('orb--instant');
    }
    function move(el, p, o, dir) {
      window.clearTimeout(el._wrapTimer);
      var wrap = dir && Math.abs(p) <= 2 && !reducedMotion && (o === undefined || Math.abs(o) > 2 || (p - o) * dir > 0);
      if (!wrap) { place(el, p); return; }
      var enter = dir > 0 ? 2 : -2;
      if (o !== undefined && Math.abs(o) <= 1) {
        /* Synligt klot: glid först ut åt samma håll som resten av ringen,
           hoppa sedan osynligt runt och rulla in från andra sidan. */
        place(el, -enter);
        el._wrapTimer = window.setTimeout(function () { jump(el, enter); place(el, p); }, 280);
      } else {
        jump(el, enter);
        place(el, p);
      }
    }

    /* Med bara två projekt skulle ena sidan av ringen stå tom. Då visas en
       spegelbild av det andra klotet där, så ringen alltid ser hel ut.
       Spegeln är dekorativ: dold för skärmläsare och inte ett tabbstopp. */
    var ghosts = [];
    var ghostOffsets = [];
    if (n === 2) {
      ghosts = orbs.map(function (orb) {
        var g = orb.cloneNode(true);
        g.classList.add('orb--ghost');
        g.setAttribute('aria-hidden', 'true');
        /* Utan href kan spegeln varken få fokus eller öppnas i ny flik */
        g.removeAttribute('href');
        g.removeAttribute('target');
        g.removeAttribute('tabindex');
        g.removeAttribute('aria-label');
        g.removeAttribute('aria-current');
        place(g, 9);
        stage.insertBefore(g, nextBtn || null);
        return g;
      });
    }

    function apply(dir) {
      /* Två projekt: om klotet som ska in i mitten står på "fel" sida medan
         dess spegel står på rätt, byter de plats osynligt (de ser likadana ut).
         Då kommer allt alltid in från rätt håll och inget sveper över mitten. */
      if (ghosts.length && dir && ghostOffsets[focus] === dir && offsets[focus] === -dir) {
        jump(orbs[focus], dir);
        jump(ghosts[focus], -dir);
        offsets[focus] = dir;
        ghostOffsets[focus] = -dir;
      }
      ghosts.forEach(function (g, i) {
        var p = i === focus ? (dir ? (dir > 0 ? -2 : 2) : 9) : -offsetOf(i);
        move(g, p, ghostOffsets[i], dir);
        ghostOffsets[i] = p;
      });
      orbs.forEach(function (orb, i) {
        var p = offsetOf(i);
        move(orb, p, offsets[i], dir);
        offsets[i] = p;
        var label = orb.dataset.label;
        orb.setAttribute('aria-label', p === 0 ? label + ': ' + orb.dataset.action : label + ': rotate into focus');
        if (p === 0) orb.setAttribute('aria-current', 'true'); else orb.removeAttribute('aria-current');
        /* Bara klotet i mitten är ett tabbstopp; sidokloten nås med pilarna */
        if (p === 0) orb.removeAttribute('tabindex'); else orb.setAttribute('tabindex', '-1');
      });

      var key = keys[focus];
      var center = orbs[focus];

      /* Bakgrundsfärg + glöd via CSS (body[data-category] / body[data-project]) */
      document.body.setAttribute(bodyAttr, key);
      if (themeMeta && center.dataset.theme) themeMeta.setAttribute('content', center.dataset.theme);

      syncScenes();

      /* Infopanelen för projektet i fokus; övriga går inte att tabba till */
      panels.forEach(function (panel) {
        var on = panel.dataset.key === key;
        panel.classList.toggle('is-active', on);
        panel.setAttribute('aria-hidden', String(!on));
        if (on) panel.removeAttribute('inert'); else panel.setAttribute('inert', '');
      });

      /* Undertexten byts med kort fade */
      if (sub) {
        var swap = function () {
          sub.innerHTML = '<strong>' + center.dataset.label + '</strong> · ' + center.dataset.desc;
          sub.classList.remove('is-swap');
        };
        if (dir) {
          window.clearTimeout(subTimer);
          sub.classList.add('is-swap');
          subTimer = window.setTimeout(swap, 180);
        } else {
          swap();
        }
      }

      /* Adressen minns valet, så "tillbaka" från en projektsida landar rätt.
         Skrivs först när rotationen vilat en stund (Safari begränsar antalet anrop). */
      if (dir && window.history.replaceState) {
        window.clearTimeout(hashTimer);
        hashTimer = window.setTimeout(function () {
          try { window.history.replaceState(null, '', '#' + keys[focus]); } catch (err) { /* ignoreras */ }
        }, 250);
      }
    }

    /* Bilder i scener som inte syns från början har data-src i HTML:en, så
       att första skärmen bara laddar det som visas. De hämtas när scenen
       roteras in, eller i lugn och ro när sidan väl är färdigladdad. */
    /* Vid första visningen räcker första bilden i ett bildspel (de andra
       tonas in först efter flera sekunder); resten kommer med förladdningen. */
    var scenesBooted = false;
    function loadLayer(layer, firstOnly) {
      layer.querySelectorAll('img[data-src]').forEach(function (img) {
        if (firstOnly && /scene__img--[bc]/.test(img.className)) return;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      });
    }
    window.addEventListener('load', function () {
      var preload = function () { scenes.forEach(loadLayer); };
      if (window.requestIdleCallback) window.requestIdleCallback(preload, { timeout: 3000 });
      else window.setTimeout(preload, 1200);
    });

    /* Scenlagren: bara det aktiva syns och spelar */
    function syncScenes() {
      var key = keys[focus];
      scenes.forEach(function (layer) {
        var on = layer.dataset.scene === key;
        if (on) loadLayer(layer, !scenesBooted);
        layer.classList.toggle('is-active', on);
        layer.querySelectorAll('video').forEach(function (v) {
          if (on && !reducedMotion) {
            var pr = v.play();
            if (pr && pr.catch) pr.catch(function () {});
          } else {
            v.pause();
          }
        });
      });
      syncHexScenes();
    }

    function rotate(dir, steps) {
      focus = ((focus + dir * (steps || 1)) % n + n) % n;
      lastDir = dir;
      apply(dir);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { rotate(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { rotate(1); });

    /* Fokuserat klot är en vanlig länk. Ett klot på sidan roteras in i stället. */
    orbs.forEach(function (orb, i) {
      orb.addEventListener('click', function (e) {
        var p = offsets[i];
        if (p === 0) return;
        e.preventDefault();
        rotate(p > 0 ? 1 : -1, Math.abs(p));
      });
    });
    ghosts.forEach(function (g, i) {
      g.addEventListener('click', function (e) {
        e.preventDefault();
        rotate(ghostOffsets[i] > 0 ? 1 : -1);
      });
    });

    /* Piltangenter roterar klotet, men bara när karusellen syns (eller fokus
       står i den). Fokus följer med, så det aldrig hamnar i en inaktiv panel. */
    var orbitInView = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        orbitInView = entries[0].isIntersecting;
      }, { threshold: 0.5 }).observe(orbit);
    }
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.defaultPrevented || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
      if (!orbitInView && !orbit.contains(e.target)) return;
      var active = document.activeElement;
      var wasOrb = orbs.indexOf(active) >= 0;
      var wasPanel = active && active.closest && active.closest('.orbit__panel');
      rotate(e.key === 'ArrowLeft' ? -1 : 1);
      if (wasOrb) {
        orbs[focus].focus({ preventScroll: true });
      } else if (wasPanel) {
        var target = orbit.querySelector('.orbit__panel.is-active .btn');
        if (target) target.focus({ preventScroll: true });
      }
    });

    /* Första läget sätts utan övergångar, så en direktlänk (t.ex. #vpp)
       inte glider in från HTML:ens standardläge. */
    var hashTimer = null;
    document.documentElement.classList.add('orbit-init');
    apply(0);
    scenesBooted = true;
    void document.body.offsetWidth;
    document.documentElement.classList.remove('orbit-init');

    /* Tillbaka-knappen kan återställa sidan från cache med pausad video */
    window.addEventListener('pageshow', function (e) { if (e.persisted) syncScenes(); });
  }

  /* ============ Videor som ska spela av sig själva ============ */
  /* Bara när besökaren inte bett om mindre rörelse. Annars står postern kvar
     och videon får vanliga kontroller, så den går att spela på eget initiativ. */
  var autoVideos = document.querySelectorAll('video[data-autoplay]');
  function playAutoVideos() {
    autoVideos.forEach(function (v) {
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () {});
    });
  }
  if (reducedMotion) {
    autoVideos.forEach(function (v) { v.controls = true; });
  } else {
    playAutoVideos();
    window.addEventListener('pageshow', function (e) { if (e.persisted) playAutoVideos(); });
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
