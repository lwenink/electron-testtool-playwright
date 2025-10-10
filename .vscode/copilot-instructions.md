# 🤖 Copilot Instructions — Playwright + Electron + React Scaffold

## 🎯 Project Goal
This project is a **standalone desktop automation tool** built with:
- **Electron (Main Process)** → manages Playwright sessions
- **React (Renderer Process)** → displays UI (browser state, screenshots, logs)
- **Playwright** → controls browsers programmatically

It must:
- Be **fully standalone** (packaged with `electron-builder`)
- Use **strong TypeScript typing**
- Follow **SOLID principles**
- Use **IPC (Inter-Process Communication)** for all Electron ↔ Renderer interaction
- Contain **no `any` or `unknown` types**

---

## 🧱 Folder Structure

playwrapp/
│
├─ src/
│ ├─ main/ # Electron main process
│ │ ├─ main.ts # Entry point, app setup
│ │ ├─ preload.ts # IPC bridge exposure
│ │ ├─ ipc/
│ │ │ ├─ channels.ts # Strongly typed IPC channel names
│ │ │ ├─ handlers/ # Handlers for each channel
│ │ │ └─ types.ts # Type definitions for IPC messages
│ │ ├─ services/
│ │ │ ├─ BrowserService.ts # SOLID: manages Playwright sessions
│ │ │ └─ LogService.ts # Handles logs & events
│ │ └─ utils/
│ │ └─ logger.ts
│ │
│ ├─ renderer/ # React UI
│ │ ├─ index.tsx # Entry point
│ │ ├─ App.tsx
│ │ ├─ components/
│ │ │ ├─ BrowserView.tsx
│ │ │ └─ LogViewer.tsx
│ │ ├─ hooks/
│ │ │ └─ useIpc.ts
│ │ └─ types/
│ │ └─ ipc.ts
│ │
│ ├─ shared/
│ │ ├─ models/
│ │ │ ├─ BrowserState.ts
│ │ │ ├─ LogEntry.ts
│ │ │ └─ MessageEnvelope.ts
│ │ └─ constants.ts
│ │
├─ playwright/
│ └─ config.ts # Preconfigured Playwright launcher
│
├─ package.json
├─ electron-builder.yml
└─ copilot-instructions.md


---

## 🧩 Coding Standards for Copilot

### ✅ 1. Strong Typing
- Use `interface` and `type` for all IPC payloads and Playwright results.
- Avoid `any` or `unknown`. If needed, narrow to a known union type.
- Example:
  ```ts
  export interface LaunchBrowserRequest {
    browserType: 'chromium' | 'firefox' | 'webkit';
    headless: boolean;
  }

  export interface LaunchBrowserResponse {
    success: boolean;
    message?: string;
  }

✅ 2. SOLID Principles

    Single Responsibility — one class per responsibility (e.g. BrowserService, LogService).

    Open/Closed — use interfaces and abstractions (e.g. IBrowserManager).

    Liskov Substitution — services should depend on abstractions, not concretions.

    Interface Segregation — define small, purpose-driven interfaces.

    Dependency Inversion — inject services into handlers via constructors.

Example:

// BrowserService.ts
export interface IBrowserService {
  launch(browserType: 'chromium' | 'firefox' | 'webkit', headless: boolean): Promise<void>;
  close(): Promise<void>;
}

export class BrowserService implements IBrowserService {
  // ...
}

🪄 3. IPC Wiring (Strongly Typed)
IPC Channel Definition

export enum IpcChannels {
  LaunchBrowser = 'playwrapp:launchBrowser',
  CloseBrowser = 'playwrapp:closeBrowser',
  GetState = 'playwrapp:getState',
}

IPC Handler

ipcMain.handle(IpcChannels.LaunchBrowser, async (_event, args: LaunchBrowserRequest): Promise<LaunchBrowserResponse> => {
  return browserService.launch(args.browserType, args.headless);
});

Renderer Usage

const launchBrowser = async () => {
  const response = await window.electron.invoke<LaunchBrowserResponse>(
    IpcChannels.LaunchBrowser,
    { browserType: 'chromium', headless: true }
  );
  console.log(response);
};

🧠 4. Testing Guidelines

    Unit tests: Jest for services and IPC handlers.

    Integration tests: Playwright scripts under /tests/e2e/.

    CI/CD: Add npm run test and npm run lint in the build pipeline.

🧩 5. Build & Packaging

    Use electron-builder for standalone EXE creation.

    Ensure Playwright binaries are pre-installed and copied to /browsers folder.

    Build commands:

    npm run build:renderer
    npm run build:main
    npm run dist

⚙️ 6. Copilot Prompting Tips

When asking Copilot to generate code:

    "Implement a strongly typed IPC handler for launching and closing browsers using Playwright. Follow the SOLID pattern and use dependency injection for services."

When adding new components:

    "Add a React component that subscribes to the BrowserState IPC channel and renders a screenshot with a refresh button."

When extending Playwright features:

    "Add a new IPC command to capture a screenshot of the current page and send it to the renderer as base64."

🧩 7. Future Extensibility

    ✅ Add multi-session Playwright support (BrowserContext pool)

    ✅ Stream logs via WebSocket or IPC event channel

    ✅ Add visual diff snapshots

    ✅ Add plugin architecture for external automation scripts

🧭 Goal Summary

    Build a strongly typed, SOLID, Electron + Playwright automation desktop app scaffold that runs fully standalone and can be iterated on safely using Copilot.
