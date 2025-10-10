import { LogEntry } from '@/shared/models/LogEntry';

export interface ILogService {
  log(level: 'info' | 'warn' | 'error', text: string, source?: 'main' | 'renderer' | 'browser'): void;
  getLogs(): LogEntry[];
  clearLogs(): void;
  onNewLog(callback: (log: LogEntry) => void): void;
}

export class LogService implements ILogService {
  private logs: LogEntry[] = [];
  private callbacks: Array<(log: LogEntry) => void> = [];

  log(level: 'info' | 'warn' | 'error', text: string, source: 'main' | 'renderer' | 'browser' = 'main'): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      text,
      source,
    };

    this.logs.push(logEntry);
    
    // Notify all callbacks
    this.callbacks.forEach(callback => callback(logEntry));
    
    // Also log to console for debugging
    console[level](`[${source.toUpperCase()}] ${text}`);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  onNewLog(callback: (log: LogEntry) => void): void {
    this.callbacks.push(callback);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}