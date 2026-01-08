import { handleCreateComponent, handleDeleteComponent, handleGetComponents, handleReset, handleGetStats, handleGetEventLog, handleComponentAction } from './handlers/smart-home-handlers.js';

// Constants
const TOAST_DURATION = 3000; // 3 seconds
const DOM_ELEMENT_IDS = {
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
    select: 'component-action__select',
    statsDashboard: 'stats-dashboard',
    eventLog: 'event-log',
};

// DOM element cache
const el = {
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

// Track if stats dashboard is currently visible
let statsVisible = false;
// Track stats display mode: 'global' or 'filtered'
let statsMode = 'global';
// Track if components list is currently visible
let componentsListVisible = false;
// Track if event log is currently visible
let eventLogVisible = false;

/**
 * Refresh statistics if dashboard is visible
 */
function autoRefreshStats() {
    console.log('[Stats] Auto-refresh triggered. Visible:', statsVisible);
    if (statsVisible) {
        handleGetStats({
            onSuccess: (stats) => {
                const selectedRoom = getSelectedRoomFilter();
                if (selectedRoom) {
                    handleGetComponents({
                        onSuccess: (list) => {
                            const items = Array.isArray(list) ? list : [];
                            const rs = computeRoomStats(items, selectedRoom);
                            displayStats(stats, rs);
                        },
                        onError: () => { displayStats(stats); }
                    });
                } else {
                    displayStats(stats);
                }
            },
            onError: (error) => {
                // Silent fail for auto-refresh
            }
        });
    }
}

/**
 * Refresh components list if it is visible
 */
function autoRefreshComponentsList() {
    console.log('[ComponentsList] Auto-refresh triggered. Visible:', componentsListVisible);
    if (componentsListVisible) {
        handleGetComponents({
            onSuccess: (list) => {
                const items = Array.isArray(list) ? list : [];
                populateRoomFilterOptionsFromList(items);
                displayComponentsAccordion(applyRoomFilter(items));
            },
            onError: (error) => {
                // Silent fail for auto-refresh
            }
        });
    }
}

/**
 * Refresh event log if it is visible
 */
function autoRefreshEventLog() {
    console.log('[EventLog] Auto-refresh triggered. Visible:', eventLogVisible);
    if (eventLogVisible) {
        handleGetEventLog(20, {
            onSuccess: (log) => {
                displayEventLog(log);
            },
            onError: (error) => {
                // Silent fail for auto-refresh
            }
        });
    }
}

/**
 * Cache all DOM elements
 */
function cacheElements() {
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
 /** Get selected room
 * @returns {string} Room or 'Unassigned'
 */
function getComponentRoom() {
    const val = (el.roomInput?.value || '').trim();
    return val || 'Unassigned';
}
/** Get selected room filter */
function getSelectedRoomFilter() {
    return (el.roomFilter?.value || '').trim();
}
/** Populate room filter options from list of components */
function populateRoomFilterOptionsFromList(list) {
    if (!el.roomFilter) return;
    const prev = el.roomFilter.value;
    const rooms = Array.from(new Set((Array.isArray(list) ? list : []).map(c => String(c.room || 'Unassigned')))).sort();
    el.roomFilter.innerHTML = '';
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = 'All Rooms';
    el.roomFilter.appendChild(allOpt);
    rooms.forEach(room => {
        const opt = document.createElement('option');
        opt.value = room;
        opt.textContent = room;
        el.roomFilter.appendChild(opt);
    });
    if (prev && rooms.includes(prev)) {
        el.roomFilter.value = prev;
    } else {
        el.roomFilter.value = '';
    }
}
/** Apply room filter to components list */
function applyRoomFilter(list) {
    const selected = getSelectedRoomFilter();
    if (!selected) return list;
    return (Array.isArray(list) ? list : []).filter(c => String(c.room || 'Unassigned') === selected);
}

/** Populate room select for removal with available rooms */
function populateRoomSelectForRemoval() {
    if (!el.roomSelect) return;
    handleGetComponents({
        onSuccess: (list) => {
            const items = Array.isArray(list) ? list : [];
            const prevValue = el.roomSelect.value;
            const rooms = Array.from(new Set(items.map(c => String(c.room || 'Unassigned')))).sort();
            el.roomSelect.innerHTML = '';
            const allOpt = document.createElement('option');
            allOpt.value = '';
            allOpt.textContent = 'All Rooms';
            el.roomSelect.appendChild(allOpt);
            rooms.forEach(room => {
                const opt = document.createElement('option');
                opt.value = room;
                opt.textContent = room;
                el.roomSelect.appendChild(opt);
            });
            if (prevValue && rooms.includes(prevValue)) {
                el.roomSelect.value = prevValue;
            } else {
                el.roomSelect.value = '';
            }
            updateSelectOptionsByRoom(el.roomSelect.value);
        },
        onError: () => {}
    });
}

/** Update component select options filtered by selected room */
function updateSelectOptionsByRoom(room) {
    if (!el.select) return;
    handleGetComponents({
        onSuccess: (list) => {
            const items = Array.isArray(list) ? list : [];
            const filtered = room ? items.filter(c => String(c.room || 'Unassigned') === room) : items;
            el.select.innerHTML = '';
            if (filtered.length === 0) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = room ? `No components in ${room}` : 'No components available';
                opt.disabled = true;
                el.select.appendChild(opt);
            } else {
                filtered.forEach(component => {
                    const opt = document.createElement('option');
                    opt.value = String(component.id);
                    opt.textContent = `${component.name} (${component.type}${component.room ? ' • ' + component.room : ''})`;
                    el.select.appendChild(opt);
                });
            }
        },
        onError: () => {}
    });
}
/**
 * Ensure toast container exists in DOM
 * @returns {HTMLElement} Toast container element
 */
function ensureToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Get icon for toast type
 * @param {string} type - Toast type
 * @returns {string} Icon character
 */
function getToastIcon(type) {
    const icons = { 
        success: '✓', 
        error: '✕', 
        info: 'ℹ',
        create: '✨',
        delete: '🗑️',
        update: '🔄'
    };
    return icons[type] || icons.info;
}

/**
 * Display a toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, info, create, delete, update)
 */
function showToast(message, type = 'info') {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = getToastIcon(type);

    const text = document.createElement('span');
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.4s ease-in forwards';
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, TOAST_DURATION);
}
/**
 * Display result message
 * @param {string} message - Result message
 * @param {string} type - Result type (success, error, info)
 */
