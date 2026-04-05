/* ========================================
   Portfolio - Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initTypingEffect();
  initScrollReveal();
  initCounters();
  initSmoothScroll();
  initImageGalleries();
  initThesisSteps();
  initVppSteps();
});

/* ----------------------------------------
   Navbar scroll effect
   ---------------------------------------- */
function initNavbar() {
  const nav = document.getElementById('nav');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('nav--scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ----------------------------------------
   Mobile menu
   ---------------------------------------- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const links = mobileMenu.querySelectorAll('.mobile-menu__link');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* ----------------------------------------
   Typing effect for hero subtitle
   ---------------------------------------- */
function initTypingEffect() {
  const element = document.getElementById('typedText');
  const titles = [
    'Full-Stack Developer',
    'Data Scientist',
    'Problem Solver',
  ];

  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let pauseTimer = null;

  function type() {
    const current = titles[titleIndex];

    if (!isDeleting) {
      element.textContent = current.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        pauseTimer = setTimeout(() => {
          isDeleting = true;
          type();
        }, 2200);
        return;
      }
      setTimeout(type, 80);
    } else {
      element.textContent = current.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, 40);
    }
  }

  // Start after hero animations finish
  setTimeout(type, 1200);
}

/* ----------------------------------------
   Scroll reveal (Intersection Observer)
   ---------------------------------------- */
function initScrollReveal() {
  // Standard reveal elements
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Pipeline steps - staggered reveal
  const pipelineSteps = document.querySelectorAll('.reveal-step');

  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find all steps and animate them sequentially
        pipelineSteps.forEach((step, index) => {
          setTimeout(() => {
            step.classList.add('visible');
          }, index * 150);
        });
        // Unobserve all after triggering
        pipelineSteps.forEach(step => stepObserver.unobserve(step));
      }
    });
  }, {
    threshold: 0.2,
  });

  // Only observe the first step to trigger the sequence
  if (pipelineSteps.length > 0) {
    stepObserver.observe(pipelineSteps[0]);
  }
}

/* ----------------------------------------
   Animated counters
   ---------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-target]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5,
  });

  counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element) {
  const target = parseFloat(element.dataset.target);
  const suffix = element.dataset.suffix || '';
  const decimals = parseInt(element.dataset.decimals) || 0;
  const duration = 1800;
  const startTime = performance.now();

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const current = easedProgress * target;

    element.textContent = current.toFixed(decimals) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toFixed(decimals) + suffix;
    }
  }

  requestAnimationFrame(update);
}

/* ----------------------------------------
   Smooth scroll for anchor links
   ---------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80; // nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ----------------------------------------
   Image gallery (thumbnail → main image)
   ---------------------------------------- */
function initImageGalleries() {
  document.querySelectorAll('.img-showcase').forEach(gallery => {
    const mainImg = gallery.querySelector('.img-showcase__img');
    const thumbs = gallery.querySelectorAll('.img-showcase__thumb');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const src = thumb.dataset.src;
        const alt = thumb.querySelector('img').alt;

        // Fade transition
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = src;
          mainImg.alt = alt;
          mainImg.style.opacity = '1';
        }, 200);

        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  });
}

/* ----------------------------------------
   Thesis interactive steps
   ---------------------------------------- */
function initThesisSteps() {
  const nav = document.getElementById('thesisStepsNav');
  const content = document.getElementById('thesisContent');
  const prevBtn = document.getElementById('thesisPrev');
  const nextBtn = document.getElementById('thesisNext');
  const counter = document.getElementById('thesisCurrentStep');

  if (!nav || !content) return;

  const stepBtns = nav.querySelectorAll('.thesis-step-btn');
  const panels = content.querySelectorAll('.thesis-panel');
  let current = 1;
  const total = stepBtns.length;

  function goToStep(step) {
    current = step;

    // Update buttons
    stepBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.step) === step);
    });

    // Update panels
    panels.forEach(panel => {
      panel.classList.toggle('active', parseInt(panel.dataset.panel) === step);
    });

    // Update nav
    prevBtn.disabled = step === 1;
    nextBtn.disabled = step === total;
    counter.textContent = step;

    // Scroll the active step button into view in the nav
    const activeBtn = nav.querySelector('.thesis-step-btn.active');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  // Click on step buttons
  stepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(parseInt(btn.dataset.step));
    });
  });

  // Prev / Next
  prevBtn.addEventListener('click', () => {
    if (current > 1) goToStep(current - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (current < total) goToStep(current + 1);
  });
}

/* ----------------------------------------
   VPP interactive steps
   ---------------------------------------- */
function initVppSteps() {
  const nav = document.getElementById('vppStepsNav');
  const content = document.getElementById('vppContent');
  const prevBtn = document.getElementById('vppPrev');
  const nextBtn = document.getElementById('vppNext');
  const counter = document.getElementById('vppCurrentStep');

  if (!nav || !content) return;

  const stepBtns = nav.querySelectorAll('.thesis-step-btn');
  const panels = content.querySelectorAll('.thesis-panel');
  let current = 1;
  const total = stepBtns.length;

  function goToStep(step) {
    current = step;
    stepBtns.forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.step) === step));
    panels.forEach(panel => panel.classList.toggle('active', parseInt(panel.dataset.panel) === step));
    prevBtn.disabled = step === 1;
    nextBtn.disabled = step === total;
    counter.textContent = step;

    const activeBtn = nav.querySelector('.thesis-step-btn.active');
    if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  stepBtns.forEach(btn => btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.step))));
  prevBtn.addEventListener('click', () => { if (current > 1) goToStep(current - 1); });
  nextBtn.addEventListener('click', () => { if (current < total) goToStep(current + 1); });
}
