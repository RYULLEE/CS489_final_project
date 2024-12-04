(function () {
  let API_KEY = '';

  // 우하단 아이콘 생성
  const iconButton = document.createElement('div');
  iconButton.id = 'philosopher-icon-button';
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
  selectTitle.innerText = 'Select Talker';

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

  const philosopherStyles = {
    1: 'You are Immanuel Kant.',
    2: 'You are Friedrich Nietzsche.',
    3: 'You are Aristotle.',
    4: 'You are Socrates.',
  };

  const philosopherNames = {
    1: 'Immanuel Kant',
    2: 'Friedrich Nietzsche',
    3: 'Aristotle',
    4: 'Socrates',
  };

  let selectedImages = [];

  // 이미지 요소 생성 및 이벤트 리스너 추가
  images.forEach((imgData, index) => {
    const philosopherContainer = document.createElement('div');
    philosopherContainer.className = 'philosopher-item';

    //이미지 요소 생성
    const imgElement = document.createElement('img');
    imgElement.src = chrome.runtime.getURL('asset/' + imgData.current);
    imgElement.alt = 'Image ' + (index + 1);
    imgElement.dataset.current = 'current';
    imgElement.dataset.index = index;

    
    // 이름 요소 생성
    const nameElement = document.createElement('span');
    nameElement.className = 'philosopher-name';
    nameElement.textContent = philosopherNames[index + 1]; // 철학자 이름 추가
    
    imgElement.addEventListener('click', () => {
      if (imgElement.dataset.current === 'current') {
        if (selectedImages.length < 2) {
          imgElement.src = chrome.runtime.getURL('asset/' + imgData.alternate);
          imgElement.dataset.current = 'alternate';
          selectedImages.push(index + 1);
        } else {
          alert('더 이상 선택할 수 없습니다. 최대 2개의 이미지를 선택할 수 있습니다.');
        }
      } else {
        imgElement.src = chrome.runtime.getURL('asset/' + imgData.current);
        imgElement.dataset.current = 'current';
        selectedImages = selectedImages.filter((i) => i !== index + 1);
      }
    });
    philosopherContainer.appendChild(imgElement);
    philosopherContainer.appendChild(nameElement);
    imageContainer.appendChild(philosopherContainer);
  });

  const modal = document.createElement('div');
  modal.id = 'philosopher-modal';

  const contentArea = document.createElement('div');
  contentArea.id = 'philosopher-content';

  const closeButton = document.createElement('button');
  closeButton.id = 'philosopher-close-button';
  // 'Done' 버튼 기능 유지 및 체크 아이콘 추가
  const checkIcon = document.createElement('img');
  checkIcon.src = chrome.runtime.getURL('asset/check_icon.png'); // 체크 아이콘 이미지 경로
  checkIcon.alt = 'Check Icon';
  closeButton.appendChild(checkIcon);

  modal.appendChild(contentArea);
  overlay.appendChild(selectTitle);
  overlay.appendChild(imageContainer);
  overlay.appendChild(closeButton);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  iconButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB_URL' }, (response) => {
      if (response && response.url) {
        console.log("response:", response);
        const currentTabUrl = response.url;
  
        if (currentTabUrl.startsWith('https://n.news.naver.com/') || currentTabUrl.startsWith('https://m.entertain.naver.com/') || currentTabUrl.startsWith('https://m.sports.naver.com/')) {
          
        
        overlay.style.display = 'flex';
        iconButton.style.display = 'none';
      }
      else throw(Error);
      } else {
        console.error("URL을 가져오지 못했습니다.");
        return alert("Go to Naver News Detail And Click Me!!");
      }
    });
  });
  

  fetch(chrome.runtime.getURL('config.json'))
    .then((response) => response.json())
    .then((data) => {
      API_KEY = data.openaiApiKey;
    })
    .catch((error) => console.error('Failed to load config.json:', error));

  async function getPhilosopherOpinion(messages) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
        }),
      });
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('철학자 의견을 가져오는 중 오류 발생:', error);
      return '응답을 가져오는 중 오류가 발생했습니다.';
    }
  }

  function displayMessage(philosopherId, message, isRightAligned) {
    const chatContainer = document.getElementById('chatting-bubble-container');

    // 메세지 전체 컨테이너
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (isRightAligned) messageDiv.classList.add('right');

    // 철학자 이미지
    const imgElement = document.createElement('img');
    imgElement.src = chrome.runtime.getURL('asset/' + images[philosopherId - 1].current);
    imgElement.alt = philosopherNames[philosopherId];
    imgElement.classList.add('philosopher-image');
    
    // 철학자 이름
    const nameElement = document.createElement('span');
    nameElement.className = 'philosopher-name';
    nameElement.textContent = philosopherNames[philosopherId]; // 이름 설정

    // 요소 조립
    const nameAndImageDiv = document.createElement('div');
    nameAndImageDiv.classList.add('name-and-image');
    nameAndImageDiv.appendChild(imgElement);
    nameAndImageDiv.appendChild(nameElement);

    // 메세지 텍스트
    const textDiv = document.createElement('div');
    textDiv.classList.add('message-text');
    textDiv.textContent = message;

    

    if (isRightAligned) {
      messageDiv.appendChild(textDiv); // 메시지 추가
      messageDiv.appendChild(nameAndImageDiv); // 이름+이미지 추가
    } else {
      messageDiv.appendChild(nameAndImageDiv); // 이름+이미지 추가
      messageDiv.appendChild(textDiv); // 메시지 추가
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function displaySkeletonMessage(philosopherId, isRightAligned) {
    const chatContainer = document.getElementById('chatting-bubble-container');
  
    // 메시지 전체 컨테이너
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (isRightAligned) messageDiv.classList.add('right');
  
    // 철학자 이미지
    const imgElement = document.createElement('img');
    imgElement.src = chrome.runtime.getURL('asset/' + images[philosopherId - 1].current);
    imgElement.alt = philosopherNames[philosopherId];
    imgElement.classList.add('philosopher-image');
  
    // 철학자 이름
    const nameElement = document.createElement('span');
    nameElement.className = 'philosopher-name';
    nameElement.textContent = philosopherNames[philosopherId];
  
    // 메시지 텍스트 자리 (스켈레톤 효과 적용)
    const textDiv = document.createElement('div');
    textDiv.classList.add('message-text', 'skeleton-box');
  
    // 철학자 이름과 이미지를 감싸는 컨테이너
    const nameAndImageDiv = document.createElement('div');
    nameAndImageDiv.classList.add('name-and-image');
    nameAndImageDiv.appendChild(imgElement);
    nameAndImageDiv.appendChild(nameElement);
  
    // 요소 조립
    if (isRightAligned) {
      messageDiv.appendChild(textDiv); // 메시지 추가
      messageDiv.appendChild(nameAndImageDiv); // 이름+이미지 추가
    } else {
      messageDiv.appendChild(nameAndImageDiv); // 이름+이미지 추가
      messageDiv.appendChild(textDiv); // 메시지 추가
    }
  
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  
    return textDiv; // 나중에 스켈레톤을 실제 메시지로 대체하기 위해 반환
  }
  
  
  
async function chat(phil_Ids, text) {
  let turn = 0;
  const conversationHistory = [{ role: 'user', content: text }];

  const conversation = async () => {
    const currentPhilosopher = phil_Ids[turn % phil_Ids.length];
    const isRightAligned = phil_Ids.length > 1 && turn % phil_Ids.length === 1;

    // 스켈레톤 메시지 표시
    const skeletonTextDiv = displaySkeletonMessage(currentPhilosopher, isRightAligned);

    const systemPrompt = `${philosopherStyles[currentPhilosopher]} Limit your response to two sentences in Korean. Do not include any Korean. Continue the conversation based on the previous messages. Do not question.`;
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
    ];

    const opinion = await getPhilosopherOpinion(messages);

    // 스켈레톤 텍스트를 실제 메시지로 대체
    skeletonTextDiv.classList.remove('skeleton-box');
    skeletonTextDiv.textContent = opinion;

    conversationHistory.push({ role: 'assistant', content: opinion });
    turn++;
    setTimeout(conversation, 2000); // 2초마다 대화 진행
  };

  conversation();
}


  closeButton.addEventListener('click', () => {
    overlay.style.display = 'none';
  
    if (selectedImages.length > 0) {
      const chatContainer = document.createElement('div');
      chatContainer.id = 'chatting-bubble-container';
      document.body.appendChild(chatContainer);
  
      // Background Script에 URL 요청
      chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB_URL' }, (response) => {
        const currentTabUrl = response.url;
  
        if (currentTabUrl) {
          let articleText = '';
          let targetSelector = '';
          console.log("currentTabUrl : ", currentTabUrl);
  
          // 도메인별로 targetSelector 설정
          if (currentTabUrl.startsWith('https://n.news.naver.com/')) {
            targetSelector = '#newsct_article';
          } else if (currentTabUrl.startsWith('https://m.entertain.naver.com/')) {
            targetSelector = '#comp_news_article';
          } else if (currentTabUrl.startsWith('https://m.sports.naver.com/')) {
            targetSelector = '#comp_news_article';
          }
  
          if (targetSelector) {
            const targetDiv = document.querySelector(targetSelector);
            console.log("check : ", currentTabUrl.startsWith('https://m.sports.naver.com/'));
            console.log("articleText : ", targetDiv.innerText);
            if (targetDiv) {
              articleText = targetDiv.innerText || '';

            }
          }
  
          // 채팅 시작
          chat(selectedImages, articleText);
        } else {
          console.error('현재 탭 URL을 가져올 수 없습니다.');
        }
      });
    }
  });
  
})();


