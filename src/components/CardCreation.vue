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
          @dragover.prevent
          @drop="onDrop($event, index)"
        >
          <template v-if="images[index]">
            <img v-if="images[index].type === 'photo'" :src="images[index].data" class="slot-image" />
            <span v-else class="slot-emoji">{{ images[index].data }}</span>
            <button class="replace-hint">點擊替換</button>
          </template>
          <template v-else>
            <span class="slot-plus">+</span>
          </template>
        </div>
      </div>

      <div v-if="currentSlot !== null" class="source-panel">
        <p class="source-hint">{{ images[currentSlot] ? '替換圖案' : '選擇圖案來源' }}</p>
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

      <div v-if="savedPhotos.length > 0" class="saved-photos-section">
        <div class="saved-photos-header">
          <p class="source-hint">已儲存的照片（可拖拉到上方格子替換）</p>
          <div class="saved-photos-actions">
            <button class="add-photo-btn" @click="openUpload">+ 上傳照片</button>
            <button class="random-btn" @click="randomDeploy">🎲 隨機部署</button>
            <button class="clear-all-btn" @click="clearAllPhotos">清除全部</button>
          </div>
        </div>
        <div class="saved-photos-grid">
          <div
            v-for="(photo, index) in savedPhotos"
            :key="index"
            class="saved-photo-item"
            draggable="true"
            @dragstart="onDragStart($event, photo)"
            @click="useSavedPhoto(photo)"
          >
            <img :src="photo.data" class="saved-photo-img" />
            <button class="saved-photo-delete" @click.stop="deleteSavedPhoto(index)">×</button>
          </div>
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
      multiple
      style="display:none"
      @change="handleCameraCapture"
    />
    <input
      ref="uploadInput"
      type="file"
      accept="image/*"
      multiple
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
import { ref, computed, reactive, onMounted } from 'vue'

const props = defineProps({
  setup: Object
})

const emit = defineEmits(['start', 'back'])

const cameraInput = ref(null)
const uploadInput = ref(null)
const currentSlot = ref(null)
const showEmojiPicker = ref(false)
const activeCategory = ref('faces')
const savedPhotos = ref([])

const images = reactive({})

const defaultEmojis = ['🐶', '🐱', '🐰', '🦊', '🐼', '🦁', '🐸', '🐵', '🍎', '🏀']

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

onMounted(() => {
  loadSavedPhotos()
  initDefaultImages()
})

function initDefaultImages() {
  const shuffled = [...defaultEmojis].sort(() => Math.random() - 0.5)
  for (let i = 0; i < props.setup.pairs; i++) {
    if (!images[i]) {
      images[i] = { type: 'emoji', data: shuffled[i % shuffled.length] }
    }
  }
}

function loadSavedPhotos() {
  try {
    const saved = localStorage.getItem('memory-game-photos')
    if (saved) {
      savedPhotos.value = JSON.parse(saved)
    }
  } catch (e) {
    savedPhotos.value = []
  }
}

function savePhotosToStorage() {
  try {
    localStorage.setItem('memory-game-photos', JSON.stringify(savedPhotos.value))
  } catch (e) {
    console.warn('儲存照片失敗，可能已超過儲存空間')
  }
}

const filledCount = computed(() => {
  return Object.values(images).filter(Boolean).length
})

const allFilled = computed(() => {
  return filledCount.value === props.setup.pairs
})

