/* ============================================================
   FUSION RETICLE CURSOR + INTERACTION LAYER
   ------------------------------------------------------------
   A signature, high-visibility precision cursor built for DevCenterPoint:
     · Hyper-responsive 0-latency Electric Cobalt / Cyan core
     · Fluid aerodynamic follower ring with velocity deformation
     · Ambient glowing plasma aura with theme-aware luminance
     · Precision aerospace crosshair reticle with lock-on states
     · Tactile shockwave ripple on pointer click
     · Intelligent yield over text inputs and code editors
   Skipped on touch devices and when reduced motion is requested.
   ============================================================ */

import gsap from 'gsap';

const FINE_POINTER = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export function initCursor({ reduced = false } = {}) {
  if (!FINE_POINTER || reduced) return { destroy() {} };

  const root = document.createElement('div');
  root.className = 'cursor';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <div class="cursor__aura"></div>
    <div class="cursor__ring">
      <span class="cursor__crosshair cursor__crosshair--t"></span>
      <span class="cursor__crosshair cursor__crosshair--b"></span>
      <span class="cursor__crosshair cursor__crosshair--l"></span>
      <span class="cursor__crosshair cursor__crosshair--r"></span>
    </div>
    <div class="cursor__dot"></div>
  `;
  document.body.appendChild(root);
  document.documentElement.classList.add('has-cursor');

  const aura = root.querySelector('.cursor__aura');
  const ring = root.querySelector('.cursor__ring');
  const dot = root.querySelector('.cursor__dot');

  // Focal point tracks hardware mouse with 0ms latency
  const setXDot = gsap.quickSetter(dot, 'x', 'px');
  const setYDot = gsap.quickSetter(dot, 'y', 'px');

  // Precision reticle follows with snappy 0.14s fluid damping
  const xToR = gsap.quickTo(ring, 'x', { duration: 0.14, ease: 'power2.out' });
  const yToR = gsap.quickTo(ring, 'y', { duration: 0.14, ease: 'power2.out' });

  // Ambient aura follows with smooth 0.22s soft glide
  const xToA = gsap.quickTo(aura, 'x', { duration: 0.22, ease: 'power2.out' });
  const yToA = gsap.quickTo(aura, 'y', { duration: 0.22, ease: 'power2.out' });

  let visible = false;
  let isOverInput = false;
  let isHovered = false;

  let lastX = 0;
  let lastY = 0;
  let velTimeout = null;

  const onMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;

    if (!visible) {
      visible = true;
      gsap.to(root, { autoAlpha: 1, duration: 0.18 });
      lastX = x;
      lastY = y;
    }

    setXDot(x);
    setYDot(y);
    xToR(x);
    yToR(y);
    xToA(x);
    yToA(y);

    // Instantaneous velocity calculation for aerodynamic stretch
    const dx = x - lastX;
    const dy = y - lastY;
    const dist = Math.hypot(dx, dy);
    lastX = x;
    lastY = y;

    if (dist > 3 && !isHovered) {
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const stretch = Math.min(dist * 0.007, 0.4);

      gsap.to(ring, {
        rotation: angle,
        scaleX: 1 + stretch,
        scaleY: 1 - stretch * 0.45,
        duration: 0.08,
        overwrite: 'auto',
      });

      clearTimeout(velTimeout);
      velTimeout = setTimeout(() => {
        gsap.to(ring, {
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          duration: 0.22,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }, 40);
    }
  };

  const onLeave = () => {
    gsap.to(root, { autoAlpha: 0, duration: 0.18 });
    visible = false;
  };

  const onDown = (e) => {
    if (!isOverInput) {
      gsap.to([ring, dot], { scale: 0.82, duration: 0.08, ease: 'power2.out' });

      // Spawn energetic shockwave ripple
      const ripple = document.createElement('span');
      ripple.className = 'cursor__ripple';
      root.appendChild(ripple);
      gsap.set(ripple, { x: e.clientX, y: e.clientY });

      gsap.fromTo(ripple,
        { scale: 0.4, autoAlpha: 0.9 },
        {
          scale: 2.3,
          autoAlpha: 0,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        }
      );
    }
  };

  const onUp = () => {
    if (!isOverInput) {
      gsap.to([ring, dot], {
        scale: isHovered ? 1.45 : 1,
        duration: 0.22,
        ease: 'back.out(2)',
      });
    }
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  window.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });

  /* ---- Interactive Targets & Hover Handling ---- */
  const HOVERS = 'a, button, [data-magnetic], [data-accordion-trigger], .tag, .filter, .card, label, [role="button"], input[type="submit"], input[type="button"]';
  const TEXT_INPUTS = 'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]';

  const setHover = (on) => {
    isHovered = on;
    root.classList.toggle('is-hover', on);

    gsap.to(ring, {
      scale: on ? 1.45 : 1,
      rotation: 0,
      scaleX: on ? 1.45 : 1,
      scaleY: on ? 1.45 : 1,
      duration: 0.22,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    gsap.to(aura, {
      scale: on ? 1.6 : 1,
      duration: 0.28,
      ease: 'power2.out',
    });
  };

  const onOver = (e) => {
    if (e.target.closest(TEXT_INPUTS)) {
      isOverInput = true;
      gsap.to(root, { autoAlpha: 0, duration: 0.1 });
      return;
    }
    if (isOverInput) {
      isOverInput = false;
      gsap.to(root, { autoAlpha: 1, duration: 0.15 });
    }
    if (e.target.closest(HOVERS)) {
      setHover(true);
    }
  };

  const onOut = (e) => {
    if (e.target.closest(HOVERS)) {
      setHover(false);
    }
  };

  document.addEventListener('pointerover', onOver, { passive: true });
  document.addEventListener('pointerout', onOut, { passive: true });

  /* ---- Snappy Magnetic Attraction ---- */
  const magnets = [...document.querySelectorAll('[data-magnetic]')];
  const magCleanups = magnets.map((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.28;
    const qx = gsap.quickTo(el, 'x', { duration: 0.2, ease: 'power2.out' });
    const qy = gsap.quickTo(el, 'y', { duration: 0.2, ease: 'power2.out' });

    const move = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      qx(dx * strength);
      qy(dy * strength);
    };
    const reset = () => { qx(0); qy(0); };

    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', reset, { passive: true });
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
