'use strict';
const Sequelize = require('sequelize');
const db = require('./db');

let Card = db.define('Cards', {
    sequence: Sequelize.INTEGER,
    title: Sequelize.TEXT,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    completed: Sequelize.BOOLEAN
});
Card.associate = function(models) {};

module.exports = Card;