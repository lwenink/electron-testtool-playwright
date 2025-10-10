export interface LaunchBrowserRequest {
  browserType: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
}

export interface LaunchBrowserResponse {
  success: boolean;
  message?: string;
}

export interface LogMessage {
  level: 'info' | 'warn' | 'error';
  text: string;
}