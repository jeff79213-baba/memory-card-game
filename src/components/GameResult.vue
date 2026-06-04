<template>
  <div class="screen result-screen">
    <div class="confetti-container">
      <div v-for="i in 30" :key="i" class="confetti" :style="confettiStyle(i)"></div>
    </div>

    <div class="result-content">
      <div class="trophy-area">
        <div class="trophy">🏆</div>
        <h1 class="winner-name">{{ winner.name }}</h1>
        <p class="winner-text">獲得勝利！</p>
      </div>

      <div class="podium">
        <div v-if="players.length > 2" class="podium-item second">
          <div class="podium-avatar" :style="{ background: sortedPlayers[1].color }">
            {{ sortedPlayers[1].name.charAt(0) }}
          </div>
          <div class="podium-name">{{ sortedPlayers[1].name }}</div>
          <div class="podium-score">{{ sortedPlayers[1].score }} 分</div>
          <div class="podium-bar bar-2"></div>
          <div class="podium-rank">🥈</div>
        </div>

        <div class="podium-item first">
          <div class="podium-avatar" :style="{ background: winner.color }">
            {{ winner.name.charAt(0) }}
          </div>
          <div class="podium-name">{{ winner.name }}</div>
          <div class="podium-score">{{ winner.score }} 分</div>
          <div class="podium-bar bar-1"></div>
          <div class="podium-rank">🥇</div>
        </div>

        <div v-if="players.length > 1" class="podium-item third">
          <div class="podium-avatar" :style="{ background: sortedPlayers[2].color }">
            {{ sortedPlayers[2].name.charAt(0) }}
          </div>
          <div class="podium-name">{{ sortedPlayers[2].name }}</div>
          <div class="podium-score">{{ sortedPlayers[2].score }} 分</div>
          <div class="podium-bar bar-3"></div>
          <div class="podium-rank">🥉</div>
        </div>
      </div>

      <div v-if="players.length > 3" class="other-players">
        <div
          v-for="(player, index) in sortedPlayers.slice(3)"
          :key="player.name"
          class="other-player"
        >
          <span class="other-rank">#{{ index + 4 }}</span>
          <span class="other-avatar" :style="{ background: player.color }">
            {{ player.name.charAt(0) }}
          </span>
          <span class="other-name">{{ player.name }}</span>
          <span class="other-score">{{ player.score }} 分</span>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn play-again" @click="$emit('restart')">
          🔄 再來一局
        </button>
        <button class="action-btn back-home" @click="$emit('home')">
          🏠 回首頁
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  players: Array
})

defineEmits(['restart', 'home'])

const sortedPlayers = computed(() => {
  return [...props.players].sort((a, b) => b.score - a.score)
})

const winner = computed(() => {
  return sortedPlayers.value[0]
})

function confettiStyle(i) {
  const colors = ['#FF6B6B', '#4ECDC4', '#FDCB6E', '#A29BFE', '#FD79A8', '#00CEC9']
  return {
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 2 + 's',
    animationDuration: (Math.random() * 2 + 2) + 's',
    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    width: (Math.random() * 8 + 4) + 'px',
    height: (Math.random() * 8 + 4) + 'px'
  }
}
</script>

<style scoped>
.result-screen {
  background: linear-gradient(180deg, #0A0A23 0%, #1A1A4E 50%, #2D1B69 100%);
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.confetti-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  top: -20px;
  border-radius: 2px;
  animation: confettiFall linear infinite;
  opacity: 0.8;
}

@keyframes confettiFall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 20px;
  z-index: 1;
  animation: fadeIn 0.8s ease;
}

.trophy-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.trophy {
  font-size: 72px;
  animation: bounce 1.5s ease-in-out infinite;
}

.winner-name {
  font-size: 32px;
  font-weight: 900;
  background: linear-gradient(135deg, #FDCB6E, #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.winner-text {
  font-size: 18px;
  color: var(--text-muted);
}

.podium {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  animation: slideUp 0.5s ease both;
}

.podium-item.first { animation-delay: 0.3s; }
.podium-item.second { animation-delay: 0.1s; }
.podium-item.third { animation-delay: 0.2s; }

.podium-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.first .podium-avatar {
  width: 64px;
  height: 64px;
  font-size: 24px;
  border-color: gold;
}

.podium-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.podium-score {
  font-size: 12px;
  color: var(--text-muted);
}

.podium-bar {
  width: 100px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
}

.bar-1 {
  height: 100px;
  background: linear-gradient(180deg, #FFD700, #FFA500);
}

.bar-2 {
  height: 75px;
  background: linear-gradient(180deg, #C0C0C0, #A0A0A0);
}

.bar-3 {
  height: 55px;
  background: linear-gradient(180deg, #CD7F32, #8B4513);
}

.podium-rank {
  font-size: 24px;
  margin-top: 4px;
}

.other-players {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.other-player {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: var(--bg-card);
  border-radius: 12px;
}

.other-rank {
  font-size: 13px;
  color: var(--text-muted);
  width: 28px;
}

.other-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.other-name {
  flex: 1;
  font-size: 14px;
}

.other-score {
  font-size: 14px;
  font-weight: 700;
  color: var(--warning);
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 10px;
}

.action-btn {
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 700;
  color: white;
  border-radius: 16px;
}

.play-again {
  background: linear-gradient(135deg, #6C5CE7, #A29BFE);
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.4);
}

.back-home {
  background: var(--bg-card);
  border: 2px solid rgba(255, 255, 255, 0.1);
}
</style>
