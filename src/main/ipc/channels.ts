export enum IpcChannels {
  LaunchBrowser = 'playwrapp:launchBrowser',
  CloseBrowser = 'playwrapp:closeBrowser',
  LogMessage = 'playwrapp:logMessage',
  NavigateToUrl = 'playwrapp:navigateToUrl',
  StartRecording = 'playwrapp:startRecording',
  StopRecording = 'playwrapp:stopRecording',
  GetRecordingState = 'playwrapp:getRecordingState',
  ExportScript = 'playwrapp:exportScript',
  SaveScript = 'playwrapp:saveScript',
  LoadScripts = 'playwrapp:loadScripts',
  DeleteScript = 'playwrapp:deleteScript',
  RunScript = 'playwrapp:runScript',
}