function displayResult(message, type = 'info') {
    if (!el.result) return;
    el.result.className = `component-action__result component-action__result--${type}`;
    el.result.textContent = message;
}

/**
 * Display list of components
 * @param {Array} list - Array of component names
 */
function displayComponentsList(list) {
    if (!el.result) return;
    el.result.className = 'component-action__result component-action__result--success';
    el.result.innerHTML = '';

    const heading = document.createElement('strong');
    heading.className = 'component-action__result-heading';
    heading.textContent = `Active Components (${list.length}):`;
    el.result.appendChild(heading);

    const ul = document.createElement('ul');
    ul.className = 'component-action__result-list';
    list.forEach(item => {
        const li = document.createElement('li');
        li.className = 'component-action__result-item';
        li.textContent = item;
        ul.appendChild(li);
    });

    el.result.appendChild(ul);
}

/**
 * Render expandable list of components with actions
 * @param {Array} components - Array of component info objects
 */
function displayComponentsAccordion(components) {
    if (!el.result) return;
    el.result.className = 'component-action__result component-action__result--success';
    el.result.innerHTML = '';

    const headerWrapper = document.createElement('div');
    headerWrapper.className = 'component-action__header-wrapper';
    
    const heading = document.createElement('strong');
    heading.className = 'component-action__result-heading';
    const selectedRoom = getSelectedRoomFilter();
    heading.textContent = selectedRoom ? `Active Components (${components.length}) — Room: ${selectedRoom}` : `Active Components (${components.length}):`;
    
    const closeBtn = createCloseButton(el.result, () => {
        componentsListVisible = false;
        console.log('[ComponentsList] List closed. Visible set to false');
    });
    headerWrapper.appendChild(heading);
    headerWrapper.appendChild(closeBtn);
    el.result.appendChild(headerWrapper);

    const container = document.createElement('div');
    container.className = 'component-accordion';

    components.forEach(component => {
        const item = document.createElement('div');
        item.className = 'component-accordion__item';
        item.dataset.id = String(component.id);
        item.dataset.type = String(component.type);

        const header = document.createElement('div');
        header.className = 'component-accordion__header';
        header.innerHTML = `
            <span class="component-accordion__title">${component.name}</span>
            <span class="component-accordion__meta">${component.type} • ${component.status}</span>
            <span class="component-accordion__chevron">▾</span>
        `;

        const panel = document.createElement('div');
        panel.className = 'component-accordion__panel';

        const controls = buildActionControls(component);
        panel.appendChild(controls);

        header.addEventListener('click', () => {
            const open = item.classList.toggle('open');
            if (open) {
                panel.style.maxHeight = panel.scrollHeight + 'px';
            } else {
                panel.style.maxHeight = '0px';
            }
        });

        item.appendChild(header);
        item.appendChild(panel);
        container.appendChild(item);
    });

    el.result.appendChild(container);
}

