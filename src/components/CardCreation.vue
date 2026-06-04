<template>
  <div class="screen card-creation-screen">
    <div class="header">
      <button class="back-btn" @click="$emit('back')">←</button>
      <h2>製作卡片</h2>
      <div style="width:40px"></div>
    </div>

    <div class="creation-content">
      <div class="progress-info">
        <span>需要 <strong>{{ setup.pairs }}</strong> 個圖案</span>
        <span class="divider">|</span>
        <span>已選 <strong :class="{ done: filledCount === setup.pairs }">{{ filledCount }}</strong> 個</span>
      </div>

      <div class="slots-area">
        <div
          v-for="(_, index) in setup.pairs"
          :key="index"
          :class="['slot', { filled: images[index], active: currentSlot === index }]"
          @click="selectSlot(index)"
        >
          <template v-if="images[index]">
            <img v-if="images[index].type === 'photo'" :src="images[index].data" class="slot-image" />
            <span v-else class="slot-emoji">{{ images[index].data }}</span>
            <button class="remove-btn" @click.stop="removeImage(index)">×</button>
          </template>
          <template v-else>
            <span class="slot-plus">+</span>
          </template>
        </div>
      </div>

      <div v-if="currentSlot !== null && !images[currentSlot]" class="source-panel">
        <p class="source-hint">選擇圖案來源</p>
        <div class="source-buttons">
          <button class="source-btn camera" @click="openCamera">
            <span class="source-icon">📷</span>
            <span>拍照</span>
          </button>
          <button class="source-btn upload" @click="openUpload">
            <span class="source-icon">🖼️</span>
            <span>上傳照片</span>
          </button>
          <button class="source-btn emoji" @click="showEmojiPicker = true">
            <span class="source-icon">😊</span>
            <span>選擇圖案</span>
          </button>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <button
        :class="['start-btn', { ready: allFilled }]"
        :disabled="!allFilled"
        @click="startGame"
      >
        <span v-if="allFilled">開始遊戲 🎮</span>
        <span v-else>還需選擇 {{ setup.pairs - filledCount }} 個圖案</span>
      </button>
    </div>

    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="environment"
      style="display:none"
      @change="handleCameraCapture"
    />
    <input
      ref="uploadInput"
      type="file"
      accept="image/*"
      style="display:none"
      @change="handleFileUpload"
    />

    <teleport to="body">
      <transition name="fade">
        <div v-if="showEmojiPicker" class="modal-overlay" @click="showEmojiPicker = false">
          <div class="emoji-modal" @click.stop>
            <div class="modal-header">
              <h3>選擇圖案</h3>
              <button class="close-btn" @click="showEmojiPicker = false">×</button>
            </div>
            <div class="emoji-categories">
              <button
                v-for="(cat, key) in emojiCategories"
                :key="key"
                :class="['cat-btn', { active: activeCategory === key }]"
                @click="activeCategory = key"
              >
                {{ cat.icon }}
              </button>
            </div>
            <div class="emoji-grid">
              <button
                v-for="emoji in emojiCategories[activeCategory].items"
                :key="emoji"
                class="emoji-item"
                @click="selectEmoji(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const props = defineProps({
  setup: Object
})

const emit = defineEmits(['start', 'back'])

const cameraInput = ref(null)
const uploadInput = ref(null)
const currentSlot = ref(null)
const showEmojiPicker = ref(false)
const activeCategory = ref('faces')

const images = reactive({})

const emojiCategories = {
  faces: {
    icon: '😊',
    items: ['😊', '😂', '😍', '🥰', '😎', '🤩', '🥳', '😱', '🤔', '😏', '😴', '🤗', '😈', '👻', '💀', '🤡', '👽', '🤖', '💩', '❤️', '🔥', '⭐', '🌈', '🎈', '🎉', '🎯', '🎪', '🎨', '🎭', '🎬']
  },
  animals: {
    icon: '🐶',
    items: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋']
  },
  food: {
    icon: '🍎',
    items: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥝', '🍅', '🥑', '🍆', '🌶️', '🫑', '🥒', '🥕', '🧄', '🧅', '🥔', '🍞', '🥐', '🧀', '🍔', '🍕', '🌮']
  },
  objects: {
    icon: '⚽',
    items: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🏓', '🏸', '🥅', '⛳', '🎯', '🏆', '🎮', '🎲', '🧩', '🎭', '🎨', '🎸', '🎹', '🎺', '🎻', '🥁', '📱', '💻', '⌨️', '🖥️', '📷', '🎥', '📺']
  },
  nature: {
    icon: '🌸',
    items: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🌿', '🍀', '🍁', '🍂', '🍃', '🌲', '🌳', '🌴', '🌵', '🌾', '🍄', '🌰', '🐚', '🪨', '🌍', '🌙', '⭐', '☀️', '🌤️', '⛅', '🌈', '❄️', '🌊', '🔥']
  }
}

