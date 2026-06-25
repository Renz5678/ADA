'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class MaterialTransaction extends Model { };

    MaterialTransaction.init({
        material_transaction_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        material_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Materials',
                key: 'material_id'
            },
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Type must not be empty' },
                notNull: { msg: 'Type must not be null' }
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: 'Quantity must not be null' }
            }
        },
        unit_cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: { msg: 'Unit cost must not be null' }
            }
        },
        date_bought: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: { msg: 'Date must not be null' }
            }
        }
    },
        {
            sequelize, modelName: 'MaterialTransaction'
        });

    MaterialTransaction.associate = (models) => {
        MaterialTransaction.belongsTo(models.Material, { foreignKey: 'material_id' });
    }
    return MaterialTransaction;
}