export function computeRoomStats(items, room) {
    const filtered = (Array.isArray(items) ? items : []).filter(c => String(c.room || 'Unassigned') === room);
    const total = filtered.length;
    let online = 0;
    let offline = 0;
    const byType = new Map();
    filtered.forEach(c => {
        const status = String(c.status || '').toLowerCase();
        if (status.includes('online')) online++; else offline++;
        const type = String(c.type || 'unknown');
        byType.set(type, (byType.get(type) || 0) + 1);
    });
    return { room, total, online, offline, byType };
}

export function displayStats(container, stats, roomStats = null, { selectedRoom, statsMode, onToggleMode, onClose } = {}) {
    if (!container) return;

    const canFilter = selectedRoom && roomStats;
    const isFiltered = statsMode === 'filtered' && canFilter;

    const mainStats = isFiltered ? roomStats : stats;
    const mainByTypeData = isFiltered ? roomStats.byType : stats.byType;

    const byTypeEntries = mainByTypeData instanceof Map ? Array.from(mainByTypeData.entries()) : Object.entries(mainByTypeData || {});
    const byTypeHtml = byTypeEntries
        .map(([type, count]) => `<span class="stat-badge">${type}: ${count}</span>`)
        .join('');
    const byRoomHtml = Object.entries(stats.byRoom || {})
        .map(([room, count]) => `<span class="stat-badge">${room}: ${count}</span>`)
        .join('');

    const modeLabel = isFiltered ? `📊 Statistics — ${selectedRoom}` : '📊 System Statistics';
    const toggleBtn = canFilter ? `<button class="component-action__btn component-action__btn--mini" id="stats-mode-toggle">${statsMode === 'global' ? 'Show Room Only' : 'Show Global'}</button>` : '';

    container.innerHTML = `
        <div class="stats-container">
            <div class="stats-header">
                <h3 class="stats-title">${modeLabel}</h3>
                <div class="stats-header-controls">
                    ${toggleBtn}
                    <button class="component-action__close-btn" aria-label="Close">✕</button>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Components</span>
                    <span class="stat-value">${mainStats.total}</span>
                </div>
                <div class="stat-item stat-item--online">
                    <span class="stat-label">Online</span>
                    <span class="stat-value">${mainStats.online}</span>
                </div>
                <div class="stat-item stat-item--offline">
                    <span class="stat-label">Offline</span>
                    <span class="stat-value">${mainStats.offline}</span>
                </div>
            </div>
            <div class="stats-by-type">
                <h4>Components by Type${isFiltered ? ' (Room)' : ''}</h4>
                <div class="stat-badges">${byTypeHtml || '<span class="stat-badge">No components</span>'}</div>
            </div>
            ${statsMode === 'global' ? `
            <div class="stats-by-room">
                <h4>Components by Room</h4>
                <div class="stat-badges">${byRoomHtml || '<span class="stat-badge">No rooms</span>'}</div>
            </div>
            ` : ''}
        </div>
    `;

    container.querySelector('.component-action__close-btn')?.addEventListener('click', () => onClose?.());
    const toggleBtnEl = document.getElementById('stats-mode-toggle');
    if (toggleBtnEl) {
        toggleBtnEl.addEventListener('click', () => onToggleMode?.());
    }
}

export function renderRoomStats(roomStats) {
    const totalEl = document.getElementById('stats-room-total');
    const onlineEl = document.getElementById('stats-room-online');
    const offlineEl = document.getElementById('stats-room-offline');
    const badgesEl = document.getElementById('stats-room-badges');
    if (!totalEl || !onlineEl || !offlineEl || !badgesEl) return;
    totalEl.textContent = String(roomStats.total);
    onlineEl.textContent = String(roomStats.online);
    offlineEl.textContent = String(roomStats.offline);
    const badges = Array.from(roomStats.byType.entries()).map(([type, count]) => `<span class="stat-badge">${type}: ${count}</span>`).join('');
    badgesEl.innerHTML = badges || '<span class="stat-badge">No components</span>';
}
