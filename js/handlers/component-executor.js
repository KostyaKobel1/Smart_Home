/**
 * Component Executor Handler - Виконання дій компонентів
 */

import { smartHomeService } from '../services/smart-home-service.js';

export function handleComponentAction(id, action, params = {}, { onSuccess, onError } = {}) {
  if (!id || !action) return onError?.('ID and action are required');
  try {
    const res = smartHomeService.executeAction(Number(id), action, params);
    res.success ? onSuccess?.(res) : onError?.(res.message);
  } catch (e) {
    onError?.(e.message || 'Action error');
  }
}

export function handleGetComponents({ onSuccess, onError } = {}) {
  try {
    onSuccess?.(smartHomeService.listComponents());
  } catch (e) {
    onError?.(e.message || 'List error');
  }
}
