const Vue = require('vue/dist/vue.js');
const cardsDb = require('../util/cardsDb');
let socket = io();

let filters = {
    all: function (cards) {
        return cards;
    },
    active: function (cards) {
        return cards.filter(function (card) {
            return !card.completed;
        });
    },
    completed: function (cards) {
        return cards.filter(function (card) {
            return card.completed;
        });
    }
};

let app = {
    
    // the root element that will be compiled
    el: '.popcornApp',
    
    // app initial state
    data: {
        cards: [],
        visibility: 'all',
        totalCardsText: '',
        currentDate: '',
        timer: '',
        time: '0',
        allCardsComplete: false
    },
    
    created() {
        this.socket = io();
        let self = this;
        this.socket.on('cardsRefresh', function (cards) {
            self.updateCards(cards);
        });
        this.socket.on('manageTimer', function (timerOn) {
            if(timerOn) {
                self.startTimer();
            } else {
                self.stopTimer();
            }
        });
        cardsDb.fetch((err, cards) => {});
    },
    
    computed: {
        filteredCards: function () {
            let totalCards = this.cards.length;
            let totalCardsComplete = filters.completed(this.cards).length;
            
            this.totalCardsText = '(' + totalCardsComplete + '/' + totalCards + ')';
            
            this.allCardsComplete = (totalCards === totalCardsComplete);
            
            return this.cards;
        }
    },
    
    methods: {
        updateCards: function(cards){
            this.cards = cards;
        },
        
        completeCard: function (card) {
            card.completed = true;
            cardsDb.update(card,(err, cards) => {
                // this.cards = cards;
            });
            
            this.stopTimer();
        },
        
        updateTime: function() {
            let d = new Date();
            let changedDate = d - this.currentDate;
            this.time = Math.floor(changedDate / 1000).toString();
        },
        
        clickStartTimer: function() {
            cardsDb.manageTimer(true,(err, cards) => {
                // this.cards = cards;
            });
        },
    
        clickStopTimer: function() {
            cardsDb.manageTimer(false,(err, cards) => {
                // this.cards = cards;
            });
        },
        
        startTimer: function () {
            this.stopTimer();
            this.currentDate = new Date();
            this.timer = setInterval(this.updateTime, 1000)
        },
        
        stopTimer: function () {
            clearInterval(this.timer);
            this.time = '0';
        },
        
        shuffleCards: function() {
            cardsDb.shuffle((err, cards) => {
                console.log(err + cards);
            });
        }
    }
};

module.exports = app;