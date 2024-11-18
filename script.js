document.addEventListener("DOMContentLoaded", () => {
    const contentDiv = document.getElementById("content");
  
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        contentDiv.innerText = "No active tab found.";
        return;
      }
  
      const currentTabId = tabs[0].id;
  
      chrome.scripting.executeScript(
        {
          target: { tabId: currentTabId, allFrames: false },
          files: ["content.js"],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error("Error injecting script:", chrome.runtime.lastError.message);
            contentDiv.innerText = `Error: ${chrome.runtime.lastError.message}`;
          } else {
            chrome.tabs.sendMessage(currentTabId, { type: "REQUEST_BODY_TEXT" }, (response) => {
              if (chrome.runtime.lastError) {
                contentDiv.innerText = `Error: ${chrome.runtime.lastError.message}`;
              } else if (response && response.text) {
                contentDiv.innerText = response.text;
              } else {
                contentDiv.innerText = "No response from content script.";
              }
            });
          }
        }
      );
    });
  });
  