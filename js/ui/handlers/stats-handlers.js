// Stats Handlers
import { state, setState, toggleStatsMode as toggleStatsModeState } from '../state/state-manager.js';
import { el, getSelectedRoomFilter } from '../dom/dom-cache.js';
import { showToast } from '../toast.js';
import { handleGetStats } from '../../handlers/system-handlers.js';
import { handleGetComponents } from '../../handlers/component-executor.js';
import { displayStats, computeRoomStats } from '../views/index.js';
import { autoRefreshStats } from './auto-refresh-handlers.js';

export function handleToggleStatsMode() {
  setState({ statsMode: toggleStatsModeState() });
  autoRefreshStats(handleToggleStatsMode);
}

export function handleStatsClick() {
  setState({ statsVisible: true });
  handleGetStats({
    onSuccess: (stats) => {
      const selectedRoom = getSelectedRoomFilter();
      const commonOptions = {
        selectedRoom,
        statsMode: state.statsMode,
        onToggleMode: handleToggleStatsMode,
        onClose: () => {
          el.statsDashboard.innerHTML = '';
          setState({ statsVisible: false, statsMode: 'global' });
        },
      };

      if (selectedRoom) {
        handleGetComponents({
          onSuccess: (list) => {
            const items = Array.isArray(list) ? list : [];
            const rs = computeRoomStats(items, selectedRoom);
            displayStats(el.statsDashboard, stats, rs, commonOptions);
            showToast('Statistics updated', 'info');
          },
          onError: () => {
            displayStats(el.statsDashboard, stats, null, commonOptions);
            showToast('Statistics updated', 'info');
          },
        });
      } else {
        displayStats(el.statsDashboard, stats, null, commonOptions);
        showToast('Statistics updated', 'info');
      }
    },
    onError: (err) => showToast(String(err), 'error'),
  });
}