/**
 * Build action controls for a component
 * @param {Object} c - Component info
 * @returns {HTMLElement}
 */
function buildActionControls(component) {
    const wrap = document.createElement('div');
    wrap.className = 'component-actions';

    const actions = Array.isArray(component.actions) ? component.actions : [];
    const actionByKey = new Map(actions.map(action => [String(action.key).toLowerCase(), action]));

    // Grouped power controls
    const powerKeys = ['on', 'off', 'toggle'];
    const hasPower = powerKeys.some(key => actionByKey.has(key));
    if (hasPower) {
        const row = document.createElement('div');
        row.className = 'component-actions__row';
        const label = document.createElement('span');
        label.className = 'component-actions__label';
        label.textContent = 'Power';
        row.appendChild(label);

        powerKeys.forEach(key => {
            if (!actionByKey.has(key)) return;
            const btn = document.createElement('button');
            btn.className = 'component-action__btn component-action__btn--mini';
            btn.textContent = actionByKey.get(key).label || key;
            btn.addEventListener('click', () => executeAndToast(component.id, key));
            row.appendChild(btn);
        });
        wrap.appendChild(row);
    }

    // Optional grouped sets for better UX
    const groupedSets = [
        { label: 'Lock', keys: ['lock', 'unlock'] },
        { label: 'Recording', keys: ['record', 'stop'] },
        { label: 'Volume', keys: ['mute', 'unmute', 'volumeup', 'volumedown'] },
        { label: 'Channel', keys: ['channelup', 'channeldown'] },
        { label: 'Input Source', keys: ['inputtv', 'inputhdmi1', 'inputhdmi2', 'inputusb'] },
        { label: 'Info', keys: ['getchannels'] },
    ];
    groupedSets.forEach(group => {
        const presentKeys = group.keys.filter(key => actionByKey.has(key));
        if (presentKeys.length === 0) return;
        const row = document.createElement('div');
        row.className = 'component-actions__row';
        const label = document.createElement('span');
        label.className = 'component-actions__label';
        label.textContent = group.label;
        row.appendChild(label);
        presentKeys.forEach(key => {
            const actionSpec = actionByKey.get(key);
            const btn = document.createElement('button');
            btn.className = 'component-action__btn component-action__btn--mini';
            btn.textContent = actionSpec.label || key;
            btn.addEventListener('click', () => executeAndToast(component.id, key));
            row.appendChild(btn);
        });
        wrap.appendChild(row);
        // remove from processing list
        presentKeys.forEach(key => actionByKey.delete(key));
    });

    // Render remaining actions
    actionByKey.forEach(actionSpec => {
        const key = String(actionSpec.key).toLowerCase();
        const kind = String(actionSpec.kind || 'button').toLowerCase();
        if (kind === 'range') {
            const row = document.createElement('div');
            row.className = 'component-actions__row';
            const label = document.createElement('span');
            label.className = 'component-actions__label';
            label.textContent = actionSpec.label || 'Adjust';
            const slider = document.createElement('input');
            slider.type = 'range';
            if (typeof actionSpec.min === 'number') slider.min = String(actionSpec.min);
            if (typeof actionSpec.max === 'number') slider.max = String(actionSpec.max);
            if (typeof actionSpec.value === 'number') slider.value = String(actionSpec.value);
            slider.className = 'component-actions__slider';
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'component-actions__value';
            const unit = actionSpec.unit ? String(actionSpec.unit) : '';
            valueDisplay.textContent = `${slider.value}${unit}`;
            slider.addEventListener('input', () => { valueDisplay.textContent = `${slider.value}${unit}`; });
            const btn = document.createElement('button');
            btn.className = 'component-action__btn component-action__btn--mini';
            btn.textContent = 'Set';
            const paramName = getParamNameForAction(key);
            btn.addEventListener('click', () => executeAndToast(component.id, key, { [paramName]: Number(slider.value) }));
            row.appendChild(label);
            row.appendChild(slider);
            row.appendChild(valueDisplay);
            row.appendChild(btn);
            wrap.appendChild(row);
        } else {
            const row = document.createElement('div');
            row.className = 'component-actions__row';
            const label = document.createElement('span');
            label.className = 'component-actions__label';
            label.textContent = actionSpec.label || key;
            const btn = document.createElement('button');
            btn.className = 'component-action__btn component-action__btn--mini';
            btn.textContent = actionSpec.label || key;
            btn.addEventListener('click', () => executeAndToast(component.id, key));
            row.appendChild(label);
            row.appendChild(btn);
            wrap.appendChild(row);
        }
    });

    const footer = document.createElement('div');
    footer.className = 'component-actions__footer';
    const updated = document.createElement('span');
    updated.className = 'component-actions__updated';
    updated.textContent = `Updated: ${new Date(component.lastUpdated).toLocaleString()}`;
    footer.appendChild(updated);
    wrap.appendChild(footer);

    return wrap;
}

