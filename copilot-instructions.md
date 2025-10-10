# Playwrapp - Copilot Instructions

## Project Overview

Playwrapp is a strongly typed, SOLID-principled Electron application that integrates Playwright browser automation with a React frontend. This application serves as a comprehensive starter scaffold for building Playwright-based testing tools.

## Architecture

### Main Process (src/main/)
- **main.ts**: Application entry point with window management and lifecycle
- **preload.ts**: Secure IPC bridge between main and renderer processes
- **services/**: Business logic layer following SOLID principles
  - `BrowserService`: Manages Playwright browser instances
  - `LogService`: Handles application logging and log aggregation
- **ipc/**: Inter-process communication layer
  - `channels.ts`: IPC channel definitions
  - `types.ts`: IPC message type definitions
  - `handlers/`: IPC request handlers

### Renderer Process (src/renderer/)
- **React-based UI** with TypeScript
- **components/**: Reusable UI components
  - `BrowserView`: Browser control interface
  - `LogViewer`: Real-time log display
- **hooks/**: Custom React hooks
  - `useIpc`: IPC communication hook

### Shared (src/shared/)
- **models/**: Domain models used across processes
- **constants.ts**: Application-wide constants

## Key Features

1. **Type Safety**: Full TypeScript coverage with strict typing
2. **SOLID Principles**: Clean architecture with dependency injection
3. **Real-time Communication**: Bidirectional IPC with type safety
4. **Browser Management**: Launch and control Playwright browsers
5. **Logging System**: Centralized logging with real-time updates
6. **Modern UI**: React-based interface with responsive design

## Development Commands

- `npm run dev`: Start development mode (main + renderer)
- `npm run build`: Build for production
- `npm run dist`: Create distributable packages

## Code Style Guidelines

1. Use TypeScript strict mode
2. Follow SOLID principles
3. Implement interfaces for all services
4. Use async/await for asynchronous operations
5. Prefer composition over inheritance
6. Maintain clear separation of concerns

## Testing Strategy

- Unit tests for services and utilities
- Integration tests for IPC communication
- End-to-end tests using Playwright
- Component testing for React components

## Extension Points

The scaffold is designed to be easily extended:

1. **New Browser Operations**: Add handlers in `src/main/ipc/handlers/`
2. **Additional Services**: Create new services in `src/main/services/`
3. **UI Components**: Add components in `src/renderer/components/`
4. **Shared Models**: Define domain models in `src/shared/models/`

## Security Considerations

- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication through preload script
- Type-safe message passing

## Build Configuration

- **Vite**: Fast development and optimized production builds
- **Electron Builder**: Cross-platform packaging
- **TypeScript**: Strict type checking and modern JS features