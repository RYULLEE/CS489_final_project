# Philosopher's Battlefield : Web Chrome Extension
![Naver News Detail Domain Only](asset/first_page.png)
## Overview
The Philosopher Chat Extension is a Chrome extension that integrates a unique conversational experience with philosophical figures. The extension allows users to interact with multiple philosophers, visualize AI CO2 usage through a tree-burning metaphor, and dynamically manage increasing interaction complexity.

---

## Features

### 1. **Philosopher Interaction**
**Purpose:** Create a dynamic and engaging way for users to interact with philosophical figures.

- **Philosopher Selection:**
  - Users can select up to 2 philosophers to engage in conversation.
  - Implemented using interactive image buttons that toggle between selected and deselected states.
  - Images are dynamically rendered and updated with JavaScript.
  - ![select](asset/select_page.png)
- **Conversation Flow:**
  - Conversation is initiated with selected philosophers.
  - Integrated with OpenAI GPT to simulate philosophical responses.
  - Each philosopher's style and persona are reflected in responses, tailored with a system prompt.
  - ![talk](asset/talk_page.png)
  
- **Dynamic Messaging:**
  - Chat bubbles with philosopher avatars and messages.
  - Skeleton loaders for smoother UI experience during API calls.

### 2. **Usage Visualization**
**Purpose:** Provide a fun and informative way to visualize AI usage while ensuring responsible API use.
![Tree](asset/tree_page.png)
- **Tree Metaphor:**
  - A tree represents AI usage. As usage increases, the tree gradually burns.
  - Tree images update dynamically based on usage percentage: Healthy, Slight Burn, Moderate Burn, Fully Burned.

- **Multi-Tree Logic:**
  - When the usage of a tree reaches 100%, a new tree is added to the interface.
  - The logic continues seamlessly, visualizing cumulative usage.

- **Dynamic Percentage Increase:**
  - Initially, usage increases by used Tokens.
  - So percentage gets higher as the chat number increases.

### 3. **Website Compatibility**
**Purpose:** Ensure the extension only works on specific web pages.
- **Supported Domains:**
  - Designed to activate on Naver News and Entertainment pages.
  - URLs are dynamically checked before enabling functionalities.

- **Domain Restriction Logic:**
  - The extension uses a **background script** to fetch the current tab's domain.
  - The script ensures that the extension only activates on supported domains (e.g., Naver News).
  - If an unsupported domain is detected, the extension shows an alert to guide the user.

- **Error Handling:**
  - If the user navigates to an unsupported page, a prompt notifies them to switch to a supported site.

### 4. **Custom UI/UX**
**Purpose:** Provide an intuitive and visually appealing interface.

- **Floating Icon:**
  - A persistent button in the bottom-right corner allows users to activate the extension.
  - Styled with CSS for a modern look.

- **Overlay:**
  - A modal appears when the extension is activated, guiding users through the philosopher selection process.

- **Chat Bubble Design:**
  - Philosophers' messages are displayed in styled bubbles with avatars.
  - Messages alternate alignment for a clean, conversational flow.

- **Skeleton Loaders:**
  - To mimic a real chat experience, skeleton loaders are displayed while fetching responses from OpenAI GPT.
  - The skeletons are replaced by actual messages upon successful API responses.

### 5. **Secure API Key Handling**
**Purpose:** Prevent accidental exposure of sensitive API keys.

- **Config File Usage:**
  - API keys are stored in a `config.json` file, which is fetched dynamically during runtime.
  - The `config.json` file is included in the `.gitignore` file to prevent it from being uploaded to public repositories.
  - This ensures that sensitive information remains secure while developing and sharing the project.

---

## Implementation Details

### Technology Stack
- **Languages:** JavaScript, CSS, HTML
- **APIs:** OpenAI GPT (for conversational responses)
- **Browser Integration:** Chrome Extensions API

### Key Functions

#### 1. `getPhilosopherOpinion`
- Fetches a response from OpenAI GPT.
- Sends conversation history and system prompt to the API.
- Returns the philosopher's response or an error message.

#### 2. `incrementUsage`
- Dynamically adjusts usage percentage based on total messages.
- Handles tree burning logic and ensures a smooth transition when creating new trees.

#### 3. `createTreeElement`
- Adds a new tree to the interface when the current tree reaches 100% usage.
- Manages positioning and initialization of the new tree.

#### 4. `displaySkeletonMessage`
- Adds a skeleton loader while fetching philosopher responses.
- Replaces the skeleton with the actual message upon completion.

#### 5. `chat`
- Orchestrates the conversation flow between the user and selected philosophers.
- Alternates philosopher turns and displays messages dynamically.

#### 6. Domain Validation in `background.js`
- Fetches the current tab's URL using Chrome's `tabs` API.
- Checks if the URL matches the supported domains list.
- Ensures all extension functionalities are disabled for unsupported pages.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RYULLEE/CS489_final_project.git
   ```

2. Navigate to the project directory:
   ```bash
   cd philosopher-chat-extension
   ```

3. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable **Developer Mode**.
   - Click **Load unpacked** and select the project directory.

4. Update the `config.json` file with your OpenAI API key.

---

## How to Use

1. Navigate to a supported website (e.g., Naver News).
2. Click the philosopher icon in the bottom-right corner.
3. Select up to two philosophers to converse with.
4. Interact through the chat interface and watch the tree burn as usage increases.

---

## Future Enhancements

1. Expand support to additional websites.
2. Add more philosophical figures with diverse conversational styles.
3. Include advanced usage tracking and detailed statistics.
4. Enhance UI animations and responsiveness.

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---