/**
 * Create close button with callback
 * @param {HTMLElement} container - Container element to clear
 * @param {Function} onClose - Optional callback to execute on close
 * @returns {HTMLElement} Close button element
 */
function createCloseButton(container, onClose = null) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'component-action__close-btn';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', () => {
        container.innerHTML = '';
        if (typeof onClose === 'function') {
            onClose();
        }
    });
    return closeBtn;
}

function getParamNameForAction(key) {
    switch (String(key).toLowerCase()) {
        case 'setbrightness':
            return 'brightness';
        case 'settemperature':
            return 'temperature';
        case 'setvolume':
            return 'volume';
        case 'setchannel':
            return 'channel';
        default:
            return 'value';
    }
}

function executeAndToast(id, action, params = {}) {
    console.log('[Action] Executing action:', { id, action, params });
    handleComponentAction(id, action, params, {
        onSuccess: (res) => {
            console.log('[Action] Action succeeded:', res);
            showToast(`🔄 ${res.message}`, 'success');
            autoRefreshStats();
            autoRefreshEventLog();
            // Optimistically update UI meta and timestamps
            const item = el.result?.querySelector(`.component-accordion__item[data-id="${String(id)}"]`);
            if (item) {
                const meta = item.querySelector('.component-accordion__meta');
                const updated = item.querySelector('.component-actions__updated');
                const type = (item.dataset.type || '').toLowerCase();
                const nowText = `Updated: ${new Date().toLocaleString()}`;
                if (updated) updated.textContent = nowText;

                const toStatusText = (status) => `${type} • ${status}`;
                if (meta) {
                    const current = meta.textContent || `${type} • offline`;
                    const isOnline = current.toLowerCase().includes('online');
                    switch ((action || '').toLowerCase()) {
                        case 'on':
                            meta.textContent = toStatusText('online');
                            break;
                        case 'off':
                            meta.textContent = toStatusText('offline');
                            break;
                        case 'toggle':
                            meta.textContent = toStatusText(isOnline ? 'offline' : 'online');
                            break;
                        default:
                            // leave meta as is for other actions
                            break;
                    }
                }
            }
        },
        onError: (err) => {
            showToast(String(err), 'error');
        }
    });
}


/**
 * Get trimmed component name from input
 * @returns {string} Component name or empty string
 */
function getComponentName() {
    return (el.input?.value || '').trim();
}

/**
 * Get selected component type
 * @returns {string} Component type or 'generic'
 */
function getComponentType() {
    return el.typeSelect?.value || 'generic';
}

/**
 * Callbacks object for handlers
 */
const callbacks = {
    showToast,
    displayResult,
    displayComponentsList,
    clearInput: () => { if (el.input) el.input.value = ''; },
};

const RESET_OPTIONS = [
    { value: 'event-log', label: 'Clear event log', description: 'Clears the event log only. Devices and statistics remain.' },
    { value: 'factory', label: 'Factory reset (all data)', description: 'Removes all devices, counters, and the event log. Full wipe.' },
];

function createResetDialog(onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'reset-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'reset-dialog';

    const title = document.createElement('h3');
    title.textContent = 'Reset Data';

    const description = document.createElement('p');
    description.textContent = 'Choose what to reset:';

    const select = document.createElement('select');
    select.className = 'reset-dialog__select';

    RESET_OPTIONS.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
    });

    const help = document.createElement('div');
    help.className = 'reset-dialog__help';

    const updateHelp = (val) => {
        const current = RESET_OPTIONS.find(o => o.value === val);
        help.textContent = current ? current.description : '';
    };
    select.addEventListener('change', () => updateHelp(select.value));
    updateHelp(select.value);

    const buttons = document.createElement('div');
    buttons.className = 'reset-dialog__buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'component-action__btn component-action__btn--remove';
    cancelBtn.addEventListener('click', () => onCancel?.(overlay));

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Reset';
    confirmBtn.className = 'component-action__btn component-action__btn--reset';
    confirmBtn.addEventListener('click', () => onConfirm?.(select.value, overlay));

    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);

    dialog.appendChild(title);
    dialog.appendChild(description);
    dialog.appendChild(select);
    dialog.appendChild(help);
    dialog.appendChild(buttons);
    overlay.appendChild(dialog);
    return { overlay, select, confirmBtn, cancelBtn };
}

