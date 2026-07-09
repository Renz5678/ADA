'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Clients', 'verification_token', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    } catch (e) {}
    try {
      await queryInterface.addColumn('Clients', 'is_verified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    } catch (e) {}
    try {
      await queryInterface.addColumn('Clients', 'otp_expires_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    } catch (e) {}
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Clients', 'verification_token');
    await queryInterface.removeColumn('Clients', 'is_verified');
    await queryInterface.removeColumn('Clients', 'otp_expires_at');
  }
};
