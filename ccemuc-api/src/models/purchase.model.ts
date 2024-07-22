import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, Unique, BeforeCreate } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';
import Course from './course.model';
import { createHash } from 'crypto';

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

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  buyOrder!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isPaid!: boolean;

  @BelongsTo(() => Course)
  course!: Course;

  @BeforeCreate
  static generateBuyOrder(instance: Purchase) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString(36);
    const rawBuyOrder = `${timestamp}${randomString}`;
  
    const hash = createHash('sha256').update(rawBuyOrder).digest('hex');
  
    instance.buyOrder = hash.substring(0, 26);
    console.log('Generated buy order:', instance.buyOrder, instance.buyOrder.length);
  }

}

