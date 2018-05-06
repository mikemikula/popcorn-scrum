'use strict';

// Test environment settings
let config = {};

// Use special purpose test database
config.databaseOptions.databaseUrl = 'localhost:5432';

module.exports = config;
