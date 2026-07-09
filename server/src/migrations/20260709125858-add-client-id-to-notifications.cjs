'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('Notifications');
    if (!tableDesc.client_id) {
        await queryInterface.addColumn('Notifications', 'client_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Clients',
            key: 'client_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
    }
    
    await queryInterface.changeColumn('Notifications', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Notifications', 'client_id');
    await queryInterface.changeColumn('Notifications', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