(async function () {
  let API_KEY = '';

  // 나무 컨테이너 추가
  const treeContainer = document.createElement("div");
  treeContainer.id = "tree-container";

  // 나무 이미지 추가
  const treeImage = document.createElement("img");
  treeImage.id = "tree-image";
  treeImage.src = chrome.runtime.getURL("asset/tree_healthy.png"); // 초기 이미지 경로
  treeImage.alt = "Tree Status";

  // 나무 퍼센티지 텍스트 추가
  const treePercentage = document.createElement("div");
  treePercentage.id = "tree-percentage";
  treePercentage.textContent = "Usage: 0%"; // 초기값

  // 나무 컨테이너에 이미지와 퍼센티지 추가
  treeContainer.appendChild(treeImage);
  treeContainer.appendChild(treePercentage);

  // 나무 컨테이너를 body에 추가
  document.body.appendChild(treeContainer);

  // 나무 이미지를 업데이트하는 함수
  function updateTreeBurnStage(usagePercentage) {
    treePercentage.textContent = `Usage: ${usagePercentage}%`;

    if (usagePercentage < 25) {
      treeImage.src = chrome.runtime.getURL("asset/tree_healthy.png");
    } else if (usagePercentage < 50) {
      treeImage.src = chrome.runtime.getURL("asset/tree_slight_burn.png");
    } else if (usagePercentage < 75) {
      treeImage.src = chrome.runtime.getURL("asset/tree_moderate_burn.png");
    } else {
      treeImage.src = chrome.runtime.getURL("asset/tree_burned.png");
    }
  }

  // 사용량 퍼센트 계산 함수
  function calculateUsagePercentage(totalUsage) {
    const maxUsage = 1000000; // 최대 사용량 (예: 100만 토큰)
    const percentage = (totalUsage / maxUsage) * 100;
    return Math.min(100, Math.max(0, percentage));
  }

  // GPT 사용량 가져오는 함수
  async function fetchGPTUsage() {
    try {
      const response = await fetch('https://api.openai.com/v1/usage', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.total_usage) {
        const usagePercentage = calculateUsagePercentage(data.total_usage);
        updateTreeBurnStage(usagePercentage);
      } else {
        console.warn('No total_usage found in response.');
        updateTreeBurnStage(0); // 기본값으로 초기화
      }
    } catch (error) {
      console.error('Failed to fetch GPT usage:', error);
      updateTreeBurnStage(0); // 기본값으로 초기화
    }
  }

  // config.json에서 API_KEY 가져오기
  try {
    const configResponse = await fetch(chrome.runtime.getURL('config.json'));
    const configData = await configResponse.json();
    API_KEY = configData.openaiApiKey;

    // 5초마다 GPT 사용량 업데이트
    setInterval(fetchGPTUsage, 5000);
  } catch (error) {
    console.error('Failed to load API_KEY from config.json:', error);
  }
})();
