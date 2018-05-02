const Vue = require('vue');

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
        cards: [
            {title: 'Mike Mikula', completed: false}
            , {title: 'Kyle Kopps', completed: false}
            , {title: 'JJ Cory', completed: false}
            , {title: 'Bethany Sievert', completed: false}
            , {title: 'Ryan Hood', completed: false}
            , {title: 'Bryan Schiek', completed: false}
            , {title: 'Tatianna Hansen', completed: false}
            , {title: 'Maria Bellmann', completed: false}
            , {title: 'Terry Beaulieu', completed: false}
            , {title: 'Dave Hoover', completed: false}
            , {title: 'Tom Sullivan', completed: false}
            , {title: 'Nathan Wenslaff', completed: false}
            , {title: 'Lauren Gordon-Fahn', completed: false}
        ],
        visibility: 'all',
        totalCards: ''
    },
    
    computed: {
        filteredCards: function () {
            this.totalCards = '(' + (filters.completed(this.cards).length + 1) + '/' + this.cards.length + ')';
            return this.cards;
        }
    },
    
    methods: {
        removeThis: function (card) {
            card.completed = true;
        }
    }
};

module.exports = app;