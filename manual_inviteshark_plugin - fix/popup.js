document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('toggle-extension');

    // Load the current state
    chrome.storage.local.get(['extensionEnabled'], function(result) {
        const isEnabled = result.extensionEnabled !== false; // Default to true if not set
        toggleSwitch.checked = isEnabled;
        console.log('Initial state:', isEnabled);
    });

    // Handle toggle switch change
    toggleSwitch.addEventListener('change', () => {
        const isChecked = toggleSwitch.checked;
        chrome.storage.local.set({ extensionEnabled: isChecked }, () => {
            console.log('Extension enabled state set to', isChecked);
        });
    });
});
