const http = require('./http');

// Define handlers for application routes
module.exports = (app) => {
    //Static
    app.get('/', http.popcornscrum);
    //API
    app.put('/api/create', http.create_card);
    app.get('/api/get', http.get_cards);
    app.post('/api/update/:id', http.update_card);
    app.post('/api/shuffle', http.shuffle_cards);
    app.delete('/api/remove/:id', http.remove_card);
};
