chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "REQUEST_BODY_TEXT") {
    // 특정 div 선택
    const targetDiv = document.querySelector("#newsct_article");
    
    if (targetDiv) {
      // div 안에 있는 모든 텍스트 가져오기
      const articleText = targetDiv.innerText;
      sendResponse({ text: articleText });
    } else {
      sendResponse({ text: "Target div not found." });
    }
  }
  return true; // 비동기 응답 허용
});
