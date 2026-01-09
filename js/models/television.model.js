import { Component } from './component.model.js';

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