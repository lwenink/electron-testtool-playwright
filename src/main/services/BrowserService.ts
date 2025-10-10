import { Browser, chromium, firefox, webkit } from 'playwright';
import { BrowserState } from '@/shared/models/BrowserState';

export interface IBrowserService {
  launch(browserType: 'chromium' | 'firefox' | 'webkit', headless: boolean): Promise<void>;
  close(): Promise<void>;
  getState(): BrowserState;
}

export class BrowserService implements IBrowserService {
  private browser: Browser | null = null;
  private state: BrowserState = {
    isLaunched: false,
    browserType: null,
    headless: false,
  };

  async launch(browserType: 'chromium' | 'firefox' | 'webkit', headless: boolean): Promise<void> {
    if (this.browser) {
      await this.close();
    }

    try {
      let browserInstance: Browser;
      
      switch (browserType) {
        case 'chromium':
          browserInstance = await chromium.launch({ headless });
          break;
        case 'firefox':
          browserInstance = await firefox.launch({ headless });
          break;
        case 'webkit':
          browserInstance = await webkit.launch({ headless });
          break;
        default:
          throw new Error(`Unsupported browser type: ${browserType}`);
      }

      this.browser = browserInstance;
      this.state = {
        isLaunched: true,
        browserType,
        headless,
        launchedAt: new Date(),
      };
    } catch (error) {
      this.state = {
        isLaunched: false,
        browserType: null,
        headless: false,
      };
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    this.state = {
      isLaunched: false,
      browserType: null,
      headless: false,
    };
  }

  getState(): BrowserState {
    return { ...this.state };
  }
}