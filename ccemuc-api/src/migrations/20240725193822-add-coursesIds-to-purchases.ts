import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('Purchases', 'coursesIds', {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('Purchases', 'coursesIds');
  },
};
