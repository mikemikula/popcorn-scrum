'use strict';
const nr = require('newrelic');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./controllers/routes');
const morgan = require('morgan');

let app = express();

// Configure view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('x-powered-by', false);

// Configure middleware
app.use(morgan('combined'));
app.use('/api/*', bodyParser.json());
app.use('/api/*', bodyParser.urlencoded({extended: false}));

// Static file serving happens everywhere but in production
if (process.env.NODE_ENV !== 'production') {
    let staticPath = path.join(__dirname, '..', '..', 'public');
    app.use('/static', express.static(staticPath));
    
} else {
    app.use('/static', express.static('public'));
}

// Mount application routes
routes(app);

// Export Express webapp instance
module.exports = app;
