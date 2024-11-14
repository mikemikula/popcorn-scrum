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
  max-width: var(--max-width-xl);
  margin: 0 auto;
  padding: var(--spacing-4);
}

/* Header Styles - More Compact */
.app-header {
  padding: var(--spacing-6) 0;
  margin-bottom: var(--spacing-8);
  background: linear-gradient(
    to bottom,
    var(--bg-secondary),
    rgba(30, 41, 59, 0.8)
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

.app-title {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: var(--spacing-2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
}

.app-subtitle {
  font-size: var(--font-size-base);
  opacity: 0.8;
}

/* Progress Bar - More Compact */
.progress-wrapper {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-6);
  background: var(--bg-secondary);
  overflow: hidden;
}

.progress-container {
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--bg-tertiary);
  overflow: hidden;
  position: relative;
}

.progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--primary-gradient);
  transition: width 0.3s ease-in-out;
}

.progress-text {
  position: absolute;
  right: var(--spacing-4);
  top: -1.5rem;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Timer Section - Centered */
.timer-section {
  background: linear-gradient(145deg, var(--bg-secondary), var(--bg-tertiary));
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  margin-bottom: var(--spacing-8);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.timer {
  font-size: clamp(3rem, 8vw, 4.5rem);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: var(--shadow-glow);
  margin-bottom: var(--spacing-6);
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px; /* Add fixed height to prevent jumping */
  width: 100%;
}

.timer-running {
  animation: pulse 2s infinite;
}

/* Button Group - Centered */
.timer-controls {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 0 var(--spacing-4);
  width: 100%;
  max-width: 600px; /* Limit width for better layout */
}

.btn {
  position: relative;
  padding: var(--spacing-3) var(--spacing-6);
  font-weight: 600;
  font-size: var(--font-size-base);
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  transition: all 0.2s ease;
  border: none;
  min-width: 160px;
  justify-content: center;
  letter-spacing: 0.01em;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.2em;
  line-height: 1;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
}

.btn-danger {
  background: linear-gradient(145deg, var(--danger), #ff6b6b);
  color: white;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-warning {
  background: linear-gradient(145deg, var(--warning), #ffd43b);
  color: var(--bg-primary);
  font-weight: 700;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Content Grid - Fix heights and spacing */
.content-grid {
  display: grid;
  gap: var(--spacing-6);
  margin: var(--spacing-8) 0;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-8);
  }
}

/* Scrum Questions Section */
.scrum-questions {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--spacing-4);
  background: var(--bg-secondary);
  padding: var(--spacing-6);
  border-radius: var(--radius-xl);
}

.question-card {
  flex: 1;
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin: 0; /* Remove default margin */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Active Card Section - Match height */
.active-card-section {
  background: linear-gradient(145deg, var(--bg-secondary), var(--bg-tertiary));
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: var(--shadow-lg);
}

.active-card-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
}

/* Card Wrapper Styles */
.card-wrapper {
  width: 100%;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.active .card-wrapper {
  background: var(--primary-gradient);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.no-active-card {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--text-secondary);
}

/* Question Number Style */
.question-number {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  flex-shrink: 0;
}

.question {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .content-grid {
    gap: var(--spacing-4);
  }

  .scrum-questions,
  .active-card-section {
    padding: var(--spacing-4);
  }

  .question-card {
    padding: var(--spacing-3);
  }

  .timer-section {
    padding: var(--spacing-6);
  }

  .timer {
    min-height: 100px; /* Smaller height for mobile */
    font-size: clamp(2.5rem, 6vw, 3.5rem);
  }

  .timer-controls {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    min-width: unset;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: var(--font-size-lg);
  }
}

/* Animations - Smoother */
.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.2s ease;
}

.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Active Card Highlight */
.active .card-wrapper {
  background: var(--primary-gradient);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.active .card-content {
  color: white;
}

/* Completed Card Style */
.completed .card-wrapper {
  background: var(--bg-tertiary);
  opacity: 0.8;
}

/* Completed Cards Section Improvements */
.completed-cards-section {
  margin-top: var(--spacing-12);
  padding: var(--spacing-8);
  border-radius: var(--radius-xl);
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-title {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-6);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.section-icon {
  font-size: 1.2em;
}

.cards-grid {
  display: grid;
  gap: var(--spacing-4);
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.card-wrapper {
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;
}

.card-content {
  padding: var(--spacing-4) var(--spacing-6);
}

.card-title {
  font-size: var(--font-size-base);
  font-weight: 500;
  margin-bottom: var(--spacing-2);
  color: var(--text-primary);
}

.completion-time {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Active Card Improvements */
.active-card-section {
  background: linear-gradient(145deg, var(--bg-secondary), var(--bg-tertiary));
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: var(--shadow-lg);
}

.active .card-wrapper {
  background: var(--primary-gradient);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.active .card-content {
  color: white;
}

.no-active-card {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--text-secondary);
}

.celebration {
  font-size: 3rem;
  margin-bottom: var(--spacing-4);
  display: block;
  animation: bounce 2s infinite;
}

/* Responsive Improvements */
@media (max-width: 768px) {
  .timer-section {
    padding: var(--spacing-6);
  }

  .timer {
    font-size: clamp(2.5rem, 6vw, 3.5rem);
  }

  .timer-controls {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .btn {
    width: 100%;
    min-width: unset;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: var(--font-size-lg);
  }
}

/* Animations */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
</style> 