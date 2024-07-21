import { QueryInterface, Sequelize, DataTypes } from 'sequelize';


export = {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.removeColumn('Purchases', 'confirmationCode');
  },

  down: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.addColumn('Purchases', 'confirmationCode', {
      type: DataTypes.STRING(20),
      allowNull: true,
    });
  },
};
