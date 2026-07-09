'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'profile_picture', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'banner_image', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'bio', {
      type: Sequelize.STRING(200),
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'theme_color', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'profile_picture');
    await queryInterface.removeColumn('Users', 'banner_image');
    await queryInterface.removeColumn('Users', 'bio');
    await queryInterface.removeColumn('Users', 'description');
    await queryInterface.removeColumn('Users', 'theme_color');
  }
};
