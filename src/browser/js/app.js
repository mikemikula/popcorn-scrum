'use strict';

const Vue = require('vue/dist/vue.js');
//const appView = require('./views/todos');
const cardAppView = require('./views/cards');
const router = require('./util/routes');

// Create main Vue app
//let app = new Vue(appView);
let cardApp = new Vue(cardAppView);

// Configure router
//router(app);
router(cardApp);
