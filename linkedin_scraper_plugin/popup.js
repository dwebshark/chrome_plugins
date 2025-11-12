document.getElementById('startButton').addEventListener('click', () => {
    const avatureId = document.getElementById('avatureId').value;
    const numPersons = parseInt(document.getElementById('numPersons').value, 10);
    const skipPersons = document.getElementById('skipPersons').checked;
  
    chrome.runtime.sendMessage({
      action: 'startScraping',
      avatureId,
      numPersons,
      skipPersons
    });
  });
  