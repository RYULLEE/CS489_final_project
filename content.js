chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "REQUEST_BODY_TEXT") {
    if (document.body) {
      sendResponse({ text: document.body.innerText });
    } else {
      sendResponse({ text: "No body content available" });
    }
  }
  return true; // 비동기 응답을 허용
});
