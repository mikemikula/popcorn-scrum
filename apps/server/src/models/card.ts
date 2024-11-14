import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db';
import type { Card } from '@popcorn/shared';

interface CardInstance extends Model<Card>, Card {}

export const CardModel = sequelize.define<CardInstance>('Card', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sequence: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}); 