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

// {title: 'Mike Mikula', completed: false}
// , {title: 'Kyle Kopps', completed: false}
// , {title: 'JJ Cory', completed: false}
// , {title: 'Bethany Sievert', completed: false}
// , {title: 'Ryan Hood', completed: false}
// , {title: 'Bryan Schiek', completed: false}
// , {title: 'Tatianna Hansen', completed: false}
// , {title: 'Maria Bellmann', completed: false}
// , {title: 'Terry Beaulieu', completed: false}
// , {title: 'Dave Hoover', completed: false}
// , {title: 'Tom Sullivan', completed: false}
// , {title: 'Nathan Wenslaff', completed: false}
// , {title: 'Lauren Gordon-Fahn', completed: false}

let app = {
    
    // the root element that will be compiled
    el: '.popcornApp',
    
    // app initial state
    data: {
        cards: [],
        visibility: 'all',
        totalCards: '',
        currentDate: '',
        timer: '',
        time: '0'
    },
    
    created() {
        this.socket = io();
        let self = this;
        this.socket.on('cardAdded', function (card) {
            let found = false;
            for (let t of self.cards) {
                if (t.id == card.id) {
                    found = true;
                    break;
                }
            }
            if (!found) self.cards.push(card);
        });
        cardsDb.fetch((err, cards) => {
            this.cards = cards;
            console.log(cards);
        });
    },
    
    computed: {
        filteredCards: function () {
            this.totalCards = '(' + (filters.completed(this.cards).length + 1) + '/' + this.cards.length + ')';
            return this.cards;
        }
    },
    
    mounted: function (){
        this.shuffleCards();
    },
    
    methods: {
        removeThis: function (card) {
            card.completed = true;
            this.stopTimer();
        },
        
        updateTime: function() {
            let d = new Date();
            let changedDate = d - this.currentDate;
            this.time = Math.floor(changedDate / 1000).toString();
        },
        
        startTimer: function () {
            this.currentDate = new Date();
            this.timer = setInterval(this.updateTime, 1000)
        },
        
        stopTimer: function () {
            clearInterval(this.timer);
            this.time = '0';
        },
        
        shuffleCards: function() {
            this.cards = _.shuffle(this.cards);
        }
        
    }
};

module.exports = app;