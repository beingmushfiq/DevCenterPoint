/* ============================================================
   MAGNETIC CURSOR + INTERACTION LAYER
   ------------------------------------------------------------
   A two-part cursor (precise dot + lagging ring) that:
     · lerps toward the pointer for a weighted, premium feel
     · expands and snaps over interactive targets
     · magnetically pulls [data-magnetic] elements toward the cursor
   Fully skipped on touch devices and when reduced motion is set —
   the native cursor is never taken away from users who need it.
   ============================================================ */

import gsap from 'gsap';

const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export function initCursor({ reduced = false } = {}) {
  if (!FINE_POINTER || reduced) return { destroy() {} };

  const root = document.createElement('div');
  root.className = 'cursor';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<span class="cursor__ring"></span><span class="cursor__dot"></span>';
  document.body.appendChild(root);
  document.documentElement.classList.add('has-cursor');

  const ring = root.querySelector('.cursor__ring');
  const dot = root.querySelector('.cursor__dot');

  const xToR = gsap.quickTo(ring, 'x', { duration: 0.48, ease: 'power3.out' });
  const yToR = gsap.quickTo(ring, 'y', { duration: 0.48, ease: 'power3.out' });
  const xToD = gsap.quickTo(dot, 'x', { duration: 0.07, ease: 'power2.out' });
  const yToD = gsap.quickTo(dot, 'y', { duration: 0.07, ease: 'power2.out' });

  let visible = false;
  const onMove = (e) => {
    if (!visible) { visible = true; gsap.to(root, { autoAlpha: 1, duration: 0.3 }); }
    xToR(e.clientX); yToR(e.clientY);
    xToD(e.clientX); yToD(e.clientY);
  };

  const onLeave = () => { gsap.to(root, { autoAlpha: 0, duration: 0.25 }); visible = false; };
  const onDown = () => gsap.to(root, { scale: 0.78, duration: 0.12, ease: 'power2.in' });
  const onUp   = () => gsap.to(root, { scale: 1, duration: 0.35, ease: 'back.out(2)' });

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  window.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });

  /* ---- Hover states over interactive targets ---- */
  const HOVERS = 'a, button, [data-magnetic], input, textarea, .cap__item, .path, .card, .metric, .curve__cell, label';
  const setHover = (on) => {
    root.classList.toggle('is-hover', on);
    gsap.to(ring, { scale: on ? 1.5 : 1, duration: 0.35, ease: 'power3.out' });
  };
  const onOver = (e) => { if (e.target.closest(HOVERS)) setHover(true); };
  const onOut = (e) => { if (e.target.closest(HOVERS)) setHover(false); };

  document.addEventListener('pointerover', onOver, { passive: true });
  document.addEventListener('pointerout', onOut, { passive: true });

  /* ---- Magnetic elements: the element leans toward the cursor ---- */
  const magnets = [...document.querySelectorAll('[data-magnetic]')];
  const magCleanups = magnets.map((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.35;
    const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    const move = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      qx(dx * strength);
      qy(dy * strength);
    };
    const reset = () => { qx(0); qy(0); };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', reset);
    };
  });

  return {
    destroy() {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      magCleanups.forEach((fn) => fn());
      document.documentElement.classList.remove('has-cursor');
      root.remove();
    },
  };
}
