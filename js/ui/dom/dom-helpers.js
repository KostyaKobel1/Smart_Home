// DOM Helpers - утиліти для роботи з DOM
import { el } from './dom-cache.js';

export function displayResult(message, type = 'info') {
  if (!el.result) return;
  el.result.className = `component-action__result component-action__result--${type}`;
  el.result.textContent = message;
}

export function updateComponentItemStatus(id, action) {
  const item = el.result?.querySelector(`.component-accordion__item[data-id="${String(id)}"]`);
  if (!item) return;

  const meta = item.querySelector('.component-accordion__meta');
  const updated = item.querySelector('.component-actions__updated');
  const type = (item.dataset.type || '').toLowerCase();

  if (updated) {
    updated.textContent = `Updated: ${new Date().toLocaleString()}`;
  }

  if (meta) {
    const current = meta.textContent || `${type} • offline`;
    const isOnline = current.toLowerCase().includes('online');
    const toStatusText = (status) => `${type} • ${status}`;

    switch ((action || '').toLowerCase()) {
      case 'on':
        meta.textContent = toStatusText('online');
        break;
      case 'off':
        meta.textContent = toStatusText('offline');
        break;
      case 'toggle':
        meta.textContent = toStatusText(isOnline ? 'offline' : 'online');
        break;
      default:
        break;
    }
  }
}
