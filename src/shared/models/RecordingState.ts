export interface RecordedStep {
  id: string;
  type: 'navigation' | 'click' | 'type' | 'select' | 'keyboard' | 'wait';
  selector?: string;
  url?: string;
  text?: string;
  key?: string;
  value?: string;
  timestamp: Date;
  description: string;
}

export interface RecordingState {
  isRecording: boolean;
  steps: RecordedStep[];
  startedAt?: Date;
  currentUrl?: string;
}

export interface TestScript {
  id: string;
  name: string;
  steps: RecordedStep[];
  createdAt: Date;
  url?: string;
  description?: string;
}