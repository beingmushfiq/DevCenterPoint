/* ============================================================
   THEME MANAGER — DARK / LIGHT MODE
   Supports instant no-FOUT toggling, circular View Transitions
   expanding from touch/click coordinates, localStorage persistence,
   system preference detection, and cross-tab synchronization.
   ============================================================ */

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

export function setTheme(theme, save = true) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);

  if (save) {
    try {
      localStorage.setItem('dcp-theme', next);
    } catch {
      /* localStorage may be unavailable in private browsing */
    }
  }

  // Update mobile browser chrome theme color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', next === 'light' ? '#f8fafc' : '#07090e');
  }

  // Broadcast event for 3D scene and other reactive elements
  window.dispatchEvent(new CustomEvent('dcp:themechange', { detail: { theme: next } }));
}

let isTransitioning = false;

/**
 * Toggles the theme with a fluid circular reveal originating
 * from the exact click or touch coordinates.
 */
export async function toggleTheme(event = null, triggerBtn = null) {
  if (isTransitioning) return getTheme();

  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';

  // Respect accessibility: immediate switch if reduced motion is preferred
  const prefersReduced = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Resolve click / touch coordinates
  let x = null;
  let y = null;

  if (event) {
    if (event.clientX != null && (event.clientX !== 0 || event.clientY !== 0)) {
      x = event.clientX;
      y = event.clientY;
    } else if (event.touches && event.touches[0]) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    } else if (event.changedTouches && event.changedTouches[0]) {
      x = event.changedTouches[0].clientX;
      y = event.changedTouches[0].clientY;
    }
  }

  // Fallback to the trigger button's center if keyboard-activated or missing coords
  const btn = triggerBtn || (event && event.currentTarget) || document.querySelector('.theme-toggle');
  if (btn && (x == null || y == null || (x === 0 && y === 0))) {
    const rect = btn.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  }

  // Ultimate fallback to viewport center
  if (x == null || y == null) {
    x = window.innerWidth / 2;
    y = window.innerHeight / 2;
  }

  // Trigger tactile spring feedback on button
  if (btn) {
    btn.classList.remove('is-animating');
    void btn.offsetWidth; // force reflow
    btn.classList.add('is-animating');
    setTimeout(() => btn.classList.remove('is-animating'), 500);
  }

  // Subtle haptic tick on supported mobile devices
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try { navigator.vibrate(8); } catch {}
  }

  // If View Transitions API is not available or reduced motion is requested
  if (!document.startViewTransition || prefersReduced) {
    runFallbackTransition(x, y, next);
    return next;
  }

  isTransitioning = true;

  // Calculate distance to furthest corner from touch/click origin
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  try {
    // Disable background cross-fade transitions during snapshot capture
    document.documentElement.classList.add('is-theme-switching');

    const transition = document.startViewTransition(() => {
      setTheme(next, true);
      // Force sync layout so all theme variables compute instantly
      void document.documentElement.offsetWidth;
    });

    await transition.ready;

    // Smooth fluid circular reveal radiating from contact point
    const animation = document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 520,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    );

    await animation.finished;
  } catch (err) {
    setTheme(next, true);
  } finally {
    document.documentElement.classList.remove('is-theme-switching');
    isTransitioning = false;
  }

  return next;
}

function runFallbackTransition(x, y, nextTheme) {
  const isReduced = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isReduced) {
    setTheme(nextTheme, true);
    return;
  }

  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const overlay = document.createElement('div');
  overlay.className = 'theme-transition-fallback';
  overlay.style.background = nextTheme === 'light' ? '#f8fafc' : '#07090e';
  document.body.appendChild(overlay);

  setTheme(nextTheme, true);

  const anim = overlay.animate(
    [
      { clipPath: `circle(0px at ${x}px ${y}px)`, opacity: 0.95 },
      { clipPath: `circle(${endRadius}px at ${x}px ${y}px)`, opacity: 0 },
    ],
    {
      duration: 500,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    }
  );

  anim.onfinish = () => overlay.remove();
  anim.oncancel = () => overlay.remove();
}

export function initTheme() {
  // Track last touch/pointer coordinates for highest sub-pixel accuracy
  let lastCoord = null;

  const buttons = document.querySelectorAll('.theme-toggle, [id^="themeToggle"]');
  buttons.forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      lastCoord = { x: e.clientX, y: e.clientY };
    }, { passive: true });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Pass coordinates from event or last pointer contact
      const hasCoords = (e.clientX != null && (e.clientX !== 0 || e.clientY !== 0));
      const eventWithCoords = hasCoords ? e : {
        clientX: lastCoord ? lastCoord.x : null,
        clientY: lastCoord ? lastCoord.y : null,
        currentTarget: btn,
      };
      toggleTheme(eventWithCoords, btn);
    });
  });

  // Cross-tab synchronization
  window.addEventListener('storage', (e) => {
    if (e.key === 'dcp-theme' && e.newValue) {
      setTheme(e.newValue, false);
    }
  });

  // Respect system preference changes if user hasn't explicitly set a preference
  try {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    media.addEventListener('change', (e) => {
      if (!localStorage.getItem('dcp-theme')) {
        setTheme(e.matches ? 'light' : 'dark', false);
      }
    });
  } catch {
    /* Older browser fallback */
  }
}

