<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import axios from 'axios'
import { io } from 'socket.io-client'
import type { Card } from '@popcorn/shared'

const socket = io()
const time = ref('00:00')
const totalCardsText = ref('')
const filteredCards = ref<Card[]>([])
const isRunning = ref(false)
let timerInterval: NodeJS.Timer | null = null
let startTime: number | null = null
const theme = ref('dark')
const isMobile = ref(window.innerWidth < 768)

const fetchCards = async () => {
  try {
    const response = await axios.get<Card[]>('/api/get')
    filteredCards.value = response.data
    updateTotalCards()

    const allCompleted = filteredCards.value.every(card => card.completed)
    if (allCompleted && isRunning.value) {
      await clickStopTimer()
      time.value = '00:00'
    }
  } catch (error) {
    console.error('Error fetching cards:', error)
  }
}

const updateTotalCards = () => {
  const total = filteredCards.value.length
  const remaining = filteredCards.value.filter(card => !card.completed).length
  totalCardsText.value = ` (${remaining}/${total})`
}

const clickStartTimer = async () => {
  try {
    await axios.post('/api/timer', { isTiming: true })
    startTimer()
  } catch (error) {
    console.error('Error starting timer:', error)
  }
}

const clickStopTimer = async () => {
  try {
    await axios.post('/api/timer', { isTiming: false })
    stopTimer()
  } catch (error) {
    console.error('Error stopping timer:', error)
  }
}

const startTimer = () => {
  if (!isRunning.value) {
    isRunning.value = true
    startTime = Date.now()
    timerInterval = setInterval(updateTimer, 1000)
  }
}

const stopTimer = () => {
  if (isRunning.value) {
    isRunning.value = false
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
}

const updateTimer = () => {
  if (!startTime) return
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  time.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const shuffleCards = async () => {
  try {
    if (isRunning.value) {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 1000);
    }

    await axios.post('/api/shuffle')
    await fetchCards()

    const allCompleted = filteredCards.value.every(card => card.completed)
    if (allCompleted && isRunning.value) {
      await clickStopTimer()
    }
    
    time.value = '00:00'
  } catch (error) {
    console.error('Error shuffling cards:', error)
  }
}

const completeCard = async (card: Card) => {
  if (!card.isActive) return
  try {
    await axios.put(`/api/update/${card.id}`, {
      completed: true,
      title: card.title
    })
    await fetchCards()
  } catch (error) {
    console.error('Error updating card:', error)
  }
}

const resetAll = async () => {
  try {
    // Always stop and reset timer first
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isRunning.value = false;
    startTime = null;
    time.value = '00:00';
    
    // Notify server that timer is stopped
    await axios.post('/api/timer', { isTiming: false });
    
    // Reset all cards to uncompleted
    const promises = filteredCards.value.map(card => 
      axios.put(`/api/update/${card.id}`, {
        completed: false,
        title: card.title
      })
    );
    await Promise.all(promises);
    await fetchCards();
  } catch (error) {
    console.error('Error resetting:', error);
  }
};

// Add computed properties for active and completed cards
const activeCard = computed(() => 
  filteredCards.value.find(card => card.isActive)
)

const completedCards = computed(() => 
  filteredCards.value.filter(card => card.completed)
)

// Add computed property for all completed state
const allCompleted = computed(() => 
  filteredCards.value.every(card => card.completed)
)

onMounted(() => {
  fetchCards()
  
  socket.on('cards:refresh', (cards: Card[]) => {
    filteredCards.value = cards
    updateTotalCards()
  })
  
  socket.on('timer:start', () => {
    startTimer()
  })
  
  socket.on('timer:stop', () => {
    stopTimer()
  })
  
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
})

onBeforeUnmount(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  socket.off('cards:refresh')
  socket.off('timer:start')
  socket.off('timer:stop')
  window.removeEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
})
</script>

