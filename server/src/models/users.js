'use strict';
import { Model } from 'sequelize';
import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
    class Users extends Model { };

    Users.init({
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Username must not be null' },
                notEmpty: { msg: 'Username must not be empty' }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Email must not be empty' },
                notNull: { msg: 'Email must not be null' },
                isEmail: { msg: 'User must have a valid email' }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Password must not be empty' },
                notNull: { msg: 'Password must not be null' }
            }
        }
    },
        {
            sequelize,
            modelName: 'Users'
        });

    Users.beforeCreate(async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
    });

    Users.comparePassword = async (password, user) => {
        return await bcrypt.compare(password, user.password);
    };

    Users.associate = (models) => {
        Users.hasMany(models.Product, { foreignKey: 'user_id' });
    };

    return Users;
}