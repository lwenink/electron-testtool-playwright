import React, { useState } from 'react';
import { useIpc } from '../hooks/useIpc';
import { BROWSER_TYPES } from '@/shared/constants';

export const BrowserView: React.FC = () => {
  const { launchBrowser, closeBrowser, isConnected } = useIpc();
  const [selectedBrowser, setSelectedBrowser] = useState<'chromium' | 'firefox' | 'webkit'>('chromium');
  const [headless, setHeadless] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleLaunchBrowser = async () => {
    setIsLaunching(true);
    setMessage('');

    try {
      const response = await launchBrowser({
        browserType: selectedBrowser,
        headless,
      });

      setMessage(response.message || '');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleCloseBrowser = async () => {
    setIsClosing(true);
    setMessage('');

    try {
      const response = await closeBrowser();
      setMessage(response.message || '');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsClosing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="browser-view">
        <h2>Browser Control</h2>
        <p className="error">Not connected to Electron main process</p>
      </div>
    );
  }

  return (
    <div className="browser-view">
      <h2>Browser Control</h2>
      
      <div className="browser-config">
        <div className="form-group">
          <label htmlFor="browser-select">Browser Type:</label>
          <select
            id="browser-select"
            value={selectedBrowser}
            onChange={(e) => setSelectedBrowser(e.target.value as typeof selectedBrowser)}
            disabled={isLaunching || isClosing}
          >
            {BROWSER_TYPES.map(browser => (
              <option key={browser} value={browser}>
                {browser.charAt(0).toUpperCase() + browser.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={headless}
              onChange={(e) => setHeadless(e.target.checked)}
              disabled={isLaunching || isClosing}
            />
            Headless Mode
          </label>
        </div>

        <div className="button-group">
          <button
            onClick={handleLaunchBrowser}
            disabled={isLaunching || isClosing}
            className="launch-button"
          >
            {isLaunching ? 'Launching...' : 'Launch Browser'}
          </button>

          <button
            onClick={handleCloseBrowser}
            disabled={isLaunching || isClosing}
            className="close-button"
          >
            {isClosing ? 'Closing...' : 'Close Browser'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.toLowerCase().includes('error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};