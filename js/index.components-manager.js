import { handleCreateComponent, handleDeleteComponent, handleGetComponents, handleReset, handleGetStats, handleGetEventLog, handleComponentAction } from './handlers/smart-home-handlers.js';
import { updateSelectOptions, getSelectedComponent } from './handlers/component-select.js';

// Constants
const TOAST_DURATION = 3000;
const DOM_ELEMENT_IDS = {
    input: 'component-name-input',
    typeSelect: 'component-type-select',
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

/**
 * Refresh statistics if dashboard is visible
 */
function autoRefreshStats() {
    console.log('[Stats] Auto-refresh triggered. Visible:', statsVisible);
    if (statsVisible) {
        console.log('[Stats] Stats visible - fetching updated stats');
        handleGetStats({
            onSuccess: (stats) => {
                console.log('[Stats] Stats received:', stats);
                displayStats(stats);
            },
            onError: (error) => {
                console.warn('[Stats] Auto-refresh error:', error);
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
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    return icons[type] || icons.info;
}

/**
 * Display a toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, info)
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

    setTimeout(() => {
        toast.remove();
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
    heading.textContent = `Active Components (${components.length}):`;
    
    const closeBtn = createCloseButton(el.result);
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

function createCloseButton(container) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'component-action__close-btn';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', () => {
        container.innerHTML = '';
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
            showToast(res.message, 'success');
            autoRefreshStats();
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
    updateSelect: () => updateSelectOptions(el.select),
    clearInput: () => { if (el.input) el.input.value = ''; },
};

/**
 * Event handler for create button click
 */
function handleCreateClick() {
    const name = getComponentName();
    const type = getComponentType();
    handleCreateComponent(name, type, {
        onSuccess: (info) => {
            console.log('[Action] Component created:', info);
            callbacks.updateSelect();
            callbacks.clearInput();
            callbacks.showToast(`Component "${info.name}" (${info.type}) added successfully!`, 'success');
            callbacks.displayResult(`Component "${info.name}" added successfully.`, 'success');
            autoRefreshStats();
        },
        onError: (err) => {
            callbacks.showToast(String(err), 'error');
            callbacks.displayResult(String(err), 'error');
        }
    });
}

/**
 * Event handler for remove button click
 */
function handleRemoveClick() {
    const id = getSelectedComponent(el.select);
    handleDeleteComponent(id, {
        onSuccess: (res) => {
            callbacks.updateSelect();
            callbacks.clearInput();
            callbacks.showToast(res.message, 'success');
            callbacks.displayResult(res.message, 'success');
            autoRefreshStats();
        },
        onError: (err) => {
            callbacks.showToast(String(err), 'error');
            callbacks.displayResult(String(err), 'error');
        }
    });
}

/**
 * Event handler for list button click
 */
function handleListClick() {
    handleGetComponents({
        onSuccess: (list) => {
            const items = Array.isArray(list) ? list : [];
            displayComponentsAccordion(items);
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
            displayStats(stats);
            callbacks.showToast('Statistics updated', 'info');
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
    if (!confirm('⚠️ Are you sure you want to reset all data? This cannot be undone.')) {
        return;
    }
    
    handleReset({
        onSuccess: (res) => {
            callbacks.updateSelect();
            callbacks.clearInput();
            el.result.innerHTML = '';
            el.statsDashboard.innerHTML = '';
            el.eventLog.innerHTML = '';
            callbacks.showToast(res.message, 'success');
            callbacks.displayResult(res.message, 'success');
        },
        onError: (err) => {
            callbacks.showToast(String(err), 'error');
        }
    });
}

/**
 * Display statistics dashboard
 */
function displayStats(stats) {
    if (!el.statsDashboard) return;
    
    const byTypeHtml = Object.entries(stats.byType)
        .map(([type, count]) => `<span class="stat-badge">${type}: ${count}</span>`)
        .join('');
    
    el.statsDashboard.innerHTML = `
        <div class="stats-container">
            <div class="stats-header">
                <h3 class="stats-title">📊 System Statistics</h3>
                <button class="component-action__close-btn" aria-label="Close">✕</button>
            </div>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Components</span>
                    <span class="stat-value">${stats.total}</span>
                </div>
                <div class="stat-item stat-item--online">
                    <span class="stat-label">Online</span>
                    <span class="stat-value">${stats.online}</span>
                </div>
                <div class="stat-item stat-item--offline">
                    <span class="stat-label">Offline</span>
                    <span class="stat-value">${stats.offline}</span>
                </div>
            </div>
            <div class="stats-by-type">
                <h4>Components by Type</h4>
                <div class="stat-badges">${byTypeHtml || '<span class="stat-badge">No components</span>'}</div>
            </div>
        </div>
    `;
    el.statsDashboard.querySelector('.component-action__close-btn')?.addEventListener('click', () => {
        el.statsDashboard.innerHTML = '';
        statsVisible = false;
    });
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
    // Populate select with current components (IDs)
    updateSelectOptions(el.select);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
