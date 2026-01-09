import { Component } from './component.model.js';

export class Camera extends Component {
  constructor(id, name, isRecording = false, room = 'Unassigned') {
    super(id, name, 'camera', 'offline', room);
    this.isRecording = isRecording;
  }
  getActions() {
    return [
      ...super.getActions(),
      { key: 'record', label: 'Start Recording' },
      { key: 'stop', label: 'Stop Recording' },
    ];
  }
  startRecording() {
    this.isRecording = true;
    this.lastUpdated = new Date();
    return { success: true, message: `${this.name} recording started` };
  }
  stopRecording() {
    this.isRecording = false;
    this.lastUpdated = new Date();
    return { success: true, message: `${this.name} recording stopped` };
  }
  getInfo() {
    return { ...super.getInfo(), isRecording: this.isRecording };
  }
}