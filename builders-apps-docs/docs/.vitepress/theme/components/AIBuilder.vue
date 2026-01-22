<template>
  <div class="ai-builder">
    <div class="ai-builder-container">
      <div class="chat-header">
        <div class="header-content">
          <div class="header-icon">🤖</div>
          <div class="header-text">
            <h2>AI Mini App Builder</h2>
            <p>Describe your mini app idea and I'll help you build it</p>
          </div>
        </div>
        <button v-if="messages.length > 0" @click="clearChat" class="clear-btn">
          Clear Chat
        </button>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="welcome-message">
          <h3>👋 Let's build something amazing!</h3>
          <p>
            I can help you create blockchain-powered mini apps for the Movement
            Everything wallet.
          </p>
          <div class="example-prompts">
            <h4>Try asking:</h4>
            <button
              v-for="example in examplePrompts"
              :key="example"
              @click="sendMessage(example)"
              class="example-btn"
            >
              {{ example }}
            </button>
          </div>
        </div>

        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.role]"
        >
          <div class="message-avatar">
            {{ message.role === 'user' ? '👤' : '🤖' }}
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
          </div>
        </div>

        <div v-if="isLoading" class="message assistant">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-container">
        <div v-if="error" class="error-message">
          {{ error }}
          <button @click="error = null" class="error-close">×</button>
        </div>
        <form @submit.prevent="handleSubmit" class="chat-input-form">
          <textarea
            v-model="inputMessage"
            @keydown.enter.exact.prevent="handleSubmit"
            placeholder="Describe your mini app idea..."
            class="chat-input"
            rows="3"
            :disabled="isLoading"
          ></textarea>
          <button type="submit" :disabled="!inputMessage.trim() || isLoading" class="send-btn">
            <span v-if="!isLoading">Send</span>
            <span v-else>Sending...</span>
          </button>
        </form>
        <div class="input-hint">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const messages = ref<Message[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);

const examplePrompts = [
  'Create a token swap mini app',
  'Build an NFT gallery viewer',
  'Make a P2P payment app',
  'Create a staking dashboard',
];

const API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:3001';

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const formatMessage = (content: string) => {
  // Basic markdown-like formatting
  let formatted = content
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
  return formatted;
};

const sendMessage = async (content: string) => {
  inputMessage.value = content;
  await handleSubmit();
};

const handleSubmit = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return;

  const userMessage: Message = {
    role: 'user',
    content: inputMessage.value.trim(),
  };

  messages.value.push(userMessage);
  inputMessage.value = '';
  isLoading.value = true;
  error.value = null;

  scrollToBottom();

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.value.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let assistantMessage = '';
    const assistantMessageIndex = messages.value.length;
    messages.value.push({ role: 'assistant', content: '' });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            break;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              assistantMessage += parsed.text;
              messages.value[assistantMessageIndex].content = assistantMessage;
              scrollToBottom();
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send message';
    console.error('Chat error:', err);
    // Remove the empty assistant message on error
    if (messages.value[messages.value.length - 1].role === 'assistant') {
      messages.value.pop();
    }
  } finally {
    isLoading.value = false;
  }
};

const clearChat = () => {
  if (confirm('Clear all messages?')) {
    messages.value = [];
    error.value = null;
  }
};
</script>

<style scoped>
.ai-builder {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.ai-builder-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-direction: column;
  height: 700px;
}

.chat-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.header-icon {
  font-size: 2.5rem;
}

.header-text h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--vp-c-brand);
}

.header-text p {
  margin: 0.25rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.welcome-message {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--vp-c-text-2);
}

.welcome-message h3 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.example-prompts {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.example-prompts h4 {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.example-btn {
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  color: var(--vp-c-text-1);
  transition: all 0.2s;
}

.example-btn:hover {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-bg-soft);
}

.message {
  display: flex;
  gap: 1rem;
  animation: fadeIn 0.3s ease-in;
}

.message-avatar {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}

.message.user .message-content {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
}

.message-text {
  color: var(--vp-c-text-1);
  line-height: 1.6;
  word-wrap: break-word;
}

.message-text :deep(pre) {
  background: var(--vp-code-block-bg);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.message-text :deep(code) {
  background: var(--vp-code-bg);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9em;
}

.message-text :deep(pre code) {
  background: transparent;
  padding: 0;
}

.typing-indicator {
  display: flex;
  gap: 0.3rem;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--vp-c-text-2);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-input-container {
  padding: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.error-message {
  padding: 0.75rem 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: #c33;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #c33;
  padding: 0;
  width: 24px;
  height: 24px;
}

.chat-input-form {
  display: flex;
  gap: 1rem;
}

.chat-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 60px;
}

.chat-input:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.chat-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
}

.send-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  text-align: center;
}
</style>
