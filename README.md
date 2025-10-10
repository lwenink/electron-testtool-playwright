# 🧩 Playwrapp

A strongly typed, SOLID-principled Electron + Playwright + React starter scaffold for building powerful automation and testing tools.

![Playwrapp Screenshot](https://github.com/user-attachments/assets/3f26a6f6-388a-44b1-b8bd-fd632b4711dc)

## ✨ Features

- **🔒 Type Safety**: Full TypeScript coverage with strict typing
- **🏗️ SOLID Architecture**: Clean, maintainable code following SOLID principles
- **⚡ Modern Stack**: Electron 32, React 18, Playwright 1.47, Vite 5
- **🎨 Beautiful UI**: Responsive React interface with professional styling
- **🔄 Real-time Communication**: Type-safe IPC between main and renderer processes
- **🌐 Browser Automation**: Launch and control Chromium, Firefox, and WebKit
- **📝 Centralized Logging**: Real-time log aggregation and display
- **📦 Production Ready**: Electron Builder configuration for cross-platform distribution

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

Start both main and renderer processes in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1: Start renderer dev server
npm run dev:renderer

# Terminal 2: Start main process with auto-reload
npm run dev:main
```

### Production Build

```bash
npm run build
```

### Create Distributables

```bash
npm run dist
```

## 📁 Project Structure

```
playwrapp/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.ts             # Application entry point
│   │   ├── preload.ts          # IPC bridge
│   │   ├── ipc/                # IPC layer
│   │   │   ├── channels.ts     # Channel definitions
│   │   │   ├── types.ts        # Message types
│   │   │   └── handlers/       # Request handlers
│   │   ├── services/           # Business logic
│   │   │   ├── BrowserService.ts
│   │   │   └── LogService.ts
│   │   └── utils/              # Utilities
│   │
│   ├── renderer/               # React frontend
│   │   ├── index.tsx          # React entry point
│   │   ├── App.tsx            # Main component
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom hooks
│   │   └── types/             # Type definitions
│   │
│   └── shared/                 # Shared code
│       ├── models/            # Domain models
│       └── constants.ts       # App constants
│
├── playwright/                 # Playwright configuration
├── dist/                      # Build output
└── release/                   # Distribution packages
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development mode (main + renderer) |
| `npm run dev:main` | Start main process with watch mode |
| `npm run dev:renderer` | Start renderer dev server |
| `npm run build` | Build for production |
| `npm run dist` | Create distribution packages |

## 🔧 Key Components

### BrowserService
Manages Playwright browser instances with support for:
- Chromium, Firefox, and WebKit browsers
- Headless and headed modes
- State management and lifecycle control

### LogService
Centralized logging system featuring:
- Real-time log aggregation
- Multi-source logging (main, renderer, browser)
- Live log streaming to UI

### IPC Communication
Type-safe inter-process communication with:
- Structured channel definitions
- Request/response patterns
- Event-based messaging

## 🎯 Extension Points

The scaffold is designed for easy extension:

1. **Browser Operations**: Add new handlers in `src/main/ipc/handlers/`
2. **Services**: Create new services in `src/main/services/`
3. **UI Components**: Add components in `src/renderer/components/`
4. **Domain Models**: Define models in `src/shared/models/`

## 🔒 Security

- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC through preload scripts
- Type-safe message validation

## 📚 Tech Stack

- **Electron 32**: Desktop app framework
- **React 18**: UI library with hooks
- **TypeScript 5.5**: Type safety and modern JS
- **Playwright 1.47**: Browser automation
- **Vite 5**: Fast build tool and dev server
- **Electron Builder**: Cross-platform packaging

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for the automation and testing community.