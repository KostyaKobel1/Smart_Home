// Component Model - base type

export class Component {
  constructor(id, name, type, status = 'offline', room = 'Unassigned') {
    this.id = id;
    this.name = name;
    this.type = type; // 'light', 'thermostat', 'lock', 'camera', etc.
    this.status = status; // 'online' | 'offline'
    this.room = room;
    this.createdAt = new Date();
    this.lastUpdated = new Date();
  }
  getActions() {
    return [
      { key: 'on', label: 'On' },
      { key: 'off', label: 'Off' },
      { key: 'toggle', label: 'Toggle' }
    ];
  }
  turnOn() {
    this.status = 'online';
    this.lastUpdated = new Date();
    return { success: true, message: `${this.name} turned on` };
  }
  turnOff() {
    this.status = 'offline';
    this.lastUpdated = new Date();
    return { success: true, message: `${this.name} turned off` };
  }
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      room: this.room,
      lastUpdated: this.lastUpdated.toISOString(),
      actions: this.getActions(),
    };
  }
}