function selectSlot(index) {
  if (currentSlot.value === index) {
    currentSlot.value = null
  } else {
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

function processImage(file) {
  return new Promise((resolve) => {
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

        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

async function handleCameraCapture(e) {
  const files = Array.from(e.target.files)
  if (files.length === 0) return

  for (const file of files) {
    const data = await processImage(file)
    addToSavedPhotos(data)

    if (currentSlot.value !== null && !images[currentSlot.value]) {
      images[currentSlot.value] = { type: 'photo', data }
      moveToNextSlot()
    }
  }
}

async function handleFileUpload(e) {
  const files = Array.from(e.target.files)
  if (files.length === 0) return

  for (const file of files) {
    const data = await processImage(file)
    addToSavedPhotos(data)

    if (currentSlot.value !== null && !images[currentSlot.value]) {
      images[currentSlot.value] = { type: 'photo', data }
      moveToNextSlot()
    }
  }
}

function addToSavedPhotos(data) {
  const exists = savedPhotos.value.some(p => p.data === data)
  if (!exists) {
    savedPhotos.value.unshift({ data })
    if (savedPhotos.value.length > 20) {
      savedPhotos.value = savedPhotos.value.slice(0, 20)
    }
    savePhotosToStorage()
  }
}

function useSavedPhoto(photo) {
  let slotIndex = currentSlot.value
  if (slotIndex === null) {
    slotIndex = findNextEmptySlot()
    if (slotIndex === null) {
      slotIndex = 0
    }
    currentSlot.value = slotIndex
  }
  images[slotIndex] = { type: 'photo', data: photo.data }
  moveToNextSlot()
}

function onDragStart(e, photo) {
  e.dataTransfer.setData('photoData', photo.data)
}

function onDrop(e, slotIndex) {
  const photoData = e.dataTransfer.getData('photoData')
  if (photoData) {
    images[slotIndex] = { type: 'photo', data: photoData }
  }
}

function deleteSavedPhoto(index) {
  savedPhotos.value.splice(index, 1)
  savePhotosToStorage()
}

function clearAllPhotos() {
  if (confirm('確定要清除所有已儲存的照片嗎？')) {
    savedPhotos.value = []
    savePhotosToStorage()
  }
}

function randomDeploy() {
  const emptySlots = []
  for (let i = 0; i < props.setup.pairs; i++) {
    if (!images[i]) emptySlots.push(i)
  }
  if (emptySlots.length === 0 || savedPhotos.value.length === 0) return

  const shuffledSlots = emptySlots.sort(() => Math.random() - 0.5)
  const shuffledPhotos = [...savedPhotos.value].sort(() => Math.random() - 0.5)

  const count = Math.min(shuffledSlots.length, shuffledPhotos.length)
  for (let i = 0; i < count; i++) {
    images[shuffledSlots[i]] = { type: 'photo', data: shuffledPhotos[i].data }
  }
}

function selectEmoji(emoji) {
  images[currentSlot.value] = { type: 'emoji', data: emoji }
  showEmojiPicker.value = false
  moveToNextSlot()
}

function findNextEmptySlot() {
  for (let i = 0; i < props.setup.pairs; i++) {
    if (!images[i]) return i
  }
  return null
}

function moveToNextSlot() {
  const next = findNextEmptySlot()
  currentSlot.value = next
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
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]]
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

.replace-hint {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 8px;
  font-size: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.slot:hover .replace-hint, .slot.active .replace-hint {
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

.saved-photos-section {
  margin-top: 8px;
}

.saved-photos-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.saved-photos-header .source-hint {
  margin-bottom: 0;
  text-align: left;
}

.saved-photos-actions {
  display: flex;
  gap: 8px;
}

.add-photo-btn {
  padding: 6px 12px;
  font-size: 12px;
  color: var(--success);
  background: rgba(0, 184, 148, 0.1);
  border-radius: 8px;
  white-space: nowrap;
}

.random-btn {
  padding: 6px 12px;
  font-size: 12px;
  color: var(--primary-light);
  background: rgba(108, 92, 231, 0.15);
  border-radius: 8px;
  white-space: nowrap;
}

.clear-all-btn {
  padding: 6px 12px;
  font-size: 12px;
  color: var(--danger);
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  white-space: nowrap;
}

.saved-photos-grid {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.saved-photos-grid::-webkit-scrollbar {
  height: 4px;
}

.saved-photos-grid::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 2px;
}

.saved-photo-item {
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.saved-photo-item:active {
  transform: scale(0.95);
  border-color: var(--primary);
}

.saved-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.saved-photo-delete {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 107, 107, 0.9);
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.saved-photo-item:hover .saved-photo-delete {
  opacity: 1;
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
