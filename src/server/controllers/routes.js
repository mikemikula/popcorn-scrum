const http = require('./http');

// Define handlers for application routes
module.exports = (app) => {
    app.get('/', http.popcornscrum);
};
