import React, { useEffect, useRef } from 'react';
import { useIpc } from '../hooks/useIpc';
import { LogEntry } from '@/shared/models/LogEntry';

export const LogViewer: React.FC = () => {
  const { logs, clearLogs, refreshLogs, isConnected } = useIpc();
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLogClassName = (level: string) => {
    return `log-entry log-${level}`;
  };

  const getSourceBadge = (source: string) => {
    return <span className={`source-badge source-${source}`}>{source.toUpperCase()}</span>;
  };

  if (!isConnected) {
    return (
      <div className="log-viewer">
        <h2>Log Viewer</h2>
        <p className="error">Not connected to Electron main process</p>
      </div>
    );
  }

  return (
    <div className="log-viewer">
      <div className="log-header">
        <h2>Log Viewer</h2>
        <div className="log-controls">
          <button onClick={refreshLogs} className="refresh-button">
            Refresh
          </button>
          <button onClick={clearLogs} className="clear-button">
            Clear Logs
          </button>
          <span className="log-count">
            {logs.length} log{logs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="log-container" ref={logContainerRef}>
        {logs.length === 0 ? (
          <div className="no-logs">No logs available</div>
        ) : (
          logs.map((log: LogEntry) => (
            <div key={log.id} className={getLogClassName(log.level)}>
              <div className="log-meta">
                <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                {getSourceBadge(log.source)}
                <span className={`log-level level-${log.level}`}>
                  {log.level.toUpperCase()}
                </span>
              </div>
              <div className="log-text">{log.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};