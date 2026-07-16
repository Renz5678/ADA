'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Material extends Model { };

    Material.init({
        material_id: {
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
        material_code: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Material Code must not be null' },
                notEmpty: { msg: 'Material Code must not be empty' }
            }
        },
        material_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Material Name must not be null' },
                notEmpty: { msg: 'Material Name must not be empty' }
            }
        },
        unit_cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: 'Unit Cost must not be null' }
            }
        },
        quantity: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: 'Quantity must not be null' }
            }
        },
        low_stock_threshold: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null
        }
    },
        {
            sequelize, modelName: 'Material'
        });

    Material.associate = (models) => {
        Material.belongsTo(models.Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
        if (models.MaterialTransaction) Material.hasMany(models.MaterialTransaction, { foreignKey: 'material_id', onDelete: 'CASCADE' });
        if (models.ProductMaterial) {
            Material.hasMany(models.ProductMaterial, { foreignKey: 'material_id', onDelete: 'CASCADE' });
        }
    };

    return Material;
}