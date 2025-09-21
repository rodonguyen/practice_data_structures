const { app, BrowserWindow, Tray, Menu, ipcMain, Notification } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Keep global references
let mainWindow;
let tray;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    // icon: path.join(__dirname, '../assets/icon.png'),
    show: false, // Don't show until ready
    titleBarStyle: 'default',
    frame: true
  });

  // Load the appropriate URL
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist-react/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on window
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle minimize to tray
  mainWindow.on('minimize', (event) => {
    if (process.platform === 'win32') {
      event.preventDefault();
      mainWindow.hide();
      
      // Show notification on first minimize
      if (!mainWindow.hasBeenMinimized) {
        new Notification({
          title: 'Multi-Timer',
          body: 'App minimized to system tray. Click the tray icon to restore.',
          icon: path.join(__dirname, '../assets/icon.png')
        }).show();
        mainWindow.hasBeenMinimized = true;
      }
    }
  });
}

function createTray() {
  // Create system tray (skip for now due to missing icons)
  return;
  // const trayIcon = path.join(__dirname, '../assets/tray.png');
  // tray = new Tray(trayIcon);
  
  // tray.setToolTip('Multi-Timer - Your precision timer app');
  
  // Create tray menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Multi-Timer',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quick Timer',
      submenu: [
        {
          label: '5 Minutes',
          click: () => sendToRenderer('create-quick-timer', { minutes: 5 })
        },
        {
          label: '10 Minutes', 
          click: () => sendToRenderer('create-quick-timer', { minutes: 10 })
        },
        {
          label: '25 Minutes (Pomodoro)',
          click: () => sendToRenderer('create-quick-timer', { minutes: 25 })
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  // Double click to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Helper function to send messages to renderer
function sendToRenderer(channel, data) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, data);
  }
}

// App event listeners
app.whenReady().then(() => {
  createWindow();
  createTray();
  
  // macOS - recreate window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Prevent app from quitting when window is closed (minimize to tray instead)
app.on('before-quit', (event) => {
  if (!app.isQuiting && process.platform === 'win32') {
    event.preventDefault();
    if (mainWindow) {
      mainWindow.hide();
    }
    return false;
  }
});

// IPC handlers for timer notifications
ipcMain.handle('show-notification', async (event, { title, body, icon }) => {
  const notification = new Notification({
    title,
    body,
    icon: icon || path.join(__dirname, '../assets/icon.png'),
    silent: false
  });
  
  notification.show();
  
  // Flash tray icon
  if (tray) {
    tray.setImage(path.join(__dirname, '../assets/tray-alert.png'));
    setTimeout(() => {
      tray.setImage(path.join(__dirname, '../assets/tray.png'));
    }, 3000);
  }
  
  return true;
});

// Handle timer mark notifications
ipcMain.handle('timer-mark-triggered', async (event, { timerName, markName, timeRemaining }) => {
  // Show notification
  const notification = new Notification({
    title: `${timerName} - Mark Reached`,
    body: `${markName} • ${timeRemaining} remaining`,
    icon: path.join(__dirname, '../assets/icon.png')
  });
  
  notification.show();
  
  // Flash tray and window if minimized
  if (tray) {
    tray.setImage(path.join(__dirname, '../assets/tray-alert.png'));
    setTimeout(() => {
      tray.setImage(path.join(__dirname, '../assets/tray.png'));
    }, 2000);
  }
  
  if (mainWindow && !mainWindow.isVisible()) {
    mainWindow.flashFrame(true);
  }
  
  return true;
});

// Handle app focus
ipcMain.handle('focus-window', async () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
  return true;
});