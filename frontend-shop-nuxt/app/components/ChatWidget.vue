<template>
  <div>
    <div class="chat-fab-wrapper">
      <!-- Tooltip -->
      <Transition name="tooltip">
        <div v-if="showTooltip && !isOpen" class="chat-fab__tooltip">
          <div class="chat-fab__tooltip-content">
            <span class="chat-fab__tooltip-icon">🤖</span>
            <div>
              <strong>{{ $t('chat.needHelp') }}</strong>
              <span>{{ $t('chat.tooltipIntro') }}</span>
            </div>
          </div>
          <button @click="showTooltip = false" :aria-label="$t('chat.close')" class="chat-fab__tooltip-close">✕</button>
        </div>
      </Transition>

      <!-- Bouton FAB -->
      <button
        class="chat-fab"
        @click="toggleChat"
        :class="{ 'chat-fab--active': isOpen, 'chat-fab--pulse': unread > 0 && !isOpen }"
        :aria-label="$t('chat.open')"
        :title="isOpen ? $t('chat.close') : $t('chat.talkToIce')"
      >
        <div class="chat-fab__icon">
          <!-- Icône IA fermée -->
          <svg v-if="!isOpen" width="28" height="28" viewBox="0 0 28 28" fill="none">
            <!-- Cercle de fond -->
            <circle cx="14" cy="14" r="13" fill="white" opacity="0.2"/>
            <!-- Antenne IA -->
            <path d="M14 2C11 2 9 4 9 7C9 9 10 11 14 11C18 11 19 9 19 7C19 4 17 2 14 2Z" fill="white"/>
            <circle cx="14" cy="6" r="2" fill="#3b82f6"/>
            <!-- Visage -->
            <ellipse cx="14" cy="15" rx="8" ry="9" fill="white"/>
            <!-- Yeux -->
            <circle cx="11" cy="14" r="1.5" fill="#3b82f6"/>
            <circle cx="17" cy="14" r="1.5" fill="#3b82f6"/>
            <!-- Sourire -->
            <path d="M10 18C11 20 17 20 18 18" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <!-- Éclat -->
            <circle cx="20" cy="8" r="3" fill="#60a5fa" opacity="0.6"/>
          </svg>
          <!-- Icône fermeture -->
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </div>
        <span v-if="unread > 0 && !isOpen" class="chat-fab__badge">{{ unread > 9 ? '9+' : unread }}</span>
        <!-- Effet de brillance -->
        <div class="chat-fab__glow"></div>
      </button>
    </div>

    <!-- Fenêtre de chat -->
    <Transition name="chat-slide">
      <div
        v-if="isOpen"
        ref="chatWindowRef"
        class="chat-window"
        :style="chatWindowStyle"
        role="dialog"
        :aria-label="$t('chat.dialogLabel')"
      >
        <!-- Header -->
        <div class="chat-window__header" @pointerdown="startDrag">
          <div class="chat-window__agent">
            <div class="chat-window__avatar">
              <!-- Avatar IA -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="white" opacity="0.3"/>
                <circle cx="12" cy="7" r="3" fill="white"/>
                <circle cx="10" cy="6" r="0.8" fill="#3b82f6"/>
                <ellipse cx="12" cy="14" rx="5" ry="6" fill="white"/>
                <circle cx="10" cy="13" r="1" fill="#3b82f6"/>
                <circle cx="14" cy="13" r="1" fill="#3b82f6"/>
                <path d="M9 16C10 17.5 14 17.5 15 16" stroke="#3b82f6" stroke-width="1.2" stroke-linecap="round" fill="none"/>
              </svg>
              <div class="chat-window__online-dot"></div>
              <div class="chat-window__ai-badge">AI</div>
            </div>
            <div class="chat-window__agent-info">
              <strong>{{ shop.settings.chat_assistant_name }}</strong>
              <div class="chat-window__agent-tags">
                <span class="chat-window__agent-role">{{ $t('chat.assistantRole') }}</span>
                <span class="chat-window__agent-status">● {{ $t('chat.online') }}</span>
              </div>
            </div>
          </div>
          <div class="chat-window__header-actions">
            <button class="chat-window__action-btn" @click="messages = []; typing = false" :title="$t('chat.newConversation')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
            <a :href="shop.whatsappLink" target="_blank" class="chat-window__whatsapp-btn" title="WhatsApp">
              <WhatsAppIcon size="18" />
            </a>
            <button class="chat-window__close" @click="toggleChat" :title="$t('chat.close')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-window__messages" ref="messagesContainer" @scroll="onScroll">
          <!-- Bienvenue -->
          <div v-if="messages.length === 0" class="chat-welcome">
            <div class="chat-welcome__avatar">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" fill="url(#iceGradient)" stroke="white" stroke-width="2"/>
                <defs>
                  <linearGradient id="iceGradient" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stop-color="#3b82f6"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                  </linearGradient>
                </defs>
                <!-- Visage IA -->
                <circle cx="24" cy="14" r="5" fill="white"/>
                <circle cx="21" cy="13" r="1.2" fill="#3b82f6"/>
                <circle cx="27" cy="13" r="1.2" fill="#3b82f6"/>
                <ellipse cx="24" cy="26" rx="9" ry="10" fill="white"/>
                <circle cx="19" cy="25" r="2" fill="#3b82f6"/>
                <circle cx="29" cy="25" r="2" fill="#3b82f6"/>
                <path d="M17 30C19 33 29 33 31 30" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" fill="none"/>
                <!-- Antenne -->
                <line x1="24" y1="9" x2="24" y2="4" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <circle cx="24" cy="3" r="2" fill="#10b981"/>
              </svg>
            </div>
            <h3 class="chat-welcome__title">{{ $t('chat.hello') }} 👋</h3>
            <p class="chat-welcome__text">{{ localizedChatWelcome }}</p>
            <p class="chat-welcome__subtext">{{ $t('chat.welcomeQuestion') }}</p>
            <div class="chat-welcome__suggestions">
              <span>{{ $t('chat.suggestions') }}</span>
              <button v-for="q in quickQuestions" :key="q" @click="sendQuick(q)">{{ q }}</button>
            </div>
          </div>

          <!-- Messages -->
          <div v-for="(msg, i) in messages" :key="i" :class="['chat-msg', `chat-msg--${msg.sender}`]">
            <div v-if="msg.sender === 'bot'" class="chat-msg__avatar">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="white" opacity="0.3"/>
                <circle cx="8" cy="4" r="2" fill="white"/>
                <ellipse cx="8" cy="9" rx="4" ry="5" fill="white"/>
                <circle cx="6.5" cy="8.5" r="0.7" fill="#3b82f6"/>
                <circle cx="9.5" cy="8.5" r="0.7" fill="#3b82f6"/>
              </svg>
              <span class="chat-msg__ai-label">AI</span>
            </div>
            <div class="chat-msg__content">
              <div class="chat-msg__bubble" v-html="renderMarkdown(msg.text)"></div>
              <span class="chat-msg__time">{{ msg.time }}</span>
            </div>
            <div v-if="msg.sender === 'user'" class="chat-msg__avatar chat-msg__avatar--user">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 00-16 0"/></svg>
            </div>
          </div>

          <!-- Typing -->
          <div v-if="typing" class="chat-msg chat-msg--bot">
            <div class="chat-msg__avatar">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="white" opacity="0.3"/>
                <circle cx="8" cy="4" r="2" fill="white"/>
                <ellipse cx="8" cy="9" rx="4" ry="5" fill="white"/>
              </svg>
            </div>
            <div class="chat-msg__content">
              <div class="chat-msg__typing"><span></span><span></span><span></span></div>
            </div>
          </div>

          <!-- Offline -->
          <div v-if="isOffline" class="chat-offline">
            <span>📡</span><p>{{ $t('chat.offline') }}</p>
          </div>
          <div ref="messagesEnd"></div>
        </div>

        <!-- Quick actions -->
        <div v-if="messages.length > 0" class="chat-window__quick-actions">
          <button @click="sendQuick(`📱 ${$t('chat.quickPhones')}`)">📱</button>
          <button @click="sendQuick(`💍 ${$t('chat.quickJewelry')}`)">💍</button>
          <button @click="sendQuick(`🚚 ${$t('chat.quickDelivery')}`)">🚚</button>
          <button @click="sendQuick(`💰 ${$t('chat.quickPayment')}`)">💰</button>
          <button @click="sendQuick(`🛒 ${$t('chat.quickOrder')}`)">🛒</button>
          <button @click="sendQuick(`🎨 ${$t('chat.quickCustomize')}`)">🎨</button>
        </div>

        <!-- Footer -->
        <div class="chat-window__footer">
          <div class="chat-window__input-wrap">
            <div class="chat-window__input-container">
              <svg class="chat-window__input-ai-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" fill="#3b82f6" opacity="0.1"/>
                <path d="M6 9H12M9 6V12" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input 
                ref="inputRef" 
                v-model="input" 
                :placeholder="isOffline ? $t('chat.reconnecting') : $t('chat.placeholder')"
                @keyup.enter="sendMessage" 
                :disabled="sending || isOffline" 
                class="chat-window__input" 
                autocomplete="off" 
              />
            </div>
            <button class="chat-window__send" @click="sendMessage" :disabled="sending || isOffline || !input.trim()" :title="$t('chat.send')">
              <svg v-if="!sending" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <div v-else class="chat-window__spinner"></div>
            </button>
          </div>
          <p class="chat-window__disclaimer">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 0L6 3.5L9.5 4.5L6 5.5L5 9L4 5.5L0.5 4.5L4 3.5Z"/></svg>
            {{ $t('chat.disclaimer') }}
          </p>
        </div>

        <button
          class="chat-window__resize"
          type="button"
          :aria-label="$t('chat.resize')"
          @pointerdown="startResize"
        ></button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import api from '@/services/api'
import { useShopSettingsStore } from '@/stores/shopSettings'

const shop = useShopSettingsStore()
const { t, locale } = useI18n()
const isOpen = ref(false)
const input = ref('')
const messages = ref([])
const typing = ref(false)
const sending = ref(false)
const unread = ref(0)
const isOffline = ref(false)
const showTooltip = ref(false)
const messagesContainer = ref(null)
const messagesEnd = ref(null)
const inputRef = ref(null)
const chatWindowRef = ref(null)
const chatFrame = ref({ x: 0, y: 0, width: 420, height: 540, ready: false })

let retryTimeout = null
let tooltipTimer = null
let dragState = null
let resizeState = null

const clientId = process.client ? (localStorage.getItem('chatClientId') || 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)) : 'client_ssr'
if (process.client) localStorage.setItem('chatClientId', clientId)

