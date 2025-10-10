import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { IpcChannels } from '../channels';
import { LaunchBrowserRequest, LaunchBrowserResponse } from '../types';
import { BrowserService } from '../../services/BrowserService';
import Logger from '../../utils/logger';

export class BrowserHandler {
  constructor(
    private browserService: BrowserService,
    private logger: Logger
  ) {
    this.setupHandlers();
  }

  private setupHandlers(): void {
    ipcMain.handle(IpcChannels.LaunchBrowser, this.handleLaunchBrowser.bind(this));
    ipcMain.handle(IpcChannels.CloseBrowser, this.handleCloseBrowser.bind(this));
  }

  private async handleLaunchBrowser(
    event: IpcMainInvokeEvent,
    request: LaunchBrowserRequest
  ): Promise<LaunchBrowserResponse> {
    try {
      this.logger.info(`Launching ${request.browserType} browser (headless: ${request.headless})`);
      
      await this.browserService.launch(request.browserType, request.headless);
      
      this.logger.info(`${request.browserType} browser launched successfully`);
      
      return {
        success: true,
        message: `${request.browserType} browser launched successfully`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to launch ${request.browserType} browser: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  private async handleCloseBrowser(event: IpcMainInvokeEvent): Promise<LaunchBrowserResponse> {
    try {
      const state = this.browserService.getState();
      
      if (!state.isLaunched) {
        return {
          success: true,
          message: 'No browser is currently running',
        };
      }

      this.logger.info(`Closing ${state.browserType} browser`);
      
      await this.browserService.close();
      
      this.logger.info('Browser closed successfully');
      
      return {
        success: true,
        message: 'Browser closed successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to close browser: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}