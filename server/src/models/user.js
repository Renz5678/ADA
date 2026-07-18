'use strict';
import { Model } from 'sequelize';
import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
    class Users extends Model { };

    Users.init({
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Username must not be null' },
                notEmpty: { msg: 'Username must not be empty' }
            }
        },
        business_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: 'Business Name must not be null' },
                notEmpty: { msg: 'Business Name must not be empty' }
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
        },
        verification_token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        otp_expires_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        profile_picture: {
            type: DataTypes.STRING,
            allowNull: true
        },
        banner_image: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bio: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        theme_color: {
            type: DataTypes.STRING,
            allowNull: true
        },
        social_facebook: {
            type: DataTypes.STRING,
            allowNull: true
        },
        social_instagram: {
            type: DataTypes.STRING,
            allowNull: true
        },
        social_shopee: {
            type: DataTypes.STRING,
            allowNull: true
        },
        social_tiktok: {
            type: DataTypes.STRING,
            allowNull: true
        },
        social_twitter: {
            type: DataTypes.STRING,
            allowNull: true
        },
        social_linkedin: {
            type: DataTypes.STRING,
            allowNull: true
        },
        flaggedForReview: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        normalized_email: {
            type: DataTypes.STRING,
            allowNull: true
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
        if (models.Product) Users.hasMany(models.Product, { foreignKey: 'user_id' });
        if (models.Orders) Users.hasMany(models.Orders, { foreignKey: 'user_id' });
        if (models.Material) Users.hasMany(models.Material, { foreignKey: 'user_id' });
        if (models.Expense) Users.hasMany(models.Expense, { foreignKey: 'user_id' });
        if (models.WeeklyAvailability) Users.hasMany(models.WeeklyAvailability, { foreignKey: 'user_id' });
        if (models.Notifications) Users.hasMany(models.Notifications, { foreignKey: 'user_id' });
        if (models.Clients) Users.hasMany(models.Clients, { foreignKey: 'freelancer_id' });
    };

    return Users;
}