import { LogService } from '../services/LogService';

class Logger {
  private logService: LogService;

  constructor(logService: LogService) {
    this.logService = logService;
  }

  info(message: string): void {
    this.logService.log('info', message, 'main');
  }

  warn(message: string): void {
    this.logService.log('warn', message, 'main');
  }

  error(message: string): void {
    this.logService.log('error', message, 'main');
  }
}

export default Logger;