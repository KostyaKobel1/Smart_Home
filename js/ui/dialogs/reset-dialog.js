// UI for Reset Dialog
import { RESET_OPTIONS, closeResetDialog } from './dialog-utils.js';

export function createResetDialog(onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'reset-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'reset-dialog';

    const title = document.createElement('h3');
    title.textContent = 'Reset Data';

    const description = document.createElement('p');
    description.textContent = 'Choose what to reset:';

    const select = document.createElement('select');
    select.className = 'reset-dialog__select';
    RESET_OPTIONS.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
    });

    const help = document.createElement('div');
    help.className = 'reset-dialog__help';
    const updateHelp = (val) => {
        const current = RESET_OPTIONS.find(o => o.value === val);
        help.textContent = current ? current.description : '';
    };
    select.addEventListener('change', () => updateHelp(select.value));
    updateHelp(select.value);

    const buttons = document.createElement('div');
    buttons.className = 'reset-dialog__buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'component-action__btn component-action__btn--remove';
    cancelBtn.addEventListener('click', () => onCancel?.(overlay));

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Reset';
    confirmBtn.className = 'component-action__btn component-action__btn--reset';
    confirmBtn.addEventListener('click', () => onConfirm?.(select.value, overlay));

    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);

    dialog.appendChild(title);
    dialog.appendChild(description);
    dialog.appendChild(select);
    dialog.appendChild(help);
    dialog.appendChild(buttons);
    overlay.appendChild(dialog);
    return { overlay, select, confirmBtn, cancelBtn };
}
