// Smart Home Handlers - thin layer bridging UI and service
import { smartHomeService } from '../services/smart-home-service.js';

export function handleCreateComponent(name, type, { onSuccess, onError } = {}) {
  if (!name) return onError?.('Name is required');
  try {
    const info = smartHomeService.createComponent(name, type);
    onSuccess?.(info);
  } catch (e) {
    onError?.(e.message || 'Create error');
  }
}

export function handleDeleteComponent(id, { onSuccess, onError } = {}) {
  if (!id) return onError?.('Component ID is required');
  try {
    const res = smartHomeService.removeComponent(Number(id));
    res.success ? onSuccess?.(res) : onError?.(res.message);
  } catch (e) {
    onError?.(e.message || 'Delete error');
  }
}

export function handleComponentAction(id, action, params = {}, { onSuccess, onError } = {}) {
  if (!id || !action) return onError?.('ID and action are required');
  try {
    const res = smartHomeService.executeAction(Number(id), action, params);
    res.success ? onSuccess?.(res) : onError?.(res.message);
  } catch (e) {
    onError?.(e.message || 'Action error');
  }
}

export function handleGetStats({ onSuccess, onError } = {}) {
  try {
    onSuccess?.(smartHomeService.stats());
  } catch (e) {
    onError?.(e.message || 'Stats error');
  }
}

export function handleGetComponents({ onSuccess, onError } = {}) {
  try {
    onSuccess?.(smartHomeService.listComponents());
  } catch (e) {
    onError?.(e.message || 'List error');
  }
}

export function handleReset({ onSuccess, onError } = {}) {
  try {
    const res = smartHomeService.reset();
    onSuccess?.(res);
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
