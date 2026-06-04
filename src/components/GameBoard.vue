<template>
  <div class="screen game-screen">
    <div class="game-header">
      <button class="home-btn" @click="$emit('back')">🏠</button>
      <div class="turn-indicator">
        <span class="turn-avatar" :style="{ background: currentPlayer.color }">
          {{ currentPlayer.name.charAt(0) }}
        </span>
        <span class="turn-name">{{ currentPlayer.name }} 的回合</span>
      </div>
      <div class="timer" v-if="showTimer">{{ formatTime(matchTimer) }}</div>
    </div>

    <div class="scoreboard">
      <div
        v-for="(player, index) in players"
        :key="index"
        :class="['score-item', { active: index === currentPlayerIndex }]"
      >
        <span class="score-avatar" :style="{ background: player.color }">
          {{ player.name.charAt(0) }}
        </span>
        <span class="score-name">{{ player.name }}</span>
        <span class="score-value">{{ player.score }}</span>
      </div>
    </div>

    <div class="board-area">
      <div
        class="card-grid"
        :style="gridStyle"
      >
        <div
          v-for="card in cards"
          :key="card.id"
          :class="['card', {
            flipped: card.flipped || card.matched,
            matched: card.matched,
            'no-pointer': card.matched || isChecking || !canFlip
          }]"
          @click="flipCard(card)"
        >
          <div class="card-inner">
            <div class="card-front">
              <span class="card-back-icon">?</span>
            </div>
            <div class="card-back">
              <img v-if="card.image.type === 'photo'" :src="card.image.data" class="card-image" />
              <span v-else class="card-emoji">{{ card.image.data }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showMessage" class="message-toast" :class="messageType">
        {{ message }}
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showMatchEffect" class="match-effect">
        <div class="match-stars">✨</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  setup: Object,
  cards: Array
})

const emit = defineEmits(['end', 'back'])

const localCards = ref([])
const currentPlayerIndex = ref(0)
const flippedCards = ref([])
const isChecking = ref(false)
const showMessage = ref(false)
const showMatchEffect = ref(false)
const message = ref('')
const messageType = ref('')
const matchTimer = ref(0)
const showTimer = ref(false)
let messageTimeout = null
let timerInterval = null

const players = computed(() => {
  return props.setup.players.map(p => ({ ...p }))
})

const currentPlayer = computed(() => {
  return players.value[currentPlayerIndex.value]
})

const canFlip = computed(() => {
  return flippedCards.value.length < 2 && !isChecking.value
})

const gridStyle = computed(() => {
  const total = localCards.value.length
  let cols
  if (total <= 4) cols = 2
  else if (total <= 6) cols = 3
  else if (total <= 12) cols = 4
  else cols = 4

  return {
    gridTemplateColumns: `repeat(${cols}, 1fr)`
  }
})

onMounted(() => {
  localCards.value = props.cards.map(c => ({
    ...c,
    flipped: false,
    matched: false
  }))

  timerInterval = setInterval(() => {
    matchTimer.value++
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timerInterval)
  clearTimeout(messageTimeout)
})

function flipCard(card) {
  if (card.flipped || card.matched || isChecking.value || flippedCards.value.length >= 2) return
  if (!canFlip.value) return

  card.flipped = true
  flippedCards.value.push(card)

  if (flippedCards.value.length === 2) {
    isChecking.value = true
    checkMatch()
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards.value

  if (card1.pairId === card2.pairId) {
    setTimeout(() => {
      card1.matched = true
      card2.matched = true
      players.value[currentPlayerIndex.value].score++
      showMatchEffect.value = true
      showMessageMsg('配對成功！繼續翻牌', 'success')

      setTimeout(() => {
        showMatchEffect.value = false
      }, 800)

      flippedCards.value = []
      isChecking.value = false

      if (allMatched.value) {
        setTimeout(() => {
          emit('end', players.value)
        }, 1000)
      }
    }, 600)
  } else {
    setTimeout(() => {
      card1.flipped = false
      card2.flipped = false
      showMessageMsg('配對失敗', 'fail')

      setTimeout(() => {
        flippedCards.value = []
        isChecking.value = false
        nextPlayer()
      }, 500)
    }, 1000)
  }
}

function nextPlayer() {
  currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
}

const allMatched = computed(() => {
  return localCards.value.every(c => c.matched)
})

function showMessageMsg(msg, type) {
  clearTimeout(messageTimeout)
  message.value = msg
  messageType.value = type
  showMessage.value = true
  messageTimeout = setTimeout(() => {
    showMessage.value = false
  }, 1500)
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
</script>

<style scoped>
.game-screen {
  background: linear-gradient(180deg, #0A0A23 0%, #151537 100%);
  padding: 0;
  justify-content: flex-start;
}

.game-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
}

.home-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg-card);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.turn-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: var(--bg-card);
  border-radius: 30px;
  animation: pulse 2s ease-in-out infinite;
}

.turn-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.turn-name {
  font-size: 14px;
  font-weight: 600;
}

.timer {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.scoreboard {
  width: 100%;
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.scoreboard::-webkit-scrollbar {
  display: none;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg-card);
  border-radius: 24px;
  border: 2px solid transparent;
  flex-shrink: 0;
  transition: all 0.3s;
}

.score-item.active {
  border-color: var(--primary);
  background: rgba(108, 92, 231, 0.2);
}

.score-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.score-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.score-value {
  font-size: 16px;
  font-weight: 900;
  color: var(--warning);
}

.board-area {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  overflow: hidden;
}

.card-grid {
  display: grid;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  max-height: 100%;
}

.card {
  aspect-ratio: 3 / 4;
  perspective: 1000px;
  cursor: pointer;
}

.card.no-pointer {
  cursor: default;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
  border-radius: 12px;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-front {
  background: var(--card-back);
  border: 2px solid rgba(162, 155, 254, 0.4);
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
}

.card-back-icon {
  font-size: 28px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.8);
}

.card-back {
  background: var(--bg-card);
  transform: rotateY(180deg);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-emoji {
  font-size: 36px;
}

.card.matched .card-inner {
  animation: matchGlow 1s ease;
}

.card.matched .card-back {
  border-color: var(--success);
  box-shadow: 0 0 20px rgba(0, 184, 148, 0.3);
}

.message-toast {
  position: fixed;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 700;
  z-index: 50;
  white-space: nowrap;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.message-toast.success {
  background: linear-gradient(135deg, #00B894, #00CEC9);
  color: white;
}

.message-toast.fail {
  background: linear-gradient(135deg, #FF6B6B, #EE5A24);
  color: white;
}

.match-effect {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 40;
}

.match-stars {
  font-size: 80px;
  animation: bounce 0.8s ease;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-height: 600px) {
  .scoreboard {
    padding: 8px 12px;
  }
  .score-item {
    padding: 6px 10px;
  }
  .card-grid {
    gap: 6px;
  }
}
</style>
