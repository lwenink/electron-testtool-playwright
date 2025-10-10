import { RecordedStep, RecordingState, TestScript } from '@/shared/models/RecordingState';

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

export interface NavigateToUrlRequest {
  url: string;
}

export interface NavigateToUrlResponse {
  success: boolean;
  message?: string;
  currentUrl?: string;
}

export interface StartRecordingResponse {
  success: boolean;
  message?: string;
}

export interface StopRecordingResponse {
  success: boolean;
  message?: string;
  steps: RecordedStep[];
}

export interface ExportScriptRequest {
  steps: RecordedStep[];
  name: string;
}

export interface ExportScriptResponse {
  success: boolean;
  message?: string;
  script?: TestScript;
  code?: string;
}

export interface SaveScriptRequest {
  script: TestScript;
}

export interface SaveScriptResponse {
  success: boolean;
  message?: string;
}

export interface LoadScriptsResponse {
  success: boolean;
  message?: string;
  scripts: TestScript[];
}

export interface DeleteScriptRequest {
  scriptId: string;
}

export interface DeleteScriptResponse {
  success: boolean;
  message?: string;
}

export interface RunScriptRequest {
  script: TestScript;
}

export interface RunScriptResponse {
  success: boolean;
  message?: string;
}