const quickQuestions = computed(() => {
  const raw = locale.value === 'en' ? shop.settings.chat_quick_questions_en : shop.settings.chat_quick_questions_fr
  const items = String(raw || '').split('|').map(q => q.trim()).filter(Boolean)
  return items.length ? items : [
    `📱 ${t('chat.askPhones')}`,
    `💍 ${t('chat.askJewelry')}`,
    `🚚 ${t('chat.askDelivery')}`,
    `🛒 ${t('chat.askOrder')}`,
    `💳 ${t('chat.askPayment')}`,
    `🎨 ${t('chat.askCustomize')}`
  ]
})

const localizedChatWelcome = computed(() => {
  const template = locale.value === 'en' ? shop.settings.chat_welcome_en : shop.settings.chat_welcome_fr
  return String(template || '')
    .replaceAll('{assistant}', shop.settings.chat_assistant_name || 'Ice')
    .replaceAll('{brand}', shop.settings.shop_name || '')
})

const checkOnline = () => { isOffline.value = !navigator.onLine }

const isDesktop = () => process.client && window.matchMedia('(min-width: 481px)').matches

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getDefaultChatFrame = () => {
  const width = Math.min(420, window.innerWidth - 40)
  const height = Math.min(540, window.innerHeight - 220)
  return {
    width,
    height,
    x: Math.max(20, window.innerWidth - width - 24),
    y: Math.max(80, window.innerHeight - height - 176),
    ready: true
  }
}

