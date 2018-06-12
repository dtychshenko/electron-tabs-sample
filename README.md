# Electron Tabbed

This is a sample app that demonstrates multiple windows and multiple tabs functionality in [Electron](https://electronjs.org/). Tabbing functionality is provided by [electron-tabs](https://www.npmjs.com/package/electron-tabs)

## Running

```sh
$ npm i
$ npm start
```

## File Structure Overview

* `tabs\` folder containing sample pages that are open within tabs
* `windows\` folder with sample pages that are open as new windows
    * `windows\main\` window displayed when app first starts and shows a menu with links to all tabs
    * `windows\tabs\` window that contains all tabs that are opened from the main menu
* `main.js` main process of the application. Responsible for opening the windows and handling communication between the windows

## Overall Approach

1. When the app first starts, a new window (`window\main\index.html`) is opened. The main window has a menu with three links. The links can reference other pages within this application (see Link 1 and Link 2) or link outside (see Link 3)
2. When a link is selected from the menu, the window requests the main process to open a new tab with the title and URL parameters.
3. The main process checks if a window with tabs already exists. If it does, it sends a message to the tabbed window to add a tab. If not, it first creates a tabbed window and then sends a message to it to add a tab.
4. The tabbed window listens for requests from the main process, and adds new tabs to the tab group when the new tab events are dispatched from the main process.