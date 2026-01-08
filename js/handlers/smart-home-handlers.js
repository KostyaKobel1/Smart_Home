// Smart Home Handlers - thin layer bridging UI and service
import { smartHomeService } from '../services/smart-home-service.js';

const VALID_COMPONENT_TYPES = new Set(['generic', 'light', 'thermostat', 'lock', 'camera', 'television', 'tv']);
const INVALID_TYPE_MESSAGE = 'You have selected the wrong type for the component';

const TYPE_KEYWORDS = {
  light: ['light', 'lamp', 'bulb', 'лампа', 'світло'],
  thermostat: ['thermostat', 'temp', 'climate', 'heater', 'термостат', 'темп'],
  lock: ['lock', 'door', 'замок'],
  camera: ['camera', 'cam', 'cctv', 'камера'],
  television: ['tv', 'television', 'screen', 'тв', 'телевізор']
};

function detectTypeFromName(name) {
  const lowerName = String(name || '').toLowerCase();
  if (!lowerName) return null;
  
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return type;
    }
  }
  
  return null;
}

function isTypeAllowedForName(name, type) {
  const typeValue = String(type || '').toLowerCase();
  if (!VALID_COMPONENT_TYPES.has(typeValue)) return false;
  if (typeValue === 'generic') return true;
  const detectedType = detectTypeFromName(name);
  if (!detectedType) return false; // Дозволити створення тільки якщо ім'я містить ключове слово або type = 'generic'
  return detectedType === typeValue;
}

export function handleCreateComponent(name, type, room = 'Unassigned', { onSuccess, onError } = {}) {
  if (!name) return onError?.('Name is required');
  if (!isTypeAllowedForName(name, type)) return onError?.(INVALID_TYPE_MESSAGE);
  try {
    const info = smartHomeService.createComponent(name, type, room);
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
