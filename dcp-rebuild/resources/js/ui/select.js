/* ============================================================
   CUSTOM SELECT COMPONENT (UI & PROGRESSIVE ENHANCEMENT)
   Translates standard HTML <select> elements into accessible,
   high-precision custom dropdowns with animated chevrons,
   floating glassmorphic menus, keyboard navigation, and full
   two-way event synchronization.
   ============================================================ */

const CHEVRON_SVG = `
  <svg class="custom-select__chevron-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
`;

const CHECK_SVG = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
`;

let activeOpenSelect = null;

// Global outside-click listener
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (activeOpenSelect && !activeOpenSelect.wrapper.contains(e.target)) {
      activeOpenSelect.close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeOpenSelect) {
      activeOpenSelect.close();
      activeOpenSelect.trigger.focus();
    }
  });
}

export class CustomSelect {
  constructor(selectEl) {
    this.select = selectEl;
    if (this.select.__customSelect) return this.select.__customSelect;
    this.select.__customSelect = this;

    this.isOpen = false;
    this.focusedIndex = -1;
    this.optionsData = [];

    this.build();
    this.bindEvents();
  }

  build() {
    // Determine sizing variant
    const isCompact = this.select.classList.contains('admin-select') || 
                      this.select.classList.contains('custom-select--compact') ||
                      this.select.closest('.admin-header') ||
                      this.select.closest('.admin-subbar');

    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'custom-select' + (isCompact ? ' custom-select--compact' : '');
    if (this.select.id) this.wrapper.setAttribute('data-for-id', this.select.id);

    // Hide native select visually while keeping it in the form
    this.select.classList.add('custom-select__native');
    this.select.setAttribute('tabindex', '-1');
    this.select.setAttribute('aria-hidden', 'true');

    // Insert wrapper in DOM around native select
    this.select.parentNode.insertBefore(this.wrapper, this.select);
    this.wrapper.appendChild(this.select);

    // Create Trigger Button
    this.trigger = document.createElement('button');
    this.trigger.type = 'button';
    this.trigger.className = 'custom-select__trigger';
    this.trigger.setAttribute('role', 'combobox');
    this.trigger.setAttribute('aria-haspopup', 'listbox');
    this.trigger.setAttribute('aria-expanded', 'false');

    this.labelEl = document.createElement('span');
    this.labelEl.className = 'custom-select__label';

    this.chevronEl = document.createElement('span');
    this.chevronEl.className = 'custom-select__chevron';
    this.chevronEl.innerHTML = CHEVRON_SVG;

    this.trigger.appendChild(this.labelEl);
    this.trigger.appendChild(this.chevronEl);
    this.wrapper.appendChild(this.trigger);

    // Create Dropdown Menu
    this.menu = document.createElement('div');
    this.menu.className = 'custom-select__menu';
    this.menu.setAttribute('role', 'listbox');
    this.wrapper.appendChild(this.menu);

    this.renderOptions();
    this.syncSelection(false);
  }

  renderOptions() {
    this.menu.innerHTML = '';
    this.optionsData = [];

    const nativeOptions = Array.from(this.select.options);
    nativeOptions.forEach((opt, index) => {
      const optionEl = document.createElement('div');
      optionEl.className = 'custom-select__option' + (opt.disabled ? ' is-disabled' : '');
      optionEl.setAttribute('role', 'option');
      optionEl.setAttribute('data-index', index);
      optionEl.setAttribute('data-value', opt.value);

      const content = document.createElement('div');
      content.className = 'custom-select__option-content';

      const title = document.createElement('span');
      title.className = 'custom-select__option-title';
      title.textContent = opt.textContent;
      content.appendChild(title);

      // Support secondary meta tags (e.g. data-weeks, data-team, data-meta)
      const metaText = opt.dataset.weeks || opt.dataset.meta || opt.dataset.sub;
      if (metaText) {
        const meta = document.createElement('span');
        meta.className = 'custom-select__option-meta';
        meta.textContent = metaText;
        content.appendChild(meta);
      }

      const check = document.createElement('span');
      check.className = 'custom-select__check';
      check.innerHTML = CHECK_SVG;

      optionEl.appendChild(content);
      optionEl.appendChild(check);
      this.menu.appendChild(optionEl);

      this.optionsData.push({
        element: optionEl,
        nativeOption: opt,
        value: opt.value,
        text: opt.textContent,
        disabled: opt.disabled
      });

      optionEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (opt.disabled) return;
        this.selectIndex(index);
        this.close();
        this.trigger.focus();
      });
    });
  }

  syncSelection(triggerNativeEvent = false) {
    const selectedIndex = this.select.selectedIndex >= 0 ? this.select.selectedIndex : 0;
    const currentOpt = this.optionsData[selectedIndex] || this.optionsData[0];

    if (currentOpt) {
      this.labelEl.textContent = currentOpt.text;
      const isPlaceholder = !currentOpt.value && (currentOpt.text.toLowerCase().includes('select') || currentOpt.text.toLowerCase().includes('choose'));
      this.labelEl.classList.toggle('is-placeholder', isPlaceholder);

      this.optionsData.forEach((item, idx) => {
        const isSel = idx === selectedIndex;
        item.element.classList.toggle('is-selected', isSel);
        item.element.setAttribute('aria-selected', isSel ? 'true' : 'false');
      });
    }

    if (triggerNativeEvent) {
      this.select.dispatchEvent(new Event('change', { bubbles: true }));
      this.select.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  selectIndex(index) {
    if (index < 0 || index >= this.optionsData.length) return;
    const target = this.optionsData[index];
    if (target.disabled) return;

    this.select.selectedIndex = index;
    this.syncSelection(true);
  }

  open() {
    if (this.isOpen || this.select.disabled) return;

    if (activeOpenSelect && activeOpenSelect !== this) {
      activeOpenSelect.close();
    }

    // Check collision with viewport bottom for dropup position
    const rect = this.wrapper.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const menuHeight = Math.min(300, (this.optionsData.length * 42) + 16);

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      this.wrapper.classList.add('is-dropup');
    } else {
      this.wrapper.classList.remove('is-dropup');
    }

    this.isOpen = true;
    this.wrapper.classList.add('is-open');
    this.trigger.setAttribute('aria-expanded', 'true');
    activeOpenSelect = this;

    // Scroll active selected option into view
    const selectedIdx = this.select.selectedIndex;
    this.focusedIndex = selectedIdx >= 0 ? selectedIdx : 0;
    this.updateFocusedOption();

    if (this.optionsData[this.focusedIndex]) {
      this.optionsData[this.focusedIndex].element.scrollIntoView({ block: 'nearest' });
    }
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.wrapper.classList.remove('is-open');
    this.trigger.setAttribute('aria-expanded', 'false');
    if (activeOpenSelect === this) activeOpenSelect = null;
    this.clearFocusedOption();
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  updateFocusedOption() {
    this.optionsData.forEach((item, idx) => {
      item.element.classList.toggle('is-focused', idx === this.focusedIndex);
    });
  }

  clearFocusedOption() {
    this.optionsData.forEach((item) => {
      item.element.classList.remove('is-focused');
    });
  }

  bindEvents() {
    // Trigger button click
    this.trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });

    // Keyboard navigation on trigger
    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (this.isOpen) {
          if (this.focusedIndex >= 0) {
            this.selectIndex(this.focusedIndex);
          }
          this.close();
        } else {
          this.open();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          this.moveFocus(1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          this.moveFocus(-1);
        }
      } else if (e.key === 'Tab' && this.isOpen) {
        this.close();
      }
    });

    // Native select change event listener (keeps custom select in sync if updated from elsewhere)
    this.select.addEventListener('change', () => {
      this.syncSelection(false);
    });

    // Form reset synchronization
    if (this.select.form) {
      this.select.form.addEventListener('reset', () => {
        setTimeout(() => this.syncSelection(false), 20);
      });
    }
  }

  moveFocus(delta) {
    let nextIdx = this.focusedIndex + delta;
    const len = this.optionsData.length;
    if (nextIdx < 0) nextIdx = len - 1;
    if (nextIdx >= len) nextIdx = 0;

    // Skip disabled
    if (this.optionsData[nextIdx] && this.optionsData[nextIdx].disabled) {
      nextIdx = (nextIdx + delta + len) % len;
    }

    this.focusedIndex = nextIdx;
    this.updateFocusedOption();

    if (this.optionsData[this.focusedIndex]) {
      this.optionsData[this.focusedIndex].element.scrollIntoView({ block: 'nearest' });
    }
  }

  refresh() {
    this.renderOptions();
    this.syncSelection(false);
  }

  destroy() {
    if (this.wrapper && this.wrapper.parentNode) {
      this.select.classList.remove('custom-select__native');
      this.select.removeAttribute('tabindex');
      this.select.removeAttribute('aria-hidden');
      this.wrapper.parentNode.insertBefore(this.select, this.wrapper);
      this.wrapper.remove();
    }
    delete this.select.__customSelect;
  }
}

/**
 * Initialize custom selects for all matching <select> elements in the container
 */
export function initCustomSelects(container = document) {
  if (!container || typeof container.querySelectorAll !== 'function') return [];
  const nativeSelects = container.querySelectorAll('select:not([data-no-custom])');
  const instances = [];

  nativeSelects.forEach((sel) => {
    if (sel.__customSelect) {
      sel.__customSelect.refresh();
      instances.push(sel.__customSelect);
    } else {
      instances.push(new CustomSelect(sel));
    }
  });

  return instances;
}
