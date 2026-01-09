// State Manager - керування станом UI панелей
export const state = {
  statsVisible: false,
  statsMode: 'global',
  componentsListVisible: false,
  eventLogVisible: false,
};

export function getState() {
  return { ...state };
}

export function setState(updates) {
  Object.assign(state, updates);
}

export function toggleStatsMode() {
  state.statsMode = state.statsMode === 'global' ? 'filtered' : 'global';
  return state.statsMode;
}
