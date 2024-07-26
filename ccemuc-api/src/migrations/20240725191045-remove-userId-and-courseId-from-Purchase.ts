import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint('Purchases', 'UserCourseUnique');
    await queryInterface.removeColumn('Purchases', 'userId');
    await queryInterface.removeColumn('Purchases', 'courseId');
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('Purchases', 'userId', {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('Purchases', 'courseId', {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('Purchases', {
      fields: ['userId', 'courseId'],
      type: 'unique',
      name: 'UserCourseUnique'
    });
  }
};
