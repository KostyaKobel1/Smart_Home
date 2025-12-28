/**
 * Component Remove Handler - Manages component deletion workflow
 */

import { Base } from '../index-base.js';
import { removeComponent } from '../services/component-service.js';

/**
 * Validate callback object structure
 * @param {Object} callbacks - Callbacks object to validate
 * @returns {boolean} True if valid
 */
function validateCallbacks(callbacks) {
    return callbacks && 
           typeof callbacks.showToast === 'function' &&
           typeof callbacks.displayResult === 'function' &&
           typeof callbacks.updateSelect === 'function' &&
           typeof callbacks.clearInput === 'function';
}

/**
 * Handle component removal
 * @param {string} componentName - Name of component to remove
 * @param {Object} callbacks - UI callback functions
 * @returns {boolean} Success status
 */
export function handleRemove(componentName, callbacks) {
    if (!validateCallbacks(callbacks)) {
        console.error('Invalid callbacks provided to handleRemove');
        return false;
    }

    const { showToast, displayResult, updateSelect, clearInput } = callbacks;

    if (!componentName || typeof componentName !== 'string') {
        const errorMsg = 'Please select a component.';
        showToast(errorMsg, 'error');
        displayResult(errorMsg, 'error');
        return false;
    }

    // Remove from service
    const serviceResult = removeComponent(componentName);
    if (!serviceResult.success) {
        showToast(serviceResult.message, 'error');
        displayResult(serviceResult.message, 'error');
        return false;
    }

    // Remove component via Base class
    try {
        const componentInstance = new Base(componentName, 'remove');
        const result = componentInstance.actionOnComponent('remove');

        // Update UI
        updateSelect();
        clearInput();

        const successMsg = `Component "${result}" removed successfully!`;
        showToast(successMsg, 'success');
        displayResult(successMsg, 'success');

        return true;
    } catch (error) {
        console.error('Error removing component:', error);
        const errorMsg = 'Error removing component.';
        showToast(errorMsg, 'error');
        displayResult(errorMsg, 'error');
        return false;
    }
}
