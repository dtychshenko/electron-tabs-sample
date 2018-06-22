const { app, ipcMain, BrowserWindow, crashReporter } = require("electron");
const path = require("path");

// Reference to the main window that contains the menu
let mainWindow;

// Tabbed windows that can hold multiple tabs
let tabbedWindows = [];

// Resolved paths to window templates
const paths = {
  main: path.resolve("windows/main/index.html"),
  tabs: path.resolve("windows/tabs/index.html")
}

// Default window options
const defaultWinOptions = {
  width: 400,
  height: 400,
  x: 0,
  y: 0
};

app.once("ready", () => {
  // When app is ready, open the main window with the menu
  mainWindow = new BrowserWindow(defaultWinOptions);
  mainWindow.loadFile(paths.main);

  // When the main window is closed, also close the tabbed windows
  mainWindow.on("closed", () => {
    mainWindow = null;
    BrowserWindow.getAllWindows().forEach(w => w.close());
  });
});

// Shut down the application if all windows are closed
app.once("window-all-closed", () => app.quit());

ipcMain.on("open-tabs-window", (_event, params) => {
  // If there are no tabbed windows or if the caller is requesting a new window, open a new browser window
  if (tabbedWindows.length < 1 || params.forceNewWindow) {
    addTabbedWindow(params, params.x, params.y);
    return;
  }

  // Otherwise, open a new tab in the last available tabbed window
  const [ lastWindow ] = tabbedWindows.slice(-1);
  if (!lastWindow.isDestroyed()) {
    lastWindow.webContents.send("open-tab", params);
    lastWindow.focus();
  }
});

function addTabbedWindow(params, x = 400, y = 0, width = 800, height = 400) {
  // Create the tab window first based on the parameters
  const tabbedWindow = new BrowserWindow({ width, height, x, y });
  tabbedWindow.loadURL(paths.tabs);
  
  tabbedWindow.webContents.openDevTools();
  
  // Dereference the tab window when it closes
  tabbedWindow.once("closed", () => {
    const removeIndex = tabbedWindows.indexOf(tabbedWindow);
    if (removeIndex > -1) {
      tabbedWindows.splice(removeIndex, 1);
    }
  });
  
  // When the tab window finished loading, dispatch an event to add a new tab
  tabbedWindow.webContents.once("did-finish-load", () => {
    tabbedWindow.webContents.send("open-tab", params);
  });

  // Focus on the new tabbed window
  tabbedWindow.focus();

  // Store the reference to this window in the array
  tabbedWindows.push(tabbedWindow);
}