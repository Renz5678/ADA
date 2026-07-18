'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'normalized_email', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Clients', 'normalized_email', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    // Backfill existing data
    await queryInterface.sequelize.query(`UPDATE "Users" SET "normalized_email" = "email"`);
    await queryInterface.sequelize.query(`UPDATE "Clients" SET "normalized_email" = "email"`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'normalized_email');
    await queryInterface.removeColumn('Clients', 'normalized_email');
  }
};