function closeResetDialog(overlay) {
    if (overlay && overlay.parentElement) {
        overlay.parentElement.removeChild(overlay);
    }
}

function performReset(mode, overlay) {
    const confirmations = {
        'event-log': 'Clear the event log? Devices and statistics will remain.',
        'factory': 'Factory reset: remove ALL devices, counters, and event log? This cannot be undone.',
    };

    if (!confirm(confirmations[mode] || 'Are you sure?')) {
        closeResetDialog(overlay);
        return;
    }

    handleReset(mode, {
        onSuccess: (res) => {
            callbacks.clearInput();

            if (mode === 'factory') {
                el.result.innerHTML = '';
                componentsListVisible = false;
            }

            if (mode === 'event-log') {
                el.eventLog.innerHTML = '';
                eventLogVisible = false;
            } else if (mode === 'factory') {
                el.eventLog.innerHTML = '';
                eventLogVisible = false;
                // Do not delete/clear statistics data explicitly; let it recalc
            }

            callbacks.showToast(res.message, 'success');
            autoRefreshStats();
            autoRefreshComponentsList();
            autoRefreshEventLog();
            closeResetDialog(overlay);
        },
        onError: (err) => {
            callbacks.showToast(String(err), 'error');
            closeResetDialog(overlay);
        }
    });
}

/**
 * Create remove component dialog
 */
function createRemoveDialog(onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'reset-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'reset-dialog';

    const title = document.createElement('h3');
    title.textContent = 'Remove Component';

    const description = document.createElement('p');
    description.textContent = 'Select room and component to remove:';

    // Room select
    const roomLabel = document.createElement('label');
    roomLabel.textContent = 'Room';
    roomLabel.style.display = 'block';
    roomLabel.style.marginTop = '0.75rem';
    roomLabel.style.marginBottom = '0.25rem';
    roomLabel.style.fontWeight = '600';

    const roomSelect = document.createElement('select');
    roomSelect.className = 'reset-dialog__select';
    roomSelect.innerHTML = '<option value="">Loading rooms...</option>';

    // Component select
    const componentLabel = document.createElement('label');
    componentLabel.textContent = 'Component';
    componentLabel.style.display = 'block';
    componentLabel.style.marginTop = '0.75rem';
    componentLabel.style.marginBottom = '0.25rem';
    componentLabel.style.fontWeight = '600';

    const componentSelect = document.createElement('select');
    componentSelect.className = 'reset-dialog__select';
    componentSelect.innerHTML = '<option value="">Select room first</option>';

    // Populate rooms
    handleGetComponents({
        onSuccess: (list) => {
            const items = Array.isArray(list) ? list : [];
            const rooms = Array.from(new Set(items.map(c => String(c.room || 'Unassigned')))).sort();
            roomSelect.innerHTML = '';
            const allOpt = document.createElement('option');
            allOpt.value = '';
            allOpt.textContent = 'All Rooms';
            roomSelect.appendChild(allOpt);
            rooms.forEach(room => {
                const opt = document.createElement('option');
                opt.value = room;
                opt.textContent = room;
                roomSelect.appendChild(opt);
            });
            // Trigger initial component population
            updateComponentSelectByRoom('', items, componentSelect);
        },
        onError: () => {
            roomSelect.innerHTML = '<option value="">Error loading rooms</option>';
        }
    });

    // Update components when room changes
    roomSelect.addEventListener('change', () => {
        handleGetComponents({
            onSuccess: (list) => {
                const items = Array.isArray(list) ? list : [];
                updateComponentSelectByRoom(roomSelect.value, items, componentSelect);
            },
            onError: () => {}
        });
    });

    const buttons = document.createElement('div');
    buttons.className = 'reset-dialog__buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'component-action__btn component-action__btn--remove';
    cancelBtn.addEventListener('click', () => onCancel?.(overlay));

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Remove';
    confirmBtn.className = 'component-action__btn component-action__btn--reset';
    confirmBtn.addEventListener('click', () => {
        const componentId = componentSelect.value;
        if (!componentId) {
            callbacks.showToast('Please select a component to remove', 'error');
            return;
        }
        onConfirm?.(componentId, overlay);
    });

    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);

    dialog.appendChild(title);
    dialog.appendChild(description);
    dialog.appendChild(roomLabel);
    dialog.appendChild(roomSelect);
    dialog.appendChild(componentLabel);
    dialog.appendChild(componentSelect);
    dialog.appendChild(buttons);
    overlay.appendChild(dialog);
    return { overlay, roomSelect, componentSelect, confirmBtn, cancelBtn };
}

