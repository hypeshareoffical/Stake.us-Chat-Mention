// content.js
let username = ''; // Initialize username variable at the top for visibility

// Fetch the username from storage as soon as the script loads
chrome.storage.local.get('username', function(data) {
    if (data.username) {
        username = data.username; // Set the global username variable
        startMonitoring(); // Start monitoring with the loaded username
    }
});

// Function to start monitoring chat mentions
function startMonitoring() {
    // Disconnect the previous observer if it exists
    if (window.observer) {
        observer.disconnect();
    }

    window.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                checkForMentionInNode(node);
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

let mentionedRecently = false; // Variable to track recent mentions

// Function to check for mention of username in a node
function checkForMentionInNode(node) {
    if (!username) return; // Early return if username is not set

    // Continue using your query selector for mentions
    const querySelector = `span.svelte-vo3igl a[href*="${username}"]`;

    // Query for elements that specifically represent user mentions
    const mentionElements = node.querySelectorAll ? node.querySelectorAll(querySelector) : [];

    mentionElements.forEach(element => {
        // Navigate to the parent node that should contain the username of the mentioner
        let potentialMentioner = element.closest('.content').querySelector('button[data-analytics="global-betsBoard-user-button"]');
        if (potentialMentioner) {
            const mentioner = potentialMentioner.textContent.trim(); // Extract the username of the mentioner
            if (!mentionedRecently) {
                mentionedRecently = true;
                createInPageAlert(mentioner); // Use the extracted mentioner's username

                setTimeout(() => {
                    mentionedRecently = false;
                }, 5000);
            }
        }
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "showExampleAlert") {
        // Call the function to create an in-page alert
        createInPageAlert();
    } else if (request.type === "setUsername") {
        // When a message to set the username is received
        username = request.username.replace('@', ''); // Normalize username by removing '@'
        console.log("New username set:", username); // Logging for confirmation
        startMonitoring(); // Start monitoring for mentions with the new username
    }
});

// Function to create the in-page alert
function createInPageAlert(mentioner) {
    // Create a container for alerts if it doesn't already exist
    let alertsContainer = document.getElementById('alertsContainer');
    if (!alertsContainer) {
        alertsContainer = document.createElement('div');
        alertsContainer.id = 'alertsContainer';
        alertsContainer.style.position = 'fixed';
        alertsContainer.style.top = '10px';
        alertsContainer.style.left = '10px';
        alertsContainer.style.zIndex = '1000';
        document.body.appendChild(alertsContainer);
    }

    // Create the alert message
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert'; // Use for styling
    // Add timestamp to the alert text content
    const timeStamp = new Date().toLocaleTimeString();
    alertDiv.innerHTML = `CHAT MENTION!<br>Someone mentioned you: <strong>@${mentioner}</strong><br><span style="font-size: 0.8em; color: #6c757d;">(${timeStamp})</span>`;

    // Apply styles to the alertDiv
    alertDiv.style.backgroundColor = '#d4edda';
    alertDiv.style.color = '#155724';
    alertDiv.style.padding = '20px';
    alertDiv.style.marginTop = '10px'; // Increase space between alerts
    alertDiv.style.borderRadius = '5px';
    alertDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    alertDiv.style.display = 'flex';
    alertDiv.style.flexDirection = 'column'; // Stack elements vertically

    // Add close button
    const closeButton = document.createElement('span');
    closeButton.textContent = 'X';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginTop = '10px'; // Increase space between timestamp and clear button
    closeButton.addEventListener('click', () => {
        alertDiv.remove();
    });
    alertDiv.appendChild(closeButton);

    // Prepend the new alert to the alerts container to stack them vertically
    if (alertsContainer.firstChild) {
        alertsContainer.insertBefore(alertDiv, alertsContainer.firstChild);
    } else {
        alertsContainer.appendChild(alertDiv);
    }

    // Ensure that no more than 3 alerts are visible
    const allAlerts = alertsContainer.getElementsByClassName('custom-alert');
    if (allAlerts.length > 3) {
        allAlerts[allAlerts.length - 1].remove(); // Remove the oldest alert
    }
}
