import { CourseType } from '../enums/course-type.enum';

export interface CourseAttributes {
  id?: string;
  module: number;
  title: string;
  description: string;
  type: CourseType;
  price: number;
  capacity: number;
  week: number;
  features?: Record<string, string>;
}