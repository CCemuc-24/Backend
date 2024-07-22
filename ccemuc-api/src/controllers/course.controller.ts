import { Context } from 'koa';
import Course from '../models/course.model';
import { CourseAttributes } from '../interfaces/course.interfaces';

export class CourseController {
  async create(ctx: Context) {
    try {
      const courseData = ctx.request.body as Omit<CourseAttributes, 'id'>;
      const course = Course.build(courseData);
      await course.save();
      ctx.status = 201;
      ctx.body = course;
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: (error as Error).message };
    }
  }

  async getAll(ctx: Context) {
    try {
      const courses = await Course.findAll();
      ctx.body = courses;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async getById(ctx: Context) {
    try {
      const { id } = ctx.params;
      const course = await Course.findByPk(id);
      if (course) {
        ctx.body = course;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'Course not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async update(ctx: Context) {
    try {
      const { id } = ctx.params;
      const courseData = ctx.request.body as Omit<CourseAttributes, 'id'>;
      const [updated] = await Course.update(courseData, { where: { id } });
      if (updated) {
        const updatedCourse = await Course.findByPk(id);
        ctx.body = updatedCourse;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'Course not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async delete(ctx: Context) {
    try {
      const { id } = ctx.params;
      const deleted = await Course.destroy({ where: { id } });
      if (deleted) {
        ctx.status = 204;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'Course not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }
}