'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Product extends Model { };

    Product.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        product_code: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Product code must not be empty' },
                notNull: { msg: 'Product code must not be null' },
            }
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Product name must not be empty' },
                notNull: { msg: 'Product name must not be null' },
            }
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: 'Price must not be null' },
            }
        }
    },
        {
            sequelize, modelName: 'Product'
        });

    Product.associate = (models) => {
        if (models.OrderItem) Product.hasMany(models.OrderItem, { foreignKey: 'product_id' });
        Product.belongsTo(models.Users, { foreignKey: 'user_id' });
    }

    return Product;
}