'use strict';

// Application configuration - environment settings here are the same across
// all environments. To override settings locally, move "user.example.js" to
// "user.js"
let config = {};

// ---------------------------------------------------------------
// Config values common across environments (overridable defaults)
// ---------------------------------------------------------------

// HTTP port for Express
config.port = process.env.PORT || 3000;

// Options for Sequelize ORM connection - overrides in production and test
// environments
config.url = 'postgresql://kplxtedrscxosn:c08dec439d5adf7af2ca908813a4765b60031d29eda761a4795ca5bfaa1c9b0a' +
        '@ec2-54-225-200-15.compute-1.amazonaws.com:5432/d9ljogm9150m07';

config.databaseUrl = config.url;

config.dialect = 'postgres';
config.dialectOptions = {
    ssl:{
        require:true
    }
};
config.logging = console.log;
config.pool = {
    max: 5,
    min: 0,
    idle: 10000
};


// ----------------------------------------------------
// Assign values based on current execution environment
// ----------------------------------------------------
let environmentSettings = {};
//process.env.NODE_ENV = 'production'; //FORCED TODO

switch (process.env.NODE_ENV) {
    case 'production':
        environmentSettings = require('./production');
        break;
    case 'test':
        environmentSettings = require('./test');
        break;
    default:
        environmentSettings = require('./development');
        break;
}
config = Object.assign(config, environmentSettings);

// ---------------------------------------
// Override with user settings, if present
// ---------------------------------------
// try {
//     let userSettings = require('./user');
//     config = Object.assign(config, userSettings);
// } catch (e) {
//     // nbd if we don't have user settings
// }

// Export final configuration object
module.exports = config;
