const { ipcRenderer } = require("electron");
const TabGroup = require("electron-tabs");
const dragula = require("dragula");

// Create a group of draggable tabs when the tabbed window first initializes
const tabGroup = new TabGroup({
  ready: tabGroup => {
    dragula([tabGroup.tabContainer], {
      direction: "horizontal"
    });
  }
});

// When the last tab is removed from the group, dispatch an event that closes this window to the main process
tabGroup.on("tab-removed", (tab, tabGroup) => {
  if (tabGroup.getTabs().length < 1) {
    ipcRenderer.send("close-tabs-window");
  }
});

// When the open tab event is dispatched, create a new tab with the provided parameters
ipcRenderer.on("open-tab", (event, params) => {
  tabGroup.addTab({
    // Params are passed from the main process
    ...params,

    // The new tab will be visible
    visible: true,

    // Make the new tab active
    active: true
  });
});
