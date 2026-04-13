/* ========================================
   Portfolio - Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  bustImageCache();
  initNavbar();
  initMobileMenu();
  initTypingEffect();
  initTerminal();
  initScrollReveal();
  initCounters();
  initSmoothScroll();
  initImageGalleries();
  initThesisSteps();
  initVppSteps();
  initPanelDropdowns();
  initLightbox();
});

/* ----------------------------------------
   Cache busting for images
   ---------------------------------------- */
function bustImageCache() {
  const v = '?v=3';
  document.querySelectorAll('img[src]').forEach(img => {
    if (img.src.includes('assets/') && !img.src.includes('?v=')) {
      img.src = img.getAttribute('src') + v;
    }
  });
  document.querySelectorAll('[data-src]').forEach(el => {
    if (!el.dataset.src.includes('?v=')) {
      el.dataset.src = el.dataset.src + v;
    }
  });
}

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
   Terminal animation in hero
   ---------------------------------------- */
function initTerminal() {
  const body = document.getElementById('terminalBody');
  if (!body) return;

  const lines = [
    { type: 'output', content: '<span class="terminal__bracket">{</span>' },
    { type: 'output', content: '  <span class="terminal__key">"name"</span>: <span class="terminal__val">"Nataniel Ataseven"</span>,' },
    { type: 'output', content: '  <span class="terminal__key">"role"</span>: <span class="terminal__val">"Developer & Data Scientist"</span>,' },
    { type: 'output', content: '  <span class="terminal__key">"education"</span>: <span class="terminal__val">"MSc Industrial Engineering"</span>,' },
    { type: 'output', content: '  <span class="terminal__key">"skills"</span>: <span class="terminal__val">["Python", "React", "TypeScript",</span>' },
    { type: 'output', content: '    <span class="terminal__val">"TensorFlow", "OpenCV", "Node.js"]</span>,' },
    { type: 'output', content: '  <span class="terminal__key">"projects"</span>: <span class="terminal__val">3</span>,' },
    { type: 'output', content: '  <span class="terminal__key">"transactions_analyzed"</span>: <span class="terminal__val">5_400_000</span>' },
    { type: 'output', content: '<span class="terminal__bracket">}</span>' },
    { type: 'cmd', content: '<span class="terminal__prompt">$</span> <span class="terminal__comment"># scroll down to explore ↓</span>' },
  ];

  let i = 0;
  const baseDelay = 1200; // wait for hero text animations

  function addLine() {
    if (i >= lines.length) return;
    const line = lines[i];
    const div = document.createElement('div');
    div.className = 'terminal__line';
    div.innerHTML = line.content;
    div.style.animationDelay = '0s';
    body.appendChild(div);
    i++;
    setTimeout(addLine, 60 + Math.random() * 40);
  }

  setTimeout(addLine, baseDelay);
}

/* ----------------------------------------
   Scroll reveal (Intersection Observer)
   ---------------------------------------- */
function initScrollReveal() {
  // Standard reveal elements (includes stagger-children parents)
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px',
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

    // Scroll the active step button into view in the nav
    const activeBtn = nav.querySelector('.thesis-step-btn.active');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  stepBtns.forEach(btn => {
    btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.step)));
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

    const activeBtn = nav.querySelector('.thesis-step-btn.active');
    if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  stepBtns.forEach(btn => btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.step))));
}

/* ----------------------------------------
   Convert tech & config sections to dropdowns
   ---------------------------------------- */
function initPanelDropdowns() {
  document.querySelectorAll('.thesis-panel__tech, .thesis-panel__settings').forEach(section => {
    const label = section.querySelector('.thesis-panel__tech-label, .thesis-panel__settings-label');
    if (!label) return;

    const details = document.createElement('details');
    details.className = 'project__dropdown';

    const summary = document.createElement('summary');
    summary.className = 'project__dropdown-title';
    summary.textContent = label.textContent;

    section.parentNode.insertBefore(details, section);
    details.appendChild(summary);

    // Move all children except the label into a content wrapper
    const content = document.createElement('div');
    content.className = 'project__dropdown-content';
    const children = [...section.children].filter(c => c !== label);
    children.forEach(child => content.appendChild(child));
    details.appendChild(content);

    section.remove();
  });
}

/* ----------------------------------------
   Lightbox for images
   ---------------------------------------- */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  if (!lightbox) return;

  // All clickable images
  const targets = document.querySelectorAll('.img-showcase__img, .thesis-panel__preview img');

  targets.forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close lightbox
  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}
