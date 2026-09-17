import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export let activeLenis = null;

export function initSmoothScroll() {
  if (reduceMotion) return null;

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.4,
  });
  activeLenis = lenis;

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: 0, duration: 1.4 });
    });
  });

  return lenis;
}

/* Progress 0..1 over the entire document — drives the 3D core. */
export function trackProgress(onProgress) {
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    onProgress(max > 0 ? window.scrollY / max : 0);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

/* Scroll velocity, normalised to roughly -1..1 and decaying to zero.
   Feeds the 3D core's turbulence so the page feels physically linked
   to the hand on the wheel. */
export function trackVelocity(onVelocity) {
  let last = window.scrollY;
  let raf = 0;
  let running = true;

  const sample = () => {
    if (!running) return;
    const now = window.scrollY;
    const delta = now - last;
    last = now;
    // 45px per frame ≈ "fast scroll" → full intensity.
    onVelocity(Math.max(-1, Math.min(1, delta / 45)));
    raf = requestAnimationFrame(sample);
  };

  raf = requestAnimationFrame(sample);
  return () => { running = false; cancelAnimationFrame(raf); };
}

/* Split [data-split] headings into per-character spans so they can be
   choreographed, while PRESERVING inline markup (<em>, <strong>, <br>).
   Words are wrapped so the browser never breaks mid-word, and the
   visual spans are hidden from assistive tech behind an aria-label —
   screen readers still get one clean sentence. */
export function initSplitHeadings() {
  const groups = [];

  const splitTextNode = (node, out) => {
    const frag = document.createDocumentFragment();
    /* Keep whitespace separate so it collapses naturally. */
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }

      const word = document.createElement('span');
      word.className = 'split__word';
      word.setAttribute('aria-hidden', 'true');   // name comes from the parent's aria-label
      [...part].forEach((ch) => {
        const c = document.createElement('span');
        c.className = 'split__char';
        c.textContent = ch;
        word.appendChild(c);
        out.push(c);
      });
      frag.appendChild(word);
    });
    node.parentNode.replaceChild(frag, node);
  };

  const walk = (node, out) => {
    if (node.nodeType === Node.TEXT_NODE) { splitTextNode(node, out); return; }
    if (node.nodeType !== Node.ELEMENT_NODE || node.tagName === 'BR') return;
    [...node.childNodes].forEach((child) => walk(child, out));
  };

  document.querySelectorAll('[data-split]').forEach((el) => {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    /* aria-label provides the accessible name for the heading, so screen
       readers announce one clean sentence instead of spelling out
       individual characters. We must NOT aria-hide the heading itself —
       that would remove it from the accessibility tree entirely. */
    el.setAttribute('aria-label', label);

    const chars = [];
    [...el.childNodes].forEach((child) => walk(child, chars));
    if (chars.length) groups.push({ el, chars });
  });

  return groups;
}

/* Cinematic auto-intro: the system ignites from nothing, and the hero
   types itself in. Runs before any scrolling, so a visitor sees the
   product "come alive" instead of a static page. */
export function playIntro({ scene, onIgniteDone } = {}) {
  const flash = document.getElementById('flash');

  if (reduceMotion) {
    scene?.setIgnite(1);
    onIgniteDone?.();
    return gsap.timeline();
  }

  const tl = gsap.timeline();
  const ignite = { v: 0 };

  tl.to(ignite, {
    v: 1,
    duration: 2.8,
    ease: 'power2.inOut',
    onUpdate: () => scene?.setIgnite(ignite.v),
    onComplete: () => onIgniteDone?.(),
  }, 0);

  if (flash) {
    tl.fromTo(flash, { opacity: 0 }, { opacity: 0.85, duration: 0.45, ease: 'power2.out' }, 0.25);
    tl.to(flash, { opacity: 0, duration: 1.2, ease: 'power2.in' }, 0.7);
  }

  return tl;
}

/* Animate split characters in, staggered. Used for the hero heading at
   intro time and for later chapters on scroll. */
export function revealSplit(chars, { delay = 0, scroll = false, trigger = null } = {}) {
  if (!chars.length) return null;

  const config = {
    opacity: 1,
    y: 0,
    rotateX: 0,
    duration: reduceMotion ? 0.01 : 0.7,
    ease: 'power3.out',
    stagger: reduceMotion ? 0 : 0.022,
    delay: reduceMotion ? 0 : delay,
  };

  gsap.set(chars, { opacity: 0, y: reduceMotion ? 0 : '0.55em', rotateX: reduceMotion ? 0 : -55 });

  if (scroll && trigger) {
    config.scrollTrigger = { trigger, start: 'top 78%', toggleActions: 'play none none none' };
    config.delay = 0;
  }
  return gsap.to(chars, config);
}