const keepChatInViewport = () => {
  if (!isDesktop() || !chatFrame.value.ready) return
  const maxWidth = window.innerWidth - 40
  const maxHeight = window.innerHeight - 140
  const width = clamp(chatFrame.value.width, 340, maxWidth)
  const height = clamp(chatFrame.value.height, 420, maxHeight)
  chatFrame.value = {
    ...chatFrame.value,
    width,
    height,
    x: clamp(chatFrame.value.x, 20, window.innerWidth - width - 20),
    y: clamp(chatFrame.value.y, 80, window.innerHeight - height - 20)
  }
}

const initChatFrame = () => {
  if (!isDesktop()) return
  if (!chatFrame.value.ready) {
    chatFrame.value = getDefaultChatFrame()
  }
  keepChatInViewport()
}

const chatWindowStyle = computed(() => {
  if (!chatFrame.value.ready) return {}
  return {
    width: `${chatFrame.value.width}px`,
    height: `${chatFrame.value.height}px`,
    left: `${chatFrame.value.x}px`,
    top: `${chatFrame.value.y}px`,
    right: 'auto',
    bottom: 'auto'
  }
})

const startDrag = (event) => {
  if (!isDesktop() || event.target.closest('button, a, input')) return
  initChatFrame()
  dragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    frame: { ...chatFrame.value }
  }
  event.currentTarget.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', onDrag)
  window.addEventListener('pointerup', stopDrag)
}

