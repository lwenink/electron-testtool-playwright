import { Browser, Page, chromium, firefox, webkit } from 'playwright';
import { BrowserState } from '@/shared/models/BrowserState';

export interface IBrowserService {
  launch(browserType: 'chromium' | 'firefox' | 'webkit', headless: boolean): Promise<void>;
  close(): Promise<void>;
  getState(): BrowserState;
  navigateToUrl(url: string): Promise<void>;
  createPage(): Promise<Page>;
  getCurrentPage(): Page | null;
  getCurrentUrl(): Promise<string | null>;
}

export class BrowserService implements IBrowserService {
  private browser: Browser | null = null;
  private currentPage: Page | null = null;
  private state: BrowserState = {
    isLaunched: false,
    browserType: null,
    headless: false,
    hasActivePage: false,
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
        hasActivePage: false,
      };
    } catch (error) {
      this.state = {
        isLaunched: false,
        browserType: null,
        headless: false,
        hasActivePage: false,
      };
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.currentPage) {
      await this.currentPage.close();
      this.currentPage = null;
    }
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    this.state = {
      isLaunched: false,
      browserType: null,
      headless: false,
      hasActivePage: false,
    };
  }

  getState(): BrowserState {
    return { ...this.state };
  }

  async createPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('No browser instance available. Launch a browser first.');
    }

    if (this.currentPage) {
      await this.currentPage.close();
    }

    this.currentPage = await this.browser.newPage();
    this.state.hasActivePage = true;
    
    return this.currentPage;
  }

  getCurrentPage(): Page | null {
    return this.currentPage;
  }

  async navigateToUrl(url: string): Promise<void> {
    if (!this.currentPage) {
      await this.createPage();
    }

    if (!this.currentPage) {
      throw new Error('Failed to create page');
    }

    await this.currentPage.goto(url);
    this.state.currentUrl = url;
  }

  async getCurrentUrl(): Promise<string | null> {
    if (!this.currentPage) {
      return null;
    }

    try {
      return this.currentPage.url();
    } catch {
      return null;
    }
  }
}