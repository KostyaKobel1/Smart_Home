// Reset Handlers
import { setState } from '../state/state-manager.js';
import { el, clearInput } from '../dom/dom-cache.js';
import { showToast } from '../toast.js';
import { createResetDialog, closeResetDialog } from '../dialogs/index.js';
import { handleReset } from '../../handlers/system-handlers.js';
import { autoRefreshStats, autoRefreshComponentsList, autoRefreshEventLog } from './auto-refresh-handlers.js';
import { handleToggleStatsMode } from './stats-handlers.js';
import { handleExecuteAndToast } from './execute-handlers.js';

function performReset(mode, overlay) {
  const confirmations = {
    'event-log': 'Clear the event log? Devices and statistics will remain.',
    factory: 'Factory reset: remove ALL devices, counters, and event log? This cannot be undone.',
  };

  if (!confirm(confirmations[mode] || 'Are you sure?')) {
    closeResetDialog(overlay);
    return;
  }

  handleReset(mode, {
    onSuccess: (res) => {
      clearInput();

      if (mode === 'factory') {
        el.result.innerHTML = '';
        setState({ componentsListVisible: false });
      }

      if (mode === 'event-log' || mode === 'factory') {
        el.eventLog.innerHTML = '';
        setState({ eventLogVisible: false });
      }

      showToast(res.message, 'success');
      autoRefreshStats(handleToggleStatsMode);
      autoRefreshComponentsList(handleExecuteAndToast);
      autoRefreshEventLog();
      closeResetDialog(overlay);
    },
    onError: (err) => {
      showToast(String(err), 'error');
      closeResetDialog(overlay);
    },
  });
}

export function handleResetClick() {
  const { overlay, select } = createResetDialog((mode, ov) => performReset(mode, ov), closeResetDialog);
  document.body.appendChild(overlay);
  select.focus();
}
