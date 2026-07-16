'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Clients', 'verification_token', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    } catch (e) {
      // Ignore error if column already exists
    }
    try {
      await queryInterface.addColumn('Clients', 'is_verified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    } catch (e) {
      // Ignore error if column already exists
    }
    try {
      await queryInterface.addColumn('Clients', 'otp_expires_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    } catch (e) {
      // Ignore error if column already exists
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Clients', 'verification_token');
    await queryInterface.removeColumn('Clients', 'is_verified');
    await queryInterface.removeColumn('Clients', 'otp_expires_at');
  }
};
