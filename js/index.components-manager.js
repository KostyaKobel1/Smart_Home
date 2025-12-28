import { handleCreate } from './handlers/component-create.js';
import { handleRemove } from './handlers/component-remove.js';
import { handleList } from './handlers/component-list.js';
import { updateSelectOptions, getSelectedComponent } from './handlers/component-select.js';

// Constants
const TOAST_DURATION = 3000;
const DOM_ELEMENT_IDS = {
    input: 'component-name-input',
    createBtn: 'create-component-btn',
    removeBtn: 'remove-component-btn',
    listBtn: 'get-full-list-of-components-btn',
    result: 'component-action-result',
    select: 'component-action__select',
};

// DOM element cache
const el = {
    input: null,
    createBtn: null,
    removeBtn: null,
    listBtn: null,
    result: null,
    select: null,
};

/**
 * Cache all DOM elements
 */
function cacheElements() {
    el.input = document.getElementById(DOM_ELEMENT_IDS.input);
    el.createBtn = document.getElementById(DOM_ELEMENT_IDS.createBtn);
    el.removeBtn = document.getElementById(DOM_ELEMENT_IDS.removeBtn);
    el.listBtn = document.getElementById(DOM_ELEMENT_IDS.listBtn);
    el.result = document.getElementById(DOM_ELEMENT_IDS.result);
    el.select = document.getElementById(DOM_ELEMENT_IDS.select);
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
 * Get trimmed component name from input
 * @returns {string} Component name or empty string
 */
function getComponentName() {
    return (el.input?.value || '').trim();
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
    handleCreate(getComponentName(), callbacks);
}

/**
 * Event handler for remove button click
 */
function handleRemoveClick() {
    handleRemove(getSelectedComponent(el.select), callbacks);
}

/**
 * Event handler for list button click
 */
function handleListClick() {
    handleList(callbacks);
}
/**
 * Bind event listeners to buttons
 */
function bindEvents() {
    el.createBtn?.addEventListener('click', handleCreateClick);
    el.removeBtn?.addEventListener('click', handleRemoveClick);
    el.listBtn?.addEventListener('click', handleListClick);
}

/**
 * Validate that all required DOM elements are available
 * @returns {boolean} True if all elements exist
 */
function validateElements() {
    return el.input && el.createBtn && el.removeBtn && el.listBtn && el.result && el.select;
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
