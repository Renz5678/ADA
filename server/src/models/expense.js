'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Expense extends Model { };

    Expense.init({
        expense_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Title must not be null' },
                notEmpty: { msg: 'Title must not be empty' },
            }
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: 'Amount must not be null' }
            }
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Category must not be null' },
                notEmpty: { msg: 'Category must not be empty' }
            }
        },
        expense_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: { msg: 'Date must not be null' }
            }
        }
    },
        {
            sequelize, modelName: 'Expense'
        });

    Expense.associate = (models) => {
        Expense.belongsTo(models.Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    }

    return Expense;
}