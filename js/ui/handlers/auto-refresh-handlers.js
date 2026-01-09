// Auto Refresh Handlers - автоматичне оновлення панелей
import { state, setState } from '../state/state-manager.js';
import { el, getSelectedRoomFilter } from '../dom/dom-cache.js';
import { handleGetStats, handleGetEventLog } from '../../handlers/system-handlers.js';
import { handleGetComponents } from '../../handlers/component-executor.js';
import { displayComponentsAccordion, applyRoomFilter, populateRoomFilterOptionsFromList } from '../components/index.js';
import { displayStats, computeRoomStats } from '../views/index.js';
import { displayEventLog } from '../views/index.js';

export function autoRefreshStats(onToggleMode) {
  if (!state.statsVisible) return;

  handleGetStats({
    onSuccess: (stats) => {
      const selectedRoom = getSelectedRoomFilter();
      const commonOptions = {
        selectedRoom,
        statsMode: state.statsMode,
        onToggleMode,
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
          },
          onError: () => displayStats(el.statsDashboard, stats, null, commonOptions),
        });
      } else {
        displayStats(el.statsDashboard, stats, null, commonOptions);
      }
    },
    onError: () => {},
  });
}

export function autoRefreshComponentsList(executeAndToast) {
  if (!state.componentsListVisible) return;

  handleGetComponents({
    onSuccess: (list) => {
      const items = Array.isArray(list) ? list : [];
      populateRoomFilterOptionsFromList(items, el.roomFilter);
      displayComponentsAccordion(
        applyRoomFilter(items, getSelectedRoomFilter()),
        {
          container: el.result,
          selectedRoom: getSelectedRoomFilter(),
          executeAndToast,
          onClose: () => {
            el.result.innerHTML = '';
            setState({ componentsListVisible: false });
          },
        },
      );
    },
    onError: () => {},
  });
}

export function autoRefreshEventLog() {
  if (!state.eventLogVisible) return;

  handleGetEventLog(20, {
    onSuccess: (log) => displayEventLog(log, {
      container: el.eventLog,
      onClose: () => {
        el.eventLog.innerHTML = '';
        setState({ eventLogVisible: false });
      },
    }),
    onError: () => {},
  });
}