const filledCount = computed(() => {
  return Object.values(images).filter(Boolean).length
})

const allFilled = computed(() => {
  return filledCount.value === props.setup.pairs
})

function selectSlot(index) {
  if (!images[index]) {
    currentSlot.value = index
  }
}

function openCamera() {
  cameraInput.value.value = ''
  cameraInput.value.click()
}

function openUpload() {
  uploadInput.value.value = ''
  uploadInput.value.click()
}

function processImage(file, callback) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxSize = 400
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      callback(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

function handleCameraCapture(e) {
  const file = e.target.files[0]
  if (!file) return
  processImage(file, (data) => {
    images[currentSlot.value] = { type: 'photo', data }
    moveToNextSlot()
  })
}

function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  processImage(file, (data) => {
    images[currentSlot.value] = { type: 'photo', data }
    moveToNextSlot()
  })
}

function selectEmoji(emoji) {
  images[currentSlot.value] = { type: 'emoji', data: emoji }
  showEmojiPicker.value = false
  moveToNextSlot()
}

function moveToNextSlot() {
  for (let i = 0; i < props.setup.pairs; i++) {
    if (!images[i]) {
      currentSlot.value = i
      return
    }
  }
  currentSlot.value = null
}

function removeImage(index) {
  images[index] = undefined
  currentSlot.value = index
}

function startGame() {
  const imageArray = []
  for (let i = 0; i < props.setup.pairs; i++) {
    imageArray.push(images[i])
  }

  const cards = []
  imageArray.forEach((img, pairIndex) => {
    cards.push({ id: pairIndex * 2, pairId: pairIndex, image: img })
    cards.push({ id: pairIndex * 2 + 1, pairId: pairIndex, image: img })
  })

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }

  emit('start', cards, props.setup.players)
}
</script>

<style scoped>
.card-creation-screen {
  background: var(--bg-dark);
  padding: 0;
  justify-content: flex-start;
}

.header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header h2 {
  font-size: 20px;
  font-weight: 700;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: var(--bg-card);
  border-radius: 12px;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.creation-content {
  flex: 1;
  width: 100%;
  max-width: 500px;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.progress-info {
  text-align: center;
  font-size: 16px;
  color: var(--text-muted);
  padding: 12px;
  background: var(--bg-card);
  border-radius: 12px;
}

.progress-info strong {
  color: var(--primary-light);
}

.progress-info strong.done {
  color: var(--success);
}

.divider {
  margin: 0 12px;
  opacity: 0.3;
}

.slots-area {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.slot {
  aspect-ratio: 1;
  border-radius: 16px;
  background: var(--bg-card);
  border: 2px dashed rgba(162, 155, 254, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.slot.active {
  border-color: var(--primary);
  border-style: solid;
  box-shadow: 0 0 20px rgba(108, 92, 231, 0.3);
}

.slot.filled {
  border-color: var(--success);
  border-style: solid;
}

.slot-plus {
  font-size: 32px;
  color: var(--text-muted);
  opacity: 0.5;
}

.slot-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.slot-emoji {
  font-size: 40px;
}

.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 107, 107, 0.9);
  color: white;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.slot:hover .remove-btn, .slot.filled .remove-btn {
  opacity: 1;
}

.source-panel {
  animation: slideUp 0.3s ease;
}

.source-hint {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.source-buttons {
  display: flex;
  gap: 12px;
}

.source-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.source-btn.camera {
  background: linear-gradient(135deg, #FF6B6B, #EE5A24);
}

.source-btn.upload {
  background: linear-gradient(135deg, #4ECDC4, #44B09E);
}

.source-btn.emoji {
  background: linear-gradient(135deg, #FDCB6E, #F39C12);
}

.source-icon {
  font-size: 32px;
}

.bottom-bar {
  width: 100%;
  padding: 16px 20px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
}

.start-btn {
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  border-radius: 60px;
  background: var(--bg-card);
  opacity: 0.5;
}

.start-btn.ready {
  background: linear-gradient(135deg, #00B894, #00CEC9);
  opacity: 1;
  box-shadow: 0 8px 30px rgba(0, 184, 148, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.emoji-modal {
  width: 100%;
  max-width: 500px;
  max-height: 70vh;
  background: var(--bg-card);
  border-radius: 24px 24px 0 0;
  padding: 20px;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.cat-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cat-btn.active {
  background: var(--primary);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.emoji-item {
  aspect-ratio: 1;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.emoji-item:active {
  background: var(--primary);
  transform: scale(0.9);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
