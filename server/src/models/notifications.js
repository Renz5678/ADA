'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Notifications extends Model { };

    Notifications.init({
        notification_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('DEADLINE', 'STOCK', 'INFO'),
            allowNull: false,
            defaultValue: 'INFO'
        },
        reference_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        reference_type: {
            type: DataTypes.ENUM('ORDER', 'MATERIAL'),
            allowNull: true
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Notifications'
    });

    Notifications.associate = (models) => {
        Notifications.belongsTo(models.Users, { foreignKey: 'user_id' });
    };

    return Notifications;
};
