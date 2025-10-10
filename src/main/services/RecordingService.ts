import { Page } from 'playwright';
import { RecordedStep, RecordingState, TestScript } from '@/shared/models/RecordingState';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface IRecordingService {
  startRecording(page: Page): Promise<void>;
  stopRecording(): Promise<RecordedStep[]>;
  getRecordingState(): RecordingState;
  exportScript(steps: RecordedStep[], name: string): Promise<TestScript>;
  saveScript(script: TestScript): Promise<void>;
  loadScripts(): Promise<TestScript[]>;
  deleteScript(scriptId: string): Promise<void>;
  generatePlaywrightCode(steps: RecordedStep[]): string;
}

export class RecordingService implements IRecordingService {
  private recordingState: RecordingState = {
    isRecording: false,
    steps: [],
  };
  private currentPage: Page | null = null;
  private scriptsDir = path.join(process.cwd(), 'recorded-scripts');

  constructor() {
    this.ensureScriptsDirectory();
  }

  private async ensureScriptsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.scriptsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create scripts directory:', error);
    }
  }

  async startRecording(page: Page): Promise<void> {
    if (this.recordingState.isRecording) {
      throw new Error('Recording is already in progress');
    }

    this.currentPage = page;
    this.recordingState = {
      isRecording: true,
      steps: [],
      startedAt: new Date(),
      currentUrl: page.url(),
    };

    // Set up event listeners for recording
    await this.setupRecordingListeners(page);
  }

  async stopRecording(): Promise<RecordedStep[]> {
    if (!this.recordingState.isRecording) {
      throw new Error('No recording in progress');
    }

    this.recordingState.isRecording = false;
    const steps = [...this.recordingState.steps];
    
    // Clean up event listeners
    if (this.currentPage) {
      await this.cleanupRecordingListeners(this.currentPage);
    }
    
    this.currentPage = null;
    return steps;
  }

  getRecordingState(): RecordingState {
    return { ...this.recordingState };
  }

  private async setupRecordingListeners(page: Page): Promise<void> {
    // Record navigation
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        this.addStep({
          type: 'navigation',
          url: frame.url(),
          description: `Navigate to ${frame.url()}`,
        });
      }
    });

    // Record clicks
    await page.exposeFunction('recordClick', (selector: string, text?: string) => {
      this.addStep({
        type: 'click',
        selector,
        description: `Click on element ${selector}${text ? ` with text "${text}"` : ''}`,
      });
    });

    // Record input/typing
    await page.exposeFunction('recordType', (selector: string, text: string) => {
      this.addStep({
        type: 'type',
        selector,
        text,
        description: `Type "${text}" into ${selector}`,
      });
    });

    // Inject recording script into the page
    await page.addInitScript(`
      // Helper function to generate CSS selector
      function generateSelector(element) {
        if (element.id) {
          return '#' + element.id;
        }
        
        if (element.className) {
          const classes = element.className.split(' ').filter(c => c.trim());
          if (classes.length > 0) {
            return '.' + classes.join('.');
          }
        }
        
        // Use tag name with position if no id or class
        const parent = element.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(
            child => child.tagName === element.tagName
          );
          const index = siblings.indexOf(element);
          if (siblings.length > 1) {
            return element.tagName.toLowerCase() + ':nth-of-type(' + (index + 1) + ')';
          }
        }
        
        return element.tagName.toLowerCase();
      }
      
      // Record clicks
      document.addEventListener('click', (event) => {
        const target = event.target;
        if (target) {
          const selector = generateSelector(target);
          const text = target.textContent ? target.textContent.trim() : '';
          window.recordClick(selector, text);
        }
      });

      // Record input changes
      document.addEventListener('input', (event) => {
        const target = event.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          const selector = generateSelector(target);
          window.recordType(selector, target.value);
        }
      });
    `);
  }

  private async cleanupRecordingListeners(page: Page): Promise<void> {
    // Remove event listeners - Playwright will clean up when page is closed
    // Additional cleanup can be added here if needed
  }

  private addStep(stepData: Partial<RecordedStep>): void {
    if (!this.recordingState.isRecording) return;

    const step: RecordedStep = {
      id: uuidv4(),
      timestamp: new Date(),
      ...stepData,
    } as RecordedStep;

    this.recordingState.steps.push(step);
  }

  async exportScript(steps: RecordedStep[], name: string): Promise<TestScript> {
    const script: TestScript = {
      id: uuidv4(),
      name,
      steps,
      createdAt: new Date(),
      url: steps.find(s => s.type === 'navigation')?.url,
      description: `Recorded test script: ${name}`,
    };

    return script;
  }

  async saveScript(script: TestScript): Promise<void> {
    const filename = `${script.id}.json`;
    const filepath = path.join(this.scriptsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(script, null, 2));
  }

  async loadScripts(): Promise<TestScript[]> {
    try {
      const files = await fs.readdir(this.scriptsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      const scripts: TestScript[] = [];
      for (const file of jsonFiles) {
        try {
          const filepath = path.join(this.scriptsDir, file);
          const content = await fs.readFile(filepath, 'utf-8');
          const script = JSON.parse(content) as TestScript;
          scripts.push(script);
        } catch (error) {
          console.error(`Failed to load script ${file}:`, error);
        }
      }
      
      return scripts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Failed to load scripts:', error);
      return [];
    }
  }

  async deleteScript(scriptId: string): Promise<void> {
    const filename = `${scriptId}.json`;
    const filepath = path.join(this.scriptsDir, filename);
    
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error(`Failed to delete script ${scriptId}:`, error);
      throw error;
    }
  }

  generatePlaywrightCode(steps: RecordedStep[]): string {
    let code = `import { test, expect } from '@playwright/test';\n\n`;
    code += `test('recorded test', async ({ page }) => {\n`;

    for (const step of steps) {
      switch (step.type) {
        case 'navigation':
          code += `  await page.goto('${step.url}');\n`;
          break;
        case 'click':
          code += `  await page.click('${step.selector}');\n`;
          break;
        case 'type':
          code += `  await page.fill('${step.selector}', '${step.text}');\n`;
          break;
        case 'wait':
          code += `  await page.waitForTimeout(${step.value || 1000});\n`;
          break;
        default:
          code += `  // ${step.description}\n`;
      }
    }

    code += `});\n`;
    return code;
  }
}