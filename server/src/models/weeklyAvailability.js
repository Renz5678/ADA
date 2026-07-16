'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class WeeklyAvailability extends Model { };

    WeeklyAvailability.init({
        availability_id: {
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
        day_of_week: {
            type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
            allowNull: false,
            validate: {
                notNull: { msg: 'Day of week must not be null' },
                isIn: {
                    args: [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']],
                    msg: 'Invalid day of week'
                }
            }
        },
        block_type: {
            type: DataTypes.ENUM('Free', 'Flexible', 'Unavailable'),
            allowNull: false,
            defaultValue: 'Free',
            validate: {
                isIn: {
                    args: [['Free', 'Flexible', 'Unavailable']],
                    msg: 'Invalid block type'
                }
            }
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false,
            validate: {
                notNull: { msg: 'Start time must not be null' }
            }
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false,
            validate: {
                notNull: { msg: 'End time must not be null' }
            }
        }
    },
        {
            sequelize, modelName: 'WeeklyAvailability'
        });

    WeeklyAvailability.associate = (models) => {
        if (models.Users) WeeklyAvailability.belongsTo(models.Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    };

    return WeeklyAvailability;
}
