import { useEffect, useState, useCallback } from 'react';
import { ElectronAPI } from '../types/ipc';
import { LaunchBrowserRequest, LaunchBrowserResponse } from '../../main/ipc/types';
import { LogEntry } from '@/shared/models/LogEntry';

// Type guard to check if we're in Electron
const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!window.electronAPI;
};

export const useIpc = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);

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

  return {
    isConnected,
    logs,
    launchBrowser,
    closeBrowser,
    clearLogs,
    refreshLogs,
  };
};