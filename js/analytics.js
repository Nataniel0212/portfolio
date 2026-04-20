/* ========================================
   Analytics - Google Analytics 4 + custom events
   ========================================

   SETUP (gör detta en gång):
   1. Gå till https://analytics.google.com/ och logga in
   2. Admin -> Skapa Property -> "Portfolio" -> Web -> lägg till din URL
   3. Kopiera din Measurement ID (ser ut som G-XXXXXXXXXX)
   4. Klistra in den nedanför, mellan citattecknen

   Besökare får en consent-banner. Ingen tracking sker innan de klickar "Acceptera".
======================================== */

const GA_MEASUREMENT_ID = 'G-WQGPXC0D5Z';

const CONSENT_KEY = 'analytics-consent';

document.addEventListener('DOMContentLoaded', () => {
  const choice = readConsent();
  if (choice === 'accepted') {
    loadAnalytics();
  } else if (choice !== 'declined') {
    showBanner();
  }
});

function readConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? JSON.parse(raw).choice : null;
  } catch {
    return null;
  }
}

function writeConsent(choice) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice, at: Date.now() }));
}

function showBanner() {
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie-inställningar');
  banner.innerHTML = `
    <p class="cookie-banner__text">Denna sida använder anonyma cookies för att förstå hur den används. Ingen personlig data lagras.</p>
    <div class="cookie-banner__actions">
      <button type="button" class="cookie-banner__btn cookie-banner__btn--decline">Neka</button>
      <button type="button" class="cookie-banner__btn cookie-banner__btn--accept">Acceptera</button>
    </div>
  `;
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('is-visible'));

  banner.querySelector('.cookie-banner__btn--accept').addEventListener('click', () => {
    writeConsent('accepted');
    hideBanner(banner);
    loadAnalytics();
  });
  banner.querySelector('.cookie-banner__btn--decline').addEventListener('click', () => {
    writeConsent('declined');
    hideBanner(banner);
  });
}

function hideBanner(banner) {
  banner.classList.remove('is-visible');
  setTimeout(() => banner.remove(), 300);
}

function loadAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    console.info('[analytics] GA_MEASUREMENT_ID ej satt — tracking avstängt. Klistra in din ID i js/analytics.js.');
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });

  trackPageContext();
  attachEventTracking();
}

function trackEvent(name, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

function trackPageContext() {
  const filename = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (filename.startsWith('personligt_brev_')) {
    const company = filename.replace('personligt_brev_', '').replace('.html', '');
    trackEvent('cover_letter_view', { company });
  } else if (filename === 'cv.html') {
    trackEvent('cv_view');
  }
}

function attachEventTracking() {
  document.querySelectorAll('a[href^="mailto:"], a[href*="github.com"], a[href*="linkedin.com"]').forEach(a => {
    a.addEventListener('click', () => {
      const channel = a.href.startsWith('mailto:') ? 'email'
        : a.href.includes('github') ? 'github'
        : 'linkedin';
      trackEvent('contact_click', { channel });
    });
  });

  document.querySelectorAll('.project__dropdown').forEach(d => {
    d.addEventListener('toggle', () => {
      if (!d.open) return;
      const project = d.closest('[id^="project-"]')?.id || 'unknown';
      const label = d.querySelector('summary')?.textContent?.trim().slice(0, 60) || 'section';
      trackEvent('project_expand', { project, section: label });
    });
  });

  document.querySelectorAll('.thesis-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const project = btn.closest('[id^="project-"]')?.id || 'unknown';
      trackEvent('project_step_view', { project, step: btn.dataset.step });
    });
  });

  document.querySelectorAll('.hero__cta .btn').forEach(b => {
    b.addEventListener('click', () => {
      trackEvent('hero_cta_click', { label: b.textContent.trim() });
    });
  });

  document.getElementById('themeToggle')?.addEventListener('click', () => trackEvent('theme_toggle'));
  document.getElementById('backToTop')?.addEventListener('click', () => trackEvent('back_to_top_click'));

  const seen = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.id && !seen.has(e.target.id)) {
        seen.add(e.target.id);
        trackEvent('section_view', { section: e.target.id });
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('section[id]').forEach(s => io.observe(s));

  const milestones = [25, 50, 75, 100];
  const fired = new Set();
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    const pct = Math.round((window.scrollY / max) * 100);
    milestones.forEach(m => {
      if (pct >= m && !fired.has(m)) {
        fired.add(m);
        trackEvent('scroll_depth', { depth: m });
      }
    });
  }, { passive: true });
}