/**
 * Update component select options based on selected room
 */
function updateComponentSelectByRoom(room, items, componentSelect) {
    const filtered = room ? items.filter(c => String(c.room || 'Unassigned') === room) : items;
    componentSelect.innerHTML = '';
    if (filtered.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = room ? `No components in ${room}` : 'No components available';
        opt.disabled = true;
        componentSelect.appendChild(opt);
    } else {
        filtered.forEach(component => {
            const opt = document.createElement('option');
            opt.value = String(component.id);
            opt.textContent = `${component.name} (${component.type}${component.room ? ' • ' + component.room : ''})`;
            componentSelect.appendChild(opt);
        });
    }
}

/**
 * Event handler for create button click
 */
function handleCreateClick() {
    const name = getComponentName();
    const type = getComponentType();
    const room = getComponentRoom();
    handleCreateComponent(name, type, room, {
        onSuccess: (info) => {
            console.log('[Action] Component created:', info);
            callbacks.clearInput();
            if (el.roomInput) el.roomInput.value = '';
            callbacks.showToast(`✨ Component "${info.name}" created!`, 'success');
            autoRefreshStats();
            autoRefreshComponentsList();
            autoRefreshEventLog();
        },
        onError: (err) => {
            callbacks.showToast(String(err), 'error');
        }
    });
}

/**
 * Event handler for remove button click
 */
function handleRemoveClick() {
    const { overlay } = createRemoveDialog(
        (componentId, ov) => {
            if (!confirm('Are you sure you want to remove this component?')) {
                closeResetDialog(ov);
                return;
            }
            handleDeleteComponent(componentId, {
                onSuccess: (res) => {
                    callbacks.showToast(`🗑️ ${res.message}`, 'success');
                    autoRefreshStats();
                    autoRefreshComponentsList();
                    autoRefreshEventLog();
                    closeResetDialog(ov);
                },
                onError: (err) => {
                    callbacks.showToast(String(err), 'error');
                    closeResetDialog(ov);
                }
            });
        },
        closeResetDialog
    );
    document.body.appendChild(overlay);
}

/**
 * Event handler for list button click
 */
function handleListClick() {
    componentsListVisible = true;
    handleGetComponents({
        onSuccess: (list) => {
            const items = Array.isArray(list) ? list : [];
            populateRoomFilterOptionsFromList(items);
            displayComponentsAccordion(applyRoomFilter(items));
            callbacks.showToast(`Found ${items.length} component(s)`, 'info');
        },
        onError: (err) => {
            callbacks.showToast(String(err), 'error');
            callbacks.displayResult(String(err), 'error');
        }
    });
}

/**
 * Event handler for stats button click
 */
function handleStatsClick() {
    console.log('[Stats] Show Stats button clicked');
    statsVisible = true;
    console.log('[Stats] statsVisible set to true');
    handleGetStats({
        onSuccess: (stats) => {
            console.log('[Stats] Initial stats loaded:', stats);
            const selectedRoom = getSelectedRoomFilter();
            if (selectedRoom) {
                handleGetComponents({
                    onSuccess: (list) => {
                        const items = Array.isArray(list) ? list : [];
                        const rs = computeRoomStats(items, selectedRoom);
                        displayStats(stats, rs);
                        callbacks.showToast('Statistics updated', 'info');
                    },
                    onError: () => { 
                        displayStats(stats);
                        callbacks.showToast('Statistics updated', 'info');
                    }
                });
            } else {
                displayStats(stats);
                callbacks.showToast('Statistics updated', 'info');
            }
        },
        onError: (err) => {
            console.error('[Stats] Error loading stats:', err);
            callbacks.showToast(String(err), 'error');
        }
    });
}

/**
 * Event handler for event log button click
 */
