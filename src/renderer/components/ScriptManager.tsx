import React, { useState, useEffect } from 'react';
import { useIpc } from '../hooks/useIpc';
import { TestScript, RecordedStep } from '@/shared/models/RecordingState';

export const ScriptManager: React.FC = () => {
  const {
    scripts,
    recordingState,
    exportScript,
    saveScript,
    deleteScript,
    runScript,
    loadScripts,
    isConnected,
  } = useIpc();

  const [message, setMessage] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [scriptName, setScriptName] = useState<string>('');
  const [exportedScript, setExportedScript] = useState<TestScript | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [showCodeModal, setShowCodeModal] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadScripts();
    }
  }, [isConnected, loadScripts]);

  const handleExportScript = async () => {
    if (!scriptName.trim()) {
      setMessage('Please enter a script name');
      return;
    }

    if (recordingState.steps.length === 0) {
      setMessage('No recorded steps to export');
      return;
    }

    setIsExporting(true);
    setMessage('');

    try {
      const response = await exportScript({
        steps: recordingState.steps,
        name: scriptName.trim(),
      });

      if (response.success && response.script && response.code) {
        setExportedScript(response.script);
        setGeneratedCode(response.code);
        setMessage(`Script "${scriptName}" exported successfully`);
        setScriptName('');
      } else {
        setMessage(response.message || 'Failed to export script');
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveScript = async (script: TestScript) => {
    setIsSaving(true);
    setMessage('');

    try {
      const response = await saveScript(script);
      if (response.success) {
        setMessage(`Script "${script.name}" saved successfully`);
        setExportedScript(null);
        setGeneratedCode('');
      } else {
        setMessage(response.message || 'Failed to save script');
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteScript = async (scriptId: string, scriptName: string) => {
    if (!confirm(`Are you sure you want to delete "${scriptName}"?`)) {
      return;
    }

    setMessage('');

    try {
      const response = await deleteScript(scriptId);
      if (response.success) {
        setMessage(`Script "${scriptName}" deleted successfully`);
      } else {
        setMessage(response.message || 'Failed to delete script');
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRunScript = async (script: TestScript) => {
    setIsRunning(script.id);
    setMessage('');

    try {
      const response = await runScript(script);
      if (response.success) {
        setMessage(`Script "${script.name}" executed successfully`);
      } else {
        setMessage(response.message || 'Failed to run script');
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(null);
    }
  };

  const handleShowCode = (script: TestScript) => {
    // Generate code for viewing
    const steps = script.steps;
    let code = `import { test, expect } from '@playwright/test';\n\n`;
    code += `test('${script.name}', async ({ page }) => {\n`;

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
    setGeneratedCode(code);
    setShowCodeModal(true);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  if (!isConnected) {
    return (
      <div className="script-manager">
        <h2>Script Manager</h2>
        <p className="error">Not connected to Electron main process</p>
      </div>
    );
  }

  return (
    <div className="script-manager">
      <h2>Script Manager</h2>

      {/* Export Section */}
      <div className="export-section">
        <h3>Export Recording</h3>
        {recordingState.steps.length > 0 ? (
          <div>
            <p>Current recording has {recordingState.steps.length} steps</p>
            <div className="form-group">
              <input
                type="text"
                value={scriptName}
                onChange={(e) => setScriptName(e.target.value)}
                placeholder="Enter script name"
                disabled={isExporting}
              />
              <button
                onClick={handleExportScript}
                disabled={isExporting || !scriptName.trim()}
                className="export-button"
              >
                {isExporting ? 'Exporting...' : 'Export Script'}
              </button>
            </div>
          </div>
        ) : (
          <p>No recorded steps available. Start recording to create a script.</p>
        )}
      </div>

      {/* Exported Script Preview */}
      {exportedScript && (
        <div className="exported-script">
          <h3>Exported Script: {exportedScript.name}</h3>
          <p>Created: {formatDate(exportedScript.createdAt)}</p>
          <p>Steps: {exportedScript.steps.length}</p>
          
          <div className="button-group">
            <button
              onClick={() => handleSaveScript(exportedScript)}
              disabled={isSaving}
              className="save-button"
            >
              {isSaving ? 'Saving...' : 'Save Script'}
            </button>
            
            <button
              onClick={() => setShowCodeModal(true)}
              className="view-code-button"
            >
              View Code
            </button>
            
            <button
              onClick={() => {
                setExportedScript(null);
                setGeneratedCode('');
              }}
              className="discard-button"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Saved Scripts */}
      <div className="saved-scripts">
        <h3>Saved Scripts ({scripts.length})</h3>
        {scripts.length > 0 ? (
          <div className="script-list">
            {scripts.map((script) => (
              <div key={script.id} className="script-item">
                <div className="script-info">
                  <h4>{script.name}</h4>
                  <p>Created: {formatDate(script.createdAt)}</p>
                  <p>Steps: {script.steps.length}</p>
                  {script.url && <p>URL: {script.url}</p>}
                </div>
                
                <div className="script-actions">
                  <button
                    onClick={() => handleRunScript(script)}
                    disabled={isRunning === script.id}
                    className="run-button"
                  >
                    {isRunning === script.id ? 'Running...' : 'Run'}
                  </button>
                  
                  <button
                    onClick={() => handleShowCode(script)}
                    className="view-code-button"
                  >
                    View Code
                  </button>
                  
                  <button
                    onClick={() => handleDeleteScript(script.id, script.name)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No saved scripts. Export and save a recording to see scripts here.</p>
        )}
      </div>

      {/* Code Modal */}
      {showCodeModal && (
        <div className="modal-overlay" onClick={() => setShowCodeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Playwright Test Code</h3>
              <button
                onClick={() => setShowCodeModal(false)}
                className="close-button"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <pre className="code-block">{generatedCode}</pre>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  setMessage('Code copied to clipboard');
                }}
                className="copy-button"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowCodeModal(false)}
                className="close-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`message ${message.toLowerCase().includes('error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};