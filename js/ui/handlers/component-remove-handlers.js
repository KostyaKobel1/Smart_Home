// Component Remove Handlers
import { getSelectedRoomFilter } from '../dom/dom-cache.js';
import { showToast } from '../toast.js';
import { createRemoveDialog, closeResetDialog } from '../dialogs/index.js';
import { handleDeleteComponent } from '../../handlers/component-action.js';
import { handleGetComponents } from '../../handlers/component-executor.js';
import { autoRefreshStats, autoRefreshComponentsList, autoRefreshEventLog } from './auto-refresh-handlers.js';
import { handleToggleStatsMode } from './stats-handlers.js';
import { handleExecuteAndToast } from './execute-handlers.js';

export function handleRemoveClick() {
  const { overlay } = createRemoveDialog(
    handleGetComponents,
    (componentId, ov) => {
      if (!confirm('Are you sure you want to remove this component?')) {
        closeResetDialog(ov);
        return;
      }
      handleDeleteComponent(componentId, {
        onSuccess: (res) => {
          showToast(`Removed: ${res.message}`, 'success');
          autoRefreshStats(handleToggleStatsMode);
          autoRefreshComponentsList(handleExecuteAndToast);
          autoRefreshEventLog();
          closeResetDialog(ov);
        },
        onError: (err) => {
          showToast(String(err), 'error');
          closeResetDialog(ov);
        },
      });
    },
    closeResetDialog,
    getSelectedRoomFilter(),
  );
  document.body.appendChild(overlay);
}
