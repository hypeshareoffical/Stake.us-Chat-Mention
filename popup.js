//popup.js
// Function to load the saved username and display it in the text field
function loadUsername() {
    chrome.storage.local.get('username', function(data) {
        if (data.username) {
            document.getElementById('username').value = data.username;
        }
    });
}

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Function to check if the active tab is the Stake.us webpage
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const isStakeUsTab = tabs.some(tab => tab.url.includes('stake.us')); // Check if any of the active tabs are stake.us
        if (!isStakeUsTab) {
            alert('NOTICE! Please go to the Stake.us tab and set your username in this extension!');
            return;
        }

        // Load the saved username and display it in the text field
        loadUsername();

        // Show the popup content only if the active tab is Stake.us
        showPopupContent();
    });

    // Event listener for the "Show Alert Example!" button
    document.getElementById('show-example').addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            // Ensure we're sending a message to the content script of the current tab
            chrome.tabs.sendMessage(tabs[0].id, {action: "showExampleAlert"});
        });
    });

    // Event listener for the "Save Username" button
    document.getElementById('save-username').addEventListener('click', function() {
        const username = document.getElementById('username').value.trim();
        
        if (!username) {
            alert('Please enter a valid username!');
            return;
        }

        // Save the username to local storage
        chrome.storage.local.set({'username': username}, function() {
            console.log('Username saved:', username);

            // Inform the content script to update the username
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type: "setUsername", username: username});
            });

            // Close the popup
            window.close();
        });
    });
});

// Function to show the popup content
function showPopupContent() {
    document.getElementById('popup-content').style.display = 'block';
}
