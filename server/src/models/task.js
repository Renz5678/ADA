'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Tasks extends Model { };

    Tasks.init({
        task_id: {
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
                notEmpty: { msg: 'Task title must not be empty' },
                notNull: { msg: 'Task title must not be null' }
            }
        },
        deadline: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('Not Started', 'In Progress', 'Done', 'Cancelled'),
            allowNull: false,
            defaultValue: 'Not Started',
            validate: {
                isIn: {
                    args: [['Not Started', 'In Progress', 'Done', 'Cancelled']],
                    msg: 'Invalid status'
                }
            }
        },
        related_order_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Orders',
                key: 'order_id'
            }
        },
        priority_score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    },
    {
        sequelize, 
        modelName: 'Tasks'
    });

    Tasks.associate = (models) => {
        Tasks.belongsTo(models.Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
        if (models.Orders) {
            Tasks.belongsTo(models.Orders, { foreignKey: 'related_order_id', onDelete: 'CASCADE' });
        }
    };

    return Tasks;
}