/* Chapter observation → sets active dot + notifies listeners. */
export function trackChapters(sections, onChange) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = sections.indexOf(entry.target);
          if (idx > -1) onChange(idx, entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((s) => io.observe(s));
  return io;
}

/* Staggered entrance reveals for [data-reveal] elements.
   The FIRST chapter is animated on load — never left waiting on a
   scroll trigger, which would otherwise leave the hero invisible. */
export function initReveals() {
  const chapters = [...document.querySelectorAll('.chapter')];

  chapters.forEach((chapter, ci) => {
    /* Headings managed by the split-character system are excluded here;
       two competing tweens on the same node would fight each other. */
    const els = [...chapter.querySelectorAll('[data-reveal]')]
      .filter((el) => !el.hasAttribute('data-split') && !el.closest('[data-split]'));
    if (!els.length) return;

    gsap.set(els, { opacity: 0, y: reduceMotion ? 0 : 28 });

    const tween = {
      opacity: 1,
      y: 0,
      duration: reduceMotion ? 0.01 : 0.9,
      ease: 'power3.out',
      stagger: reduceMotion ? 0 : 0.09,
    };

    if (ci === 0) {
      /* Hero plays straight away — the visitor must never see a void. */
      gsap.to(els, { ...tween, delay: reduceMotion ? 0 : 0.15 });
    } else {
      gsap.to(els, {
        ...tween,
        scrollTrigger: {
          trigger: chapter,
          start: 'top 72%',
          toggleActions: 'play none none none',
        },
      });
    }
  });
}

/* The cost curve's escalation bars: fill when the section enters,
   so the 1× → 10× → 100× argument reads as a single rising gesture
   rather than three static numbers. */
export function initCurve() {
  document.querySelectorAll('[data-curve]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => el.classList.add('is-in'),
    });
  });
}

/* Count-up for [data-count] metrics. */
export function initCounters() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: end,
          duration: reduceMotion ? 0.01 : 1.8,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
        });
      },
    });
  });
}

/* Text scramble for the naming chapter. */
export function initScramble() {
  const el = document.querySelector('[data-scramble]');
  if (!el) return;
  const final = el.dataset.scramble;
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·-';
  if (reduceMotion) { el.textContent = final; return; }

  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      let frame = 0;
      const total = 34;
      const id = setInterval(() => {
        frame++;
        el.textContent = final
          .split('')
          .map((c, i) => (i < (frame / total) * final.length ? c : glyphs[Math.floor(Math.random() * glyphs.length)]))
          .join('');
        if (frame >= total) { clearInterval(id); el.textContent = final; }
      }, 45);
    },
  });
}

/* Nav background once scrolling begins. */
export function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ============================================================
   PRECISION SEGMENT NAVIGATOR & DRAGGABLE SCRUBBER
   ------------------------------------------------------------
   - Generous hit targets (30px vertical target per segment)
   - Real-time dragging & scrubbing with magnetic chapter snaps
   - Sleek glassmorphic telemetry shell
   - Draggable reticle thumb with illuminated core
   - Real-time floating HUD tooltip with section titles & %
   - Direct integration with Lenis smooth scroll
   ============================================================ */
