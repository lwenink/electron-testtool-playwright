import React from 'react';
import { BrowserView } from './components/BrowserView';
import { ScriptManager } from './components/ScriptManager';
import { LogViewer } from './components/LogViewer';
import { APP_NAME, APP_VERSION } from '@/shared/constants';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>{APP_NAME}</h1>
        <span className="version">v{APP_VERSION}</span>
      </header>

      <main className="app-main">
        <div className="app-grid">
          <div className="browser-section">
            <BrowserView />
          </div>
          
          <div className="script-section">
            <ScriptManager />
          </div>
          
          <div className="log-section">
            <LogViewer />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Playwright + Electron + React Test Tool</p>
      </footer>
    </div>
  );
};

export default App;