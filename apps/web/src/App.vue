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

// Add theme customization
const themes = {
  dark: {
    name: 'dark',
    icon: '🌙'
  },
  light: {
    name: 'light',
    icon: '☀️'
  }
}

const currentTheme = ref(themes.dark)

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === themes.dark ? themes.light : themes.dark
}

// Add container width control
const containerWidth = ref('1200px')
</script>

<template>
  <div class="app-container" :class="currentTheme.name">
    <!-- Header Section -->
    <header class="app-header glass">
      <div class="container">
        <div class="header-content">
          <h1 class="app-title text-gradient">
            <span class="app-icon">🍿</span>
            Popcorn Scrum
          </h1>
          <p class="app-subtitle">Make your daily standups fun and efficient</p>
          <button 
            class="theme-toggle" 
            @click="toggleTheme"
            :aria-label="`Switch to ${currentTheme === themes.dark ? 'light' : 'dark'} theme`"
          >
            {{ currentTheme.icon }}
          </button>
        </div>
      </div>
    </header>
    
    <main class="popcornApp">
      <div class="container">
        <!-- Progress Bar -->
        <div class="progress-wrapper glass">
          <div class="progress-container">
            <div 
              class="progress-bar" 
              :style="{ width: `${(completedCards.length / filteredCards.length) * 100}%` }"
              :aria-valuenow="completedCards.length"
              :aria-valuemin="0"
              :aria-valuemax="filteredCards.length"
            >
              <span class="progress-text">
                {{ completedCards.length }}/{{ filteredCards.length }} Updates
              </span>
            </div>
          </div>
        </div>

        <!-- Timer Section -->
        <section class="timer-section glass" aria-label="Timer Controls">
          <div 
            class="timer" 
            :class="{ 'timer-running': isRunning }"
            role="timer"
            aria-label="Standup Timer"
          >
            {{ time }}
          </div>
          <div class="timer-controls" role="group" aria-label="Timer Controls">
            <button 
              class="btn" 
              :class="[
                isRunning ? 'btn-danger pulse' : 'btn-primary',
                { 'btn-disabled': allCompleted }
              ]"
              @click="isRunning ? clickStopTimer() : clickStartTimer()"
              :disabled="allCompleted"
            >
              <span class="btn-icon" aria-hidden="true">
                {{ isRunning ? '⏹' : '▶' }}
              </span>
              <span class="btn-text">{{ isRunning ? 'Stop Timer' : 'Start Timer' }}</span>
            </button>
            <button 
              class="btn btn-secondary" 
              @click="shuffleCards"
              :disabled="allCompleted"
              :class="{ 'btn-disabled': allCompleted }"
            >
              <span class="btn-icon" aria-hidden="true">⏭</span>
              <span class="btn-text">Next Speaker</span>
            </button>
            <button 
              class="btn btn-warning" 
              @click="resetAll"
            >
              <span class="btn-icon" aria-hidden="true">🔄</span>
              <span class="btn-text">Reset All</span>
            </button>
          </div>
        </section>

        <div class="content-grid">
          <!-- Scrum Questions Section -->
          <section class="scrum-questions" aria-label="Scrum Questions">
            <div class="question-card glass" v-for="(question, index) in [
              'What did you do yesterday?',
              'What are you working on today?',
              'Any blockers?'
            ]" :key="index">
              <span class="question-number">{{ index + 1 }}</span>
              <div class="question">{{ question }}</div>
            </div>
          </section>

          <!-- Active Card Section -->
          <section 
            class="active-card-section glass" 
            :class="{ 'all-done': allCompleted }"
            aria-live="polite"
          >
            <h2 class="section-title">
              Current Speaker
              <div class="card-count-wrapper">
                <span class="card-count" role="status">{{ totalCardsText }}</span>
              </div>
            </h2>
            <div class="active-card-container">
              <transition name="card-fade">
                <div 
                  v-if="activeCard" 
                  class="card-wrapper active"
                  @click="completeCard(activeCard)"
                  role="button"
                  tabindex="0"
                >
                  <div class="card-content">
                    <div class="card-title">{{ activeCard.title }}</div>
                    <div class="card-action">Click to mark as done</div>
                  </div>
                </div>
                <div v-else class="no-active-card">
                  <span class="celebration" role="img" aria-label="celebration">🎉</span>
                  <div class="message">All team members have spoken!</div>
                  <div class="sub-message">Click Reset All to start a new round</div>
                </div>
              </transition>
            </div>
          </section>
        </div>
        
        <!-- Completed Cards Section -->
        <section 
          v-if="completedCards.length > 0" 
          class="completed-cards-section"
          aria-label="Completed Updates"
        >
          <transition name="fade">
            <div>
              <h3 class="section-title">
                <span class="section-icon" aria-hidden="true">✅</span>
                Completed Updates
              </h3>
              <div class="cards-grid">
                <transition-group name="card-list">
                  <div 
                    v-for="card in completedCards" 
                    :key="card.id"
                    class="card-wrapper completed glass"
                    role="listitem"
                  >
                    <div class="card-content">
                      <div class="card-title">{{ card.title }}</div>
                      <div class="completion-time">
                        {{ new Date(card.updatedAt).toLocaleTimeString() }}
                      </div>
                    </div>
                  </div>
                </transition-group>
              </div>
            </div>
          </transition>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Layout & Container Styles */
