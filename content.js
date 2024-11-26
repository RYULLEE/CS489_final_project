(function () {
  // 우하단 아이콘 생성
  const iconButton = document.createElement('div');
  iconButton.id = 'philosopher-icon-button';

  // 이미지 아이콘 생성
  iconButton.innerHTML =
    '<img src="' + chrome.runtime.getURL('asset/initial.png') + '" alt="Icon" />';
  document.body.appendChild(iconButton);

  // 오버레이 생성
  const overlay = document.createElement('div');
  overlay.id = 'philosopher-overlay';
  overlay.style.display = 'none';

  // 선택 제목 생성
  const selectTitle = document.createElement('div');
  selectTitle.id = 'philosopher-select-title-container';
  selectTitle.innerText = 'Select philosopher !';

  // 이미지 컨테이너 생성
  const imageContainer = document.createElement('div');
  imageContainer.id = 'philosopher-image-container';

  // 이미지 파일 배열
  const images = [
    { current: 'ph1.png', alternate: 'ph1_check.png' },
    { current: 'ph2.png', alternate: 'ph2_check.png' },
    { current: 'ph3.png', alternate: 'ph3_check.png' },
    { current: 'ph4.png', alternate: 'ph4_check.png' },
  ];

  // 선택된 이미지 인덱스를 저장할 배열
  let selectedImages = [];

  // 이미지 요소 생성 및 이벤트 리스너 추가
  images.forEach((imgData, index) => {
    const imgElement = document.createElement('img');
    imgElement.src = chrome.runtime.getURL('asset/' + imgData.current);
    imgElement.alt = 'Image ' + (index + 1);
    imgElement.dataset.current = 'current'; // 현재 이미지 상태를 저장
    imgElement.dataset.index = index; // 이미지 인덱스 저장

    // 이미지 클릭 이벤트 리스너
    imgElement.addEventListener('click', () => {
      if (imgElement.dataset.current === 'current') {
        if (selectedImages.length < 2) {
          imgElement.src = chrome.runtime.getURL('asset/' + imgData.alternate);
          imgElement.dataset.current = 'alternate';
          selectedImages.push(index);
        } else {
          alert('더 이상 선택할 수 없습니다. 최대 2개의 이미지를 선택할 수 있습니다.');
        }
      } else {
        imgElement.src = chrome.runtime.getURL('asset/' + imgData.current);
        imgElement.dataset.current = 'current';
        // 선택된 이미지에서 제거
        selectedImages = selectedImages.filter((i) => i !== index);
      }
    });

    imageContainer.appendChild(imgElement);
  });

  // 모달 창 생성
  const modal = document.createElement('div');
  modal.id = 'philosopher-modal';

  // 내용 표시 영역 생성
  const contentArea = document.createElement('div');
  contentArea.id = 'philosopher-content';

  // 종료 버튼 생성
  const closeButton = document.createElement('button');
  closeButton.id = 'philosopher-close-button';
  closeButton.innerText = 'Done';

  // 요소 연결
  modal.appendChild(contentArea);
  overlay.appendChild(selectTitle);
  overlay.appendChild(imageContainer);
  overlay.appendChild(closeButton);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // 이벤트 리스너 설정
  iconButton.addEventListener('click', () => {
    // 특정 요소에서 내용 가져오기 (생략 가능)
    overlay.style.display = 'flex';
    iconButton.style.display = 'none';
  });

  closeButton.addEventListener('click', () => {
    iconButton.style.display = 'flex';
    overlay.style.display = 'none';

    // 이전에 추가된 선택된 이미지 컨테이너 제거
    const existingContainer = document.getElementById('selected-images-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // 선택된 이미지가 있을 경우 우측 하단에 표시
    if (selectedImages.length > 0) {
      iconButton.style.display = 'none';
      const selectedImagesContainer = document.createElement('div');
      selectedImagesContainer.id = 'selected-images-container';
      selectedImagesContainer.style.position = 'fixed';
      selectedImagesContainer.style.bottom = '20px';
      selectedImagesContainer.style.right = '20px';
      selectedImagesContainer.style.zIndex = '10000';
      selectedImagesContainer.style.display = 'flex';

      selectedImages.forEach((index) => {
        const imgElement = document.createElement('img');
        imgElement.src = chrome.runtime.getURL('asset/' + images[index].current);
        imgElement.alt = 'Selected Image ' + (index + 1);
        imgElement.style.width = '120px';
        imgElement.style.height = '120px';
        imgElement.style.marginLeft = '148px';
        imgElement.style.borderRadius = '10000px';
        selectedImagesContainer.appendChild(imgElement);
      });

      const chattingBubbleContatiner = document.createElement('div');
      chattingBubbleContatiner.id = 'chatting-bubble-contatiner';
      
      document.body.appendChild(chattingBubbleContatiner);
      document.body.appendChild(selectedImagesContainer);
    }

    // 선택된 이미지 및 상태 초기화
    selectedImages = [];
    images.forEach((imgData, index) => {
      const imgElement = imageContainer.children[index];
      imgElement.src = chrome.runtime.getURL('asset/' + imgData.current);
      imgElement.dataset.current = 'current';
    });
  });
})();
