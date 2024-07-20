import { Table, Column, Model, DataType, PrimaryKey, Default, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Purchase from './purchase.model';
import { isRut } from '../utils/rutValidator';

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

  @HasMany(() => Purchase, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  purchases!: Purchase[];
}
