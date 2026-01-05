// SmartHomeService - orchestrates components and actions
import { Component, Light, Thermostat, SmartLock, Camera, Television } from '../models/component.model.js';

export class SmartHomeService {
  constructor() {
    this.components = new Map();
    this.componentCounter = 0;
    this.eventLog = [];
    this.STORAGE_KEYS = {
      components: 'smartHome.components',
      counter: 'smartHome.counter',
      eventLog: 'smartHome.eventLog',
    };
    this.load();
  }
/**
 * SmartHomeService
 * - Stores components in-memory (Map)
 * - Persists state to localStorage (components + counter)
 * - Logs events for diagnostics (keeps last 50)
 * Flows:
 *   create/remove/execute -> update in-memory -> save() -> logEvent()
 *   stats/list -> derived from in-memory state
 */

  createComponent(name, type = 'generic') {
    const id = ++this.componentCounter;
    let component;
    switch ((type || '').toLowerCase()) {
      case 'light':
        component = new Light(id, name);
        break;
      case 'thermostat':
        component = new Thermostat(id, name);
        break;
      case 'lock':
        component = new SmartLock(id, name);
        break;
      case 'camera':
        component = new Camera(id, name);
        break;
      case 'television':
      case 'tv':
        component = new Television(id, name);
        break;
      default:
        component = new Component(id, name, type || 'generic');
    }
    this.components.set(id, component);
    this.logEvent('CREATE', `Component "${name}" (${component.type}) created`);
    this.save();
    return component.getInfo();
  }

  removeComponent(id) {
    const component = this.components.get(id);
    if (!component) return { success: false, message: 'Component not found' };
    this.components.delete(id);
    this.logEvent('DELETE', `Component "${component.name}" deleted`);
    this.save();
    return { success: true, message: `${component.name} removed` };
  }

  getComponent(id) {
    return this.components.get(id) || null;
  }

  listComponents() {
    return Array.from(this.components.values()).map(component => component.getInfo());
  }

