'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
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
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    if (queryInterface.sequelize.getDialect() === 'postgres') {
      try {
        await queryInterface.sequelize.query(`ALTER TYPE "enum_Orders_status" ADD VALUE 'Awaiting Freelancer Confirmation'`);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'client_id');
    // Note: Postgres does not support dropping enum values easily, so down migration leaves the type alone.
  }
};