const onDrag = (event) => {
  if (!dragState) return
  const nextX = dragState.frame.x + event.clientX - dragState.startX
  const nextY = dragState.frame.y + event.clientY - dragState.startY
  chatFrame.value = {
    ...chatFrame.value,
    x: clamp(nextX, 20, window.innerWidth - chatFrame.value.width - 20),
    y: clamp(nextY, 80, window.innerHeight - chatFrame.value.height - 20)
  }
}

const stopDrag = () => {
  dragState = null
  window.removeEventListener('pointermove', onDrag)
  window.removeEventListener('pointerup', stopDrag)
}

const startResize = (event) => {
  if (!isDesktop()) return
  initChatFrame()
  resizeState = {
    startX: event.clientX,
    startY: event.clientY,
    frame: { ...chatFrame.value }
  }
  event.currentTarget.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', onResize)
  window.addEventListener('pointerup', stopResize)
}

const onResize = (event) => {
  if (!resizeState) return
  const maxWidth = window.innerWidth - resizeState.frame.x - 20
  const maxHeight = window.innerHeight - resizeState.frame.y - 20
  chatFrame.value = {
    ...chatFrame.value,
    width: clamp(resizeState.frame.width + event.clientX - resizeState.startX, 340, maxWidth),
    height: clamp(resizeState.frame.height + event.clientY - resizeState.startY, 420, maxHeight)
  }
}

const stopResize = () => {
  resizeState = null
  window.removeEventListener('pointermove', onResize)
  window.removeEventListener('pointerup', stopResize)
}

const showTooltipAfterDelay = () => {
  if (tooltipTimer) clearTimeout(tooltipTimer)
  tooltipTimer = setTimeout(() => { if (!isOpen.value) showTooltip.value = true }, 5000)
}

onMounted(() => {
  window.addEventListener('online', checkOnline)
  window.addEventListener('offline', checkOnline)
  window.addEventListener('resize', keepChatInViewport)
  checkOnline()
  setTimeout(() => { showTooltip.value = true }, 3000)
})

onUnmounted(() => {
  window.removeEventListener('online', checkOnline)
  window.removeEventListener('offline', checkOnline)
  window.removeEventListener('resize', keepChatInViewport)
  stopDrag()
  stopResize()
  if (retryTimeout) clearTimeout(retryTimeout)
  if (tooltipTimer) clearTimeout(tooltipTimer)
})

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) { 
    showTooltip.value = false
    unread.value = 0
    nextTick(() => { initChatFrame(); inputRef.value?.focus(); scrollToBottom() })
  } else { 
    showTooltipAfterDelay() 
  }
}

const sendQuick = (text) => { 
  if (!sending.value && !isOffline.value) { 
    input.value = text; sendMessage() 
  } 
}

const getTime = () => new Date().toLocaleTimeString(locale.value === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })

const renderMarkdown = (text) => {
  if (!text) return ''
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/🛒\s*(https?:\/\/[^\s<]+)/g, `<a href="$1" target="_blank" class="chat-link">🛒 ${t('chat.orderLink')} -></a>`)
    .replace(/📸\s*(https?:\/\/[^\s<]+\.(?:webp|jpg|jpeg|png|gif))(\s*\n\s*🛒\s*(https?:\/\/[^\s<]+))?/g, (match, img, linkGroup, linkUrl) => {
      if (linkUrl) return `<a href="${linkUrl}" target="_blank"><img src="${img}" class="chat-img" loading="lazy" onerror="this.style.display='none'" /></a>`
      return `<img src="${img}" class="chat-img" loading="lazy" onerror="this.style.display='none'" />`
    })
  return html
}

const sendMessage = async () => {
  const msg = input.value.trim()
  if (!msg || sending.value || isOffline.value) return
  messages.value.push({ sender: 'user', text: msg, time: getTime() })
  input.value = ''; sending.value = true; typing.value = true
  nextTick(() => scrollToBottom())
  try {
    const { data } = await api.post('/chat', { message: msg, clientId })
    typing.value = false; await typeMessage(data.reply)
    if (!isOpen.value) unread.value++
  } catch (error) {
    typing.value = false
    if (!navigator.onLine || error.message?.includes('Network') || error.message?.includes('fetch')) {
      isOffline.value = true
      retryTimeout = setTimeout(() => { isOffline.value = false; sendMessage() }, 5000)
      messages.value.push({ sender: 'bot', text: `📡 ${t('chat.unstable')}`, time: getTime() })
    } else {
      messages.value.push({ sender: 'bot', text: `❌ ${t('chat.error')}`, time: getTime() })
    }
  } finally { sending.value = false; nextTick(() => scrollToBottom()) }
}

