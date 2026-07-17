'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const socialFields = [
      'social_facebook',
      'social_instagram',
      'social_shopee',
      'social_tiktok',
      'social_twitter',
      'social_linkedin',
    ];

    for (const field of socialFields) {
      try {
        await queryInterface.addColumn('Users', field, {
          type: Sequelize.STRING,
          allowNull: true,
        });
      } catch (e) {
        // Column may already exist if a previous alter:true sync applied it
        console.warn(`Skipping column ${field}: ${e.message}`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const socialFields = [
      'social_facebook',
      'social_instagram',
      'social_shopee',
      'social_tiktok',
      'social_twitter',
      'social_linkedin',
    ];

    for (const field of socialFields) {
      await queryInterface.removeColumn('Users', field);
    }
  }
};
