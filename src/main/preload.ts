import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannels } from './ipc/channels';
import { LaunchBrowserRequest, LaunchBrowserResponse } from './ipc/types';
import { LogEntry } from '@/shared/models/LogEntry';

// Define the API that will be exposed to the renderer process
export interface ElectronAPI {
  // Browser operations
  launchBrowser: (request: LaunchBrowserRequest) => Promise<LaunchBrowserResponse>;
  closeBrowser: () => Promise<LaunchBrowserResponse>;
  
  // Log operations
  getLogs: () => Promise<LogEntry[]>;
  clearLogs: () => Promise<void>;
  onLogMessage: (callback: (log: LogEntry) => void) => void;
  removeLogListener: (callback: (log: LogEntry) => void) => void;
}

// Expose the API to the renderer process
const electronAPI: ElectronAPI = {
  launchBrowser: (request: LaunchBrowserRequest) =>
    ipcRenderer.invoke(IpcChannels.LaunchBrowser, request),
  
  closeBrowser: () =>
    ipcRenderer.invoke(IpcChannels.CloseBrowser),
  
  getLogs: () =>
    ipcRenderer.invoke('playwrapp:getLogs'),
  
  clearLogs: () =>
    ipcRenderer.invoke('playwrapp:clearLogs'),
  
  onLogMessage: (callback: (log: LogEntry) => void) => {
    const listener = (_: any, log: LogEntry) => callback(log);
    ipcRenderer.on(IpcChannels.LogMessage, listener);
  },
  
  removeLogListener: (callback: (log: LogEntry) => void) => {
    // Note: In a real app, you'd need to store the listener reference
    // For now, we'll just remove all listeners for this channel
    ipcRenderer.removeAllListeners(IpcChannels.LogMessage);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Declare global type for TypeScript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}