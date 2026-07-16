'use strict';
import { Model } from 'sequelize';
import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
    class Clients extends Model { }

    Clients.init({
        client_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        freelancer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Name must not be null' },
                notEmpty: { msg: 'Name must not be empty' }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Email must not be empty' },
                notNull: { msg: 'Email must not be null' },
                isEmail: { msg: 'Client must have a valid email' }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Password must not be empty' },
                notNull: { msg: 'Password must not be null' }
            }
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        verification_token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        otp_expires_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Clients'
    });

    Clients.beforeCreate(async (client) => {
        client.password = await bcrypt.hash(client.password, 10);
    });

    Clients.comparePassword = async (password, client) => {
        return await bcrypt.compare(password, client.password);
    };

    Clients.associate = (models) => {
        if (models.Users) Clients.belongsTo(models.Users, { foreignKey: 'freelancer_id', onDelete: 'CASCADE' });
        if (models.Orders) Clients.hasMany(models.Orders, { foreignKey: 'client_id' });
    };

    return Clients;
};