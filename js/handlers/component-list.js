/**
 * Component List Handler - Manages component listing display
 */

import { getComponents, getComponentCount } from '../services/component-service.js';

/**
 * Validate callback object structure
 * @param {Object} callbacks - Callbacks object to validate
 * @returns {boolean} True if valid
 */
function validateCallbacks(callbacks) {
    return callbacks &&
           typeof callbacks.showToast === 'function' &&
           typeof callbacks.displayComponentsList === 'function';
}

/**
 * Handle component list display
 * @param {Object} callbacks - UI callback functions
 * @returns {boolean} True if components exist
 */
export function handleList(callbacks) {
    if (!validateCallbacks(callbacks)) {
        console.error('Invalid callbacks provided to handleList');
        return false;
    }

    const { showToast, displayComponentsList } = callbacks;
    const componentsList = getComponents();
    const count = getComponentCount();

    if (count > 0) {
        showToast(`Found ${count} component(s)`, 'info');
        displayComponentsList(componentsList);
        return true;
    }

    showToast('No components added yet.', 'info');
    displayComponentsList([]);
    return false;
}
