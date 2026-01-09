import { buildActionControls } from './component-action.js';

export function createCloseButton(onClose = null) {
  const closeBtn = document.createElement('button');
  closeBtn.className = 'component-action__close-btn';
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.addEventListener('click', () => onClose?.());
  return closeBtn;
}

export function displayComponentsList(list, containerEl) {
  if (!containerEl) return;
  containerEl.className = 'component-action__result component-action__result--success';
  containerEl.innerHTML = '';

  const heading = document.createElement('strong');
  heading.className = 'component-action__result-heading';
  heading.textContent = `Active Components (${list.length}):`;
  containerEl.appendChild(heading);

  const ul = document.createElement('ul');
  ul.className = 'component-action__result-list';
  list.forEach(item => {
    const li = document.createElement('li');
    li.className = 'component-action__result-item';
    li.textContent = item;
    ul.appendChild(li);
  });

  containerEl.appendChild(ul);
}

export function displayComponentsAccordion(components, { container, selectedRoom, executeAndToast, onClose }) {
  if (!container) return;
  container.className = 'component-action__result component-action__result--success';
  container.innerHTML = '';

  const headerWrapper = document.createElement('div');
  headerWrapper.className = 'component-action__header-wrapper';

  const heading = document.createElement('strong');
  heading.className = 'component-action__result-heading';
  heading.textContent = selectedRoom ? `Active Components (${components.length}) — Room: ${selectedRoom}` : `Active Components (${components.length}):`;

  const closeBtn = createCloseButton(() => onClose?.());
  headerWrapper.appendChild(heading);
  headerWrapper.appendChild(closeBtn);
  container.appendChild(headerWrapper);

  const acc = document.createElement('div');
  acc.className = 'component-accordion';

  components.forEach(component => {
    const item = document.createElement('div');
    item.className = 'component-accordion__item';
    item.dataset.id = String(component.id);
    item.dataset.type = String(component.type);

    const header = document.createElement('div');
    header.className = 'component-accordion__header';
    header.innerHTML = `
        <span class="component-accordion__title">${component.name}</span>
        <span class="component-accordion__meta">${component.type} • ${component.status}</span>
        <span class="component-accordion__chevron">▾</span>
    `;

    const panel = document.createElement('div');
    panel.className = 'component-accordion__panel';

    const controls = buildActionControls(component, executeAndToast);
    panel.appendChild(controls);

    header.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      panel.style.maxHeight = open ? `${panel.scrollHeight}px` : '0px';
    });

    item.appendChild(header);
    item.appendChild(panel);
    acc.appendChild(item);
  });

  container.appendChild(acc);
}
