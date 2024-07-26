import { Table, Column, Model, DataType, PrimaryKey, Default, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { isRut } from '../utils/rutValidator';
import Enrollment from './enrollment.model';
import Purchase from './purchase.model';

@Table
export default class User extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column({
    type: DataType.UUID,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  names!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastNames!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isValidRut(value: string) {
        const { status, message } = isRut(value);
        if (!status) {
          throw new Error(message);
        }
      },
    },
  })
  rut!: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  university!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  carrerYear!: number;

  @HasMany(() => Enrollment, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  enrollments!: Enrollment[];

  @HasMany(() => Purchase, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  purchases!: Purchase[];
}