const typeMessage = async (text) => {
  const i = messages.value.length
  messages.value.push({ sender: 'bot', text: '', time: getTime() })
  let t = ''
  for (const w of text.split(/(\s+)/)) { 
    t += w; messages.value[i].text = t; 
    await new Promise(r => setTimeout(r, 15 + Math.random() * 20)); 
    nextTick(() => scrollToBottom()) 
  }
  messages.value[i].text = text
}

const scrollToBottom = () => messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })

const onScroll = () => {
  if (messagesContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
    if (scrollHeight - scrollTop - clientHeight < 50) unread.value = 0
  }
}
</script>

<style scoped>
/* ============================================
   FAB WRAPPER
   ============================================ */
.chat-fab-wrapper { 
  position: fixed; 
  bottom: calc(env(safe-area-inset-bottom) + 96px); 
  right: 24px; 
  z-index: 95; 
  display: flex; 
  flex-direction: column; 
  align-items: flex-end; 
  gap: 12px; 
}

/* Tooltip amélioré */
.chat-fab__tooltip { 
  background: var(--surface); 
  border: 1px solid var(--border); 
  border-radius: 16px; 
  padding: 12px 16px; 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  box-shadow: 0 12px 32px rgba(0,0,0,0.12); 
  font-size: 14px; 
  color: var(--text-primary); 
  white-space: nowrap;
  animation: tooltipIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-fab__tooltip-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-fab__tooltip-icon {
  font-size: 28px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.chat-fab__tooltip-content div {
  display: flex;
  flex-direction: column;
}

.chat-fab__tooltip-content strong {
  font-size: 15px;
  color: var(--text-primary);
}

.chat-fab__tooltip-content span {
  font-size: 13px;
  color: var(--text-muted);
}

.chat-fab__tooltip-close { 
  background: var(--bg-secondary); 
  border: none; 
  width: 26px; 
  height: 26px; 
  border-radius: 50%; 
  cursor: pointer; 
  font-size: 12px; 
  color: var(--text-muted); 
  display: flex; 
  align-items: center; 
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.chat-fab__tooltip-close:hover {
  background: var(--border);
  color: var(--text-primary);
}

@keyframes tooltipIn { 
  0% { transform: translateX(20px); opacity: 0; } 
  60% { transform: translateX(-4px); } 
  100% { transform: translateX(0); opacity: 1; } 
}

.tooltip-enter-active,
.tooltip-leave-active { transition: all 0.3s ease; }

.tooltip-enter-from,
.tooltip-leave-to { opacity: 0; transform: translateX(20px); }

/* ============================================
   FAB BOUTON - DESIGN IA
   ============================================ */
.chat-fab { 
  width: 60px; 
  height: 60px; 
  border-radius: 50%; 
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%); 
  color: #fff; 
  border: none; 
  cursor: pointer; 
  box-shadow: 0 8px 32px rgba(59,130,246,0.45); 
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
  display: flex; 
  align-items: center; 
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.chat-fab::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6, #3b82f6);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.chat-fab:hover::before {
  opacity: 1;
}

.chat-fab:hover { 
  transform: scale(1.08); 
  box-shadow: 0 12px 40px rgba(59,130,246,0.6); 
}

.chat-fab--active { 
  background: var(--surface); 
  color: var(--text-primary); 
  border: 2px solid var(--border);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.chat-fab--pulse { 
  animation: fabPulse 2s ease-in-out infinite; 
}

@keyframes fabPulse { 
  0%, 100% { box-shadow: 0 8px 32px rgba(59,130,246,0.45); } 
  50% { box-shadow: 0 8px 48px rgba(59,130,246,0.7), 0 0 0 12px rgba(59,130,246,0.1); } 
}

.chat-fab__icon { 
  display: flex; 
  align-items: center; 
  justify-content: center;
  position: relative;
  z-index: 1;
}

.chat-fab__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  transform: translate(-50%, -50%);
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { width: 0; height: 0; opacity: 0; }
  50% { width: 120%; height: 120%; opacity: 0.1; }
}

.chat-fab__badge { 
  position: absolute; 
  top: -6px; 
  right: -6px; 
  min-width: 24px; 
  height: 24px; 
  background: #ef4444; 
  color: #fff; 
  font-size: 12px; 
  font-weight: 700; 
  border-radius: 999px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(239,68,68,0.4);
  z-index: 2;
  animation: badgePop 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes badgePop {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* ============================================
   FENÊTRE CHAT
   ============================================ */
.chat-window { 
  position: fixed; 
  bottom: calc(env(safe-area-inset-bottom) + 176px); 
  right: 24px; 
  width: 420px; 
  max-width: calc(100vw - 40px); 
  height: 540px; 
  max-height: calc(100vh - 220px); 
  background: var(--surface); 
  border: 1px solid var(--border); 
  border-radius: 24px; 
  overflow: hidden; 
  display: flex; 
  flex-direction: column; 
  box-shadow: 0 25px 60px rgba(0,0,0,0.2); 
  z-index: 105; 
}

@media (max-width: 480px) { 
  .chat-window { 
    right: 0; 
    bottom: 0; 
    width: 100%; 
    max-width: 100%; 
    height: 100vh; 
    max-height: 100vh; 
    border-radius: 0; 
  } 
  .chat-fab-wrapper {
    right: 16px;
    bottom: calc(env(safe-area-inset-bottom) + 78px);
  } 
  .chat-fab { width: 52px; height: 52px; } 
  .chat-fab__tooltip { font-size: 12px; padding: 10px 14px; max-width: 240px; white-space: normal; } 
}

/* Header */
.chat-window__header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 14px 18px; 
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%); 
  color: #fff; 
  flex-shrink: 0; 
  cursor: move;
  user-select: none;
}

.chat-window__header button,
.chat-window__header a {
  cursor: pointer;
}

.chat-window__agent { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
}

.chat-window__avatar { 
  position: relative; 
  width: 44px; 
  height: 44px; 
  background: rgba(255,255,255,0.2); 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border: 2px solid rgba(255,255,255,0.3);
}

.chat-window__online-dot { 
  position: absolute; 
  bottom: 2px; 
  right: 2px; 
  width: 10px; 
  height: 10px; 
  background: #22c55e; 
  border-radius: 50%; 
  border: 2px solid #3b82f6;
  animation: onlinePulse 2s ease-in-out infinite;
}

@keyframes onlinePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50% { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
}

.chat-window__ai-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #fff;
  color: #3b82f6;
  font-size: 8px;
  font-weight: 800;
  padding: 2px 5px;
  border-radius: 4px;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chat-window__agent-info strong { 
  display: block; 
  font-size: 17px; 
  font-weight: 700; 
}

.chat-window__agent-tags {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chat-window__agent-role { 
  font-size: 12px; 
  opacity: 0.85;
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 999px;
}

.chat-window__agent-status {
  font-size: 12px;
  opacity: 0.85;
  color: #22c55e;
}

.chat-window__header-actions { 
  display: flex; 
  gap: 6px; 
}

.chat-window__action-btn,
.chat-window__close { 
  width: 32px; 
  height: 32px; 
  border-radius: 50%; 
  border: none; 
  background: rgba(255,255,255,0.15); 
  color: #fff; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: background 0.2s; 
}

.chat-window__action-btn:hover,
.chat-window__close:hover { 
  background: rgba(255,255,255,0.25); 
}

.chat-window__whatsapp-btn { 
  width: 32px; 
  height: 32px; 
  border-radius: 50%; 
  border: none; 
  background: #25D366; 
  color: #fff; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: all 0.2s; 
  text-decoration: none; 
}

.chat-window__whatsapp-btn:hover { 
  background: #20bd5a; 
  transform: scale(1.1); 
}

/* Messages */
.chat-window__messages { 
  flex: 1; 
  overflow-y: auto; 
  padding: 16px; 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  background: var(--bg-secondary); 
}

/* Bienvenue */
.chat-welcome { 
  text-align: center; 
  padding: 24px 8px; 
}

.chat-welcome__avatar {
  margin-bottom: 16px;
  display: inline-block;
  animation: welcomeFloat 3s ease-in-out infinite;
}

@keyframes welcomeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.chat-welcome__title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.chat-welcome__text {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  line-height: 1.5;
}

.chat-welcome__subtext {
  font-size: 15px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.chat-welcome__suggestions { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 8px; 
  justify-content: center; 
}

.chat-welcome__suggestions span { 
  width: 100%; 
  font-size: 12px; 
  color: var(--text-muted); 
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  margin-bottom: 4px;
}

.chat-welcome__suggestions button { 
  padding: 8px 14px; 
  background: var(--surface); 
  border: 1px solid var(--border); 
  border-radius: 999px; 
  font-size: 14px; 
  cursor: pointer; 
  transition: all 0.2s; 
  color: var(--text-primary);
  font-weight: 500;
}

.chat-welcome__suggestions button:hover { 
  background: var(--accent-light); 
  border-color: var(--accent); 
  color: var(--accent);
  transform: translateY(-1px);
}

/* Messages */
.chat-msg { 
  display: flex; 
  gap: 8px; 
  animation: msgIn 0.3s ease; 
}

@keyframes msgIn { 
  from { opacity: 0; transform: translateY(8px); } 
  to { opacity: 1; transform: translateY(0); } 
}

.chat-msg--user { 
  justify-content: flex-end; 
}

.chat-msg__avatar { 
  width: 30px; 
  height: 30px; 
  border-radius: 50%; 
  background: linear-gradient(135deg, #3b82f6, #6366f1); 
  color: #fff; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0;
  position: relative;
}

.chat-msg__avatar--user { 
  background: var(--bg-tertiary); 
  color: var(--text-secondary); 
}

.chat-msg__ai-label {
  position: absolute;
  bottom: -2px;
  right: -4px;
  background: #fff;
  color: #3b82f6;
  font-size: 6px;
  font-weight: 800;
  padding: 1px 3px;
  border-radius: 2px;
  letter-spacing: 0.05em;
}

.chat-msg__content { 
  max-width: 78%; 
}

.chat-msg--user .chat-msg__content { 
  align-items: flex-end; 
}

.chat-msg__bubble { 
  padding: 10px 14px; 
  border-radius: 16px; 
  font-size: 15px; 
  line-height: 1.65; 
  word-break: break-word; 
}

.chat-msg--bot .chat-msg__bubble { 
  background: var(--surface); 
  border: 1px solid var(--border); 
  border-bottom-left-radius: 4px; 
  color: var(--text-primary); 
}

.chat-msg--user .chat-msg__bubble { 
  background: linear-gradient(135deg, #3b82f6, #6366f1); 
  color: #fff; 
  border-bottom-right-radius: 4px; 
}

.chat-msg__time { 
  font-size: 11px; 
  color: var(--text-muted); 
  margin-top: 3px; 
  display: block; 
}

.chat-msg--user .chat-msg__time { 
  text-align: right; 
}

/* Image */
.chat-img { 
  max-width: 200px; 
  border-radius: 16px; 
  margin: 10px 0 6px; 
  display: block; 
  border: 3px solid var(--border); 
  box-shadow: 0 10px 30px rgba(0,0,0,0.15); 
  transition: all 0.35s cubic-bezier(0.4,0,0.2,1); 
  cursor: pointer; 
}

.chat-img:hover { 
  transform: scale(1.05); 
  box-shadow: 0 16px 40px rgba(0,0,0,0.25); 
  border-color: var(--accent); 
}

@media (max-width: 480px) { 
  .chat-img { max-width: 160px; border-radius: 12px; } 
}

/* Lien */
.chat-link { 
  display: inline-block; 
  background: var(--accent); 
  color: #fff !important; 
  padding: 6px 14px; 
  border-radius: 999px; 
  font-size: 14px; 
  font-weight: 700; 
  text-decoration: none; 
  margin-top: 6px; 
  transition: all 0.2s; 
}

.chat-link:hover { 
  background: var(--accent-hover); 
  transform: scale(1.05); 
}

/* Typing */
.chat-msg__typing { 
  display: flex; 
  gap: 4px; 
  padding: 12px 16px; 
  background: var(--surface); 
  border: 1px solid var(--border); 
  border-radius: 16px;
  border-bottom-left-radius: 4px;
}

.chat-msg__typing span { 
  width: 6px; 
  height: 6px; 
  background: var(--accent); 
  border-radius: 50%; 
  animation: typingBounce 1.4s infinite; 
}

.chat-msg__typing span:nth-child(2) { animation-delay: 0.2s; }
.chat-msg__typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce { 
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; } 
  30% { transform: translateY(-6px); opacity: 1; } 
}

/* Offline */
.chat-offline { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
  padding: 8px 12px; 
  background: #fef3c7; 
  border-radius: 10px; 
  font-size: 14px; 
  color: #92400e; 
}

:global(.dark) .chat-offline {
  background: rgba(251,191,36,0.1);
  color: #fbbf24;
}

/* Quick actions */
.chat-window__quick-actions { 
  display: flex; 
  gap: 6px; 
  padding: 8px 14px; 
  overflow-x: auto; 
  border-top: 1px solid var(--border); 
  background: var(--surface); 
  flex-shrink: 0;
  scrollbar-width: none;
}

.chat-window__quick-actions::-webkit-scrollbar { display: none; }

.chat-window__quick-actions button { 
  padding: 6px 10px; 
  background: var(--bg-secondary); 
  border: 1px solid var(--border); 
  border-radius: 999px; 
  font-size: 13px; 
  cursor: pointer; 
  white-space: nowrap; 
  transition: all 0.2s; 
  color: var(--text-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.chat-window__quick-actions button:hover { 
  background: var(--accent-light); 
  border-color: var(--accent); 
  color: var(--accent);
  transform: translateY(-1px);
}

/* Footer */
.chat-window__footer { 
  padding: 10px 14px 12px; 
  background: var(--surface); 
  border-top: 1px solid var(--border); 
  flex-shrink: 0; 
}

.chat-window__input-wrap { 
  display: flex; 
  gap: 8px; 
  align-items: center; 
}

.chat-window__input-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.chat-window__input-ai-icon {
  position: absolute;
  left: 12px;
  pointer-events: none;
  z-index: 1;
}

.chat-window__input { 
  flex: 1; 
  width: 100%;
  padding: 10px 14px 10px 38px; 
  border: 2px solid var(--border); 
  border-radius: 999px; 
  font-size: 15px; 
  background: var(--bg-secondary); 
  color: var(--text-primary); 
  outline: none; 
  transition: all 0.25s ease; 
  font-family: inherit; 
}

.chat-window__input:focus { 
  border-color: var(--accent); 
  background: var(--surface);
  box-shadow: 0 0 0 4px rgba(59,130,246,0.08);
}

.chat-window__input::placeholder {
  color: var(--text-muted);
  font-size: 14px;
}

.chat-window__input:disabled { 
  opacity: 0.5; 
}

.chat-window__send { 
  width: 40px; 
  height: 40px; 
  border-radius: 50%; 
  background: linear-gradient(135deg, #3b82f6, #6366f1); 
  color: #fff; 
  border: none; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: all 0.25s ease; 
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59,130,246,0.3);
}

.chat-window__send:hover:not(:disabled) { 
  transform: scale(1.08);
  box-shadow: 0 6px 16px rgba(59,130,246,0.4);
}

.chat-window__send:active:not(:disabled) {
  transform: scale(0.95);
}

.chat-window__send:disabled { 
  opacity: 0.4; 
  cursor: not-allowed; 
  box-shadow: none;
}

.chat-window__spinner { 
  width: 18px; 
  height: 18px; 
  border: 2px solid rgba(255,255,255,0.3); 
  border-top-color: #fff; 
  border-radius: 50%; 
  animation: spin 0.6s linear infinite; 
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

.chat-window__disclaimer { 
  text-align: center; 
  font-size: 12px; 
  color: var(--text-muted); 
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.chat-window__disclaimer svg {
  color: var(--accent);
}

.chat-window__resize {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 18px;
  height: 18px;
  border: 0;
  background:
    linear-gradient(135deg, transparent 0 45%, rgba(148, 163, 184, 0.9) 46% 52%, transparent 53%),
    linear-gradient(135deg, transparent 0 62%, rgba(148, 163, 184, 0.9) 63% 69%, transparent 70%);
  cursor: nwse-resize;
  opacity: 0.8;
  padding: 0;
  z-index: 3;
}

.chat-window__resize:hover {
  opacity: 1;
}

@media (max-width: 480px) { 
  .chat-window {
    left: 0 !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100vh !important;
  }

  .chat-window__footer { 
    padding-bottom: max(12px, env(safe-area-inset-bottom)); 
  } 

  .chat-window__header {
    cursor: default;
  }

  .chat-window__agent-info strong {
    font-size: 18px;
  }

  .chat-window__agent-role,
  .chat-window__agent-status {
    font-size: 12px;
  }

  .chat-window__messages {
    padding: 18px 14px;
    gap: 14px;
  }

  .chat-msg__content {
    max-width: 86%;
  }

  .chat-msg__bubble {
    font-size: 16px;
    line-height: 1.65;
    padding: 12px 15px;
  }

  .chat-welcome__title {
    font-size: 25px;
  }

  .chat-welcome__text {
    font-size: 16px;
  }

  .chat-welcome__subtext {
    font-size: 15px;
  }

  .chat-welcome__suggestions button,
  .chat-window__quick-actions button {
    font-size: 14px;
  }

  .chat-window__input {
    font-size: 16px;
    padding: 12px 14px 12px 40px;
  }

  .chat-window__input::placeholder {
    font-size: 15px;
  }

  .chat-window__disclaimer {
    font-size: 11px;
  }

  .chat-window__resize {
    display: none;
  }
}

/* Transitions */
.chat-slide-enter-active { 
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
}

.chat-slide-leave-active { 
  transition: all 0.25s ease; 
}

.chat-slide-enter-from,
.chat-slide-leave-to { 
  opacity: 0; 
  transform: translateY(20px) scale(0.95); 
}
</style>