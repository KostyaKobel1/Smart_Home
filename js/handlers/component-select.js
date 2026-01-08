/**
 * Component Select Handler - Manages select dropdown operations
 */

import { smartHomeService } from '../services/smart-home-service.js';

const DEFAULT_OPTION = '<option value="">-- Select a component --</option>';

/**
 * Update select element with current components (value=id, label=name(type))
 * @param {HTMLSelectElement} selectElement - Select element to update
 */
export function updateSelectOptions(selectElement) {
    if (!selectElement || !(selectElement instanceof HTMLSelectElement)) {
        return;
    }

    const components = smartHomeService.listComponents();
    selectElement.innerHTML = DEFAULT_OPTION;

    components.forEach(c => {
        const option = document.createElement('option');
        option.value = String(c.id);
        const room = c.room ? ` • ${c.room}` : '';
        option.textContent = `${c.name} (${c.type}${room})`;
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
