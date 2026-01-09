export function displayEventLog(log, { container, onClose } = {}) {
    if (!container) return;

    if (!Array.isArray(log) || log.length === 0) {
        container.innerHTML = `
            <div class="event-log-container">
                <div class="event-log-header">
                    <h3 class="event-log-title">📋 Event Log</h3>
                    <button class="component-action__close-btn" aria-label="Close">✕</button>
                </div>
                <div class="event-log-empty">No events logged yet</div>
            </div>
        `;
        container.querySelector('.component-action__close-btn')?.addEventListener('click', () => onClose?.());
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

    container.innerHTML = `
        <div class="event-log-container">
            <div class="event-log-header">
                <h3 class="event-log-title">📋 Event Log (Last 20)</h3>
                <button class="component-action__close-btn" aria-label="Close">✕</button>
            </div>
            <div class="event-log-list">${logHtml}</div>
        </div>
    `;
    container.querySelector('.component-action__close-btn')?.addEventListener('click', () => onClose?.());
}
