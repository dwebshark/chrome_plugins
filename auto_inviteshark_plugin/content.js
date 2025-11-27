var data = "";
var next_person_url = "";

/* -----------------------------
   VARIABLE WAIT FUNCTION
------------------------------*/
function variableWait(min, extra = 600) {
    // extra = maximale random extra wachttijd
    const randomExtra = Math.floor(Math.random() * extra);
    return new Promise(resolve => setTimeout(resolve, min + randomExtra));
}

/* -----------------------------
   DATA FUNCTIONS
------------------------------*/

function Reload_The_Data() {
    var url_to_be_sent = "http://sourcingselector.nl/fetchData/";
    chrome.runtime.sendMessage({ action: 'fetchData', url_to_be_sent: url_to_be_sent }, response => {
        if (response && response.success) {
            Recieve_The_Data(async () => {
                if (data && data.openbare_url) {
                    await variableWait(500); // min 500 ms
                    console.log("Data ready for redirection");
                    console.log(data);
                    window.location = data.openbare_url;
                }
            });
        } else {
            console.error('Failed to fetch data:', response.error);
        }
    });
}

function printData() {
    Recieve_The_Data((data) => {
        console.log('Fetched Data:', data);
    });
}

window.addEventListener('load', printData);

function Recieve_The_Data(callback) {
    chrome.runtime.sendMessage({ action: 'getStoredData' }, response => {
        if (response && response.success) {
            data = response.data;
            if (callback) callback();
        } else {
            const errorMessage = response && response.message ? response.message : 'Unknown error occurred';
            console.error('Failed to fetch stored data from background.js: ', errorMessage);
        }
    });
}

function Delete_The_First_Person(callback) {
    chrome.runtime.sendMessage({ action: 'Delete_The_First_Person' }, response => {
        if (callback) callback(response);
    });
}

/* -----------------------------
   BUTTON CREATION
------------------------------*/

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

    document.getElementById("invite-button-nav").appendChild(button);
}

function Create_Next_Button() {
    const button = document.createElement("button");
    button.id = "next-button";
    button.className = "invite-button";
    button.textContent = 'Uitgenodigd';
    button.style.backgroundColor = '#0000FF';
    button.style.flex = '1';

    button.addEventListener("click", function () {
        Delete_The_First_Person(async () => {
            chrome.runtime.sendMessage({ action: 'getNextPersonUrl' }, async response => {
                if (response && response.success) {
                    const next_person_url = response.data;
                    console.log("New URL: ", next_person_url);

                    await variableWait(500); // min 500 ms

                    if (next_person_url === "No_Url") {
                        window.alert("Je hebt alle personen uitgenodigd topper!");
                    } else {
                        window.location = next_person_url;
                    }
                } else {
                    console.error('Failed to fetch next person URL:', response.error);
                }
            });
        });
    });

    document.getElementById("invite-button-nav").appendChild(button);
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

    document.getElementById("invite-button-nav").appendChild(button);
}

/* -----------------------------
   KEYBOARD SHORTCUTS
------------------------------*/

function Add_Eventlistener_To_Keys() {
    document.addEventListener("keydown", function (event) {

        if (event.key === '3') {
            var button = document.querySelector("#next-button");
            if (button) button.click();
        }

        if (event.key === '1') {
            var button = document.querySelector("#reload-button");
            if (button) button.click();
        }

        if (event.ctrlKey) {

            async function checkButtonGone() {
                var inviteButton = document.querySelector("button[aria-label='Uitnodiging verzenden']");
                if (inviteButton) inviteButton.click();

                await variableWait(1700); // min 1700 ms

                inviteButton = document.querySelector("button[aria-label='Uitnodiging verzenden']");
                if (!inviteButton) {
                    var nextButton = document.querySelector("#next-button");
                    if (nextButton) nextButton.click();
                }
            }

            checkButtonGone();
        }
    });
}

/* -----------------------------
   ACCOUNT CHOICE POPUP
------------------------------*/

function showChoicePopup() {
    const choice = prompt(
        "Please choose one of the following options:\n1. Ian\n2. Shanna\n3. Benthe\n4. Jessica\n5. Francys\n6. Ena",
        "Naam"
    );

    if (!choice) return;

    let selectedChoice;
    switch (choice) {
        case 'Ian':
            selectedChoice = "ian_hoefnagels"; break;
        case 'Shanna':
            selectedChoice = "shanna_van_herk"; break;
        case 'Benthe':
            selectedChoice = "benthe_de_jong"; break;
        case 'Jessica':
            selectedChoice = "jessica_visser"; break;
        case 'Francys':
            selectedChoice = "francys_gaviria_aldas"; break;
        case 'Ena':
            selectedChoice = "ena_rizvanovic"; break;
        default:
            alert("Kies een van de namen");
            return;
    }

    handleChoice(selectedChoice);
}

function handleChoice(choice) {
    chrome.runtime.sendMessage({ action: 'sendChoice', choice: choice }, response => {
        if (response && response.success) {
            chrome.runtime.sendMessage({ action: 'getNextPersonUrl' }, async response => {
                if (response && response.success) {
                    const next_person_url = response.data;

                    await variableWait(500); // min 500 ms

                    if (next_person_url == "No_Url") {
                        window.location = "https://www.linkedin.com";
                        window.alert("Je hebt alle personen uitgenodigd!");
                    } else {
                        window.location = next_person_url;
                    }
                } else {
                    console.error('Failed to fetch next person URL');
                }
            });
        } else {
            console.error('Failed to send choice: ', response.message);
        }
    });
}

/* -----------------------------
   NAVIGATION DIV & CSS
------------------------------*/

function Create_Navigation_Div() {
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
    button { font-size: 25px; }
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
        0% { transform: scale(1); }
        100% { transform: scale(1.05); }
    }
    `;
    var style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}

/* -----------------------------
   PAGE LOAD
------------------------------*/

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

/* -----------------------------
   AUTO-INVITE LOGIC
------------------------------*/

chrome.storage.local.get(['extensionEnabled'], function (result) {
    if (result.extensionEnabled !== false) {

        if (document.readyState === "complete" || document.readyState === "interactive") {

            if (window.location.href.includes("linkedin.com/in")) {

                function getRandomInt() {
                    return Math.floor(Math.random() * (1200 - 800 + 1)) + 800;
                }

                function waitForElement(selector, timeout = 5000) {
                    return new Promise((resolve, reject) => {
                        const interval = getRandomInt();
                        let elapsed = 0;

                        const timer = setInterval(() => {
                            if (document.querySelector(selector)) {
                                clearInterval(timer);
                                resolve(document.querySelector(selector));
                            } else {
                                elapsed += interval;
                                if (elapsed >= timeout) {
                                    clearInterval(timer);
                                    reject(new Error(`Element not found: ${selector}`));
                                }
                            }
                        }, interval);
                    });
                }

                async function Make_Invitation_Ready() {
                    await variableWait(2500); // min 2500 ms

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
                    message_area.value = data.connectietekst;
                    message_area.dispatchEvent(new Event('input', { bubbles: true }));

                    var inviteButton = await waitForElement("button[aria-label='Uitnodiging verzenden']");
                    inviteButton.click();

                    await variableWait(1700); // min 1700 ms

                    var stillVisible = document.querySelector("button[aria-label='Uitnodiging verzenden']");
                    if (!stillVisible) {
                        const nextButton = document.querySelector("#next-button");
                        if (nextButton) nextButton.click();
                    }
                }

                Make_Invitation_Ready();
            }
        }
    }
});
