'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Feedback extends Model {
        static associate(models) {
            Feedback.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' });
        }
    }

    Feedback.init({
        feedback_id: {
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
        type: {
            type: DataTypes.ENUM('bug', 'feature'),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('open', 'in_progress', 'closed'),
            defaultValue: 'open'
        }
    }, {
        sequelize,
        modelName: 'Feedback',
    });

    return Feedback;
};
