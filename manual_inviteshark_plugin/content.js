var data = "";
var next_person_url = "";

function Reload_The_Data() {
    var url_to_be_sent = "http://sourcingselector.nl/fetchData/";
    chrome.runtime.sendMessage({ action: 'fetchData', url_to_be_sent: url_to_be_sent }, response => {
        if (response && response.success) {
            Recieve_The_Data(() => {
                if (data && data.openbare_url) {
                    setTimeout(() => {
                        console.log("Data ready for redirection");
                        console.log(data);
                        window.location = data.openbare_url;
                    }, 500);
                }
            });
        } else {
            console.error('Failed to fetch data:', response.error);
        }
    });
}
// Function to print the data to the console
function printData() {
    Recieve_The_Data((data) => {
        console.log('Fetched Data:', data);
    });
}

// Event listener for window load
window.addEventListener('load', printData);
function Recieve_The_Data(callback) {
    chrome.runtime.sendMessage({ action: 'getStoredData' }, response => {
        if (response && response.success) {
            data = response.data;
            if (callback) {
                callback();
            }
        } else {
            const errorMessage = response && response.message ? response.message : 'Unknown error occurred';
            console.error('Failed to fetch stored data from background.js: ', errorMessage);
        }
    });
}

function Delete_The_First_Person(callback) {
    chrome.runtime.sendMessage({ action: 'Delete_The_First_Person' }, response => {
        if (callback) {
            callback(response);
        }
    });
}

function Create_Reload_Button() {
    var button = document.createElement("button");
    button.id = "reload-button";
    button.className = "invite-button";
    button.textContent = 'Start';
    button.style.backgroundColor = '#008000';
    button.style.flex = '1';
    button.addEventListener("click", function () {
        Reload_The_Data();
    });

    var existingDiv = document.getElementById("invite-button-nav");
    existingDiv.appendChild(button);
}

function Create_Next_Button() {
    const button = document.createElement("button");
    button.id = "next-button";
    button.className = "invite-button";
    button.textContent = 'Uitgenodigd';
    button.style.backgroundColor = '#0000FF';
    button.style.flex = '1';

    button.addEventListener("click", function () {
        Delete_The_First_Person(() => {
            chrome.runtime.sendMessage({ action: 'getNextPersonUrl' }, response => {
                if (response && response.success) {
                    const next_person_url = response.data;
                    console.log("New URL: ", next_person_url);

                    setTimeout(() => {
                        if (next_person_url === "No_Url") {
                            window.alert("Je hebt alle personen uitgenodigd topper!");
                        } else {
                            window.location = next_person_url;
                        }
                    }, 500);
                } else {
                    console.error('Failed to fetch next person URL:', response.error);
                }
            });
        });
    });

    var existingDiv = document.getElementById("invite-button-nav");
    existingDiv.appendChild(button);
}

function Create_Skip_Button() {
    const button = document.createElement("button");
    button.id = "skip-button";
    button.className = "invite-button";
    button.textContent = 'Bepaal Account';
    button.style.backgroundColor = '#808080';
    button.style.flex = '1';

    button.addEventListener("click", function () {
        showChoicePopup();
    });

    var existingDiv = document.getElementById("invite-button-nav");
    existingDiv.appendChild(button);
}

function Add_Eventlistener_To_Keys() {
    // Add an event listener to the document to listen for keydown events
    document.addEventListener("keydown", function (event) {
        // Check if the '1' key was pressed (key code 49 for '1' on the main keyboard)
        if (event.key === '3') {
            // Get the button with the class name 'invite-button'
            var button = document.querySelector("#next-button");

            // Check if the button exists
            if (button) {
                // Trigger a click event on the button
                button.click();
            }
        }
        if (event.key === '1') {
            // Get the button with the class name 'invite-button'
            var button = document.querySelector("#reload-button");

            // Check if the button exists
            if (button) {
                // Trigger a click event on the button
                button.click();
            }
        }
        if (event.ctrlKey) {
            // Function to check if the 'invite' button is gone
            function checkButtonGone() {
                var inviteButton = document.querySelector("button[aria-label='Uitnodiging verzenden']");
                inviteButton.click();
                setTimeout(function () {
                    console.log("wacht 17 sec..");
                    var inviteButton = document.querySelector("button[aria-label='Uitnodiging verzenden']");
                    console.log(inviteButton);
                    if (!inviteButton) {
                        // Button is gone, click the next button
                        var nextButton = document.querySelector("#next-button");
                        if (nextButton) {
                            nextButton.click();
                            console.log("Next button clicked!");
                        }
                    }
                }, 1700);
            }

            // Start checking if the button is gone
            checkButtonGone();
        }
    });
}

