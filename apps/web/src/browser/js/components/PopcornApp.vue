<template>
  <div class="popcornApp">
    <div class="timer-container">
      <div class="timer">{{ time }}</div>
      <div class="timer-controls">
        <button class="btn btn-primary" @click="clickStartTimer" v-if="!isRunning">
          Start Timer
        </button>
        <button class="btn btn-danger" @click="clickStopTimer" v-else>
          Stop Timer
        </button>
        <button class="btn btn-secondary ml-2" @click="shuffleCards">
          Shuffle Cards
        </button>
      </div>
    </div>
    <div class="cards">
      <h1>
        Scrum Deck
        <span id="cards">{{ totalCardsText }}</span>
      </h1>
      <ul class="list-font">
        <li>What did you do yesterday?</li>
        <li>What did you do today?</li>
        <li>Are you blocked on any item?</li>
      </ul>
      <div v-for="card in filteredCards" :key="card.id">
        <div class="row" @click="completeCard(card)" :class="{ complete: !card.first }">
          <div class="col-lg-12">
            <div class="filler-container selectable user-card">
              <div class="font-size">{{ card.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const axios = require('axios');
const socket = require('socket.io-client')();

module.exports = {
  name: 'PopcornApp',
  data() {
    return {
      time: '00:00',
      totalCardsText: '',
      filteredCards: [],
      isRunning: false,
      timerInterval: null,
      startTime: null
    }
  },
  created() {
    this.fetchCards();
    
    // Socket event listeners
    socket.on('cards:refresh', (cards) => {
      this.filteredCards = cards;
      this.updateTotalCards();
    });
    
    socket.on('timer:start', () => {
      this.startTimer();
    });
    
    socket.on('timer:stop', () => {
      this.stopTimer();
    });
  },
  methods: {
    async fetchCards() {
      try {
        const response = await axios.get('/api/get');
        this.filteredCards = response.data;
        this.updateTotalCards();
      } catch (error) {
        console.error('Error fetching cards:', error);
      }
    },
    updateTotalCards() {
      const total = this.filteredCards.length;
      const remaining = this.filteredCards.filter(card => !card.completed).length;
      this.totalCardsText = ` (${remaining}/${total})`;
    },
    clickStartTimer() {
      this.startTimer();
      axios.post('/api/timer', { isTiming: true });
    },
    clickStopTimer() {
      this.stopTimer();
      axios.post('/api/timer', { isTiming: false });
    },
    startTimer() {
      if (!this.isRunning) {
        this.isRunning = true;
        this.startTime = Date.now() - (this.getTimeInSeconds() * 1000);
        this.timerInterval = setInterval(this.updateTimer, 1000);
      }
    },
    stopTimer() {
      if (this.isRunning) {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
    updateTimer() {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      this.time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    getTimeInSeconds() {
      const [minutes, seconds] = this.time.split(':').map(Number);
      return (minutes * 60) + seconds;
    },
    async shuffleCards() {
      try {
        await axios.post('/api/shuffle');
        await this.fetchCards();
      } catch (error) {
        console.error('Error shuffling cards:', error);
      }
    },
    async completeCard(card) {
      try {
        await axios.put(`/api/update/${card.id}`, {
          completed: !card.completed,
          title: card.title
        });
        await this.fetchCards();
      } catch (error) {
        console.error('Error updating card:', error);
      }
    }
  },
  beforeDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    socket.off('cards:refresh');
    socket.off('timer:start');
    socket.off('timer:stop');
  }
}
</script>

<style scoped>
.timer-container {
  margin-bottom: 2rem;
  text-align: center;
}

.timer {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.timer-controls {
  margin-bottom: 1.5rem;
}

.btn {
  margin: 0 0.5rem;
}

.cards {
  max-width: 800px;
  margin: 0 auto;
}

.list-font {
  list-style-type: none;
  padding-left: 0;
  margin: 1.5rem 0;
  color: #666;
}

.user-card {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
}

.complete {
  opacity: 0.5;
  text-decoration: line-through;
}

.filler-container {
  margin: 10px 0;
  padding: 15px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}

.font-size {
  font-size: 1.25rem;
}
</style> 