export function initRail(sections, onChapter) {
  const fill = document.getElementById('railFill');
  const dots = document.getElementById('dots');
  if (!dots || !sections || !sections.length) return null;

  dots.removeAttribute('aria-hidden');
  dots.setAttribute('role', 'region');
  dots.setAttribute('aria-label', 'Section Navigator and Scrubber');
  dots.innerHTML = '';

  // Extract titles and metadata for every chapter
  const chapters = sections.map((sec, i) => {
    const chNum = String(i + 1).padStart(2, '0');
    let title = `Chapter ${i + 1}`;
    const indexEl = sec.querySelector('.chapter__index, .eyebrow');
    if (indexEl) {
      const raw = indexEl.textContent.replace(/\s+/g, ' ').trim();
      const stripped = raw.replace(/^(DCP\s*\/\s*\d+|\d+)\s*[-—·/]?\s*/i, '').trim();
      if (stripped) title = stripped;
    } else {
      const heading = sec.querySelector('h1, h2, h3');
      if (heading) {
        const stripped = heading.textContent.replace(/\s+/g, ' ').trim();
        if (stripped) title = stripped;
      }
    }
    if (title.length > 28) title = title.slice(0, 26) + '…';
    return { sec, index: i, chNum, title };
  });

  // Create Shell
  const shell = document.createElement('div');
  shell.className = 'chapter-dots__shell';

  // Create Vertical Track & Thumb
  const track = document.createElement('div');
  track.className = 'chapter-dots__track';
  track.innerHTML = `
    <div class="chapter-dots__fill" id="railVerticalFill"></div>
    <div class="chapter-dots__thumb" id="railThumb" title="Drag to scrub">
      <span class="chapter-dots__thumb-pip"></span>
    </div>
  `;
  shell.appendChild(track);

  const verticalFill = track.querySelector('.chapter-dots__fill');
  const thumb = track.querySelector('.chapter-dots__thumb');

  // Create List of Buttons
  const list = document.createElement('div');
  list.className = 'chapter-dots__list';

  const buttons = chapters.map(({ sec, index, chNum, title }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chapter-dots__item';
    btn.setAttribute('aria-label', `Navigate to Chapter ${chNum}: ${title}`);
    btn.setAttribute('aria-current', index === 0 ? 'true' : 'false');
    btn.dataset.index = String(index);
    btn.innerHTML = `
      <span class="chapter-dots__num">${chNum}</span>
      <span class="chapter-dots__bar"></span>
    `;

    // Click handler (triggers only if not dragging)
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      scrollToChapter(index, { smooth: true });
    });

    list.appendChild(btn);
    return btn;
  });

  shell.appendChild(list);

  // Floating HUD Tooltip
  const hud = document.createElement('div');
  hud.className = 'chapter-dots__hud';
  hud.setAttribute('aria-hidden', 'true');
  hud.innerHTML = `
    <div class="chapter-dots__hud-meta">
      <span class="chapter-dots__hud-badge">CH 01</span>
      <span class="chapter-dots__hud-pct">0%</span>
    </div>
    <div class="chapter-dots__hud-title">Overview</div>
  `;
  dots.appendChild(shell);
  dots.appendChild(hud);

  const hudBadge = hud.querySelector('.chapter-dots__hud-badge');
  const hudPct = hud.querySelector('.chapter-dots__hud-pct');
  const hudTitle = hud.querySelector('.chapter-dots__hud-title');

  let activeIndex = 0;
  let isDragging = false;
  let hudHideTimeout = null;
  let pointerStartY = 0;

  const showHud = () => {
    clearTimeout(hudHideTimeout);
    hud.classList.add('is-visible');
  };

  const hideHud = (delay = 700) => {
    clearTimeout(hudHideTimeout);
    hudHideTimeout = setTimeout(() => {
      if (!isDragging) hud.classList.remove('is-visible');
    }, delay);
  };

  const updateHudContent = (index, pct) => {
    const ch = chapters[index] || chapters[0];
    hudBadge.textContent = `CH ${ch.chNum}`;
    hudPct.textContent = `${Math.round(pct * 100)}%`;
    hudTitle.textContent = ch.title;
  };

  const positionHud = (yPx) => {
    const dotsRect = dots.getBoundingClientRect();
    const relativeY = Math.max(16, Math.min(dotsRect.height - 16, yPx - dotsRect.top));
    hud.style.top = `${relativeY}px`;
  };

  const scrollToChapter = (index, { smooth = true } = {}) => {
    const target = sections[index];
    if (!target) return;
    if (activeLenis) {
      activeLenis.scrollTo(target, { duration: smooth && !reduceMotion ? 1.15 : 0 });
    } else {
      target.scrollIntoView({ behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
    }
  };

  // Compute scroll metrics for each section
  const getSectionMetrics = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return sections.map((sec, i) => {
      const top = sec.getBoundingClientRect().top + window.scrollY;
      return {
        index: i,
        top,
        pct: Math.min(1, Math.max(0, top / maxScroll)),
      };
    });
  };

  // Perform scrub from client Y coordinate
  const scrubToPointerY = (clientY, { snap = true } = {}) => {
    const trackRect = track.getBoundingClientRect();
    if (trackRect.height <= 0) return;

    let p = (clientY - trackRect.top) / trackRect.height;
    p = Math.max(0, Math.min(1, p));

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    let targetY = p * maxScroll;

    // Magnetic snapping: if within 3.5% of any section's target, snap cleanly
    const metrics = getSectionMetrics();
    let closestIndex = 0;
    let minDiff = Infinity;
    metrics.forEach((m) => {
      const diff = Math.abs(m.pct - p);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = m.index;
      }
    });

    if (snap && minDiff < 0.038) {
      p = metrics[closestIndex].pct;
      targetY = metrics[closestIndex].top;
    }

    if (activeLenis) {
      activeLenis.scrollTo(targetY, { immediate: true });
    } else {
      window.scrollTo(0, targetY);
    }

    // Update visuals immediately
    updateVisuals(p, closestIndex);
    positionHud(clientY);
    updateHudContent(closestIndex, p);
    showHud();
  };

  const updateVisuals = (p, currentIdx) => {
    const pctClamped = Math.max(0, Math.min(1, p));
    const pctStr = (pctClamped * 100).toFixed(1) + '%';

    if (fill) fill.style.width = pctStr;
    if (verticalFill) verticalFill.style.height = pctStr;
    if (thumb) thumb.style.top = pctStr;

    buttons.forEach((b, i) => {
      const isCurrent = i === currentIdx;
      b.setAttribute('aria-current', String(isCurrent));
      b.classList.toggle('is-passed', i < currentIdx);
    });
  };

  // Global scroll listener for natural scrolling
  const onWindowScroll = () => {
    if (isDragging) return; // Drag handler owns the updates while dragging
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    
    // Find closest section
    const metrics = getSectionMetrics();
    let currentIdx = 0;
    for (let i = 0; i < metrics.length; i++) {
      if (window.scrollY >= metrics[i].top - window.innerHeight * 0.45) {
        currentIdx = i;
      }
    }
    activeIndex = currentIdx;
    updateVisuals(p, currentIdx);
  };

  window.addEventListener('scroll', onWindowScroll, { passive: true });
  window.addEventListener('resize', onWindowScroll, { passive: true });

  // Initial sync
  setTimeout(onWindowScroll, 50);

  // Drag / Scrub Event Handlers on Shell
  shell.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDragging = true;
    pointerStartY = e.clientY;

    try { shell.setPointerCapture(e.pointerId); } catch {}
    dots.classList.add('is-dragging');
    document.body.classList.add('is-scrubbing');

    scrubToPointerY(e.clientY, { snap: false });
    e.preventDefault();
  });

  shell.addEventListener('pointermove', (e) => {
    if (isDragging) {
      scrubToPointerY(e.clientY, { snap: true });
    } else {
      // Hover preview: update HUD
      const trackRect = track.getBoundingClientRect();
      if (trackRect.height > 0) {
        let p = (e.clientY - trackRect.top) / trackRect.height;
        p = Math.max(0, Math.min(1, p));
        const metrics = getSectionMetrics();
        let closestIndex = 0;
        let minDiff = Infinity;
        metrics.forEach((m) => {
          const diff = Math.abs(m.pct - p);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = m.index;
          }
        });
        positionHud(e.clientY);
        updateHudContent(closestIndex, p);
        showHud();
      }
    }
  });

  const onPointerEnd = (e) => {
    if (isDragging) {
      try { shell.releasePointerCapture(e.pointerId); } catch {}
      isDragging = false;
      dots.classList.remove('is-dragging');
      document.body.classList.remove('is-scrubbing');
      hideHud(1000);
    }
  };

  shell.addEventListener('pointerup', onPointerEnd);
  shell.addEventListener('pointercancel', onPointerEnd);

  shell.addEventListener('mouseenter', () => {
    showHud();
    const thumbRect = thumb.getBoundingClientRect();
    positionHud(thumbRect.top + thumbRect.height / 2);
    updateHudContent(activeIndex, activeIndex / Math.max(1, chapters.length - 1));
  });

  shell.addEventListener('mouseleave', () => {
    if (!isDragging) hideHud(300);
  });

  // Keyboard navigation support on shell
  shell.setAttribute('tabindex', '0');
  shell.setAttribute('aria-label', 'Use arrow keys to jump between sections');
  shell.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.min(sections.length - 1, activeIndex + 1);
      scrollToChapter(next, { smooth: true });
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = Math.max(0, activeIndex - 1);
      scrollToChapter(prev, { smooth: true });
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToChapter(0, { smooth: true });
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToChapter(sections.length - 1, { smooth: true });
    }
  });

  // Return updater function for trackChapters IntersectionObserver
  return (idx) => {
    activeIndex = idx;
    if (!isDragging) {
      buttons.forEach((b, i) => {
        b.setAttribute('aria-current', String(i === idx));
        b.classList.toggle('is-passed', i < idx);
      });
      if (onChapter) onChapter(idx);
    }
  };
}
