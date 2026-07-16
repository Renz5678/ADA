'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Product extends Model { };

    Product.init({
        product_id: {
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
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        estimated_days: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: { args: [0], msg: 'Estimated days cannot be negative' }
            }
        }
    },
        {
            sequelize, modelName: 'Product'
        });

    Product.associate = (models) => {
        if (models.OrderItem) Product.hasMany(models.OrderItem, { foreignKey: 'product_id', onDelete: 'CASCADE' });
        Product.belongsTo(models.Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
        if (models.ProductMaterial) {
            Product.hasMany(models.ProductMaterial, { foreignKey: 'product_id', onDelete: 'CASCADE' });
        }
    }

    return Product;
}