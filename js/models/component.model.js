// Component Model - base and specific types

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

export class Television extends Component {
  constructor(id, name, room = 'Unassigned') {
    super(id, name, 'television', 'offline', room);
    this.volume = 50;
    this.currentChannel = 1;
    this.channels = [
      { number: 1, name: 'UA:Перший' },
      { number: 2, name: 'СТБ' },
      { number: 3, name: '1+1' },
      { number: 4, name: 'ICTV' },
      { number: 5, name: 'Новий канал' },
      { number: 6, name: 'Інтер' },
      { number: 7, name: 'ТРК Україна' },
      { number: 8, name: 'ТЕТ' },
      { number: 9, name: 'К1' },
      { number: 10, name: 'НТН' },
    ];
    this.inputSource = 'TV'; // TV, HDMI1, HDMI2, USB
    this.isMuted = false;
  }

  getActions() {
    return [
      ...super.getActions(),
      {
        key: 'setVolume',
        label: 'Volume',
        kind: 'range',
        min: 0,
        max: 100,
        value: this.volume,
        unit: '',
      },
      {
        key: 'setChannel',
        label: 'Channel',
        kind: 'range',
        min: 1,
        max: this.channels.length,
        value: this.currentChannel,
        unit: '',
      },
      { key: 'mute', label: 'Mute' },
      { key: 'unmute', label: 'Unmute' },
      { key: 'channelUp', label: 'Channel +' },
      { key: 'channelDown', label: 'Channel -' },
      { key: 'volumeUp', label: 'Volume +' },
      { key: 'volumeDown', label: 'Volume -' },
      { key: 'inputTV', label: 'Input: TV' },
      { key: 'inputHDMI1', label: 'Input: HDMI1' },
      { key: 'inputHDMI2', label: 'Input: HDMI2' },
      { key: 'inputUSB', label: 'Input: USB' },
      { key: 'getChannels', label: 'Show Channels' },
    ];
  }

  setVolume(level) {
    if (Number.isNaN(level) || level < 0 || level > 100) {
      return { success: false, message: 'Volume must be 0-100' };
    }
    this.volume = level;
    this.isMuted = false;
    this.lastUpdated = new Date();
    return { success: true, message: `Volume set to ${level}` };
  }

  mute() {
    this.isMuted = true;
    this.lastUpdated = new Date();
    return { success: true, message: `${this.name} muted` };
  }

  unmute() {
    this.isMuted = false;
    this.lastUpdated = new Date();
    return { success: true, message: `${this.name} unmuted` };
  }

  volumeUp() {
    this.volume = Math.min(100, this.volume + 5);
    this.isMuted = false;
    this.lastUpdated = new Date();
    return { success: true, message: `Volume: ${this.volume}` };
  }

  volumeDown() {
    this.volume = Math.max(0, this.volume - 5);
    this.lastUpdated = new Date();
    return { success: true, message: `Volume: ${this.volume}` };
  }

  setChannel(number) {
    if (Number.isNaN(number) || number < 1 || number > this.channels.length) {
      return { success: false, message: `Channel must be 1-${this.channels.length}` };
    }
    this.currentChannel = number;
    const channel = this.channels.find(ch => ch.number === number);
    this.lastUpdated = new Date();
    return { 
      success: true, 
      message: `Channel ${number}: ${channel ? channel.name : 'Unknown'}` 
    };
  }

  channelUp() {
    this.currentChannel = this.currentChannel >= this.channels.length ? 1 : this.currentChannel + 1;
    const channel = this.channels.find(ch => ch.number === this.currentChannel);
    this.lastUpdated = new Date();
    return { 
      success: true, 
      message: `Channel ${this.currentChannel}: ${channel ? channel.name : 'Unknown'}` 
    };
  }

  channelDown() {
    this.currentChannel = this.currentChannel <= 1 ? this.channels.length : this.currentChannel - 1;
    const channel = this.channels.find(ch => ch.number === this.currentChannel);
    this.lastUpdated = new Date();
    return { 
      success: true, 
      message: `Channel ${this.currentChannel}: ${channel ? channel.name : 'Unknown'}` 
    };
  }

  setInputSource(source) {
    const validSources = ['TV', 'HDMI1', 'HDMI2', 'USB'];
    if (!validSources.includes(source)) {
      return { success: false, message: 'Invalid input source' };
    }
    this.inputSource = source;
    this.lastUpdated = new Date();
    return { success: true, message: `Input source: ${source}` };
  }

  inputTV() {
    return this.setInputSource('TV');
  }

  inputHDMI1() {
    return this.setInputSource('HDMI1');
  }

  inputHDMI2() {
    return this.setInputSource('HDMI2');
  }

  inputUSB() {
    return this.setInputSource('USB');
  }

  getChannels() {
    const list = this.channels.map(ch => `${ch.number}. ${ch.name}`).join(', ');
    return { 
      success: true, 
      message: `Available channels: ${list}`,
      data: this.channels 
    };
  }

  getInfo() {
    const currentChannelInfo = this.channels.find(ch => ch.number === this.currentChannel);
    return {
      ...super.getInfo(),
      volume: this.volume,
      isMuted: this.isMuted,
      currentChannel: this.currentChannel,
      channelName: currentChannelInfo ? currentChannelInfo.name : 'Unknown',
      inputSource: this.inputSource,
      totalChannels: this.channels.length,
    };
  }
}
