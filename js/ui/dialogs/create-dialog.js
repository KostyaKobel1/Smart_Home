// ui/create-dialog.js
import { closeResetDialog } from './dialog-utils.js';

export function createComponentDialog(defaultRoom, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'reset-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'reset-dialog';

    const title = document.createElement('h3');
    title.textContent = 'Create Component';

    const description = document.createElement('p');
    description.textContent = 'Enter component details:';

    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Component name';
    nameLabel.style.display = 'block';
    nameLabel.style.marginTop = '0.75rem';
    nameLabel.style.marginBottom = '0.25rem';
    nameLabel.style.fontWeight = '600';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'reset-dialog__select';
    nameInput.placeholder = 'e.g., Ceiling Light, Front Door Lock...';
    nameInput.autocomplete = 'off';

    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Component type';
    typeLabel.style.display = 'block';
    typeLabel.style.marginTop = '0.75rem';
    typeLabel.style.marginBottom = '0.25rem';
    typeLabel.style.fontWeight = '600';

    const typeSelect = document.createElement('select');
    typeSelect.className = 'reset-dialog__select';
    typeSelect.innerHTML = `
                <option value="light">Light / Lamp</option>
                <option value="thermostat">Thermostat</option>
                <option value="lock">Smart Lock</option>
                <option value="camera">Camera</option>
                <option value="television">Television (Extended)</option>
        `;

    const roomLabel = document.createElement('label');
    roomLabel.textContent = 'Room (optional)';
    roomLabel.style.display = 'block';
    roomLabel.style.marginTop = '0.75rem';
    roomLabel.style.marginBottom = '0.25rem';
    roomLabel.style.fontWeight = '600';

    const roomInput = document.createElement('input');
    roomInput.type = 'text';
    roomInput.className = 'reset-dialog__select';
    roomInput.placeholder = 'e.g., Kitchen, Bedroom, Living Room';
    roomInput.autocomplete = 'off';
    roomInput.setAttribute('list', 'room-suggestions-modal');

    const roomDatalist = document.createElement('datalist');
    roomDatalist.id = 'room-suggestions-modal';
    roomDatalist.innerHTML = `
                <option value="Living Room"></option>
                <option value="Kitchen"></option>
                <option value="Bedroom"></option>
                <option value="Bathroom"></option>
                <option value="Hallway"></option>
                <option value="Office"></option>
                <option value="Garage"></option>
                <option value="Balcony"></option>
        `;

    if (defaultRoom) {
        roomInput.value = defaultRoom;
    }

    const buttons = document.createElement('div');
    buttons.className = 'reset-dialog__buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'component-action__btn component-action__btn--remove';
    cancelBtn.addEventListener('click', () => onCancel?.(overlay));

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Create';
    confirmBtn.className = 'component-action__btn component-action__btn--reset';
    const submit = () => {
        const name = (nameInput.value || '').trim();
        const type = typeSelect.value;
        const room = (roomInput.value || '').trim() || 'Unassigned';
        if (!name) return;
        confirmBtn.disabled = true;
        onConfirm?.(name, type, room, overlay);
        setTimeout(() => { if (document.body.contains(overlay)) confirmBtn.disabled = false; }, 300);
    };
    confirmBtn.addEventListener('click', submit);

    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);

    dialog.appendChild(title);
    dialog.appendChild(description);
    dialog.appendChild(nameLabel);
    dialog.appendChild(nameInput);
    dialog.appendChild(typeLabel);
    dialog.appendChild(typeSelect);
    dialog.appendChild(roomLabel);
    dialog.appendChild(roomInput);
    dialog.appendChild(roomDatalist);
    dialog.appendChild(buttons);
    overlay.appendChild(dialog);

    const keyHandler = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel?.(overlay);
        }
    };
    overlay.addEventListener('keydown', keyHandler);

    setTimeout(() => nameInput.focus(), 100);

    return { overlay, nameInput, typeSelect, roomInput, confirmBtn, cancelBtn };
}
