const { ipcRenderer, remote } = require("electron");
const TabGroup = require("electron-tabs");

// Create a group of draggable tabs when the tabbed window first initializes
const tabGroup = new TabGroup();
const thisWindow = remote.getCurrentWindow();

let tabGroupDragSrc = null;

// When the last tab is removed from the group, dispatch an event that closes this window to the main process
tabGroup.on("tab-removed", (tab, tabGroup) => {
  if (tabGroup.getTabs().length < 1) {
    thisWindow.close();
  }
});

// When the open tab event is dispatched, create a new tab with the provided parameters
ipcRenderer.on("open-tab", handleOpenTab);

const tabGroupContainer = document.querySelector('.etabs-tabgroup');
tabGroupContainer.addEventListener('drop', handleTabGroupDrop, false);
tabGroupContainer.addEventListener('dragover', e => e.preventDefault(), false);

function handleOpenTab(_event, params) {
  const tab = tabGroup.addTab({
    // Params are passed from the main process
    ...params.tabOptions,

    // The new tab will be visible
    visible: true,

    // Make the new tab active
    active: true
  });

  // If tab transfer parameter is provided, then this tab is being transfered from another window
  if (params.tabTransfer) {
    tab.on('webview-ready', tab => tab.webview.guestinstance = params.tabTransfer);
  }

  const tabElement = tab.tab;
  tabElement.draggable = true;
  tabElement.addEventListener('dragstart', handleDragStart, false);
  tabElement.addEventListener('dragend', handleDragEnd, false);
}

function handleTabGroupDrop(event) {
  // Prevent redirects
  event.stopPropagation && event.stopPropagation();
  
  if (this === tabGroupDragSrc) {
    return;
  }

  const tabDragDataJson = event.dataTransfer.getData('dropInParams');
  if (!tabDragDataJson) {
    return;
  }

  const params = JSON.parse(tabDragDataJson);
  handleOpenTab(null, params);
}

function handleDragStart(event) {
  this.style.opacity = '0.4';

  tabGroupDragSrc = this.parentElement.parentElement;

  const activeTab = tabGroup.getActiveTab();
  const { title, webview } = activeTab;
  const { guestinstance, src } = webview;

  const params = { 
    tabTransfer: guestinstance,
    tabOptions: { title, src }
  };

  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('dropInParams', JSON.stringify(params))
}

function handleDragEnd(event) {
  tabGroupDragSrc = null;
  this.style.opacity = null;

  const [ width, height ] = remote.getCurrentWindow().getContentSize();
  const { x, y } = event;

  if (tabGroup.getTabs().length <= 1) {
    return;
  }

  if (x < 0 || y < 0 || x > width || y > height) {
    const activeTab = tabGroup.getActiveTab();
    const { title, webview } = activeTab;
    const { guestinstance, src } = webview;

    const params = { 
      x, y,
      forceNewWindow: true, 
      tabTransfer: guestinstance,
      tabOptions: { title, src }
    };

    if (webview.guestinstance === 1) {
      activeTab.close();
    }

    webview.addEventListener('destroyed', () => activeTab.close());

    ipcRenderer.send("open-tabs-window", params);
  }
}