function handleEventLogClick() {
    eventLogVisible = true;
    handleGetEventLog(20, {
        onSuccess: (log) => {
            displayEventLog(log);
            callbacks.showToast('Event log updated', 'info');
        },
        onError: (err) => {
            callbacks.showToast(String(err), 'error');
        }
    });
}

/**
 * Event handler for reset button click
 */
function handleResetClick() {
    const { overlay, select } = createResetDialog((mode, ov) => performReset(mode, ov), closeResetDialog);
    document.body.appendChild(overlay);
    select.focus();
}

/**
 * Display statistics dashboard
 */
function displayStats(stats, roomStats = null) {
    if (!el.statsDashboard) return;
    
    const selectedRoom = getSelectedRoomFilter();
    const canFilter = selectedRoom && roomStats;
    const isFiltered = statsMode === 'filtered' && canFilter;
    
    const mainStats = isFiltered ? roomStats : stats;
    const mainByTypeData = isFiltered ? roomStats.byType : stats.byType;
    
    const byTypeHtml = (mainByTypeData instanceof Map ? Array.from(mainByTypeData.entries()) : Object.entries(mainByTypeData))
        .map(([type, count]) => `<span class="stat-badge">${type}: ${count}</span>`)
        .join('');
    const byRoomHtml = Object.entries(stats.byRoom || {})
        .map(([room, count]) => `<span class="stat-badge">${room}: ${count}</span>`)
        .join('');
    
    const modeLabel = isFiltered ? `📊 Statistics — ${selectedRoom}` : '📊 System Statistics';
    const toggleBtn = canFilter ? `<button class="component-action__btn component-action__btn--mini" id="stats-mode-toggle">${statsMode === 'global' ? 'Show Room Only' : 'Show Global'}</button>` : '';
    
    el.statsDashboard.innerHTML = `
        <div class="stats-container">
            <div class="stats-header">
                <h3 class="stats-title">${modeLabel}</h3>
                <div class="stats-header-controls">
                    ${toggleBtn}
                    <button class="component-action__close-btn" aria-label="Close">✕</button>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Components</span>
                    <span class="stat-value">${mainStats.total}</span>
                </div>
                <div class="stat-item stat-item--online">
                    <span class="stat-label">Online</span>
                    <span class="stat-value">${mainStats.online}</span>
                </div>
                <div class="stat-item stat-item--offline">
                    <span class="stat-label">Offline</span>
                    <span class="stat-value">${mainStats.offline}</span>
                </div>
            </div>
            <div class="stats-by-type">
                <h4>Components by Type${isFiltered ? ' (Room)' : ''}</h4>
                <div class="stat-badges">${byTypeHtml || '<span class="stat-badge">No components</span>'}</div>
            </div>
            ${statsMode === 'global' ? `
            <div class="stats-by-room">
                <h4>Components by Room</h4>
                <div class="stat-badges">${byRoomHtml || '<span class="stat-badge">No rooms</span>'}</div>
            </div>
            ` : ''}
        </div>
    `;
    el.statsDashboard.querySelector('.component-action__close-btn')?.addEventListener('click', () => {
        el.statsDashboard.innerHTML = '';
        statsVisible = false;
        statsMode = 'global';
    });
    const toggleBtnEl = document.getElementById('stats-mode-toggle');
    if (toggleBtnEl) {
        toggleBtnEl.addEventListener('click', () => {
            statsMode = statsMode === 'global' ? 'filtered' : 'global';
            handleGetStats({
                onSuccess: (stats) => {
                    if (selectedRoom) {
                        handleGetComponents({
                            onSuccess: (list) => {
                                const items = Array.isArray(list) ? list : [];
                                const rs = computeRoomStats(items, selectedRoom);
                                displayStats(stats, rs);
                            },
                            onError: () => { displayStats(stats); }
                        });
                    } else {
                        displayStats(stats);
                    }
                },
                onError: () => {}
            });
        });
    }
}

/** Compute stats for a specific room from component list */
function computeRoomStats(items, room) {
    const filtered = (Array.isArray(items) ? items : []).filter(c => String(c.room || 'Unassigned') === room);
    const total = filtered.length;
    let online = 0;
    let offline = 0;
    const byType = new Map();
    filtered.forEach(c => {
        const status = String(c.status || '').toLowerCase();
        if (status.includes('online')) online++; else offline++;
        const type = String(c.type || 'unknown');
        byType.set(type, (byType.get(type) || 0) + 1);
    });
    return { room, total, online, offline, byType };
}

