import { Table, Column, Model, DataType, PrimaryKey, Default, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
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
    hooks: true
  })
  purchases!: Purchase[];
}