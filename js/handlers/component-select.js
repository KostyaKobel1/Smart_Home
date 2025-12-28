/**
 * Component Select Handler - Manages select dropdown operations
 */

import { getComponents } from '../services/component-service.js';

const DEFAULT_OPTION = '<option value="">-- Select a component --</option>';

/**
 * Update select element with current components
 * @param {HTMLSelectElement} selectElement - Select element to update
 */
export function updateSelectOptions(selectElement) {
    if (!selectElement || !(selectElement instanceof HTMLSelectElement)) {
        return;
    }

    const components = getComponents();
    selectElement.innerHTML = DEFAULT_OPTION;

    components.forEach(component => {
        const option = document.createElement('option');
        option.value = component;
        option.textContent = component;
        selectElement.appendChild(option);
    });
}

/**
 * Get the currently selected component value
 * @param {HTMLSelectElement} selectElement - Select element
 * @returns {string} Selected component name or empty string
 */
export function getSelectedComponent(selectElement) {
    if (!selectElement || !(selectElement instanceof HTMLSelectElement)) {
        return '';
    }
    return (selectElement.value || '').trim();
}

/**
 * Clear select element value
 * @param {HTMLSelectElement} selectElement - Select element to clear
 */
export function clearSelectValue(selectElement) {
    if (selectElement && selectElement instanceof HTMLSelectElement) {
        selectElement.value = '';
    }
}
