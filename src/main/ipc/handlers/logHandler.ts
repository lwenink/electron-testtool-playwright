import { ipcMain, IpcMainInvokeEvent, webContents } from 'electron';
import { IpcChannels } from '../channels';
import { LogMessage } from '../types';
import { LogService } from '../../services/LogService';

export class LogHandler {
  constructor(private logService: LogService) {
    this.setupHandlers();
    this.setupLogForwarding();
  }

  private setupHandlers(): void {
    ipcMain.handle('playwrapp:getLogs', this.handleGetLogs.bind(this));
    ipcMain.handle('playwrapp:clearLogs', this.handleClearLogs.bind(this));
  }

  private setupLogForwarding(): void {
    // Forward new logs to all renderer processes
    this.logService.onNewLog((logEntry) => {
      // Send to all open windows
      webContents.getAllWebContents().forEach((webContent) => {
        if (!webContent.isDestroyed()) {
          webContent.send(IpcChannels.LogMessage, logEntry);
        }
      });
    });
  }

  private handleGetLogs(event: IpcMainInvokeEvent): any {
    return this.logService.getLogs();
  }

  private handleClearLogs(event: IpcMainInvokeEvent): void {
    this.logService.clearLogs();
  }
}