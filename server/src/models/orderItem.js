'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class OrderItem extends Model { };

    OrderItem.init({
        order_item_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Orders',
                key: 'order_id'
            }
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Product',
                key: 'product_id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: 'Quantiy must not be null' }
            }
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: 'Subtotal must not be null' }
            }
        }
    },
        {
            sequelize, modelName: 'OrderItem'
        });

    OrderItem.associate = (models) => {
        OrderItem.belongsTo(models.Orders, { foreignKey: 'order_id' });
        OrderItem.belongsTo(models.Product, { foreignKey: 'product_id' });
    }

    return OrderItem;
}