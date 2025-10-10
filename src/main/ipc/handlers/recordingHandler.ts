import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { IpcChannels } from '../channels';
import {
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
} from '../types';
import { BrowserService } from '../../services/BrowserService';
import { RecordingService } from '../../services/RecordingService';
import { RecordingState } from '@/shared/models/RecordingState';
import Logger from '../../utils/logger';

export class RecordingHandler {
  constructor(
    private browserService: BrowserService,
    private recordingService: RecordingService,
    private logger: Logger
  ) {
    this.setupHandlers();
  }

  private setupHandlers(): void {
    ipcMain.handle(IpcChannels.NavigateToUrl, this.handleNavigateToUrl.bind(this));
    ipcMain.handle(IpcChannels.StartRecording, this.handleStartRecording.bind(this));
    ipcMain.handle(IpcChannels.StopRecording, this.handleStopRecording.bind(this));
    ipcMain.handle(IpcChannels.GetRecordingState, this.handleGetRecordingState.bind(this));
    ipcMain.handle(IpcChannels.ExportScript, this.handleExportScript.bind(this));
    ipcMain.handle(IpcChannels.SaveScript, this.handleSaveScript.bind(this));
    ipcMain.handle(IpcChannels.LoadScripts, this.handleLoadScripts.bind(this));
    ipcMain.handle(IpcChannels.DeleteScript, this.handleDeleteScript.bind(this));
    ipcMain.handle(IpcChannels.RunScript, this.handleRunScript.bind(this));
  }

  private async handleNavigateToUrl(
    event: IpcMainInvokeEvent,
    request: NavigateToUrlRequest
  ): Promise<NavigateToUrlResponse> {
    try {
      this.logger.info(`Navigating to URL: ${request.url}`);
      
      const browserState = this.browserService.getState();
      if (!browserState.isLaunched) {
        return {
          success: false,
          message: 'No browser is currently running. Please launch a browser first.',
        };
      }

      await this.browserService.navigateToUrl(request.url);
      const currentUrl = await this.browserService.getCurrentUrl();
      
      this.logger.info(`Successfully navigated to: ${currentUrl}`);
      
      return {
        success: true,
        message: `Navigated to ${currentUrl}`,
        currentUrl: currentUrl || undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to navigate to URL: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  private async handleStartRecording(event: IpcMainInvokeEvent): Promise<StartRecordingResponse> {
    try {
      this.logger.info('Starting recording...');
      
      const browserState = this.browserService.getState();
      if (!browserState.isLaunched) {
        return {
          success: false,
          message: 'No browser is currently running. Please launch a browser first.',
        };
      }

      const currentPage = this.browserService.getCurrentPage();
      if (!currentPage) {
        return {
          success: false,
          message: 'No active page found. Please navigate to a URL first.',
        };
      }

      await this.recordingService.startRecording(currentPage);
      
      this.logger.info('Recording started successfully');
      
      return {
        success: true,
        message: 'Recording started successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to start recording: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  private async handleStopRecording(event: IpcMainInvokeEvent): Promise<StopRecordingResponse> {
    try {
      this.logger.info('Stopping recording...');
      
      const steps = await this.recordingService.stopRecording();
      
      this.logger.info(`Recording stopped. Captured ${steps.length} steps.`);
      
      return {
        success: true,
        message: `Recording stopped. Captured ${steps.length} steps.`,
        steps,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to stop recording: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage,
        steps: [],
      };
    }
  }

  private async handleGetRecordingState(event: IpcMainInvokeEvent): Promise<RecordingState> {
    return this.recordingService.getRecordingState();
  }

  private async handleExportScript(
    event: IpcMainInvokeEvent,
    request: ExportScriptRequest
  ): Promise<ExportScriptResponse> {
    try {
      this.logger.info(`Exporting script: ${request.name}`);
      
      const script = await this.recordingService.exportScript(request.steps, request.name);
      const code = this.recordingService.generatePlaywrightCode(request.steps);
      
      this.logger.info(`Script exported successfully: ${script.id}`);
      
      return {
        success: true,
        message: 'Script exported successfully',
        script,
        code,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to export script: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  private async handleSaveScript(
    event: IpcMainInvokeEvent,
    request: SaveScriptRequest
  ): Promise<SaveScriptResponse> {
    try {
      this.logger.info(`Saving script: ${request.script.name}`);
      
      await this.recordingService.saveScript(request.script);
      
      this.logger.info(`Script saved successfully: ${request.script.id}`);
      
      return {
        success: true,
        message: 'Script saved successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to save script: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  private async handleLoadScripts(event: IpcMainInvokeEvent): Promise<LoadScriptsResponse> {
    try {
      this.logger.info('Loading saved scripts...');
      
      const scripts = await this.recordingService.loadScripts();
      
      this.logger.info(`Loaded ${scripts.length} scripts`);
      
      return {
        success: true,
        message: `Loaded ${scripts.length} scripts`,
        scripts,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to load scripts: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage,
        scripts: [],
      };
    }
  }

  private async handleDeleteScript(
    event: IpcMainInvokeEvent,
    request: DeleteScriptRequest
  ): Promise<DeleteScriptResponse> {
    try {
      this.logger.info(`Deleting script: ${request.scriptId}`);
      
      await this.recordingService.deleteScript(request.scriptId);
      
      this.logger.info(`Script deleted successfully: ${request.scriptId}`);
      
      return {
        success: true,
        message: 'Script deleted successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to delete script: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  private async handleRunScript(
    event: IpcMainInvokeEvent,
    request: RunScriptRequest
  ): Promise<RunScriptResponse> {
    try {
      this.logger.info(`Running script: ${request.script.name}`);
      
      const browserState = this.browserService.getState();
      if (!browserState.isLaunched) {
        return {
          success: false,
          message: 'No browser is currently running. Please launch a browser first.',
        };
      }

      const currentPage = this.browserService.getCurrentPage();
      if (!currentPage) {
        await this.browserService.createPage();
      }

      const page = this.browserService.getCurrentPage();
      if (!page) {
        return {
          success: false,
          message: 'Failed to create page for script execution',
        };
      }

      // Execute the script steps
      for (const step of request.script.steps) {
        switch (step.type) {
          case 'navigation':
            if (step.url) {
              await page.goto(step.url);
            }
            break;
          case 'click':
            if (step.selector) {
              await page.click(step.selector);
            }
            break;
          case 'type':
            if (step.selector && step.text) {
              await page.fill(step.selector, step.text);
            }
            break;
          case 'wait':
            const waitTime = step.value ? parseInt(step.value) : 1000;
            await page.waitForTimeout(waitTime);
            break;
          default:
            this.logger.info(`Skipping unsupported step type: ${step.type}`);
        }
        
        // Small delay between steps
        await page.waitForTimeout(100);
      }
      
      this.logger.info(`Script executed successfully: ${request.script.name}`);
      
      return {
        success: true,
        message: 'Script executed successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to run script: ${errorMessage}`);
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}