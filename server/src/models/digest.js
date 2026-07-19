import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class Digest extends Model {
        static associate(models) {
            Digest.belongsTo(models.Users, { foreignKey: 'user_id' });
        }
    }

    Digest.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'user_id'
            },
            onDelete: 'CASCADE'
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'Digest',
        tableName: 'Digests',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'date']
            }
        ]
    });

    return Digest;
};
