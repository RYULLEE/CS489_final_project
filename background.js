// 현재 활성 탭의 URL을 반환하는 메시지 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_CURRENT_TAB_URL') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          sendResponse({ url: tabs[0].url });
        } else {
          sendResponse({ url: null });
        }
      });
      return true; // 비동기 응답을 활성화
    }
  });
  