'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Orders extends Model { };

    Orders.init({
        order_id: {
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
        customer_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        order_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: { msg: 'Date must not be null' }
            }
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: 'Price must not be null' }
            }
        },
        deadline: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Done', 'Delivered', 'Cancelled'),
            allowNull: false,
            validate: {
                notNull: { msg: 'Status must not be null' },
                isIn: {
                    args: [['Pending', 'Done', 'Delivered', 'Cancelled']],
                    msg: 'Invalid status'
                }
            }
        }
    },
        {
            sequelize, modelName: 'Orders'
        });

    Orders.associate = (models) => {
        if (models.OrderItem) Orders.hasMany(models.OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
        if (models.Users) Orders.belongsTo(models.Users, { foreignKey: 'user_id' });
    };

    return Orders;
}