function showChoicePopup() {
    const choice = prompt("Please choose one of the following options:\n1. Ian\n2. Shanna\n3. Benthe\n4. Jessica\n5. Francys\n6. Ena", "Naam");

    if (choice) {
        let selectedChoice;
        switch (choice) {
            case 'Ian':
                selectedChoice = "ian_hoefnagels";
                break;
            case 'Shanna':
                selectedChoice = "shanna_van_herk";
                break;
            case 'Benthe':
                selectedChoice = "benthe_de_jong";
                break;
            case 'Jessica':
                selectedChoice = "jessica_visser";
                break;
            case 'Francys':
                selectedChoice = "francys_gaviria_aldas";
                break;
            case 'Ena':
                selectedChoice = "ena_rizvanovic";
                break;
            default:
                alert("Kies een van de namen");
                return;
        }
        handleChoice(selectedChoice);
    }
}

function handleChoice(choice) {
    chrome.runtime.sendMessage({ action: 'sendChoice', choice: choice }, response => {
        if (response && response.success) {
            console.log("Choice sent successfully: ", choice);
            chrome.runtime.sendMessage({ action: 'getNextPersonUrl' }, response => {
                if (response && response.success) {
                    const next_person_url = response.data;
                    console.log("New URL: ", next_person_url);

                    setTimeout(() => {
                        if (next_person_url == "No_Url") {
                            window.location = "https://www.linkedin.com";
                            window.alert("Je hebt alle personen uitgenodigd!");
                        } else {
                            window.location = next_person_url;
                        }
                    }, 500);
                } else {
                    console.error('Failed to fetch next person URL');
                }
            });
        } else {
            console.error('Failed to send choice to background.js: ', response.message);
        }
    });
}

function Create_Navigation_Div() {
    var existingDiv = document.querySelector('body');

    var buttonsDiv = document.createElement('div');
    buttonsDiv.id = "invite-button-nav";
    buttonsDiv.style.display = 'flex';
    buttonsDiv.style.justifyContent = 'space-between';
    buttonsDiv.style.height = '50px';
    buttonsDiv.style.position = 'fixed';
    buttonsDiv.style.top = '0';
    buttonsDiv.style.width = '100%';
    buttonsDiv.style.zIndex = '1000';
    buttonsDiv.style.backgroundColor = 'white';
    buttonsDiv.style.marginTop = '50px';
    document.body.insertBefore(buttonsDiv, document.body.firstChild);
}

function Add_CSS_Styles() {
    var css = `
    button {
        font-size: 25px;
    }
    .invite-button {
        background-color: blue;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    
    .invite-button:hover {
        background-color: darkblue;
        animation: hoverAnimation 0.3s ease forwards;
    }
    
    @keyframes hoverAnimation {
        0% {
            transform: scale(1);
        }
        100% {
            transform: scale(1.05);
        }
    }    
`;
    var style = document.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    document.head.appendChild(style);
}

function onPageLoad() {
    if (window.location.href.includes("linkedin")) {
        Add_CSS_Styles();
        Create_Navigation_Div();
        Create_Reload_Button();
        Create_Skip_Button();
        Create_Next_Button();
        Add_Eventlistener_To_Keys();
    }
}

window.addEventListener('load', onPageLoad);

chrome.storage.local.get(['extensionEnabled'], function (result) {
    if (result.extensionEnabled !== false) { // Default to true if not set
        if (document.readyState === "complete" || document.readyState === "interactive") {
            if (window.location.href.includes("linkedin.com/in")) {
                function Wait(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

                function getRandomInt() {
                    const min = Math.ceil(800);
                    const max = Math.floor(1200);
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                function waitForElement(selector, timeout = 5000) {
                    return new Promise((resolve, reject) => {
                        const interval = getRandomInt(); // Interval in ms to check for the element
                        let elapsed = 0; // Time elapsed

                        const timer = setInterval(() => {
                            if (document.querySelector(selector)) {
                                clearInterval(timer);
                                resolve(document.querySelector(selector));
                            } else {
                                elapsed += interval;
                                if (elapsed >= timeout) { // Timeout check
                                    clearInterval(timer);
                                    reject(new Error(`Element with selector "${selector}" not found within ${timeout} ms`));
                                }
                            }
                        }, interval);
                    });
                }

                async function Make_Invitation_Ready() {
                    await Wait(2500);
                    var bericht_verstuur_vlak = document.getElementsByClassName("ph5")[0];
                    var invite_button = bericht_verstuur_vlak.querySelectorAll('[aria-label*="Connectieverzoek verzenden"]');
                    if (invite_button.length > 0) {
                        invite_button[0].click();
                    } else {
                        console.log("Already connected");
                        return;
                    }

                    var addMessageButton = await waitForElement('[aria-label*="Opmerking toevoegen"]');
                    addMessageButton.click();
                    var message_area = await waitForElement('textarea[name="message"]');
                    message_area.style.height = "300px";
                    console.log(data);
                    message_area.value = data.connectietekst; // Replace with your desired message
                    var event = new Event('input', { bubbles: true });
                    message_area.dispatchEvent(event);
                }

                Make_Invitation_Ready();
            }
        }
    }
});
