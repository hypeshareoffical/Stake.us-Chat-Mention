//background.js
// Listen for messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "checkActiveTabAndNotify") {
        // Check if the tab is active
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length > 0 && tabs[0].id !== sender.tab.id) {
                // If the user is in a different tab, show a system alert popup
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'images/icon128.png',
                    title: 'ALERT!',
                    message: 'You\'ve been mentioned in the Stake.Us chat tab!',
                    priority: 2
                });
            }
        });
    }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'mention') {
        // Trigger the alert
        alert('ALERT! You\'ve been mentioned in the Stake.Us chat tab!');
    }
});
