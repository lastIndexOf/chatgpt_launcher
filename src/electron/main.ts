import * as path from "path";
import { app, screen, globalShortcut, BrowserWindow } from "electron";
import { registerMainWinEvents } from "./main/event";
import { defaultSize, SizeDetector } from "./main/size";

let mainWindow: BrowserWindow;
const sizeController = new SizeDetector();

function createWindow() {
  mainWindow = new BrowserWindow({
    ...defaultSize,
    frame: false,
    center: true,
    y: Math.floor(screen.getPrimaryDisplay().workAreaSize.height / 4),
    resizable: false,
    show: false,
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));

  registerMainWinEvents(mainWindow, sizeController);
}

app.on("ready", () => {
  createWindow();

  if (process.platform === "darwin") {
    app.dock.hide();
  }

  // 全局快捷键
  globalShortcut.register("CommandOrControl+Shift+Space", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      if (process.platform === "darwin") {
        app.dock.hide();
      }
    } else {
      mainWindow.setVisibleOnAllWorkspaces(true);
      mainWindow.show();
    }
  });
});

app.on("will-quit", () => {
  // 注销快捷键
  globalShortcut.unregisterAll();
});
