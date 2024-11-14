#!/bin/bash

# Create database
createdb popcorn_scrum

# Run migrations
npx sequelize-cli db:migrate

# Run seeds
npx sequelize-cli db:seed:all 