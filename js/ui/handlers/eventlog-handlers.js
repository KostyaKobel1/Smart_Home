// Event Log Handlers
import { setState } from '../state/state-manager.js';
import { el } from '../dom/dom-cache.js';
import { showToast } from '../toast.js';
import { handleGetEventLog } from '../../handlers/system-handlers.js';
import { displayEventLog } from '../views/index.js';

export function handleEventLogClick() {
  setState({ eventLogVisible: true });
  handleGetEventLog(20, {
    onSuccess: (log) => {
      displayEventLog(log, {
        container: el.eventLog,
        onClose: () => {
          el.eventLog.innerHTML = '';
          setState({ eventLogVisible: false });
        },
      });
      showToast('Event log updated', 'info');
    },
    onError: (err) => showToast(String(err), 'error'),
  });
}
