// UI Remove Dialog
import { closeResetDialog, updateComponentSelectByRoom } from './dialog-utils.js';

export function createRemoveDialog(getComponentsFn, onConfirm, onCancel, defaultRoom = '') {
    const overlay = document.createElement('div');
    overlay.className = 'reset-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'reset-dialog';

    const title = document.createElement('h3');
    title.textContent = 'Remove Component';

    const description = document.createElement('p');
    description.textContent = 'Select room and component to remove:';

    const roomLabel = document.createElement('label');
    roomLabel.textContent = 'Room';
    roomLabel.style.display = 'block';
    roomLabel.style.marginTop = '0.75rem';
    roomLabel.style.marginBottom = '0.25rem';
    roomLabel.style.fontWeight = '600';

    const roomSelect = document.createElement('select');
    roomSelect.className = 'reset-dialog__select';
    roomSelect.innerHTML = '<option value="">Loading rooms...</option>';

    const componentLabel = document.createElement('label');
    componentLabel.textContent = 'Component';
    componentLabel.style.display = 'block';
    componentLabel.style.marginTop = '0.75rem';
    componentLabel.style.marginBottom = '0.25rem';
    componentLabel.style.fontWeight = '600';

    const componentSelect = document.createElement('select');
    componentSelect.className = 'reset-dialog__select';
    componentSelect.innerHTML = '<option value="">Select room first</option>';

    getComponentsFn({
        onSuccess: (list) => {
            const items = Array.isArray(list) ? list : [];
            const rooms = Array.from(new Set(items.map(c => String(c.room || 'Unassigned')))).sort();
            roomSelect.innerHTML = '';
            const allOpt = document.createElement('option');
            allOpt.value = '';
            allOpt.textContent = 'All Rooms';
            roomSelect.appendChild(allOpt);
            rooms.forEach(room => {
                const opt = document.createElement('option');
                opt.value = room;
                opt.textContent = room;
                roomSelect.appendChild(opt);
            });
            roomSelect.value = defaultRoom || '';
            updateComponentSelectByRoom(roomSelect.value, items, componentSelect);
        },
        onError: () => {
            roomSelect.innerHTML = '<option value="">Error loading rooms</option>';
        }
    });

    roomSelect.addEventListener('change', () => {
        getComponentsFn({
            onSuccess: (list) => {
                const items = Array.isArray(list) ? list : [];
                updateComponentSelectByRoom(roomSelect.value, items, componentSelect);
            },
            onError: () => {}
        });
    });

    const buttons = document.createElement('div');
    buttons.className = 'reset-dialog__buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'component-action__btn component-action__btn--remove';
    cancelBtn.addEventListener('click', () => onCancel?.(overlay));

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Remove';
    confirmBtn.className = 'component-action__btn component-action__btn--reset';
    confirmBtn.addEventListener('click', () => {
        const componentId = componentSelect.value;
        if (!componentId) return;
        onConfirm?.(componentId, overlay);
    });

    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);

    dialog.appendChild(title);
    dialog.appendChild(description);
    dialog.appendChild(roomLabel);
    dialog.appendChild(roomSelect);
    dialog.appendChild(componentLabel);
    dialog.appendChild(componentSelect);
    dialog.appendChild(buttons);
    overlay.appendChild(dialog);
    return { overlay, roomSelect, componentSelect, confirmBtn, cancelBtn };
}