# Recording Features Documentation

## Overview
Playwrapp now includes comprehensive step recording and script management capabilities that allow you to:

1. **Record user interactions** in launched browsers
2. **Navigate to specific URLs** 
3. **Export recorded steps** as Playwright test scripts
4. **Save and manage** test scripts
5. **Re-run saved scripts** for automated testing

## Usage Instructions

### 1. Browser Control & Navigation
- Launch a browser (Chromium, Firefox, or WebKit)
- Enter a URL in the navigation field and click "Go"
- The browser will navigate to the specified URL

### 2. Recording Steps
- Click "Start Recording" to begin capturing user interactions
- Interact with the browser page (clicks, typing, etc.)
- The recording status shows the number of captured steps
- Click "Stop Recording" to finish capturing

### 3. Script Management
- After stopping recording, enter a script name and click "Export Script"
- Review the exported script and click "Save Script" to persist it
- View saved scripts in the Script Manager panel
- Click "Run" to execute a saved script
- Click "View Code" to see the generated Playwright test code
- Click "Delete" to remove unwanted scripts

### 4. Generated Code
Scripts are automatically converted to Playwright test code format:

```javascript
import { test, expect } from '@playwright/test';

test('recorded test', async ({ page }) => {
  await page.goto('https://example.com');
  await page.click('#button1');
  await page.fill('#input1', 'Hello World');
  // Additional recorded steps...
});
```

## Technical Details

### Recorded Step Types
- **Navigation**: Page URL changes
- **Click**: Element clicks with CSS selector
- **Type**: Text input with target selector and content
- **Wait**: Delays between actions

### Storage
- Scripts are saved as JSON files in the `recorded-scripts/` directory
- Each script includes metadata: name, creation date, steps, and description
- Scripts can be loaded across application sessions

### CSS Selector Generation
The recording system automatically generates CSS selectors for elements:
1. ID-based selectors (highest priority): `#element-id`
2. Class-based selectors: `.class-name`
3. Tag with position: `button:nth-of-type(2)`
4. Fallback to tag name: `button`

## Development Notes
- Recording uses Playwright's page injection to capture events
- All operations are type-safe with TypeScript interfaces
- IPC communication handles all browser-renderer interactions
- UI provides real-time feedback for all operations