  executeAction(id, action, params = {}) {
    const component = this.components.get(id);
    if (!component) return { success: false, message: 'Component not found' };

    let result = { success: false, message: 'Unknown action' };
    switch ((action || '').toLowerCase()) {
      case 'toggle':
        result = component.status === 'online' ? component.turnOff() : component.turnOn();
        break;
      case 'on':
        result = component.turnOn();
        break;
      case 'off':
        result = component.turnOff();
        break;
      case 'setbrightness':
        if (component instanceof Light) result = component.setBrightness(params.brightness);
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'settemperature':
        if (component instanceof Thermostat) result = component.setTemperature(params.temperature);
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'lock':
        if (component instanceof SmartLock) result = component.lock();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'unlock':
        if (component instanceof SmartLock) result = component.unlock();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'record':
        if (component instanceof Camera) result = component.startRecording();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'stop':
        if (component instanceof Camera) result = component.stopRecording();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'setvolume':
        if (component instanceof Television) result = component.setVolume(params.volume);
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'setchannel':
        if (component instanceof Television) result = component.setChannel(params.channel);
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'mute':
        if (component instanceof Television) result = component.mute();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'unmute':
        if (component instanceof Television) result = component.unmute();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'channelup':
        if (component instanceof Television) result = component.channelUp();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'channeldown':
        if (component instanceof Television) result = component.channelDown();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'volumeup':
        if (component instanceof Television) result = component.volumeUp();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'volumedown':
        if (component instanceof Television) result = component.volumeDown();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'inputtv':
        if (component instanceof Television) result = component.inputTV();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'inputhdmi1':
        if (component instanceof Television) result = component.inputHDMI1();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'inputhdmi2':
        if (component instanceof Television) result = component.inputHDMI2();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'inputusb':
        if (component instanceof Television) result = component.inputUSB();
        else result = { success: false, message: 'Action not supported' };
        break;
      case 'getchannels':
        if (component instanceof Television) result = component.getChannels();
        else result = { success: false, message: 'Action not supported' };
        break;
    }

    this.logEvent('ACTION', `${action} on "${component.name}": ${result.message}`);
    this.save();
    return result;
  }
  /**
   * Persist components and counter to localStorage
   */
  save() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const list = this.listComponents();
      window.localStorage.setItem(this.STORAGE_KEYS.components, JSON.stringify(list));
      window.localStorage.setItem(this.STORAGE_KEYS.counter, String(this.componentCounter));
    } catch (_) {
      // Ignore persistence errors
    }
  }

  /**
   * Persist event log to localStorage
   */
  saveEventLog() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(this.STORAGE_KEYS.eventLog, JSON.stringify(this.eventLog));
    } catch (_) {
      // Ignore persistence errors
    }
  }

  /**
   * Load components and counter from localStorage
   */
  load() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const raw = window.localStorage.getItem(this.STORAGE_KEYS.components);
      const counterRaw = window.localStorage.getItem(this.STORAGE_KEYS.counter);
      const eventLogRaw = window.localStorage.getItem(this.STORAGE_KEYS.eventLog);
      
      if (counterRaw) this.componentCounter = Number(counterRaw) || 0;
      
      if (eventLogRaw) {
        try {
          const parsed = JSON.parse(eventLogRaw);
          if (Array.isArray(parsed)) this.eventLog = parsed;
        } catch (_) {}
      }
      
      if (!raw) return;
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        this.components.clear();
        list.forEach(data => {
          const instance = this.#createFromData(data);
          if (instance) this.components.set(instance.id, instance);
        });
      }
    } catch (_) {
      // Ignore persistence errors
    }
  }

  /**
   * Reset all data (clear components, counter, and event log)
   */
  reset() {
    this.components.clear();
    this.componentCounter = 0;
    this.eventLog = [];
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(this.STORAGE_KEYS.components);
      window.localStorage.removeItem(this.STORAGE_KEYS.counter);
      window.localStorage.removeItem(this.STORAGE_KEYS.eventLog);
    } catch (_) {}
    this.logEvent('SYSTEM', 'All data cleared');
    return { success: true, message: 'All data has been reset' };
  }

  /**
   * Reconstruct a component instance from plain data
   * @param {Object} data
   */
  #createFromData(data) {
    if (!data || typeof data !== 'object') return null;
    const { id, name, type, status, brightness, temperature, isLocked, isRecording, volume, currentChannel, inputSource, isMuted, lastUpdated } = data;
    let instance;
    switch ((type || '').toLowerCase()) {
      case 'light':
        instance = new Light(id, name, typeof brightness === 'number' ? brightness : 100);
        break;
      case 'thermostat':
        instance = new Thermostat(id, name, typeof temperature === 'number' ? temperature : 22);
        break;
      case 'lock':
        instance = new SmartLock(id, name, typeof isLocked === 'boolean' ? isLocked : true);
        break;
      case 'camera':
        instance = new Camera(id, name, typeof isRecording === 'boolean' ? isRecording : false);
        break;
      case 'television':
        instance = new Television(id, name);
        if (typeof volume === 'number') instance.volume = volume;
        if (typeof currentChannel === 'number') instance.currentChannel = currentChannel;
        if (typeof inputSource === 'string') instance.inputSource = inputSource;
        if (typeof isMuted === 'boolean') instance.isMuted = isMuted;
        break;
      default:
        instance = new Component(id, name, type || 'generic');
    }
    if (status === 'online') instance.status = 'online';
    else instance.status = 'offline';
    instance.lastUpdated = lastUpdated ? new Date(lastUpdated) : new Date();
    return instance;
  }

  stats() {
    const componentList = this.listComponents();
    const total = componentList.length;
    const online = componentList.filter(component => component.status === 'online').length;
    const byType = componentList.reduce((accumulator, component) => {
      accumulator[component.type] = accumulator[component.type] || 0;
      accumulator[component.type]++;
      return accumulator;
    }, {});
    return {
      total,
      online,
      offline: total - online,
      byType,
      lastEvent: this.eventLog[this.eventLog.length - 1] || null,
    };
  }

  logEvent(type, message) {
    this.eventLog.push({ timestamp: new Date().toISOString(), type, message });
    if (this.eventLog.length > 50) this.eventLog.shift();
    this.saveEventLog();
  }

  getEventLog(limit = 10) {
    return this.eventLog.slice(-limit).reverse();
  }
}

export const smartHomeService = new SmartHomeService();
