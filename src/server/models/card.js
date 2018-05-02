'use strict';

const Sequelize = require('sequelize');
const db = require('./db');

let Card = db.define('Card', {
    title: Sequelize.TEXT,
    completed: Sequelize.BOOLEAN,
});

module.exports = Card;