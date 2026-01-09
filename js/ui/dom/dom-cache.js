// DOM Cache - кешування всіх DOM елементів
export const DOM_ELEMENT_IDS = {
  input: 'component-name-input',
  typeSelect: 'component-type-select',
  roomInput: 'component-room-input',
  roomFilter: 'component-room-filter',
  select: 'component-action__select',
  createBtn: 'create-component-btn',
  removeBtn: 'remove-component-btn',
  listBtn: 'get-full-list-of-components-btn',
  statsBtn: 'show-stats-btn',
  eventLogBtn: 'show-event-log-btn',
  resetBtn: 'reset-data-btn',
  result: 'component-action-result',
  statsDashboard: 'stats-dashboard',
  eventLog: 'event-log',
};

export const el = {
  input: null,
  typeSelect: null,
  roomInput: null,
  roomFilter: null,
  createBtn: null,
  removeBtn: null,
  listBtn: null,
  statsBtn: null,
  eventLogBtn: null,
  resetBtn: null,
  result: null,
  select: null,
  statsDashboard: null,
  eventLog: null,
};

export function cacheElements() {
  el.input = document.getElementById(DOM_ELEMENT_IDS.input);
  el.typeSelect = document.getElementById(DOM_ELEMENT_IDS.typeSelect);
  el.roomInput = document.getElementById(DOM_ELEMENT_IDS.roomInput);
  el.roomFilter = document.getElementById(DOM_ELEMENT_IDS.roomFilter);
  el.createBtn = document.getElementById(DOM_ELEMENT_IDS.createBtn);
  el.removeBtn = document.getElementById(DOM_ELEMENT_IDS.removeBtn);
  el.listBtn = document.getElementById(DOM_ELEMENT_IDS.listBtn);
  el.statsBtn = document.getElementById(DOM_ELEMENT_IDS.statsBtn);
  el.eventLogBtn = document.getElementById(DOM_ELEMENT_IDS.eventLogBtn);
  el.resetBtn = document.getElementById(DOM_ELEMENT_IDS.resetBtn);
  el.result = document.getElementById(DOM_ELEMENT_IDS.result);
  el.select = document.getElementById(DOM_ELEMENT_IDS.select);
  el.statsDashboard = document.getElementById(DOM_ELEMENT_IDS.statsDashboard);
  el.eventLog = document.getElementById(DOM_ELEMENT_IDS.eventLog);
}

export function validateElements() {
  return el.input && el.typeSelect && el.createBtn && el.removeBtn && el.listBtn &&
    el.statsBtn && el.eventLogBtn && el.resetBtn &&
    el.result && el.select && el.statsDashboard && el.eventLog;
}

export function getSelectedRoomFilter() {
  return (el.roomFilter?.value || '').trim();
}

export function clearInput() {
  if (el.input) el.input.value = '';
}
