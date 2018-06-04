const sockets = require('../sockets');
const Card = require('../models/card');

// Render home page
exports.popcornscrum = (req, res) => {
    res.render('popcornscrum', {
        env: process.env.NODE_ENV
    });
};

exports.create_card = (req, res) => {
    Card.create({
        title: req.body.title,
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false
    }).then((card) => {
        res.send(card);
    }).catch((error) => {
        res.status(500).send(error);
        console.log(error);
    });
};

exports.get_cards = (req, res) => {
    Card.all({order: [
            ['sequence', 'ASC'],
        ]})
    .then((cards) => {
        res.send();
        sockets.cardsRefresh(cards);
    }).catch((error) => {
        res.status(500).send(error);
        console.log(error);
    });
};

exports.update_card = (req, res) => {
    Card.findById(req.params.id)
    .then((card) => {
        if (!card) return res.status(404);
        card.completed = req.body.completed === 'true';
        card.title = req.body.title;
        card.save()
        .then(() => {
            Card.all({order: [
                    ['sequence', 'ASC'],
            ]})
            .then((cards) => {
                res.send();
                sockets.cardsRefresh(cards);
                sockets.manageTimer(true);
            });
        });
    })
};

exports.shuffle_cards = (req, res) => {

    Card.all({order: [
        ['sequence', 'ASC'],
    ]})
    .then((cards) => {
    
        cards = cards.sort(() => Math.random() - 0.5);
        let i = 0;
        for(let card of cards){
            card.sequence = i++;
            card.completed = false;
            card.save();
        }
        
        res.send();
        sockets.cardsRefresh(cards);
        sockets.manageTimer(false);
    });
};

exports.remove_card = (req, res) => {
    Card.destroy({
        where: {
            id: req.params.id
        }
    }).then((card) => {
        res.send();
        sockets.cardsRefresh(card);
    }).catch((error) => {
        res.status(500).send(error);
    });
};

exports.manage_timer = (req, res) => {
    sockets.manageTimer(req.body.isTiming);
    res.send();
};