const TOAST_DURATION = 3000; // 3 seconds

// Ensure toast container exists in DOM
export function ensureToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

// Map toast type to icon
export function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        create: '✨',
        delete: '🗑️',
        update: '🔄',
    };
    return icons[type] || icons.info;
}

// Display a toast notification
export function showToast(message, type = 'info') {
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
        toast.style.animation = 'toastFadeOut 0.4s ease-in forwards';
        setTimeout(() => toast.remove(), 400);
    }, TOAST_DURATION);
}
