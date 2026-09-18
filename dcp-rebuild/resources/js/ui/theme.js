/* ============================================================
   THEME MANAGER — DARK / LIGHT MODE
   Supports instant no-FOUT toggling, localStorage persistence,
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

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next, true);
  return next;
}

export function initTheme() {
  // Bind all toggle buttons present on the page (public nav, admin topbar, login)
  const buttons = document.querySelectorAll('.theme-toggle, [id^="themeToggle"]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
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
