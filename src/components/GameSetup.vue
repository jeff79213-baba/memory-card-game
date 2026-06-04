<template>
  <div class="screen setup-screen">
    <div class="header">
      <button class="back-btn" @click="$emit('back')">←</button>
      <h2>遊戲設定</h2>
      <div style="width:40px"></div>
    </div>

    <div class="setup-content">
      <div class="setup-section">
        <h3>選擇卡片組數</h3>
        <p class="hint">每組 2 張相同卡片</p>
        <div class="pair-selector">
          <button class="minus-btn" @click="pairs = Math.max(2, pairs - 1)">−</button>
          <div class="pair-display">
            <span class="pair-number">{{ pairs }}</span>
            <span class="pair-label">組</span>
          </div>
          <button class="plus-btn" @click="pairs = Math.min(8, pairs + 1)">+</button>
        </div>
        <div class="card-info">
          共 <strong>{{ pairs * 2 }}</strong> 張卡片，需要 <strong>{{ pairs }}</strong> 個圖案
        </div>
      </div>

      <div class="setup-section">
        <h3>選擇玩家人數</h3>
        <div class="player-count-grid">
          <button
            v-for="n in 11"
            :key="n + 1"
            :class="['count-btn', { active: playerCount === n + 1 }]"
            @click="playerCount = n + 1"
          >
            {{ n + 1 }}
          </button>
        </div>
      </div>

      <div class="setup-section">
        <h3>玩家名稱</h3>
        <div class="players-input">
          <div
            v-for="(player, index) in players"
            :key="index"
            class="player-input-row"
          >
            <span class="player-avatar" :style="{ background: playerColors[index] }">
              {{ playerNames[index] || (index + 1) }}
            </span>
            <input
              v-model="playerNames[index]"
              :placeholder="'玩家 ' + (index + 1)"
              class="player-name-input"
              maxlength="8"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <button class="next-btn" @click="goNext">
        <span>下一步：製作卡片</span>
        <span class="btn-arrow">→</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['start', 'back'])

const pairs = ref(5)
const playerCount = ref(2)
const playerNames = ref(['', ''])

const playerColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
]

const players = computed(() => {
  return Array.from({ length: playerCount.value }, (_, i) => ({
    name: playerNames.value[i] || ('玩家 ' + (i + 1)),
    color: playerColors[i]
  }))
})

watch(playerCount, (newCount) => {
  while (playerNames.value.length < newCount) {
    playerNames.value.push('')
  }
  playerNames.value = playerNames.value.slice(0, newCount)
})

function goNext() {
  const setup = {
    pairs: pairs.value,
    players: players.value.map((p, i) => ({
      name: p.name || ('玩家 ' + (i + 1)),
      color: p.color,
      score: 0
    }))
  }
  emit('start', setup)
}
</script>

<style scoped>
.setup-screen {
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

.setup-content {
  flex: 1;
  width: 100%;
  max-width: 500px;
  padding: 24px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.setup-section h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.hint {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.pair-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;
}

.minus-btn, .plus-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-card);
  color: white;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(162, 155, 254, 0.3);
}

.minus-btn:active, .plus-btn:active {
  background: var(--primary);
}

.pair-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.pair-number {
  font-size: 56px;
  font-weight: 900;
  background: linear-gradient(135deg, #A29BFE, #FD79A8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pair-label {
  font-size: 20px;
  color: var(--text-muted);
}

.card-info {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
}

.card-info strong {
  color: var(--primary-light);
}

.player-count-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

.count-btn {
  aspect-ratio: 1;
  border-radius: 12px;
  background: var(--bg-card);
  color: white;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
}

.count-btn.active {
  background: var(--primary);
  border-color: var(--primary-light);
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.4);
}

.players-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.player-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.player-name-input {
  flex: 1;
  height: 44px;
  background: var(--bg-card);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 16px;
  color: white;
  font-size: 16px;
  transition: border-color 0.2s;
}

.player-name-input:focus {
  border-color: var(--primary);
}

.player-name-input::placeholder {
  color: var(--text-muted);
}

.bottom-bar {
  width: 100%;
  padding: 16px 20px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
}

.next-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%);
  border-radius: 60px;
  box-shadow: 0 8px 30px rgba(108, 92, 231, 0.4);
}

.btn-arrow {
  font-size: 20px;
}
</style>
