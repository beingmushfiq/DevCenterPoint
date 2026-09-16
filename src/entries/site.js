/* ============================================================
   SITE ENTRY

   Replaces the old single-page `main.js`. The behaviour now
   branches on `window.__DCP.pageType`, set by the EJS template:

     'home'    → full 3D scene + chapter choreography + intro
     'index'   → 3D scene, no chapters; slower, calmer drift
     'detail'  → no WebGL at all; text and motion only

   Why three profiles rather than one: a case-study page is a
   reading surface. Pulling in a 477 KB WebGL bundle to render a
   background nobody is looking at is the single easiest way to
   make a content page feel slow. The scene loads only where it
   earns its place.
   ============================================================ */

import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/pages.css';

import { initCursor } from '../ui/cursor.js';
import { initNav, initReveals, reduceMotion } from '../ui/motion.js';

const PAGE = (typeof window !== 'undefined' && window.__DCP) || {};
const PAGE_TYPE = PAGE.pageType || 'detail';
const WANTS_SCENE = PAGE_TYPE === 'home' || PAGE_TYPE === 'index';

/* ---- boot overlay -------------------------------------------
   Only pages that carry the overlay run this. Content pages skip
   it entirely and paint immediately. */
function runBoot(onDone) {
  const boot = document.getElementById('boot');
  if (!boot) { onDone(); return; }

  const fill = document.getElementById('bootFill');
  const pct = document.getElementById('bootPct');
  let p = 0;

  const finish = () => {
    window.__dcpReady = true;
    boot.classList.add('is-done');
    onDone();
  };

  const climb = setInterval(() => {
    p = Math.min(100, p + Math.random() * 24 + 12);
    if (fill) fill.style.width = p + '%';
    if (pct) pct.textContent = Math.round(p) + '%';
    if (p >= 100) { clearInterval(climb); setTimeout(finish, 100); }
  }, reduceMotion ? 10 : 62);
}

/* ---- app ----------------------------------------------------- */

async function app() {
  initNav();
  initCursor({ reduced: reduceMotion });
  initReveals();

  /* Everything below only applies to pages with the 3D field. */
  if (!WANTS_SCENE) {
    /* Reveal anything the reveal pass skipped, and we are done. */
    window.__dcpReady = true;
    initLightInteractions();
    return;
  }

  const { Scene } = await import('../three/scene.js');
  const { mountSpline } = await import('../three/spline.js');
  const {
    initSmoothScroll, trackProgress, trackVelocity, trackChapters,
    initCounters, initCurve, initScramble, initRail,
    initSplitHeadings, revealSplit, playIntro,
  } = await import('../ui/motion.js');

  const canvas = document.getElementById('webgl');
  const isHome = PAGE_TYPE === 'home';
  const sections = isHome ? [...document.querySelectorAll('.chapter')] : [];

  /* Split headings before the generic reveal pass so the two do not
     fight over the same nodes. */
  const splitGroups = isHome ? initSplitHeadings() : [];
  const inHero = (g) => g.el.closest('.chapter--hero');
  const heroChars = splitGroups.filter(inHero).flatMap((g) => g.chars);
  const restGroups = splitGroups.filter((g) => !inHero(g));

  let scene = null;
  if (canvas) {
    try {
      scene = new Scene(canvas, { profile: isHome ? 'full' : 'calm' });
      scene.setIgnite(isHome ? 0 : 1);
    } catch (err) {
      console.warn('WebGL unavailable — running in DOM-only mode.', err);
    }
  }

  let spline = { mounted: false };
  const slot = document.getElementById('spline-slot');
  if (slot) {
    try { spline = await mountSpline(slot); }
    catch (err) { console.warn('Spline slot skipped:', err); }
  }

  const start = () => {
    initSmoothScroll();

    if (scene) {
      trackProgress((p) => {
        scene.setProgress(p);
        /* Chapter-indexed scenes only exist on the homepage; on
           index pages the progress value alone drives the drift. */
        if (isHome && spline.mounted && spline.setChapter) {
          spline.setChapter(Math.round(p * Math.max(1, sections.length - 1)));
        }
      });
      trackVelocity((v) => scene.setVelocity(v));
    }

    if (isHome) {
      let setActiveDot = () => {};
      setActiveDot = initRail(sections, (idx) => {
        if (spline.mounted && spline.setChapter) spline.setChapter(idx);
      }) || setActiveDot;
      trackChapters(sections, (idx) => setActiveDot(idx));

      restGroups.forEach((g) => revealSplit(g.chars, { scroll: true, trigger: g.el }));
      initCurve();
      initScramble();
    }

    initCounters();

    if (isHome) {
      playIntro({ scene, onIgniteDone: () => { window.__dcpIntroDone = true; } });
      revealSplit(heroChars, { delay: reduceMotion ? 0 : 1.15 });
    }

    initLightInteractions();
    setTimeout(() => window.dispatchEvent(new Event('resize')), 260);
  };

  if (isHome) runBoot(start);
  else { window.__dcpReady = true; start(); }
}

/* Interactions that apply to every page: mobile nav, filters,
   accordions, form ergonomics. Kept dependency-free so the cheap
   pages stay cheap. */
function initLightInteractions() {
  /* --- mobile nav --- */
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  /* --- FAQ / disclosure accordions --- */
  document.querySelectorAll('[data-accordion]').forEach((item) => {
    const trigger = item.querySelector('button, [data-accordion-trigger]');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(open));
    });
  });

  /* --- case-study filtering --- */
  const filterBar = document.querySelector('[data-filters]');
  if (filterBar) {
    const items = [...document.querySelectorAll('[data-work-item]')];
    const countEl = document.querySelector('[data-work-count]');

    const apply = (key, value) => {
      let visible = 0;
      items.forEach((el) => {
        const match = value === 'all' || el.dataset[key] === value;
        el.hidden = !match;
        if (match) visible++;
      });
      if (countEl) countEl.textContent = String(visible);
    };

    filterBar.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('[data-filter]').forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        apply('sector', btn.dataset.filter);
      });
    });
  }

  /* --- current year in footers --- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

document.addEventListener('DOMContentLoaded', app);
