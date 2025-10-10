import React, { useState } from 'react';
import { useIpc } from '../hooks/useIpc';
import { BROWSER_TYPES } from '@/shared/constants';

export const BrowserView: React.FC = () => {
  const { 
    launchBrowser, 
    closeBrowser, 
    navigateToUrl,
    startRecording,
    stopRecording,
    recordingState,
    isConnected 
  } = useIpc();
  const [selectedBrowser, setSelectedBrowser] = useState<'chromium' | 'firefox' | 'webkit'>('chromium');
  const [headless, setHeadless] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [url, setUrl] = useState<string>('https://example.com');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [isStoppingRecording, setIsStoppingRecording] = useState(false);

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

  const handleNavigateToUrl = async () => {
    setIsNavigating(true);
    setMessage('');

    try {
      const response = await navigateToUrl(url);
      setMessage(response.message || '');
      if (response.currentUrl) {
        setUrl(response.currentUrl);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleStartRecording = async () => {
    setIsStartingRecording(true);
    setMessage('');

    try {
      const response = await startRecording();
      setMessage(response.message || '');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsStartingRecording(false);
    }
  };

  const handleStopRecording = async () => {
    setIsStoppingRecording(true);
    setMessage('');

    try {
      const response = await stopRecording();
      setMessage(response.message || '');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsStoppingRecording(false);
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
      </div>

      <div className="navigation-section">
        <h3>Navigation</h3>
        <div className="form-group">
          <label htmlFor="url-input">URL:</label>
          <div className="url-input-group">
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isNavigating}
              placeholder="https://example.com"
            />
            <button
              onClick={handleNavigateToUrl}
              disabled={isNavigating || !url.trim()}
              className="navigate-button"
            >
              {isNavigating ? 'Navigating...' : 'Go'}
            </button>
          </div>
        </div>
      </div>

      <div className="recording-section">
        <h3>Recording</h3>
        <div className="recording-info">
          <p>Status: {recordingState.isRecording ? 'Recording' : 'Stopped'}</p>
          {recordingState.isRecording && recordingState.startedAt && (
            <p>Started: {new Date(recordingState.startedAt).toLocaleTimeString()}</p>
          )}
          <p>Steps recorded: {recordingState.steps.length}</p>
        </div>
        
        <div className="button-group">
          <button
            onClick={handleStartRecording}
            disabled={recordingState.isRecording || isStartingRecording || isStoppingRecording}
            className="start-recording-button"
          >
            {isStartingRecording ? 'Starting...' : 'Start Recording'}
          </button>

          <button
            onClick={handleStopRecording}
            disabled={!recordingState.isRecording || isStartingRecording || isStoppingRecording}
            className="stop-recording-button"
          >
            {isStoppingRecording ? 'Stopping...' : 'Stop Recording'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.toLowerCase().includes('error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};