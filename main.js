const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");

// Reference to the main window that contains the menu
let mainWindow;

// Reference to the tabs window that holds all the tabs
let tabsWindow;

// Default window options
const winOptions = {
  width: 400,
  height: 400,
  x: 0,
  y: 0
};

app.on("ready", () => {
  // When app is ready, open the main window with the menu
  mainWindow = new BrowserWindow(winOptions);
  mainWindow.loadFile("windows/main/index.html");

  // When the main window is closed, also close the tabbed windows
  mainWindow.on("closed", () => {
    mainWindow = null;
    tabsWindow && tabsWindow.close();
  });
});

// Shut down the application if all windows are closed
app.on("window-all-closed", () => app.quit());

ipcMain.on("open-tabs-window", (event, params) => {
  // When the renderer process requests to open a new tab, check if a tabs window already exists or not
  if (!tabsWindow) {
    // If the tab window doesn't exist (first tab is opened), create the tab window first
    tabsWindow = new BrowserWindow({ ...winOptions, x: 400 });
    tabsWindow.loadURL(path.resolve("windows/tabs/index.html"));

    // Dereference the tab window when it closes
    tabsWindow.on("close", () => tabsWindow = null);

    // When the tab window finished loading, dispatch an event to add a new tab
    tabsWindow.webContents.once("did-finish-load", () => {
      tabsWindow.webContents.send("open-tab", params);
    });
  } else {
    // Otherwise, the tab window already exists, so just dispatch an event to add a new tab
    tabsWindow.webContents.send("open-tab", params);
  }

  // Focus on the tabbed window
  tabsWindow.focus();
});

// When the last tab is closed, this event is triggered, which will close the tab window
ipcMain.on("close-tabs-window", () => tabsWindow.close());
