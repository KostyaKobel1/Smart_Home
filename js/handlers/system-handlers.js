/**
 * System Handlers - Системні операції (статистика, скидання, логи)
 */

import { smartHomeService } from '../services/smart-home-service.js';

export function handleGetStats({ onSuccess, onError } = {}) {
  try {
    onSuccess?.(smartHomeService.stats());
  } catch (e) {
    onError?.(e.message || 'Stats error');
  }
}

export function handleReset(mode = 'factory', { onSuccess, onError } = {}) {
  try {
    const res = smartHomeService.reset(mode);
    res.success ? onSuccess?.(res) : onError?.(res.message);
  } catch (e) {
    onError?.(e.message || 'Reset error');
  }
}

export function handleGetEventLog(limit, { onSuccess, onError } = {}) {
  try {
    onSuccess?.(smartHomeService.getEventLog(limit));
  } catch (e) {
    onError?.(e.message || 'Event log error');
  }
}
