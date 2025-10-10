export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  text: string;
  source: 'main' | 'renderer' | 'browser';
}