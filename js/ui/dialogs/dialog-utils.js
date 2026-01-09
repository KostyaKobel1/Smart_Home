// Utility functions for dialog management

export const RESET_OPTIONS = [
    { value: 'event-log', label: 'Clear event log', description: 'Clears the event log only. Devices and statistics remain.' },
    { value: 'factory', label: 'Factory reset (all data)', description: 'Removes all devices, counters, and the event log. Full wipe.' },
];

export function closeResetDialog(overlay) {
    if (overlay && overlay.parentElement) {
        overlay.parentElement.removeChild(overlay);
    }
}

export function updateComponentSelectByRoom(room, items, componentSelect) {
    const filtered = room ? items.filter(c => String(c.room || 'Unassigned') === room) : items;
    componentSelect.innerHTML = '';
    if (filtered.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = room ? `No components in ${room}` : 'No components available';
        opt.disabled = true;
        componentSelect.appendChild(opt);
    } else {
        filtered.forEach(component => {
            const opt = document.createElement('option');
            opt.value = String(component.id);
            opt.textContent = `${component.name} (${component.type}${component.room ? ' • ' + component.room : ''})`;
            componentSelect.appendChild(opt);
        });
    }
}
