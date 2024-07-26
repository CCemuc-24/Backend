import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, Unique, BeforeCreate } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';
import Course from './course.model';
import { createHash } from 'crypto';
import Purchase from './purchase.model';

@Table
export default class Enrollment extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column({
    type: DataType.UUID,
  })
  id!: string;

  @Unique('UserCourseUnique')
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Unique('UserCourseUnique')
  @ForeignKey(() => Course)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  courseId!: string;

  @BelongsTo(() => Course)
  course!: Course;

  @ForeignKey(() => Purchase)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  purchaseId!: string;

  @BelongsTo(() => Purchase)
  purchase!: Purchase;
  
}

