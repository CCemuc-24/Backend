import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, Unique } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';
import Course from './course.model';

@Table
export default class Purchase extends Model {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  confirmationCode!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isPaid!: boolean;
  

}
