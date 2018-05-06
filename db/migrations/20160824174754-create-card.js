'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Cards', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            sequence: {
                allowNull: false,
                autoIncrement: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.TEXT
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            completed: {
                allowNull: false,
                type: Sequelize.BOOLEAN
            }
        });
    },
    
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Cards');
    }
};
