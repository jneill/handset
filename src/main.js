const { app, BrowserWindow, Menu, session, ipcMain, shell } = require('electron');
const path = require('path');

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

let win;
let store;

async function initStore() {
  const Store = (await import('electron-store')).default;
  store = new Store({
    defaults: {
      url: ''
    }
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 465,
    height: 722,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    backgroundColor: '#000000',
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

// Resolve initial URL: CLI arg > stored URL > empty (prompt)
function getInitialUrl() {
  const cliUrl = process.env.HANDSET_URL;
  if (cliUrl) {
    let url = cliUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = url.includes('localhost') ? `http://${url}` : `https://${url}`;
    }
    store.set('url', url);
    return url;
  }
  return store.get('url');
}

// IPC handlers
ipcMain.handle('get-current-url', () => {
  return getInitialUrl();
});

ipcMain.handle('set-url', (_event, url) => {
  store.set('url', url);
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
app.whenReady().then(async () => {
  await initStore();
  session.defaultSession.setUserAgent(MOBILE_UA);
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
