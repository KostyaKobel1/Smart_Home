/**
 * Component Create Handler - Manages component creation workflow
 */

import { Base } from '../index-base.js';
import { addComponent } from '../services/component-service.js';

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
 * Handle component creation
 * @param {string} componentName - Name of component to create
 * @param {Object} callbacks - UI callback functions
 * @returns {boolean} Success status
 */
export function handleCreate(componentName, callbacks) {
    if (!validateCallbacks(callbacks)) {
        console.error('Invalid callbacks provided to handleCreate');
        return false;
    }

    const { showToast, displayResult, updateSelect, clearInput } = callbacks;

    if (!componentName || typeof componentName !== 'string') {
        const errorMsg = 'Please enter a component name.';
        showToast(errorMsg, 'error');
        displayResult(errorMsg, 'error');
        return false;
    }

    // Check if component already exists
    const serviceResult = addComponent(componentName);
    if (!serviceResult.success) {
        showToast(serviceResult.message, 'error');
        displayResult(serviceResult.message, 'error');
        return false;
    }

    // Create component via Base class
    try {
        const componentInstance = new Base(componentName, 'add');
        const result = componentInstance.actionOnComponent('add');

        // Update UI
        updateSelect();
        clearInput();

        const successMsg = `Component "${result}" added successfully!`;
        showToast(successMsg, 'success');
        displayResult(successMsg, 'success');

        return true;
    } catch (error) {
        console.error('Error creating component:', error);
        const errorMsg = 'Error creating component.';
        showToast(errorMsg, 'error');
        displayResult(errorMsg, 'error');
        return false;
    }
}
