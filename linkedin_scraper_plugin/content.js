chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { avatureId, numPersons, skipPersons, currentIndex } = request;
  executeScrapePerson(avatureId, skipPersons, currentIndex);
});

// async function reloadThePage() {
//   // Manipulate DOM in the web page
//   document.getElementsByClassName("active ember-view pagination-header__nav-link")[0].click();
//   await sleep(1000);

//   // The content script cannot directly access chrome.runtime, so it will pass a message
//   // to the background script to reload the tab
//   chrome.runtime.sendMessage({ action: "reloadTab" });

//   await sleep(5000); // Wait for the tab to reload
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
