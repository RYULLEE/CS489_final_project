// 즉시 실행 함수로 전역 변수 충돌 방지
(function () {
  // 우하단 아이콘 생성
  const iconButton = document.createElement('div');
  iconButton.id = 'philosopher-icon-button';
  // iconButton.innerText = '🔮'; // 아이콘 이모지 (원하는 이미지로 변경 가능)
  iconButton.innerHTML = '<img src="' + chrome.runtime.getURL('asset/initial.png') + '" alt="Icon" />';

  document.body.appendChild(iconButton);

  // 오버레이 생성
  const overlay = document.createElement('div');
  overlay.id = 'philosopher-overlay';
  overlay.style.display = 'none';

  // 모달 창 생성
  const modal = document.createElement('div');
  modal.id = 'philosopher-modal';

  // 내용 표시 영역 생성
  const contentArea = document.createElement('div');
  contentArea.id = 'philosopher-content';

  // 종료 버튼 생성
  const closeButton = document.createElement('button');
  closeButton.id = 'philosopher-close-button';
  closeButton.innerText = '닫기';

  // 요소 연결
  modal.appendChild(closeButton);
  modal.appendChild(contentArea);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // 이벤트 리스너 설정
  iconButton.addEventListener('click', () => {
    // 특정 요소에서 내용 가져오기
    const targetDiv = document.getElementById('newsct_article');
    if (targetDiv) {
      const article = targetDiv.querySelector('article');
      if (article) {
        // 가져온 내용 복사
        const articleContent = article.cloneNode(true);

        // 이미지 태그 제거
        const images = articleContent.querySelectorAll('img');
        images.forEach((img) => img.remove());

        // 가져온 내용을 모달에 표시
        contentArea.innerHTML = '';
        contentArea.appendChild(articleContent);
      } else {
        contentArea.innerText = '기사 내용을 찾을 수 없습니다.';
      }
    } else {
      contentArea.innerText = '대상 요소를 찾을 수 없습니다.';
    }
    overlay.style.display = 'flex';
  });

  closeButton.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
})();
