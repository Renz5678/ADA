'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class PendingOrders extends Model {}

    PendingOrders.init({
        pending_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        freelancer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'user_id' }
        },
        client_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Clients', key: 'client_id' }
        },
        customer_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        deadline: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        // Full serialized snapshot of line items: [{ product_id, product_name, quantity, subtotal }]
        items_snapshot: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: []
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'PendingOrders'
    });

    PendingOrders.associate = (models) => {
        PendingOrders.belongsTo(models.Users, { foreignKey: 'freelancer_id' });
        PendingOrders.belongsTo(models.Clients, { foreignKey: 'client_id' });
    };

    return PendingOrders;
};
