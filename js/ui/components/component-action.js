// ui/component-action.js


export function getParamNameForAction(key) {
  switch (String(key).toLowerCase()) {
    case 'setbrightness': return 'brightness';
    case 'settemperature': return 'temperature';
    case 'setvolume': return 'volume';
    case 'setchannel': return 'channel';
    default: return 'value';
  }
}

export function buildActionControls(component, executeAndToast) {
  const wrap = document.createElement('div');
  wrap.className = 'component-actions';

  const actions = Array.isArray(component.actions) ? component.actions : [];
  const actionByKey = new Map(actions.map(action => [String(action.key).toLowerCase(), action]));

  const powerKeys = ['on', 'off', 'toggle'];
  const hasPower = powerKeys.some(key => actionByKey.has(key));
  if (hasPower) {
    const row = document.createElement('div');
    row.className = 'component-actions__row';
    const label = document.createElement('span');
    label.className = 'component-actions__label';
    label.textContent = 'Power';
    row.appendChild(label);

    powerKeys.forEach(key => {
      if (!actionByKey.has(key)) return;
      const btn = document.createElement('button');
      btn.className = 'component-action__btn component-action__btn--mini';
      btn.textContent = actionByKey.get(key).label || key;
      btn.addEventListener('click', () => executeAndToast(component.id, key));
      row.appendChild(btn);
    });
    wrap.appendChild(row);
  }

  const groupedSets = [
    { label: 'Lock', keys: ['lock', 'unlock'] },
    { label: 'Recording', keys: ['record', 'stop'] },
    { label: 'Volume', keys: ['mute', 'unmute', 'volumeup', 'volumedown'] },
    { label: 'Channel', keys: ['channelup', 'channeldown'] },
    { label: 'Input Source', keys: ['inputtv', 'inputhdmi1', 'inputhdmi2', 'inputusb'] },
    { label: 'Info', keys: ['getchannels'] },
  ];
  groupedSets.forEach(group => {
    const presentKeys = group.keys.filter(key => actionByKey.has(key));
    if (presentKeys.length === 0) return;
    const row = document.createElement('div');
    row.className = 'component-actions__row';
    const label = document.createElement('span');
    label.className = 'component-actions__label';
    label.textContent = group.label;
    row.appendChild(label);
    presentKeys.forEach(key => {
      const actionSpec = actionByKey.get(key);
      const btn = document.createElement('button');
      btn.className = 'component-action__btn component-action__btn--mini';
      btn.textContent = actionSpec.label || key;
      btn.addEventListener('click', () => executeAndToast(component.id, key));
      row.appendChild(btn);
    });
    wrap.appendChild(row);
    presentKeys.forEach(key => actionByKey.delete(key));
  });

  actionByKey.forEach(actionSpec => {
    const key = String(actionSpec.key).toLowerCase();
    const kind = String(actionSpec.kind || 'button').toLowerCase();
    if (kind === 'range') {
      const row = document.createElement('div');
      row.className = 'component-actions__row';
      const label = document.createElement('span');
      label.className = 'component-actions__label';
      label.textContent = actionSpec.label || 'Adjust';
      const slider = document.createElement('input');
      slider.type = 'range';
      if (typeof actionSpec.min === 'number') slider.min = String(actionSpec.min);
      if (typeof actionSpec.max === 'number') slider.max = String(actionSpec.max);
      if (typeof actionSpec.value === 'number') slider.value = String(actionSpec.value);
      slider.className = 'component-actions__slider';
      const valueDisplay = document.createElement('span');
      valueDisplay.className = 'component-actions__value';
      const unit = actionSpec.unit ? String(actionSpec.unit) : '';
      valueDisplay.textContent = `${slider.value}${unit}`;
      slider.addEventListener('input', () => { valueDisplay.textContent = `${slider.value}${unit}`; });
      const btn = document.createElement('button');
      btn.className = 'component-action__btn component-action__btn--mini';
      btn.textContent = 'Set';
      const paramName = getParamNameForAction(key);
      btn.addEventListener('click', () => executeAndToast(component.id, key, { [paramName]: Number(slider.value) }));
      row.appendChild(label);
      row.appendChild(slider);
      row.appendChild(valueDisplay);
      row.appendChild(btn);
      wrap.appendChild(row);
    } else {
      const row = document.createElement('div');
      row.className = 'component-actions__row';
      const label = document.createElement('span');
      label.className = 'component-actions__label';
      label.textContent = actionSpec.label || key;
      const btn = document.createElement('button');
      btn.className = 'component-action__btn component-action__btn--mini';
      btn.textContent = actionSpec.label || key;
      btn.addEventListener('click', () => executeAndToast(component.id, key));
      row.appendChild(label);
      row.appendChild(btn);
      wrap.appendChild(row);
    }
  });

  const footer = document.createElement('div');
  footer.className = 'component-actions__footer';
  const updated = document.createElement('span');
  updated.className = 'component-actions__updated';
  updated.textContent = `Updated: ${new Date(component.lastUpdated).toLocaleString()}`;
  footer.appendChild(updated);
  wrap.appendChild(footer);

  return wrap;
}