<template>
  <div class="app-container" :class="theme">
    <header class="app-header">
      <h1 class="app-title">Popcorn Scrum</h1>
    </header>
    
    <div class="popcornApp">
      <div class="scrum-questions">
        <div class="question">What did you do yesterday?</div>
        <div class="question">What are you working on today?</div>
        <div class="question">Any blockers?</div>
      </div>

      <!-- Active Card Section -->
      <div class="active-card-section">
        <h2>Current Speaker <span class="card-count">{{ totalCardsText }}</span></h2>
        <div class="active-card-container">
          <div 
            v-if="activeCard"
            class="card-wrapper active"
          >
            <div class="card-content">
              <div class="card-title">{{ activeCard.title }}</div>
            </div>
          </div>
          <div v-else class="no-active-card">
            All team members have spoken
          </div>
        </div>
      </div>

      <div class="timer-container">
        <div class="timer">{{ time }}</div>
        <div class="timer-controls">
          <button 
            class="btn" 
            :class="[
              isRunning ? 'btn-danger' : 'btn-primary',
              { 'btn-disabled': allCompleted }
            ]"
            @click="isRunning ? clickStopTimer() : clickStartTimer()"
            :disabled="allCompleted"
          >
            {{ isRunning ? 'Stop Timer' : 'Start Timer' }}
          </button>
          <button 
            class="btn btn-secondary" 
            @click="shuffleCards"
            :disabled="allCompleted"
            :class="{ 'btn-disabled': allCompleted }"
          >
            Next Speaker
          </button>
          <button class="btn btn-warning" @click="resetAll">
            Reset All
          </button>
        </div>
      </div>
      
      <!-- Completed Cards Section -->
      <div class="completed-cards-section" v-if="completedCards.length > 0">
        <h3>Completed Updates</h3>
        <div class="cards-grid">
          <div 
            v-for="card in completedCards" 
            :key="card.id"
            class="card-wrapper completed"
          >
            <div class="card-content">
              <div class="card-title">{{ card.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --accent-primary: #646cff;
  --accent-secondary: #535bf2;
  --danger: #ff4444;
  --warning: #ffbb33;
  --success: #00C851;
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition-speed: 0.3s;
}

body {
  margin: 0;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
}

.app-container {
  min-height: 100vh;
  padding: 2rem;
}

.timer-container {
  text-align: center;
  margin-bottom: 3rem;
}

.timer {
  font-size: 4rem;
  font-weight: bold;
  color: var(--accent-primary);
  text-shadow: 0 0 10px rgba(100, 108, 255, 0.3);
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-speed);
  margin: 0 0.5rem;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.cards-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.card-count {
  color: var(--text-secondary);
  font-size: 1rem;
}

.scrum-questions {
  margin: 2rem auto;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  max-width: 800px;
  text-align: center;
}

.question {
  color: var(--text-secondary);
  margin: 0.75rem 0;
  font-size: 1.1rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card-wrapper {
  position: relative;
  transition: all var(--transition-speed);
}

.card-content {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 500;
}

.active .card-content {
  background: var(--accent-primary);
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(100, 108, 255, 0.2);
}

.completed .card-content {
  opacity: 0.7;
  background: var(--bg-secondary);
}

.inactive .card-content {
  opacity: 0.7;
}

.app-header {
  text-align: center;
  padding: 2rem 0;
  background: var(--bg-secondary);
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--accent-primary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(100, 108, 255, 0.3);
}

.btn-warning {
  background: var(--warning);
  color: var(--bg-primary);
  font-weight: bold;
}

.btn-warning:hover {
  background: darken(var(--warning), 10%);
  transform: translateY(-1px);
}

.active-card-section {
  text-align: center;
  margin: 2rem 0 3rem;
  padding: 1rem;
}

.active-card-container {
  max-width: 600px;
  margin: 1rem auto;
}

.no-active-card {
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  color: var(--text-secondary);
  font-style: italic;
}

.completed-cards-section {
  margin-top: 3rem;
  padding: 1rem;
}

.completed-cards-section h3 {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }

  .timer {
    font-size: 3rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .btn {
    width: 100%;
    margin: 0.5rem 0;
  }

  .app-header {
    padding: 1rem 0;
  }

  .app-title {
    font-size: 2rem;
  }

  .timer-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
    margin: 0;
  }

  .active-card-section {
    margin: 1rem 0 2rem;
  }

  .scrum-questions {
    margin: 1rem auto;
    padding: 1rem;
  }

  .question {
    font-size: 1rem;
  }
}
</style> 