import { useEffect, useState, useCallback } from 'react';
import { ElectronAPI } from '../types/ipc';
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
} from '../../main/ipc/types';
import { LogEntry } from '@/shared/models/LogEntry';
import { RecordingState, TestScript } from '@/shared/models/RecordingState';

// Type guard to check if we're in Electron
const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!window.electronAPI;
};

export const useIpc = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    steps: [],
  });
  const [scripts, setScripts] = useState<TestScript[]>([]);

  const electronAPI: ElectronAPI | null = isElectron() ? window.electronAPI : null;

  useEffect(() => {
    setIsConnected(isElectron());

    if (electronAPI) {
      // Load initial logs
      electronAPI.getLogs().then(setLogs);

      // Listen for new log messages
      const handleLogMessage = (log: LogEntry) => {
        setLogs(prevLogs => [...prevLogs, log]);
      };

      electronAPI.onLogMessage(handleLogMessage);

      // Cleanup
      return () => {
        electronAPI.removeLogListener(handleLogMessage);
      };
    }
  }, [electronAPI]);

  const launchBrowser = useCallback(
    async (request: LaunchBrowserRequest): Promise<LaunchBrowserResponse> => {
      if (!electronAPI) {
        return { success: false, message: 'Electron API not available' };
      }
      return electronAPI.launchBrowser(request);
    },
    [electronAPI]
  );

  const closeBrowser = useCallback(async (): Promise<LaunchBrowserResponse> => {
    if (!electronAPI) {
      return { success: false, message: 'Electron API not available' };
    }
    return electronAPI.closeBrowser();
  }, [electronAPI]);

  const clearLogs = useCallback(async (): Promise<void> => {
    if (!electronAPI) {
      return;
    }
    await electronAPI.clearLogs();
    setLogs([]);
  }, [electronAPI]);

  const refreshLogs = useCallback(async (): Promise<void> => {
    if (!electronAPI) {
      return;
    }
    const currentLogs = await electronAPI.getLogs();
    setLogs(currentLogs);
  }, [electronAPI]);

  const navigateToUrl = useCallback(
    async (url: string): Promise<NavigateToUrlResponse> => {
      if (!electronAPI) {
        return { success: false, message: 'Electron API not available' };
      }
      return electronAPI.navigateToUrl({ url });
    },
    [electronAPI]
  );

  const startRecording = useCallback(async (): Promise<StartRecordingResponse> => {
    if (!electronAPI) {
      return { success: false, message: 'Electron API not available' };
    }
    const response = await electronAPI.startRecording();
    if (response.success) {
      const state = await electronAPI.getRecordingState();
      setRecordingState(state);
    }
    return response;
  }, [electronAPI]);

  const stopRecording = useCallback(async (): Promise<StopRecordingResponse> => {
    if (!electronAPI) {
      return { success: false, message: 'Electron API not available', steps: [] };
    }
    const response = await electronAPI.stopRecording();
    if (response.success) {
      const state = await electronAPI.getRecordingState();
      setRecordingState(state);
    }
    return response;
  }, [electronAPI]);

  const exportScript = useCallback(
    async (request: ExportScriptRequest): Promise<ExportScriptResponse> => {
      if (!electronAPI) {
        return { success: false, message: 'Electron API not available' };
      }
      return electronAPI.exportScript(request);
    },
    [electronAPI]
  );

  const saveScript = useCallback(
    async (script: TestScript): Promise<SaveScriptResponse> => {
      if (!electronAPI) {
        return { success: false, message: 'Electron API not available' };
      }
      const response = await electronAPI.saveScript({ script });
      if (response.success) {
        await loadScripts();
      }
      return response;
    },
    [electronAPI]
  );

  const loadScripts = useCallback(async (): Promise<LoadScriptsResponse> => {
    if (!electronAPI) {
      return { success: false, message: 'Electron API not available', scripts: [] };
    }
    const response = await electronAPI.loadScripts();
    if (response.success) {
      setScripts(response.scripts);
    }
    return response;
  }, [electronAPI]);

  const deleteScript = useCallback(
    async (scriptId: string): Promise<DeleteScriptResponse> => {
      if (!electronAPI) {
        return { success: false, message: 'Electron API not available' };
      }
      const response = await electronAPI.deleteScript({ scriptId });
      if (response.success) {
        await loadScripts();
      }
      return response;
    },
    [electronAPI]
  );

  const runScript = useCallback(
    async (script: TestScript): Promise<RunScriptResponse> => {
      if (!electronAPI) {
        return { success: false, message: 'Electron API not available' };
      }
      return electronAPI.runScript({ script });
    },
    [electronAPI]
  );

  const refreshRecordingState = useCallback(async (): Promise<void> => {
    if (!electronAPI) {
      return;
    }
    const state = await electronAPI.getRecordingState();
    setRecordingState(state);
  }, [electronAPI]);

  // Load initial data
  useEffect(() => {
    if (electronAPI) {
      loadScripts();
      refreshRecordingState();
    }
  }, [electronAPI, loadScripts, refreshRecordingState]);

  return {
    isConnected,
    logs,
    recordingState,
    scripts,
    launchBrowser,
    closeBrowser,
    navigateToUrl,
    startRecording,
    stopRecording,
    exportScript,
    saveScript,
    loadScripts,
    deleteScript,
    runScript,
    clearLogs,
    refreshLogs,
    refreshRecordingState,
  };
};