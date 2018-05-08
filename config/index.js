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
config.databaseUrl = 'postgresql://kplxtedrscxosn:c08dec439d5adf7af2ca908813a4765b60031d29eda761a4795ca5bfaa1c9b0a@ec2-54-225-200-15.compute-1.amazonaws.com:5432/d9ljogm9150m07';

config.databaseOptions = {
    url: config.databaseUrl,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true
        }
    },
    logging: console.log,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
};


// ----------------------------------------------------
// Assign values based on current execution environment
// ----------------------------------------------------
let environmentSettings = {};
//process.env.NODE_ENV = 'production'; //FORCED TODO

if(process.env.NODE_ENV !== 'production') {
    process.env.NEW_RELIC_APP_NAME = 'popcorn-scrum-dev';
    process.env.NEW_RELIC_LICENSE_KEY = '80893e334d2a5cd5b58c041dacd21e7d6e5e9c80';
    process.env.NEW_RELIC_NO_CONFIG_FILE=true;
}

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
