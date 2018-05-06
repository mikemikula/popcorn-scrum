'use strict';

// Production environment settings
let config = {};

// Pull in production RDS connection string
config.databaseUrl = 'postgresql://ec2-54-225-200-15.compute-1.amazonaws.com:5432/d9ljogm9150m07?sslmode=require';

module.exports = config;
