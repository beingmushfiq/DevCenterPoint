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
import { initTheme } from '../ui/theme.js';

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
  initTheme();
  initNav();
  initCursor({ reduced: reduceMotion });
  initReveals();
  initLightInteractions();
  initCommandPalette();
  initScopeEstimator();

  /* Everything below only applies to pages with the 3D field. */
  if (!WANTS_SCENE) {
    window.__dcpReady = true;
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

/* ---- Instant Quick Search (Command Palette) ----------------- */
function initCommandPalette() {
  const palette = document.getElementById('commandPalette');
  const input = document.getElementById('commandPaletteInput');
  const resultsEl = document.getElementById('commandPaletteResults');
  const openBtn = document.getElementById('openCommandPalette');
  const backdrop = document.getElementById('commandPaletteBackdrop');
  const escBtn = document.getElementById('commandPaletteEsc');

  if (!palette || !input || !resultsEl) return;

  let selectedIndex = -1;
  let currentResults = [];

  const open = () => {
    palette.classList.add('is-open');
    palette.setAttribute('aria-hidden', 'false');
    input.value = '';
    selectedIndex = -1;
    resultsEl.innerHTML = '<div class="command-palette__hint">Type at least 2 characters to search across the entire platform...</div>';
    setTimeout(() => input.focus(), 50);
  };

  const close = () => {
    palette.classList.remove('is-open');
    palette.setAttribute('aria-hidden', 'true');
  };

  if (openBtn) openBtn.addEventListener('click', open);
  if (backdrop) backdrop.addEventListener('click', close);
  if (escBtn) escBtn.addEventListener('click', close);

  /* Global keyboard shortcut: Cmd+K / Ctrl+K & Escape */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (palette.classList.contains('is-open')) close();
      else open();
    } else if (e.key === 'Escape' && palette.classList.contains('is-open')) {
      close();
    }
  });

  /* Arrow key navigation & Enter */
  input.addEventListener('keydown', (e) => {
    if (!currentResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % currentResults.length;
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
      updateSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
        window.location.href = currentResults[selectedIndex].url;
      }
    }
  });

  const updateSelection = () => {
    const items = resultsEl.querySelectorAll('.command-palette__item');
    items.forEach((item, idx) => {
      item.classList.toggle('is-selected', idx === selectedIndex);
      if (idx === selectedIndex) item.scrollIntoView({ block: 'nearest' });
    });
  };

  /* Debounced Search */
  let timer = 0;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();

    if (q.length < 2) {
      currentResults = [];
      resultsEl.innerHTML = '<div class="command-palette__hint">Type at least 2 characters to search across the entire platform...</div>';
      return;
    }

    timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        currentResults = data.results || [];
        selectedIndex = currentResults.length ? 0 : -1;

        if (!currentResults.length) {
          resultsEl.innerHTML = `<div class="command-palette__hint">No results found for "${q}".</div>`;
          return;
        }

        resultsEl.innerHTML = currentResults.map((item, idx) => `
          <a class="command-palette__item ${idx === 0 ? 'is-selected' : ''}" href="${item.url}">
            <div>
              <div class="command-palette__item-title">${item.title}</div>
              ${item.snippet ? `<div class="command-palette__item-snippet">${item.snippet.slice(0, 80)}...</div>` : ''}
            </div>
            <span class="command-palette__item-badge">${item.type}</span>
          </a>
        `).join('');
      } catch {
        resultsEl.innerHTML = '<div class="command-palette__hint">Search encountered an error. Please retry.</div>';
      }
    }, 200);
  });
}

/* ---- Project Timeline & Team Calculator --------------------- */
function initScopeEstimator() {
  const scopeSelect = document.getElementById('estimatorScope');
  const timelineOut = document.getElementById('estimatorTimelineOut');
  const teamOut = document.getElementById('estimatorTeamOut');
  const attachBtn = document.getElementById('attachEstimateBtn');
  const messageArea = document.getElementById('message');

  if (!scopeSelect || !timelineOut || !teamOut) return;

  const update = () => {
    const opt = scopeSelect.selectedOptions[0];
    if (!opt) return;
    timelineOut.textContent = opt.dataset.weeks || '4 to 6 weeks';
    teamOut.textContent = opt.dataset.team || '1 Lead + 1 Senior';
  };

  scopeSelect.addEventListener('change', update);
  update();

  if (attachBtn && messageArea) {
    attachBtn.addEventListener('click', () => {
      const opt = scopeSelect.selectedOptions[0];
      const text = `\n\n--- Project Estimation Parameter ---\nObjective: ${opt.text}\nEstimated Timeline: ${opt.dataset.weeks}\nRecommended Team: ${opt.dataset.team}\n-----------------------------------\n`;
      if (!messageArea.value.includes(opt.text)) {
        messageArea.value = (messageArea.value.trim() + text).trim();
      }
      messageArea.focus();
      messageArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      attachBtn.textContent = 'Attached to message ✓';
      setTimeout(() => { attachBtn.textContent = 'Attach estimate to message ↓'; }, 2000);
    });
  }
}

document.addEventListener('DOMContentLoaded', app);