/** Render the filtered room stats into the stats dashboard */
function renderRoomStats(roomStats) {
    const totalEl = document.getElementById('stats-room-total');
    const onlineEl = document.getElementById('stats-room-online');
    const offlineEl = document.getElementById('stats-room-offline');
    const badgesEl = document.getElementById('stats-room-badges');
    if (!totalEl || !onlineEl || !offlineEl || !badgesEl) return;
    totalEl.textContent = String(roomStats.total);
    onlineEl.textContent = String(roomStats.online);
    offlineEl.textContent = String(roomStats.offline);
    const badges = Array.from(roomStats.byType.entries()).map(([type, count]) => `<span class="stat-badge">${type}: ${count}</span>`).join('');
    badgesEl.innerHTML = badges || '<span class="stat-badge">No components</span>';
}

/**
 * Display event log
 */
function displayEventLog(log) {
    if (!el.eventLog) return;
    
    if (!Array.isArray(log) || log.length === 0) {
        el.eventLog.innerHTML = `
            <div class="event-log-container">
                <div class="event-log-header">
                    <h3 class="event-log-title">📋 Event Log</h3>
                    <button class="component-action__close-btn" aria-label="Close">✕</button>
                </div>
                <div class="event-log-empty">No events logged yet</div>
            </div>
        `;
            el.eventLog.querySelector('.component-action__close-btn')?.addEventListener('click', () => {
                el.eventLog.innerHTML = '';
                eventLogVisible = false;
            });
        return;
    }
    
    const logHtml = log.map(event => {
        const typeClass = event.type.toLowerCase();
        const time = new Date(event.timestamp).toLocaleTimeString();
        return `
            <div class="event-item event-item--${typeClass}">
                <span class="event-time">${time}</span>
                <span class="event-type">${event.type}</span>
                <span class="event-message">${event.message}</span>
            </div>
        `;
    }).join('');
    
    el.eventLog.innerHTML = `
        <div class="event-log-container">
            <div class="event-log-header">
                <h3 class="event-log-title">📋 Event Log (Last 20)</h3>
                <button class="component-action__close-btn" aria-label="Close">✕</button>
            </div>
            <div class="event-log-list">${logHtml}</div>
        </div>
    `;
    el.eventLog.querySelector('.component-action__close-btn')?.addEventListener('click', () => {
        el.eventLog.innerHTML = '';
        eventLogVisible = false;
    });
}
/**
 * Bind event listeners to buttons
 */
function bindEvents() {
    el.createBtn?.addEventListener('click', handleCreateClick);
    el.removeBtn?.addEventListener('click', handleRemoveClick);
    el.listBtn?.addEventListener('click', handleListClick);
    el.statsBtn?.addEventListener('click', handleStatsClick);
    el.eventLogBtn?.addEventListener('click', handleEventLogClick);
    el.resetBtn?.addEventListener('click', handleResetClick);
    el.roomFilter?.addEventListener('change', () => {
        if (el.roomInput) {
            el.roomInput.value = getSelectedRoomFilter() || '';
        }
        if (componentsListVisible) {
            handleGetComponents({
                onSuccess: (list) => {
                    const items = Array.isArray(list) ? list : [];
                    populateRoomFilterOptionsFromList(items);
                    displayComponentsAccordion(applyRoomFilter(items));
                },
                onError: () => {}
            });
        }
        if (statsVisible) {
            handleGetStats({
                onSuccess: (stats) => {
                    const selectedRoom = getSelectedRoomFilter();
                    if (selectedRoom) {
                        handleGetComponents({
                            onSuccess: (list) => {
                                const items = Array.isArray(list) ? list : [];
                                const rs = computeRoomStats(items, selectedRoom);
                                displayStats(stats, rs);
                            },
                            onError: () => { displayStats(stats); }
                        });
                    } else {
                        statsMode = 'global';
                        displayStats(stats);
                    }
                },
                onError: () => {}
            });
        }
    });
}

/**
 * Validate that all required DOM elements are available
 * @returns {boolean} True if all elements exist
 */
function validateElements() {
    return el.input && el.typeSelect && el.createBtn && el.removeBtn && el.listBtn && 
           el.statsBtn && el.eventLogBtn && el.resetBtn && 
           el.result && el.select && el.statsDashboard && el.eventLog;
}

/**
 * Initialize the component module
 */
function init() {
    cacheElements();

    if (!validateElements()) {
        console.warn('Component: Missing required DOM elements');
        return;
    }

    bindEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
