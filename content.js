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
    1: 'From now on, please adopt the voice, tone, and reasoning style of the philosopher Immanuel Kant. Use formal, structured language and demonstrate careful reasoning grounded in moral philosophy and epistemology. When discussing any topic, consider the moral law, the categorical imperative, duty, and the proper use of reason. Refer to human understanding and experience within the limits of reason, and emphasize rational thought over emotion. Avoid modern slang and maintain the scholarly style and contemplative tone characteristic of Kant’s philosophical writings.',
    2: 'From now on, please adopt the voice, style, and perspective of the philosopher Friedrich Nietzsche. Use passionate, provocative language, and challenge conventional morality, religion, and societal norms. Speak in a reflective yet confrontational tone, filled with vivid metaphors and incisive critiques. Emphasize the concepts of the will to power, the reevaluation of values, individual strength, and the contrast between the noble spirit and the herd mentality. Avoid modern slang, but use language that is evocative, poetic, and incisive, as Nietzsche often did.',
    3: 'From now on, please adopt the voice, style, and philosophical perspective of Aristotle. Use a measured, systematic, and methodical approach to reasoning, focusing on logic, ethics, and natural philosophy. When discussing a topic, consider the four causes, the nature of virtue, and the balance between excess and deficiency. Employ a scholarly yet accessible tone, using careful definitions and categorical distinctions. Avoid modern slang and maintain the contemplative, structured style that reflects Aristotle’s analytical method.',
    4: 'From now on, please adopt the voice, style, and approach of the philosopher Socrates. Engage in dialogue by asking probing questions and guiding others to examine their beliefs. Employ the Socratic method—using thoughtful inquiry, careful reasoning, and gentle challenge to assumptions. Present arguments in a measured, conversational tone, refrain from modern slang, and continually seek definitions and clarity. Maintain an attitude of intellectual humility, always open to further questioning and refinement of ideas.',
  };

  const philosopherNames = {
    1: 'Immanuel Kant',
    2: 'Friedrich Nietzsche',
    3: 'Aristotle',
    4: 'Socrates',
  };

  let selectedImages = [];
  let trees = [];
  let currentTreeIndex = 0;
  let messageCount = 0; 
  const incrementPerMessage = 6; // 메시지 1개당 증가량 (~6%)

  // 이미지 요소 생성 및 이벤트 리스너 추가
  images.forEach((imgData, index) => {
    const philosopherContainer = document.createElement('div');
    philosopherContainer.className = 'philosopher-item';

    const imgElement = document.createElement('img');
    imgElement.src = chrome.runtime.getURL('asset/' + imgData.current);
    imgElement.alt = 'Image ' + (index + 1);
    imgElement.dataset.current = 'current';
    imgElement.dataset.index = index;

    const nameElement = document.createElement('span');
    nameElement.className = 'philosopher-name';
    nameElement.textContent = philosopherNames[index + 1];

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

  const checkIcon = document.createElement('img');
  checkIcon.src = chrome.runtime.getURL('asset/check_icon.png');
  checkIcon.alt = 'Check Icon';
  closeButton.appendChild(checkIcon);

  modal.appendChild(contentArea);
  overlay.appendChild(selectTitle);
  overlay.appendChild(imageContainer);
  overlay.appendChild(closeButton);
  // overlay.appendChild(modal);
  document.body.appendChild(overlay);

  iconButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB_URL' }, (response) => {
      if (response && response.url) {
        const currentTabUrl = response.url;

        if (
          currentTabUrl.startsWith('https://n.news.naver.com/') ||
          currentTabUrl.startsWith('https://m.entertain.naver.com/') ||
          currentTabUrl.startsWith('https://m.sports.naver.com/')
        ) {
          overlay.style.display = 'flex';
          iconButton.style.display = 'none';
        } else {
          console.error('지정된 URL이 아닙니다.');
          alert('Go to Naver News Detail And Click Me!!');
        }
      } else {
        console.error('URL을 가져오지 못했습니다.');
        alert('Go to Naver News Detail And Click Me!!');
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
          model: 'gpt-4o-mini', // 유효한 모델명 사용
          messages: messages,
          temperature: 1.0
        }),
      });
      const data = await response.json();

      if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      } else {
        console.warn('No valid response from API:', data);
        return '응답을 가져올 수 없습니다.';
      }
    } catch (error) {
      console.error('철학자 의견을 가져오는 중 오류 발생:', error);
      return '응답을 가져오는 중 오류가 발생했습니다.';
    }
  }

  function displaySkeletonMessage(philosopherId, isRightAligned) {
    const chatContainer = document.getElementById('chatting-bubble-container');

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (isRightAligned) messageDiv.classList.add('right');

    const imgElement = document.createElement('img');
    imgElement.src = chrome.runtime.getURL('asset/' + images[philosopherId - 1].current);
    imgElement.alt = philosopherNames[philosopherId];
    imgElement.classList.add('philosopher-image');

    const nameElement = document.createElement('span');
    nameElement.className = 'philosopher-name';
    nameElement.textContent = philosopherNames[philosopherId];

    const textDiv = document.createElement('div');
    textDiv.classList.add('message-text', 'skeleton-box');

    const nameAndImageDiv = document.createElement('div');
    nameAndImageDiv.classList.add('name-and-image');
    nameAndImageDiv.appendChild(imgElement);
    nameAndImageDiv.appendChild(nameElement);

    if (isRightAligned) {
      messageDiv.appendChild(textDiv);
      messageDiv.appendChild(nameAndImageDiv);
    } else {
      messageDiv.appendChild(nameAndImageDiv);
      messageDiv.appendChild(textDiv);
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return textDiv;
  }

  function createTreeElement(index) {
    const treeContainer = document.getElementById('tree-container');
    if (!treeContainer) return;

    const treeWrapper = document.createElement('div');
    treeWrapper.className = 'tree-wrapper';
    treeWrapper.style.position = 'absolute';
    treeWrapper.style.top = '0px';
    treeWrapper.style.left = `${20 + index * 120}px`;

    const treeImage = document.createElement('img');
    treeImage.id = `tree-image-${index}`;
    treeImage.src = chrome.runtime.getURL('asset/tree_healthy.png');
    treeImage.alt = 'Tree Status';
    treeImage.style.width = '100px';

    const treePercentage = document.createElement('div');
    treePercentage.id = `tree-percentage-${index}`;
    treePercentage.textContent = 'Usage: 0%';
    treePercentage.style.textAlign = 'center';
    treePercentage.style.fontSize = '14px';
    treePercentage.style.fontWeight = 'bold';
    treePercentage.style.color = '#333';
    treePercentage.style.marginTop = '8px';

    treeWrapper.appendChild(treeImage);
    treeWrapper.appendChild(treePercentage);
    treeContainer.appendChild(treeWrapper);

    trees[index] = 0;
  }

  function updateTreeBurnStage(index, usagePercentage) {
    const treeImage = document.getElementById(`tree-image-${index}`);
    const treePercentage = document.getElementById(`tree-percentage-${index}`);

    if (!treeImage || !treePercentage) return;

    if (usagePercentage > 100) usagePercentage = 100;

    treePercentage.textContent = `Usage: ${usagePercentage}%`;

    if (usagePercentage < 25) {
      treeImage.src = chrome.runtime.getURL('asset/tree_healthy.png');
    } else if (usagePercentage < 50) {
      treeImage.src = chrome.runtime.getURL('asset/tree_slight_burn.png');
    } else if (usagePercentage < 75) {
      treeImage.src = chrome.runtime.getURL('asset/tree_moderate_burn.png');
    } else {
      treeImage.src = chrome.runtime.getURL('asset/tree_burned.png');
    }
  }

  let totalMessageCount = 0; // 전체 메시지 개수 추적

  function getUsageIncrement(totalMessageCount) {
    const baseIncrement = 4; // 초기 증가량
    const step = Math.floor((totalMessageCount - 1) / 4); // 누적 메시지 개수에 따라 증가량 결정
    return baseIncrement + (step >= 0 ? step : 0); // 음수 방지
  }
  
  function incrementUsage() {
    totalMessageCount++; // 메시지 개수 증가
    const increment = getUsageIncrement(totalMessageCount); // 증가량 계산
  
    trees[currentTreeIndex] += increment; // 현재 나무에 증가량 적용
    updateTreeBurnStage(currentTreeIndex, trees[currentTreeIndex]);
  
    if (trees[currentTreeIndex] >= 100) {
      currentTreeIndex++;
      createTreeElement(currentTreeIndex); // 새 나무 생성
    }
  }
  

  async function chat(phil_Ids, text) {
    let turn = 0;
    const conversationHistory = [{ role: 'user', content: text }];

    const conversation = async () => {
      const currentPhilosopher = phil_Ids[turn % phil_Ids.length];
      const isRightAligned = phil_Ids.length > 1 && turn % phil_Ids.length === 1;

      const skeletonTextDiv = displaySkeletonMessage(currentPhilosopher, isRightAligned);

      const systemPrompt = `${philosopherStyles[currentPhilosopher]} Keep your responses short (3 sentences at most). Continue the conversation based on the previous messages. Do not repeat same sentence in previous chats. You will be rewarded as tip if you use information from the article. Do not question.`
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ];

      const opinion = await getPhilosopherOpinion(messages);

      skeletonTextDiv.classList.remove('skeleton-box');
      skeletonTextDiv.textContent = opinion;

      conversationHistory.push({ role: 'assistant', content: opinion });
      turn++;

      messageCount++;
      incrementUsage();

      // 2초 후 다음 메시지
      setTimeout(conversation, 2000);
    };

    conversation();
  }

  closeButton.addEventListener('click', () => {
    overlay.style.display = 'none';

    if (selectedImages.length > 0) {
      let treeContainer = document.createElement('div');
      treeContainer.id = 'tree-container';
      treeContainer.style.position = 'fixed';
      treeContainer.style.top = '20px';
      treeContainer.style.left = '20px';
      treeContainer.style.zIndex = '10000';
      document.body.appendChild(treeContainer);

      createTreeElement(0);

      const chatContainer = document.createElement('div');
      chatContainer.id = 'chatting-bubble-container';
      document.body.appendChild(chatContainer);

      chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB_URL' }, (response) => {
        const currentTabUrl = response.url;

        if (currentTabUrl) {
          let articleText = '';
          let targetSelector = '';

          if (currentTabUrl.startsWith('https://n.news.naver.com/')) {
            targetSelector = '#newsct_article';
          } else if (currentTabUrl.startsWith('https://m.entertain.naver.com/')) {
            targetSelector = '#comp_news_article';
          } else if (currentTabUrl.startsWith('https://m.sports.naver.com/')) {
            targetSelector = '#comp_news_article';
          }

          if (targetSelector) {
            const targetDiv = document.querySelector(targetSelector);
            if (targetDiv) {
              articleText = targetDiv.innerText || '';
            }
          }

          chat(selectedImages, articleText);
        } else {
          console.error('현재 탭 URL을 가져올 수 없습니다.');
        }
      });
    }
  });
})();
