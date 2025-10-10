export interface BrowserState {
  isLaunched: boolean;
  browserType: 'chromium' | 'firefox' | 'webkit' | null;
  headless: boolean;
  pid?: number;
  launchedAt?: Date;
}