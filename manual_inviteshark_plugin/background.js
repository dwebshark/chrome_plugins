// Function to store a choice with error handling and callback
function storeChoice(choice, callback) {
    chrome.storage.local.set({ choice: choice }, function() {
        if (chrome.runtime.lastError) {
            console.error('Error storing choice: ', chrome.runtime.lastError.message);
            if (typeof callback === 'function') {
                callback(false, chrome.runtime.lastError.message);
            }
        } else {
            console.log('Choice stored successfully');
            if (typeof callback === 'function') {
                callback(true, 'Choice stored successfully');
            }
        }
    });
}

// Function to store data with error handling and callback
function storeStoredData(storedData, callback) {
    chrome.storage.local.set({ storedData: storedData }, function() {
        if (chrome.runtime.lastError) {
            console.error('Error storing storedData: ', chrome.runtime.lastError.message);
            if (typeof callback === 'function') {
                callback(false, chrome.runtime.lastError.message);
            }
        } else {
            console.log('storedData stored successfully');
            if (typeof callback === 'function') {
                callback(true, 'storedData stored successfully');
            }
        }
    });
}

// Function to get stored data with callback
function getStoredData(callback) {
    chrome.storage.local.get('storedData', function(result) {
        if (chrome.runtime.lastError) {
            console.error('Error fetching storedData: ', chrome.runtime.lastError.message);
            callback(null, chrome.runtime.lastError.message);
        } else {
            console.log('Fetched storedData: ', result.storedData);
            callback(result.storedData, null);
        }
    });
}

// Function to remove the first element from stored data with callback
function removeFirstElement(callback) {
    chrome.storage.local.get('storedData', function(result) {
        if (chrome.runtime.lastError) {
            console.error('Error fetching storedData: ', chrome.runtime.lastError.message);
            if (callback) callback(false, chrome.runtime.lastError.message);
        } else {
            let storedData = result.storedData;
            if (Array.isArray(storedData) && storedData.length > 0) {
                storedData.shift(); // Remove the first element
                chrome.storage.local.set({ storedData: storedData }, function() {
                    if (chrome.runtime.lastError) {
                        console.error('Error storing updated storedData: ', chrome.runtime.lastError.message);
                        if (callback) callback(false, chrome.runtime.lastError.message);
                    } else {
                        console.log('First element removed and updated storedData stored successfully');
                        if (storedData.length > 0) {
                            callback(true, storedData[0]);
                        } else {
                            callback(true, null);
                        }
                    }
                });
            } else {
                const errorMessage = 'storedData is not an array or is empty';
                console.error(errorMessage);
                if (callback) callback(false, errorMessage);
            }
        }
    });
}

// Function to fetch a choice with error handling and callback
function fetchChoice(callback) {
    chrome.storage.local.get('choice', function(result) {
        if (chrome.runtime.lastError) {
            console.error('Error fetching choice: ', chrome.runtime.lastError.message);
            if (typeof callback === 'function') {
                callback(false, null, chrome.runtime.lastError.message);
            }
        } else {
            console.log('Choice fetched successfully: ', result.choice);
            if (typeof callback === 'function') {
                callback(true, result.choice, 'Choice fetched successfully');
            }
        }
    });
}

// Function to fetch webpage data
async function fetchWebpageData(url) {
    try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

// Event listener for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchData') {
        fetchChoice((success, choice, message) => {
            if (success) {
                const url_element = choice;
                fetchWebpageData('http://sourcingselector.nl/fetchData/' + url_element)
                    .then(data => {

                        // FIXED: do NOT parse
                        const storedData = data.data;

                        storeStoredData(storedData, (success, message) => {
                            if (success) {
                                console.log('Data fetched and stored:', storedData);
                                sendResponse({ success: true, data: storedData });
                            } else {
                                console.error('Error storing data:', message);
                                sendResponse({ success: false, error: message });
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error.message);
                        sendResponse({ success: false, error: error.message });
                    });
            } else {
                console.error('Error fetching choice: ', message);
                sendResponse({ success: false, error: message });
            }
        });
    return true;
    }

    if (request.action === 'getStoredData') {
        getStoredData((storedData, error) => {
            if (storedData) {
                const person = storedData[0];
                sendResponse({ success: true, data: person });
            } else {
                console.error('Error fetching storedData:', error);
                sendResponse({ success: false, error: error });
            }
        });
        return true; // Indicate asynchronous response
    }

    if (request.action === 'getNextPersonUrl') {
        getStoredData((storedData, error) => {
            if (storedData && storedData.length > 0) {
                sendResponse({ success: true, data: storedData[0].openbare_url });
            } else {
                sendResponse({ success: true, data: "No_Url" });
            }
        });
        return true; // Indicate asynchronous response
    }

    if (request.action === 'Delete_The_First_Person') {
        removeFirstElement((success, newFirstPerson, message) => {
            if (success) {
                if (newFirstPerson) {
                    console.log('First person removed');
                    sendResponse({ success: true, data: newFirstPerson });
                } else {
                    console.log('No more persons left in the stored data');
                    sendResponse({ success: true, data: null });
                }
            } else {
                console.error('Error removing first person:', message);
                sendResponse({ success: false, error: message });
            }
        });
        return true; // Indicate asynchronous response
    }

    if (request.action === 'sendChoice') {
        storeChoice(request.choice, (success, message) => {
            if (success) {
                console.log('Choice stored');
                sendResponse({ success: true, message: message });
            } else {
                console.error('Error storing choice:', message);
                sendResponse({ success: false, error: message });
            }
        });
        return true; // Indicate asynchronous response
    }
});

// Event listener for extension installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ extensionEnabled: true });
});
