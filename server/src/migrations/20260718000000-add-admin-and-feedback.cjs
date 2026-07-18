'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Add columns to Users table
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('user', 'admin'),
      defaultValue: 'user'
    });
    
    await queryInterface.addColumn('Users', 'approval_status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'banned'),
      defaultValue: 'pending'
    });

    await queryInterface.addColumn('Users', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('Users', 'warning_message', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Retroactively approve all existing users
    await queryInterface.sequelize.query(
      "UPDATE \"Users\" SET approval_status = 'approved';"
    );

    // Create Feedbacks table
    await queryInterface.createTable('Feedbacks', {
      feedback_id: {
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
      type: {
        type: Sequelize.ENUM('bug', 'feature'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'closed'),
        defaultValue: 'open'
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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Feedbacks');
    
    // Remove columns
    await queryInterface.removeColumn('Users', 'role');
    await queryInterface.removeColumn('Users', 'approval_status');
    await queryInterface.removeColumn('Users', 'is_deleted');
    await queryInterface.removeColumn('Users', 'warning_message');

    // Drop ENUM types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_approval_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Feedbacks_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Feedbacks_status";');
  }
};
