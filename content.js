(function () {

  let API_KEY = '';
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

  // 내용 표시 영역 생성 (필요 없다면 제거 가능)
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
    overlay.style.display = 'flex';
    iconButton.style.display = 'none';
  });

  fetch(chrome.runtime.getURL('config.json'))
  .then((response) => response.json())
  .then((data) => {
    API_KEY = data.openaiApiKey;
    console.log('API Key:', API_KEY);
  })
  .catch((error) => console.error('Failed to load config.json:', error));

  // 철학자의 의견을 가져오는 함수
  async function getPhilosopherOpinion(philosopherId, text) {
    const philosopherStyles = {
      0: 'You are Immanuel Kant. Respond to the user\'s query as Kant would.',
      1: 'You are Friedrich Nietzsche. Respond to the user\'s query as Nietzsche would.',
      2: 'You are Aristotle. Respond to the user\'s query as Aristotle would.',
      3: 'You are Socrates. Respond to the user\'s query as Socrates would.',
    };

    const prompt = `${philosopherStyles[philosopherId]}\n\n${text}`;
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content.trim().slice(0,150);
      } else {
        console.error('응답 데이터 형식이 올바르지 않습니다.', data);
        return '응답을 가져오는 중 오류가 발생했습니다.';
      }
    } catch (error) {
      console.error('철학자 의견을 가져오는 중 오류 발생:', error);
      return '응답을 가져오는 중 오류가 발생했습니다.';
    }
  }

  // UI에 메시지를 표시하는 함수
function displayMessage(philosopherId, isRightAligned) {
  const chatContainer = document.getElementById('chatting-bubble-container');

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');

  if (isRightAligned) {
    messageDiv.classList.add('right');
  }

  // 철학자 이미지 추가
  const imgElement = document.createElement('img');
  imgElement.src = chrome.runtime.getURL('asset/' + images[philosopherId].current);
  imgElement.alt = 'Philosopher ' + (philosopherId + 1);
  imgElement.classList.add('philosopher-image');

  // 스켈레톤 메시지 내용 추가
  const skeletonText = document.createElement('div');
  skeletonText.classList.add('message-text', 'skeleton');

  // 메시지 요소 조립
  if (isRightAligned) {
    messageDiv.appendChild(skeletonText);
    messageDiv.appendChild(imgElement);
  } else {
    messageDiv.appendChild(imgElement);
    messageDiv.appendChild(skeletonText);
  }

  chatContainer.appendChild(messageDiv);

  // 자동 스크롤
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // 메시지를 반환하여 이후에 업데이트할 수 있도록 합니다.
  return { messageDiv, skeletonText };
}

// 메인 채팅 함수
async function chat(phil_Ids, text) {
  let turn = 0;
  let stopConversation = false;

  const conversation = async () => {
    if (stopConversation) {
      console.log("대화가 중지되었습니다.");
      return;
    }

    const currentPhilosopher = phil_Ids[turn % phil_Ids.length];
    const isRightAligned = phil_Ids.length > 1 && (turn % phil_Ids.length) === 1;

    // 스켈레톤 메시지를 먼저 표시
    const { messageDiv, skeletonText } = displayMessage(currentPhilosopher, isRightAligned);

    // 실제 메시지 가져오기
    const opinion = await getPhilosopherOpinion(currentPhilosopher, text);

    // 스켈레톤을 실제 메시지로 대체
    skeletonText.classList.remove('skeleton');
    skeletonText.textContent = opinion;

    // 필요한 경우 메시지 버블의 스타일을 업데이트
    // messageDiv.classList.add('loaded'); // 필요하다면 클래스 추가

    turn++;
    setTimeout(conversation, 2000); // 2초마다 대화 진행
  };

  conversation();
}

  // 'Done' 버튼 클릭 이벤트 수정
  closeButton.addEventListener('click', () => {
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

      selectedImages.forEach((index) => {
        const imgElement = document.createElement('img');
        imgElement.src = chrome.runtime.getURL('asset/' + images[index].current);
        imgElement.alt = 'Selected Image ' + (index + 1);
        selectedImagesContainer.appendChild(imgElement);
      });

      document.body.appendChild(selectedImagesContainer);

      // 채팅 버블 컨테이너 생성
      const chattingBubbleContainer = document.createElement('div');
      chattingBubbleContainer.id = 'chatting-bubble-container';

      document.body.appendChild(chattingBubbleContainer);
      
      chattingBubbleContainer.addEventListener('wheel', function (e) {
        const delta = e.deltaY;
        const atTop = chattingBubbleContainer.scrollTop === 0;
        const atBottom = chattingBubbleContainer.scrollHeight - chattingBubbleContainer.clientHeight === chattingBubbleContainer.scrollTop;
  
        if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
          // 스크롤이 맨 위나 맨 아래에 도달한 경우
          e.preventDefault();
          e.stopPropagation();
        }
      }, { passive: false });
  

      // 기사 내용 가져오기
      let articleText = '';
      const targetDiv = document.getElementById('newsct_article');
      if (targetDiv) {
        const article = targetDiv.querySelector('article');
        if (article) {
          articleText = article.innerText;
        }
      }

      // 채팅 시작
      chat(selectedImages, articleText);
    } else {
      // 선택된 철학자가 없을 경우 초기 상태로 돌아가기
      iconButton.style.display = 'flex';
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
