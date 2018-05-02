'use strict';

// Test environment settings
let config = {};

// Use special purpose test database
config.databaseUrl = 'postgres://localhost:5432/card-test';

module.exports = config;
