import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class ChatHistory extends Model {
        static associate(models) {
            ChatHistory.belongsTo(models.Users, { foreignKey: 'user_id' });
        }
    }

    ChatHistory.init({
        history_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'Users',
                key: 'user_id'
            },
            onDelete: 'CASCADE'
        },
        messages: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: []
        }
    }, {
        sequelize,
        modelName: 'ChatHistory',
        tableName: 'ChatHistories',
        timestamps: true,
    });

    return ChatHistory;
};
