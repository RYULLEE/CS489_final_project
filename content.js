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

  let selectedImages = [];

  // 이미지 요소 생성 및 이벤트 리스너 추가
  images.forEach((imgData, index) => {
    const imgElement = document.createElement('img');
    imgElement.src = chrome.runtime.getURL('asset/' + imgData.current);
    imgElement.alt = 'Image ' + (index + 1);
    imgElement.dataset.current = 'current';
    imgElement.dataset.index = index;

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

    imageContainer.appendChild(imgElement);
  });

  const modal = document.createElement('div');
  modal.id = 'philosopher-modal';

  const contentArea = document.createElement('div');
  contentArea.id = 'philosopher-content';

  const closeButton = document.createElement('button');
  closeButton.id = 'philosopher-close-button';
  closeButton.innerText = 'Done';

  modal.appendChild(contentArea);
  overlay.appendChild(selectTitle);
  overlay.appendChild(imageContainer);
  overlay.appendChild(closeButton);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  iconButton.addEventListener('click', () => {
    overlay.style.display = 'flex';
    iconButton.style.display = 'none';
  });

  fetch(chrome.runtime.getURL('config.json'))
    .then((response) => response.json())
    .then((data) => {
      API_KEY = data.openaiApiKey;
    })
    .catch((error) => console.error('Failed to load config.json:', error));

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

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (isRightAligned) messageDiv.classList.add('right');

    const imgElement = document.createElement('img');
    imgElement.src = chrome.runtime.getURL('asset/' + images[philosopherId - 1].current);
    imgElement.alt = philosopherNames[philosopherId];
    imgElement.classList.add('philosopher-image');

    const textDiv = document.createElement('div');
    textDiv.classList.add('message-text');
    textDiv.textContent = message;

    if (isRightAligned) {
      messageDiv.appendChild(textDiv);
      messageDiv.appendChild(imgElement);
    } else {
      messageDiv.appendChild(imgElement);
      messageDiv.appendChild(textDiv);
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function chat(phil_Ids, text) {
    let turn = 0;
    const conversationHistory = [{ role: 'user', content: text }];

    const conversation = async () => {
      const currentPhilosopher = phil_Ids[turn % phil_Ids.length];
      const isRightAligned = phil_Ids.length > 1 && turn % phil_Ids.length === 1;

      const systemPrompt = `${philosopherStyles[currentPhilosopher]} Limit your response to two sentences in Korean. Do not include any Korean. Continue the conversation based on the previous messages. Do not question.`;
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ];

      const opinion = await getPhilosopherOpinion(messages);
      displayMessage(currentPhilosopher, opinion, isRightAligned);

      conversationHistory.push({ role: 'assistant', content: opinion });
      turn++;
      setTimeout(conversation, 2000); // 2초마다 대화 진행, 최대 10번
    };

    conversation();
  }

  closeButton.addEventListener('click', () => {
    overlay.style.display = 'none';

    if (selectedImages.length > 0) {
      const chatContainer = document.createElement('div');
      chatContainer.id = 'chatting-bubble-container';
      document.body.appendChild(chatContainer);

      const targetDiv = document.getElementById('newsct_article');
      const articleText = targetDiv ? targetDiv.querySelector('article')?.innerText || '' : '';

      chat(selectedImages, articleText);
    }
  });
})();
