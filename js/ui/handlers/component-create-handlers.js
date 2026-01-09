// Component Create Handlers
import { getSelectedRoomFilter } from '../dom/dom-cache.js';
import { showToast } from '../toast.js';
import { createComponentDialog } from '../dialogs/index.js';
import { handleCreateComponent } from '../../handlers/component-action.js';
import { autoRefreshStats, autoRefreshComponentsList, autoRefreshEventLog } from './auto-refresh-handlers.js';
import { handleToggleStatsMode } from './stats-handlers.js';
import { handleExecuteAndToast } from './execute-handlers.js';

export function handleCreateClick() {
  const defaultRoom = getSelectedRoomFilter();
  const { overlay } = createComponentDialog(
    defaultRoom,
    (name, type, room, ov) => {
      handleCreateComponent(name, type, room, {
        onSuccess: (info) => {
          showToast(`Component "${info.name}" created`, 'success');
          autoRefreshStats(handleToggleStatsMode);
          autoRefreshComponentsList(handleExecuteAndToast);
          autoRefreshEventLog();
          ov.remove();
        },
        onError: (err) => showToast(String(err), 'error'),
      });
    },
    (ov) => ov.remove(),
  );
  document.body.appendChild(overlay);
}
