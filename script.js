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

  document.addEventListener("DOMContentLoaded", () => {
    const mainScreen = document.getElementById("main-screen");
    const dimmedScreen = document.getElementById("dimmed-screen");
    const openDimmedButton = document.getElementById("open-dimmed");
    const closeDimmedButton = document.getElementById("close-dimmed");
  
    // Dimmed 화면 열기
    openDimmedButton.addEventListener("click", () => {
      mainScreen.classList.add("hidden"); // 초기 화면 숨기기
      dimmedScreen.classList.remove("hidden"); // Dimmed 화면 표시
    });
  
    // Dimmed 화면 닫기
    closeDimmedButton.addEventListener("click", () => {
      dimmedScreen.classList.add("hidden"); // Dimmed 화면 숨기기
      mainScreen.classList.remove("hidden"); // 초기 화면 다시 표시
    });
  });
  