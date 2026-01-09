import { Component } from './component.model.js';

export class Light extends Component {
  constructor(id, name, brightness = 100, room = 'Unassigned') {
    super(id, name, 'light', 'offline', room);
    this.brightness = brightness;
  }
  getActions() {
    return [
      ...super.getActions(),
      {
        key: 'setBrightness',
        label: 'Set Brightness',
        kind: 'range',
        min: 0,
        max: 100,
        value: this.brightness,
        unit: '%',
      },
    ];
  }
  setBrightness(level) {
    if (Number.isNaN(level) || level < 0 || level > 100) {
      return { success: false, message: 'Brightness must be 0-100' };
    }
    this.brightness = level;
    this.lastUpdated = new Date();
    return { success: true, message: `Brightness set to ${level}%` };
  }
  getInfo() {
    return { ...super.getInfo(), brightness: this.brightness };
  }
}