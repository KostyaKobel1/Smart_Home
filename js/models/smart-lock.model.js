import { Component } from './component.model.js';

export class SmartLock extends Component {
  constructor(id, name, isLocked = true, room = 'Unassigned') {
    super(id, name, 'lock', 'offline', room);
    this.isLocked = isLocked;
  }
  getActions() {
    return [
      ...super.getActions(),
      { key: 'lock', label: 'Lock' },
      { key: 'unlock', label: 'Unlock' },
    ];
  }
  lock() {
    this.isLocked = true;
    this.lastUpdated = new Date();
    return { success: true, message: `${this.name} is now locked` };
  }
  unlock() {
    this.isLocked = false;
    this.lastUpdated = new Date();
    return { success: true, message: `${this.name} is now unlocked` };
  }
  getInfo() {
    return { ...super.getInfo(), isLocked: this.isLocked };
  }
}