import * as path from 'path';
import { app, screen, globalShortcut, BrowserWindow } from 'electron';
import { registerMainWinEvents } from './main/event';
import { defaultSize, SizeDetector } from './main/size';
import { applySystemProxy } from './main/proxy';
import { isDev } from './utils/env';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow;
const sizeController = new SizeDetector();

function createWindow() {
  mainWindow = new BrowserWindow({
    ...defaultSize,
    y: Math.floor(screen.getPrimaryDisplay().workAreaSize.height / 4),
    frame: false,
    center: true,
    resizable: false,
    show: false,
    // vibrancy: 'appearance-based',
    // backgroundColor: 'transparent',
    opacity: 0.96,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      devTools: isDev,
      nodeIntegration: true,
      contextIsolation: false,
      // experimentalFeatures: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  registerMainWinEvents(mainWindow, sizeController);
}

app.on('ready', () => {
  createWindow();
  applySystemProxy();

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'undocked' });
  }

  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  // 全局快捷键
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      if (process.platform === 'darwin') {
        app.dock.hide();
        mainWindow.setVisibleOnAllWorkspaces(false);
      }
    } else {
      // mainWindow.showInactive();
      // mainWindow.focus();
      // 获取所有显示器
      // screen.getAllDisplays();
      mainWindow.setAlwaysOnTop(true);
      mainWindow.setVisibleOnAllWorkspaces(true);
      mainWindow.show();
      setTimeout(() => {
        mainWindow.setVisibleOnAllWorkspaces(false);
      }, 100);

      // if (!currentDisplay.) {
      //   // Move the window to the current desktop and bring it to the top
      // }
    }
  });
});

app.on('will-quit', () => {
  // 注销快捷键
  globalShortcut.unregisterAll();
});
