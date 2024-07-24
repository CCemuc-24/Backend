import { Table, Column, Model, DataType, PrimaryKey, Default, HasMany, AllowNull } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { CourseType } from '../enums/course-type.enum';
import Purchase from './purchase.model';

@Table
export default class Course extends Model {
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
  title!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.ENUM(...Object.values(CourseType)),
    allowNull: false,
  })
  type!: CourseType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  price!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  capacity!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  date!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  week!: number

  @HasMany(() => Purchase, {
    onDelete: 'CASCADE',
    hooks: true
  })
  purchases!: Purchase[];
}