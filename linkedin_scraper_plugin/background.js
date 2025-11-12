let avatureId, numPersons, skipPersons, currentIndex;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startScraping') {
    ({ avatureId, numPersons, skipPersons } = request);
    currentIndex = 0;
    startScraping();
  }
  if (request.action === "reloadTab") {
    // Reload the current active tab
    console.log("het werkt haha")
    chrome.tabs.reload(sender.tab.id);
  }
});

async function startScraping() {
  // const tabs = await getActiveTab();
  while (currentIndex < numPersons) {
    if (currentIndex % 30 === 0 && currentIndex !== 0) {
      // document.getElementsByClassName("active ember-view pagination-header__nav-link")[0].click()
      // await sleep(1000)
      // chrome.tabs.reload();
      await sleep(5000); // Wait for the page to reload
      // document.querySelector("[data-test-row-lockup-full-name]").firstElementChild.firstElementChild.click();
      // await sleep(1000);
      //   const tabs = await getActiveTab(); // Assuming you have this function to get the active tab

      //   // Execute a self-contained function
      //   await chrome.scripting.executeScript({
      //     target: { tabId: tabs[0].id },
      //     func: async function () {
      //       // This function is injected into the content script context

      //       // Simulate a sleep function (because the real function may not be available in the content script)
      //       function sleep(ms) {
      //         return new Promise(resolve => setTimeout(resolve, ms));
      //       }

      //       // Perform DOM manipulations
      //       const paginationLink = document.getElementsByClassName("active ember-view pagination-header__nav-link")[0];
      //       if (paginationLink) {
      //         paginationLink.click();
      //       }

      //       await sleep(1000); // Wait for 1 second

      //       // Send message to the background script to reload the tab
      //       chrome.runtime.sendMessage({ action: "reloadTab" });

      //       await sleep(15000); // Wait for the page to reload

      //       // Click the next element
      //       const fullNameElement = document.querySelector("[data-test-row-lockup-full-name]");

      //       if (fullNameElement && fullNameElement.firstElementChild && fullNameElement.firstElementChild.firstElementChild) {
      //         fullNameElement.firstElementChild.firstElementChild.click();
      //       }

      //       await sleep(1000); // Wait for 1 second
      //     },
      //   });
    }

    const tabs = await getActiveTab();
    await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: executeScrapePerson,
      args: [avatureId, skipPersons, currentIndex]
    });

    await sleep(randomSeconds());
    currentIndex++;
  }
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomSeconds() {
  return Math.floor(Math.random() * 1000) + 2000;
}

function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        reject("No active tab found");
      } else {
        resolve(tabs);
      }
    });
  });
}

// async function reloadThePage(){
//   document.getElementsByClassName("active ember-view pagination-header__nav-link")[0].click()
//   await sleep(1000)
//   chrome.runtime.sendMessage({ action: "reloadTab" });
//   // chrome.tabs.reload();
//   await sleep(5000);
//   document.querySelector("[data-test-row-lockup-full-name]").firstElementChild.firstElementChild.click();
//   await sleep(1000);
// }

async function executeScrapePerson(avatureId, skipPersons, currentIndex) {
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const randomSeconds = () => Math.floor(Math.random() * 1000) + 2000;

  async function scrapePerson() {
    const showMoreButton = document.getElementById('line-clamp-show-more-button');
    if (showMoreButton) {
      showMoreButton.click();
      await sleep(randomSeconds());
    }

    for (let y = 0; y < 5; y++) {
      const buttons = document.querySelectorAll('[data-test-expand-more-lower-button]');
      await sleep(randomSeconds());
      for (const button of buttons) {
        button.click();
      }
    }

    const profileId = window.location.href.split('/profile/')[1].split('?')[0];
    const element = document.querySelector('.profile__container');
    const htmlContent = element.innerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${avatureId}_${profileId}.html`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);

    console.log(`Scraped person index: ${currentIndex}`);
  }

  function clickNextProfile() {
    const nextProfile = document.querySelector('a.skyline-pagination-link--active[rel="next"]');
    if (nextProfile) {
      nextProfile.click();
      return true;
    }
    return false;
  }

  function clickSaveToPipeline() {
    const profileContainer = document.querySelector('.profile__container');
    if (!profileContainer) return false;

    const saveButtonToProject = profileContainer.querySelector('.save-to-pipeline__button');
    if (saveButtonToProject) {
      saveButtonToProject.click();
      return true;
    }
    return false;
  }

  await sleep(randomSeconds());
  const saveClicked = clickSaveToPipeline();

  if (saveClicked || !skipPersons) {
    await sleep(randomSeconds());
    await scrapePerson();
  }

  await sleep(randomSeconds());
  const nextClicked = clickNextProfile();

  if (!nextClicked) {
    console.error("Next profile button not found.");
  }
}