.container {
  width: 100%;
  max-width: v-bind(containerWidth);
  margin: 0 auto;
  padding: var(--spacing-4) var(--spacing-6);
}

@media (min-width: 768px) {
  .container {
    padding: var(--spacing-6) var(--spacing-8);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-8) var(--spacing-12);
  }
}

/* Header Styles */
.app-header {
  padding: var(--spacing-12) 0;
  margin-bottom: var(--spacing-12);
  background: linear-gradient(
    to bottom,
    var(--bg-secondary),
    rgba(30, 41, 59, 0.8)
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.app-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at top right,
    rgba(99, 102, 241, 0.1),
    transparent 50%
  );
}

.header-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.app-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
}

.app-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
}

/* Progress Bar Styles */
.progress-wrapper {
  padding: var(--spacing-6);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-8);
  background: linear-gradient(
    to right,
    rgba(99, 102, 241, 0.05),
    rgba(139, 92, 246, 0.05)
  );
}

.progress-container {
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--bg-tertiary);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary-gradient);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Timer Section Styles */
.timer-section {
  padding: var(--spacing-12);
  margin: var(--spacing-12) 0;
  border-radius: var(--radius-2xl);
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.1),
    rgba(139, 92, 246, 0.1)
  );
  box-shadow: var(--shadow-lg);
}

.timer {
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 800;
  margin-bottom: var(--spacing-8);
  text-align: center;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  text-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
}

.timer-controls {
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 var(--spacing-4);
}

/* Question Cards Styles */
.scrum-questions {
  display: grid;
  gap: var(--spacing-6);
  margin: var(--spacing-12) 0;
}

.question-card {
  padding: var(--spacing-6);
  border-radius: var(--radius-xl);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  transition: transform 0.3s ease;
}

.question-card:hover {
  transform: translateY(-2px);
}

.question-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

/* Active Card Section */
.active-card-section {
  padding: var(--spacing-8);
  border-radius: var(--radius-2xl);
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.05),
    rgba(139, 92, 246, 0.05)
  );
}

.section-title {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-count-wrapper {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-full);
}

/* Completed Cards Section */
.completed-cards-section {
  margin-top: var(--spacing-12);
  padding: var(--spacing-8);
  border-radius: var(--radius-2xl);
  background: var(--bg-secondary);
}

.cards-grid {
  display: grid;
  gap: var(--spacing-6);
  margin-top: var(--spacing-6);
}

@media (min-width: 640px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Button Styles */
.btn {
  padding: var(--spacing-4) var(--spacing-8);
  min-width: 160px;
  font-size: var(--font-size-base);
  font-weight: 600;
  letter-spacing: 0.025em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn:active {
  transform: translateY(0);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .timer-section {
    padding: var(--spacing-6);
  }

  .timer-controls {
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .btn {
    width: 100%;
    min-width: unset;
  }

  .section-title {
    flex-direction: column;
    gap: var(--spacing-4);
    text-align: center;
  }
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.app-icon {
  animation: float 3s ease-in-out infinite;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .app-icon {
    animation: none;
  }
}
</style> 