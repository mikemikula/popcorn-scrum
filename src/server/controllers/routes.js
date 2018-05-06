const http = require('./http');

// Define handlers for application routes
module.exports = (app) => {
    app.get('/', http.popcornscrum);
    
    app.post('/create', http.create_card);
    
    app.get('/cards', http.get_cards);
};
