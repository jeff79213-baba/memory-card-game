<template>
  <div class="screen home-screen">
    <div class="bg-particles">
      <div v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>

    <div class="logo-area">
      <div class="logo-cards">
        <div class="logo-card logo-card-1">🃏</div>
        <div class="logo-card logo-card-2">🎴</div>
        <div class="logo-card logo-card-3">🀄</div>
      </div>
      <h1 class="game-title">記憶考驗翻翻樂</h1>
      <p class="game-subtitle">用你的照片，玩翻牌記憶遊戲</p>
    </div>

    <div class="features">
      <div class="feature">
        <span class="feature-icon">📷</span>
        <span>拍照上傳</span>
      </div>
      <div class="feature">
        <span class="feature-icon">👥</span>
        <span>2~12人對戰</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🎯</span>
        <span>自選圖案</span>
      </div>
    </div>

    <button class="start-btn" @click="$emit('start')">
      <span>開始遊戲</span>
      <span class="btn-arrow">→</span>
    </button>
  </div>
</template>

<script setup>
defineEmits(['start'])

function particleStyle(i) {
  const size = Math.random() * 6 + 2
  return {
    width: size + 'px',
    height: size + 'px',
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDelay: Math.random() * 5 + 's',
    animationDuration: (Math.random() * 3 + 3) + 's'
  }
}
</script>

<style scoped>
.home-screen {
  background: linear-gradient(180deg, #0A0A23 0%, #1A1A4E 50%, #2D1B69 100%);
  justify-content: center;
  gap: 40px;
  position: relative;
}

.bg-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: rgba(162, 155, 254, 0.4);
  border-radius: 50%;
  animation: sparkle 4s ease-in-out infinite;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: fadeIn 0.8s ease;
}

.logo-cards {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.logo-card {
  font-size: 40px;
  width: 60px;
  height: 80px;
  background: var(--bg-card);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  border: 2px solid rgba(162, 155, 254, 0.3);
}

.logo-card-1 {
  transform: rotate(-10deg);
  animation: bounce 2s ease-in-out infinite;
}

.logo-card-2 {
  animation: bounce 2s ease-in-out infinite 0.3s;
}

.logo-card-3 {
  transform: rotate(10deg);
  animation: bounce 2s ease-in-out infinite 0.6s;
}

.game-title {
  font-size: 36px;
  font-weight: 900;
  background: linear-gradient(135deg, #A29BFE 0%, #FD79A8 50%, #FDCB6E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  letter-spacing: 4px;
}

.game-subtitle {
  font-size: 16px;
  color: var(--text-muted);
  text-align: center;
}

.features {
  display: flex;
  gap: 24px;
  animation: fadeIn 0.8s ease 0.2s both;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.feature-icon {
  font-size: 28px;
  width: 56px;
  height: 56px;
  background: var(--bg-card);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(162, 155, 254, 0.2);
}

.start-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 48px;
  font-size: 20px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%);
  border-radius: 60px;
  box-shadow: 0 8px 30px rgba(108, 92, 231, 0.4);
  animation: pulse 2s ease-in-out infinite, fadeIn 0.8s ease 0.4s both;
}

.start-btn:hover {
  box-shadow: 0 12px 40px rgba(108, 92, 231, 0.6);
}

.btn-arrow {
  font-size: 24px;
  transition: transform 0.2s ease;
}

.start-btn:active .btn-arrow {
  transform: translateX(4px);
}
</style>
