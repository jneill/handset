const { app, BrowserWindow, Menu, session, ipcMain, shell } = require('electron');
const path = require('path');

const ICON_PATH = path.join(__dirname, '..', 'assets', 'icon.png');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 465,
    height: 722,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    backgroundColor: '#000000',
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  win.on('closed', () => {
    win = null;
  });

  buildMenu();
}

function buildMenu() {
  const template = [
    {
      label: 'Handset',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Change URL…',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            if (win) win.webContents.send('show-url-prompt');
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (win) win.webContents.send('reload-webview');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Always on Top',
          type: 'checkbox',
          checked: true,
          click: (menuItem) => {
            if (win) win.setAlwaysOnTop(menuItem.checked);
          }
        },
        {
          label: 'Reset Window Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (win) win.setSize(465, 722);
          }
        },
        { type: 'separator' },
        {
          label: 'Clear Cache & Data',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: async () => {
            const ses = session.defaultSession;
            await ses.clearCache();
            await ses.clearStorageData({
              storages: [
                'cookies', 'filesystem', 'indexdb', 'localstorage',
                'shadercache', 'websql', 'serviceworkers', 'cachestorage'
              ]
            });
            if (win) win.webContents.send('reload-webview');
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle DevTools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            if (win) win.webContents.toggleDevTools();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Resolve initial URL: CLI arg or empty (prompt)
function getInitialUrl() {
  const cliUrl = process.env.HANDSET_URL;
  if (cliUrl) {
    let url = cliUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = url.includes('localhost') ? `http://${url}` : `https://${url}`;
    }
    return url;
  }
  return '';
}

// IPC handlers
ipcMain.handle('get-current-url', () => {
  return getInitialUrl();
});

ipcMain.handle('set-url', () => {
  return true;
});

ipcMain.handle('clear-all-data', async () => {
  const ses = session.defaultSession;
  await ses.clearCache();
  await ses.clearStorageData({
    storages: [
      'cookies', 'filesystem', 'indexdb', 'localstorage',
      'shadercache', 'websql', 'serviceworkers', 'cachestorage'
    ]
  });
  return true;
});

ipcMain.handle('open-external', (_event, url) => {
  shell.openExternal(url);
});

// App lifecycle
app.setName('Handset');

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
