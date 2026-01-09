// Event Binding - прив'язка всіх обробників подій
import { el, getSelectedRoomFilter } from './dom/dom-cache.js';
import {
  handleCreateClick,
  handleRemoveClick,
  handleListClick,
  handleStatsClick,
  handleEventLogClick,
  handleResetClick,
  handleExecuteAndToast,
} from './handlers/action-handlers.js';
import { autoRefreshComponentsList, autoRefreshStats } from './handlers/auto-refresh-handlers.js';
import { state } from './state/state-manager.js';
import { handleToggleStatsMode } from './handlers/action-handlers.js';

export function bindEvents() {
  const bindOnce = (node, evt, handler) => {
    if (!node) return;
    const flag = `__bound_${evt}`;
    if (node[flag]) return;
    node.addEventListener(evt, handler);
    node[flag] = true;
  };

  bindOnce(el.createBtn, 'click', handleCreateClick);
  bindOnce(el.removeBtn, 'click', handleRemoveClick);
  bindOnce(el.listBtn, 'click', handleListClick);
  bindOnce(el.statsBtn, 'click', handleStatsClick);
  bindOnce(el.eventLogBtn, 'click', handleEventLogClick);
  bindOnce(el.resetBtn, 'click', handleResetClick);

  if (el.roomFilter && !el.roomFilter.__bound_change) {
    el.roomFilter.addEventListener('change', () => {
      if (el.roomInput) el.roomInput.value = getSelectedRoomFilter() || '';
      if (state.componentsListVisible) autoRefreshComponentsList(handleExecuteAndToast);
      if (state.statsVisible) autoRefreshStats(handleToggleStatsMode);
    });
    el.roomFilter.__bound_change = true;
  }
}
