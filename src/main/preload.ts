import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannels } from './ipc/channels';
import { 
  LaunchBrowserRequest, 
  LaunchBrowserResponse,
  NavigateToUrlRequest,
  NavigateToUrlResponse,
  StartRecordingResponse,
  StopRecordingResponse,
  ExportScriptRequest,
  ExportScriptResponse,
  SaveScriptRequest,
  SaveScriptResponse,
  LoadScriptsResponse,
  DeleteScriptRequest,
  DeleteScriptResponse,
  RunScriptRequest,
  RunScriptResponse,
} from './ipc/types';
import { LogEntry } from '@/shared/models/LogEntry';
import { RecordingState } from '@/shared/models/RecordingState';

// Define the API that will be exposed to the renderer process
export interface ElectronAPI {
  // Browser operations
  launchBrowser: (request: LaunchBrowserRequest) => Promise<LaunchBrowserResponse>;
  closeBrowser: () => Promise<LaunchBrowserResponse>;
  
  // Navigation operations
  navigateToUrl: (request: NavigateToUrlRequest) => Promise<NavigateToUrlResponse>;
  
  // Recording operations
  startRecording: () => Promise<StartRecordingResponse>;
  stopRecording: () => Promise<StopRecordingResponse>;
  getRecordingState: () => Promise<RecordingState>;
  
  // Script operations
  exportScript: (request: ExportScriptRequest) => Promise<ExportScriptResponse>;
  saveScript: (request: SaveScriptRequest) => Promise<SaveScriptResponse>;
  loadScripts: () => Promise<LoadScriptsResponse>;
  deleteScript: (request: DeleteScriptRequest) => Promise<DeleteScriptResponse>;
  runScript: (request: RunScriptRequest) => Promise<RunScriptResponse>;
  
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
  
  navigateToUrl: (request: NavigateToUrlRequest) =>
    ipcRenderer.invoke(IpcChannels.NavigateToUrl, request),
  
  startRecording: () =>
    ipcRenderer.invoke(IpcChannels.StartRecording),
  
  stopRecording: () =>
    ipcRenderer.invoke(IpcChannels.StopRecording),
  
  getRecordingState: () =>
    ipcRenderer.invoke(IpcChannels.GetRecordingState),
  
  exportScript: (request: ExportScriptRequest) =>
    ipcRenderer.invoke(IpcChannels.ExportScript, request),
  
  saveScript: (request: SaveScriptRequest) =>
    ipcRenderer.invoke(IpcChannels.SaveScript, request),
  
  loadScripts: () =>
    ipcRenderer.invoke(IpcChannels.LoadScripts),
  
  deleteScript: (request: DeleteScriptRequest) =>
    ipcRenderer.invoke(IpcChannels.DeleteScript, request),
  
  runScript: (request: RunScriptRequest) =>
    ipcRenderer.invoke(IpcChannels.RunScript, request),
  
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