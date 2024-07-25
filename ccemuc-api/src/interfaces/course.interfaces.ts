import { CourseType } from '../enums/course-type.enum';

export interface CourseAttributes {
  id?: string;
  title: string;
  description: string;
  type: CourseType;
  price: number;
  capacity: number;
  date: Date;
  week: number;
  features?: string[];
}