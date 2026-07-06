'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      notification_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('DEADLINE', 'STOCK', 'INFO'),
        allowNull: false,
        defaultValue: 'INFO'
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      reference_type: {
        type: Sequelize.ENUM('ORDER', 'MATERIAL'),
        allowNull: true
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add index for faster query by user
    await queryInterface.addIndex('Notifications', ['user_id', 'is_read']);
    await queryInterface.addIndex('Notifications', ['user_id', 'createdAt']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
  }
};
