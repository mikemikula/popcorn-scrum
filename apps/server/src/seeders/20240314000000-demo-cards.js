'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Cards', [
      {
        title: 'Alice',
        sequence: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Bob',
        sequence: 1,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Charlie',
        sequence: 2,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'David',
        sequence: 3,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Eve',
        sequence: 4,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Cards', null, {});
  }
}; 