'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class ProductMaterial extends Model { };

    ProductMaterial.init({
        product_material_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Products',
                key: 'product_id'
            }
        },
        material_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Materials',
                key: 'material_id'
            }
        },
        quantity_required: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: 'Quantity required must not be null' }
            }
        }
    }, {
        sequelize, modelName: 'ProductMaterial'
    });

    ProductMaterial.associate = (models) => {
        ProductMaterial.belongsTo(models.Product, { foreignKey: 'product_id', onDelete: 'CASCADE' });
        ProductMaterial.belongsTo(models.Material, { foreignKey: 'material_id', onDelete: 'CASCADE' });
    }

    return ProductMaterial;
}
