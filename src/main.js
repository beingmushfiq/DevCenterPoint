import { Scene } from './three/scene.js';
import { mountSpline } from './three/spline.js';
import { initCursor } from './ui/cursor.js';
import {
  initSmoothScroll, trackProgress, trackVelocity, trackChapters,
  initReveals, initCounters, initCurve, initScramble, initNav, initRail,
  initSplitHeadings, revealSplit, playIntro, reduceMotion,
} from './ui/motion.js';

/* ---------------- BOOT SEQUENCE ----------------
   Deliberately short. A long fake loader delays the very thing that
   makes people stay: seeing the site. The real spectacle is the
   ignition that follows, not the bar that precedes it. */
function runBoot(onDone) {
  const boot = document.getElementById('boot');
  const fill = document.getElementById('bootFill');
  const pct = document.getElementById('bootPct');
  let p = 0;
  const finish = () => {
    window.__dcpReady = true;
    if (boot) boot.classList.add('is-done');
    onDone();
  };
  const climb = setInterval(() => {
    p = Math.min(100, p + Math.random() * 24 + 12);
    if (fill) fill.style.width = p + '%';
    if (pct) pct.textContent = Math.round(p) + '%';
    if (p >= 100) {
      clearInterval(climb);
      setTimeout(finish, 100);
    }
  }, reduceMotion ? 10 : 62);
}

/* ---------------- APP ---------------- */
async function app() {
  const canvas = document.getElementById('webgl');
  const sections = [...document.querySelectorAll('.chapter')];

  initNav();
  initCursor({ reduced: reduceMotion });

  /* Split headings first, so the generic reveal pass can skip them and
     we avoid two competing tweens on the same node. */
  const splitGroups = initSplitHeadings();
  const inHero = (g) => g.el.closest('.chapter--hero');
  const heroChars = splitGroups.filter(inHero).flatMap((g) => g.chars);
  const restGroups = splitGroups.filter((g) => !inHero(g));

  let scene = null;
  if (canvas) {
    try {
      scene = new Scene(canvas);
      scene.setIgnite(0);   // start as a void; the intro forms it
    } catch (err) {
      console.warn('WebGL unavailable, running in DOM-only mode.', err);
    }
  }

  /* Spline slot — dormant unless a scene URL is configured. */
  let spline = { mounted: false };
  const slot = document.getElementById('spline-slot');
  if (slot) {
    try { spline = await mountSpline(slot); }
    catch (err) { console.warn('Spline slot skipped:', err); }
  }

  let setActiveDot = () => {};

  runBoot(() => {
    initSmoothScroll();

    if (scene) {
      trackProgress((p) => {
        scene.setProgress(p);
        if (spline.mounted && spline.setChapter) spline.setChapter(Math.round(p * 7));
      });
      /* Scroll velocity → core turbulence. */
      trackVelocity((v) => scene.setVelocity(v));
    }

    setActiveDot = initRail(sections, (idx) => {
      if (spline.mounted && spline.setChapter) spline.setChapter(idx);
    }) || setActiveDot;

    trackChapters(sections, (idx) => setActiveDot(idx));

    /* Non-hero chapters get the standard scroll reveals. */
    initReveals();
    restGroups.forEach((g) => revealSplit(g.chars, { scroll: true, trigger: g.el }));
    initCounters();
    initCurve();
    initScramble();

    /* ---- The cinematic intro: core ignites, hero assembles. ---- */
    playIntro({
      scene,
      onIgniteDone: () => { window.__dcpIntroDone = true; },
    });

    /* Hero text lands as the cloud finishes forming — never before,
       and never hidden waiting on a scroll that may not come. */
    revealSplit(heroChars, { delay: reduceMotion ? 0 : 1.15 });

    /* Let layout settle so ScrollTrigger measures the final document. */
    setTimeout(() => window.dispatchEvent(new Event('resize')), 260);
  });
}

document.addEventListener('DOMContentLoaded', app);
