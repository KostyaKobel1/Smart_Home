// Execute Action Handlers
import { showToast } from '../toast.js';
import { handleComponentAction } from '../../handlers/component-executor.js';
import { autoRefreshStats, autoRefreshEventLog } from './auto-refresh-handlers.js';
import { updateComponentItemStatus } from '../dom/dom-helpers.js';
import { handleToggleStatsMode } from './stats-handlers.js';

export function handleExecuteAndToast(id, action, params = {}) {
  handleComponentAction(id, action, params, {
    onSuccess: (res) => {
      showToast(`Action executed: ${res.message}`, 'success');
      autoRefreshStats(handleToggleStatsMode);
      autoRefreshEventLog();
      updateComponentItemStatus(id, action);
    },
    onError: (err) => showToast(String(err), 'error'),
  });
}
