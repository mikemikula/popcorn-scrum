const sockets = require('../sockets');

// Render home page
exports.popcornscrum = (request, response) => {
    response.render('popcornscrum', {
        env: process.env.NODE_ENV
    });
};