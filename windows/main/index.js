const { ipcRenderer } = require('electron');

const handleLinkClick = event => {
    // Prevent default <a> behavior
    event.preventDefault();
    
    // Get link url and title from the clicked element to pass to the open window event
    const params = {
        title: event.target.innerText,
        src: event.target.href
    };

    // Dispatch an event to the main process to open a new tab in the tabbed window
    ipcRenderer.send("open-tabs-window", params);
};

// Attach click handler to each menu item
document.querySelectorAll("ul li a").forEach(link => link.addEventListener("click", handleLinkClick));