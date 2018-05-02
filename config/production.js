'use strict';

// Production environment settings
let config = {};

// Pull in production RDS connection string
config.databaseUrl = 'postgres://fibamrth:52OMxh6b3yzaesqSgvaTzxmr3R5GjlME@pellefant.db.elephantsql.com:5432/fibamrth';

module.exports = config;
