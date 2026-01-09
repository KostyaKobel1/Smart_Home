// Component List Handlers
import { setState } from '../state/state-manager.js';
import { el, getSelectedRoomFilter } from '../dom/dom-cache.js';
import { showToast } from '../toast.js';
import { handleGetComponents } from '../../handlers/component-executor.js';
import { displayComponentsAccordion, applyRoomFilter, populateRoomFilterOptionsFromList } from '../components/index.js';
import { handleExecuteAndToast } from './execute-handlers.js';

export function handleListClick() {
  setState({ componentsListVisible: true });
  handleGetComponents({
    onSuccess: (list) => {
      const items = Array.isArray(list) ? list : [];
      populateRoomFilterOptionsFromList(items, el.roomFilter);
      displayComponentsAccordion(
        applyRoomFilter(items, getSelectedRoomFilter()),
        {
          container: el.result,
          selectedRoom: getSelectedRoomFilter(),
          executeAndToast: handleExecuteAndToast,
          onClose: () => {
            el.result.innerHTML = '';
            setState({ componentsListVisible: false });
          },
        },
      );
      showToast(`Found ${items.length} component(s)`, 'info');
    },
    onError: (err) => {
      showToast(String(err), 'error');
    },
  });
}
