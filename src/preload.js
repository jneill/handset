const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('demoAPI', {
  getCurrentUrl: () => ipcRenderer.invoke('get-current-url'),
  setUrl: (url) => ipcRenderer.invoke('set-url', url),
  clearAllData: () => ipcRenderer.invoke('clear-all-data'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  onShowUrlPrompt: (callback) => {
    ipcRenderer.on('show-url-prompt', () => callback());
  },
  onReloadWebview: (callback) => {
    ipcRenderer.on('reload-webview', () => callback());
  }
});
