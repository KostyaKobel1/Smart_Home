// Initialization - ініціалізація компонента
import { cacheElements, validateElements } from './dom/dom-cache.js';
import { bindEvents } from './event-binding.js';

export function init() {
  cacheElements();

  if (!validateElements()) {
    console.warn('Component: Missing required DOM elements');
  }

  bindEvents();
}

export function setupAutoInit() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('htmx:afterSwap', () => {
    cacheElements();
    bindEvents();
  });
}
