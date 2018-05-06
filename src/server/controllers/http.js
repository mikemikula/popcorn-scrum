const sockets = require('../sockets');
const Card = require('../models/card');
const bodyParser = require('body-parser');

// Render home page
exports.popcornscrum = (request, response) => {
    response.render('popcornscrum', {
        env: process.env.NODE_ENV
    });
};

exports.create_card = (request, response) => {
    
    Card.create({
        title: request.body.title,
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false
    }).then((card) => {
        response.send(card);
        sockets.cardAdded(card);
    }).catch((error) => {
        response.status(500).send(error);
        console.log(error);
    });
};

exports.get_cards = (request, response) => {
    
    Card.all()
    .then((cards) => {
        response.send(cards);
    }).catch((error) => {
        response.status(500).send(error);
        console.log(error);
    });
};