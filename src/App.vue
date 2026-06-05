<template>
  <div class="app-container">
    <transition :name="transitionName" mode="out-in">
      <HomeScreen
        v-if="screen === 'home'"
        @start="goToSetup"
      />
      <GameSetup
        v-else-if="screen === 'setup'"
        @start="goToCardCreation"
        @back="goHome"
      />
      <CardCreation
        v-else-if="screen === 'cardCreation'"
        :setup="gameSetup"
        @start="startGame"
        @back="goToSetup"
      />
      <GameBoard
        v-else-if="screen === 'playing'"
        :setup="gameSetup"
        :cards="gameCards"
        @end="goToResult"
        @back="goHome"
      />
      <GameResult
        v-else-if="screen === 'result'"
        :players="gamePlayers"
        :gameResult="gameResult"
        @restart="goToSetup"
        @home="goHome"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import HomeScreen from './components/HomeScreen.vue'
import GameSetup from './components/GameSetup.vue'
import CardCreation from './components/CardCreation.vue'
import GameBoard from './components/GameBoard.vue'
import GameResult from './components/GameResult.vue'

const screen = ref('home')
const transitionName = ref('fade')

const gameSetup = reactive({
  pairs: 5,
  gameMode: 'single',
  players: []
})

const gameCards = ref([])
const gamePlayers = ref([])
const gameResult = ref({})

function goHome() {
  transitionName.value = 'fade'
  screen.value = 'home'
}

function goToSetup() {
  transitionName.value = 'slide-left'
  screen.value = 'setup'
}

function goToCardCreation(setup) {
  Object.assign(gameSetup, setup)
  transitionName.value = 'slide-left'
  screen.value = 'cardCreation'
}

function startGame(cards, players) {
  gameCards.value = cards
  gamePlayers.value = JSON.parse(JSON.stringify(players))
  transitionName.value = 'slide-left'
  screen.value = 'playing'
}

function goToResult(result) {
  gamePlayers.value = result.players
  gameResult.value = {
    time: result.time,
    flips: result.flips,
    isSinglePlayer: result.isSinglePlayer
  }
  transitionName.value = 'slide-left'
  screen.value = 'result'
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active, .slide-left-leave-active {
  transition: all 0.3s ease;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
