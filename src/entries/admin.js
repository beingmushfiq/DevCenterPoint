/* ============================================================
   ADMIN ENTRY

   Deliberately separate from the site entry. The admin must never
   download Three.js, GSAP or Lenis — it is a tool, and tools should
   be fast.

   Everything here is progressive enhancement: the forms all submit
   and save without JavaScript. This file adds the conveniences
   (slug derivation, live preview, reorder, confirmations) on top.
   ============================================================ */

import '../styles/admin.css';
import { initTheme } from '../ui/theme.js';

function initAdmin() {
  initTheme();
  initSlugFields();
  initConfirmations();
  initCharCounters();
  initTabs();
  initSidebar();
  initReorder();
  initMediaPicker();
  initToasts();
  initTestimonialPreview();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}

/* ---- admin sidebar (mobile drawer) --------------------------- */
function initSidebar() {
  const toggle = document.getElementById('sidebarToggle') || document.querySelector('[data-admin-menu]');
  const sidebar = document.querySelector('.sidebar') || document.querySelector('.admin__sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar) return;

  const closeSidebar = () => {
    sidebar.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-active');
  };

  const openSidebar = () => {
    sidebar.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-active');
  };

  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar.classList.contains('is-open')) closeSidebar();
      else openSidebar();
    });
  }

  if (backdrop) backdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });
}

/* ---- auto-dismiss toast alerts ------------------------------- */
function initToasts() {
  document.querySelectorAll('[data-toast]').forEach((toast) => {
    const closeBtn = toast.querySelector('.toast-message__close');
    const dismiss = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    };
    if (closeBtn) closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, 5000);
  });
}

/* ---- live testimonial preview -------------------------------- */
function initTestimonialPreview() {
  const quoteInput = document.getElementById('quote');
  const attrInput = document.getElementById('attribution');
  const roleInput = document.getElementById('role');
  const compInput = document.getElementById('company');

  const pQuote = document.getElementById('previewQuote');
  const pAttr = document.getElementById('previewAttribution');
  const pRoleComp = document.getElementById('previewRoleCompany');
  const pAvatar = document.getElementById('previewAvatar');

  if (!quoteInput || !pQuote) return;

  const update = () => {
    const q = quoteInput.value.trim();
    const a = attrInput ? attrInput.value.trim() : '';
    const r = roleInput ? roleInput.value.trim() : '';
    const c = compInput ? compInput.value.trim() : '';

    pQuote.textContent = q ? `“${q}”` : '“Quote will appear here as you type...”';
    if (pAttr) pAttr.textContent = a || 'Author Name';
    if (pRoleComp) {
      if (r && c) pRoleComp.textContent = `${r}, ${c}`;
      else pRoleComp.textContent = r || c || 'Role / Company';
    }
    if (pAvatar) {
      pAvatar.textContent = (a || 'A').charAt(0).toUpperCase();
    }
  };

  [quoteInput, attrInput, roleInput, compInput].forEach((el) => {
    if (el) el.addEventListener('input', update);
  });
}


/* ---- slug derivation ----------------------------------------
   Types a slug from the title until the author edits the slug
   themselves, at which point we stop interfering. */
function initSlugFields() {
  document.querySelectorAll('[data-slug-source]').forEach((input) => {
    const target = document.querySelector(input.dataset.slugSource);
    if (!target) return;

    let touched = target.value.trim().length > 0;
    target.addEventListener('input', () => { touched = true; });

    input.addEventListener('input', () => {
      if (touched) return;
      target.value = input.value
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
    });
  });
}

/* ---- destructive-action confirmation ------------------------- */
function initConfirmations() {
  document.querySelectorAll('[data-confirm]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (!window.confirm(el.dataset.confirm)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });
  });
}

/* ---- live character counters --------------------------------- */
function initCharCounters() {
  document.querySelectorAll('[data-counter]').forEach((input) => {
    const out = document.querySelector(input.dataset.counter);
    if (!out) return;
    const max = Number(input.getAttribute('maxlength') || 0);

    const update = () => {
      const len = input.value.length;
      out.textContent = max ? `${len} / ${max}` : String(len);
      /* Warn before the limit, not at it — by the time the field
         refuses input the sentence is already unsalvageable. */
      out.classList.toggle('is-near', max > 0 && len > max * 0.9);
    };
    input.addEventListener('input', update);
    update();
  });
}

/* ---- tabbed editor panels ------------------------------------ */
function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach((group) => {
    const tabs = [...group.querySelectorAll('[data-tab]')];
    const panels = [...group.querySelectorAll('[data-panel]')];

    const select = (name) => {
      tabs.forEach((t) => {
        const on = t.dataset.tab === name;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      panels.forEach((p) => {
        p.hidden = p.dataset.panel !== name;
      });
    };

    tabs.forEach((t) => t.addEventListener('click', () => select(t.dataset.tab)));
    if (tabs[0]) select(tabs[0].dataset.tab);
  });
}



/* ---- reorder rows -------------------------------------------
   Up/down controls rather than drag-and-drop. Drag is nicer with a
   mouse and unusable with a keyboard; these buttons work for
   everyone and submit as a normal form. */
function initReorder() {
  document.querySelectorAll('[data-reorder]').forEach((list) => {
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-move]');
      if (!btn) return;
      e.preventDefault();

      const row = btn.closest('[data-row]');
      if (!row) return;

      if (btn.dataset.move === 'up') {
        const prev = row.previousElementSibling;
        if (prev) list.insertBefore(row, prev);
      } else {
        const next = row.nextElementSibling;
        if (next) list.insertBefore(next, row);
      }
      syncOrder(list);
    });
  });
}

function syncOrder(list) {
  list.querySelectorAll('[data-row]').forEach((row, i) => {
    const input = row.querySelector('[data-order-input]');
    if (input) input.value = String(i + 1);
  });
}

/* ---- media picker -------------------------------------------
   Opens a modal grid of uploaded files. The selected media id is
   written into a hidden input on the form. */
function initMediaPicker() {
  const modal = document.querySelector('[data-media-modal]');
  if (!modal) return;

  let activeInput = null;

  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    activeInput = null;
  };

  document.querySelectorAll('[data-media-pick]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeInput = document.querySelector(btn.dataset.mediaPick);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      const focusable = modal.querySelector('button, input, a');
      if (focusable) focusable.focus();
    });
  });

  modal.querySelectorAll('[data-media-option]').forEach((opt) => {
    opt.addEventListener('click', () => {
      if (!activeInput) return;
      activeInput.value = opt.dataset.mediaOption;

      /* Reflect the choice in the form so the author sees which
         image is attached without re-opening the modal. */
      const preview = document.querySelector(`[data-media-preview="${CSS.escape(activeInput.id)}"]`);
      if (preview) {
        const img = opt.querySelector('img');
        if (img) {
          preview.innerHTML = '';
          const clone = img.cloneNode(true);
          clone.removeAttribute('loading');
          preview.appendChild(clone);
        }
      }
      close();
    });
  });

  modal.querySelectorAll('[data-media-close]').forEach((el) => {
    el.addEventListener('click', close);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
}
