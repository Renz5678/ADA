'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'client_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Clients',
        key: 'client_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(`ALTER TYPE "enum_Orders_status" ADD VALUE 'Awaiting Freelancer Confirmation'`);
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'client_id');
    // Note: Postgres does not support dropping enum values easily, so down migration leaves the type alone.
  }
};
