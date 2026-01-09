// UI Components Filters - functions to populate and apply filters

export function populateRoomFilterOptionsFromList(list, roomFilterEl) {
  if (!roomFilterEl) return;
  const prev = roomFilterEl.value;
  const rooms = Array.from(new Set((Array.isArray(list) ? list : []).map(c => String(c.room || 'Unassigned')))).sort();
  roomFilterEl.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value = '';
  allOpt.textContent = 'All Rooms';
  roomFilterEl.appendChild(allOpt);
  rooms.forEach(room => {
    const opt = document.createElement('option');
    opt.value = room;
    opt.textContent = room;
    roomFilterEl.appendChild(opt);
  });
  if (prev && rooms.includes(prev)) roomFilterEl.value = prev; else roomFilterEl.value = '';
}

export function applyRoomFilter(list, selectedRoom) {
  if (!selectedRoom) return list;
  return (Array.isArray(list) ? list : []).filter(c => String(c.room || 'Unassigned') === selectedRoom);
}
