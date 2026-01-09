import { Component } from './component.model.js';

export class Thermostat extends Component {
  constructor(id, name, temperature = 22, room = 'Unassigned') {
    super(id, name, 'thermostat', 'offline', room);
    this.temperature = temperature;
  }
  getActions() {
    return [
      ...super.getActions(),
      {
        key: 'setTemperature',
        label: 'Set Temperature',
        kind: 'range',
        min: 16,
        max: 30,
        value: this.temperature,
        unit: '°C',
      },
    ];
  }
  setTemperature(temp) {
    if (Number.isNaN(temp) || temp < 16 || temp > 30) {
      return { success: false, message: 'Temperature must be 16-30°C' };
    }
    this.temperature = temp;
    this.lastUpdated = new Date();
    return { success: true, message: `Temperature set to ${temp}°C` };
  }
  getInfo() {
    return { ...super.getInfo(), temperature: this.temperature };
  }
}