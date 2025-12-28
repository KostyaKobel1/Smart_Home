/**
 * Component Service - Manages component state and operations
 * Provides a centralized store for all component data
 */

const components = [];

/**
 * Add a new component to the store
 * @param {string} componentName - Name of the component
 * @returns {Object} Result object with success status, message, and data
 */
export function addComponent(componentName) {
    if (!componentName || typeof componentName !== 'string') {
        return { success: false, message: 'Invalid component name' };
    }

    if (components.includes(componentName)) {
        return { success: false, message: `Component "${componentName}" already exists!` };
    }

    components.push(componentName);
    return { success: true, message: `Component added`, data: componentName };
}
/**
 * Remove a component from the store
 * @param {string} componentName - Name of the component to remove
 * @returns {Object} Result object with success status and message
 */
export function removeComponent(componentName) {
    if (!componentName || typeof componentName !== 'string') {
        return { success: false, message: 'Invalid component name' };
    }

    const index = components.indexOf(componentName);
    if (index === -1) {
        return { success: false, message: `Component "${componentName}" not found.` };
    }

    components.splice(index, 1);
    return { success: true, message: `Component removed`, data: componentName };
}

/**
 * Get all components
 * @returns {Array} Copy of components array
 */
export function getComponents() {
    return [...components];
}

/**
 * Check if any components exist
 * @returns {boolean} True if components exist
 */
export function hasComponents() {
    return components.length > 0;
}

/**
 * Get total component count
 * @returns {number} Number of components
 */
export function getComponentCount() {
    return components.length;
}

/**
 * Check if specific component exists
 * @param {string} componentName - Name to check
 * @returns {boolean} True if component exists
 */
export function isComponentExists(componentName) {
    return components.includes(componentName);
}
