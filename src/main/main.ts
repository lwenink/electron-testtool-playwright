import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import { BrowserService } from './services/BrowserService';
import { RecordingService } from './services/RecordingService';
import { LogService } from './services/LogService';
import { BrowserHandler } from './ipc/handlers/browserHandler';
import { RecordingHandler } from './ipc/handlers/recordingHandler';
import { LogHandler } from './ipc/handlers/logHandler';
import Logger from './utils/logger';
import { WINDOW_CONFIG, APP_NAME } from '@/shared/constants';

class PlaywrappApplication {
  private mainWindow: BrowserWindow | null = null;
  private browserService: BrowserService;
  private recordingService: RecordingService;
  private logService: LogService;
  private logger: Logger;
  private browserHandler: BrowserHandler;
  private recordingHandler: RecordingHandler;
  private logHandler: LogHandler;

  constructor() {
    this.browserService = new BrowserService();
    this.recordingService = new RecordingService();
    this.logService = new LogService();
    this.logger = new Logger(this.logService);
    this.browserHandler = new BrowserHandler(this.browserService, this.logger);
    this.recordingHandler = new RecordingHandler(this.browserService, this.recordingService, this.logger);
    this.logHandler = new LogHandler(this.logService);
  }

  public async initialize(): Promise<void> {
    await app.whenReady();
    
    this.logger.info('Application starting...');
    
    this.createMainWindow();
    this.setupAppEvents();
    this.setupMenu();
    
    this.logger.info('Application started successfully');
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: WINDOW_CONFIG.DEFAULT_WIDTH,
      height: WINDOW_CONFIG.DEFAULT_HEIGHT,
      minWidth: WINDOW_CONFIG.MIN_WIDTH,
      minHeight: WINDOW_CONFIG.MIN_HEIGHT,
      title: APP_NAME,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    // Load the renderer
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    this.logger.info('Main window created');
  }

  private setupAppEvents(): void {
    app.on('window-all-closed', async () => {
      this.logger.info('All windows closed, cleaning up...');
      
      // Close any running browsers
      try {
        await this.browserService.close();
        this.logger.info('Browser service cleaned up');
      } catch (error) {
        this.logger.error(`Error cleaning up browser service: ${error}`);
      }

      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createMainWindow();
      }
    });

    app.on('before-quit', async () => {
      this.logger.info('Application shutting down...');
      
      try {
        await this.browserService.close();
      } catch (error) {
        this.logger.error(`Error during shutdown: ${error}`);
      }
    });
  }

  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            },
          },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      {
        label: 'Browser',
        submenu: [
          {
            label: 'Launch Chromium',
            click: async () => {
              try {
                await this.browserService.launch('chromium', false);
              } catch (error) {
                this.logger.error(`Failed to launch Chromium: ${error}`);
              }
            },
          },
          {
            label: 'Launch Firefox',
            click: async () => {
              try {
                await this.browserService.launch('firefox', false);
              } catch (error) {
                this.logger.error(`Failed to launch Firefox: ${error}`);
              }
            },
          },
          {
            label: 'Launch WebKit',
            click: async () => {
              try {
                await this.browserService.launch('webkit', false);
              } catch (error) {
                this.logger.error(`Failed to launch WebKit: ${error}`);
              }
            },
          },
          { type: 'separator' },
          {
            label: 'Close Browser',
            click: async () => {
              try {
                await this.browserService.close();
              } catch (error) {
                this.logger.error(`Failed to close browser: ${error}`);
              }
            },
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

// Create and initialize the application
const playwrappApp = new PlaywrappApplication();

playwrappApp.initialize().catch((error) => {
  console.error('Failed to initialize application:', error);
  app.quit();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  app.quit();
});