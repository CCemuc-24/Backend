import { Context } from 'koa';
import Enrollment from '../models/enrollment.model';
import { EnrollmentAttributes } from '../interfaces/enrollment.interfaces';
import { ValidationError } from 'sequelize';

export class EnrollmentController {
  async create(ctx: Context) {
    const enrollmentData = ctx.request.body as Omit<EnrollmentAttributes, 'id'>;
    try {
      const existingEnrollment = await Enrollment.findOne({
        where: { userId: enrollmentData.userId, courseId: enrollmentData.courseId },
      });

      if (existingEnrollment) {
        ctx.status = 200;
        ctx.body = existingEnrollment;
      } else {
        const enrollment = Enrollment.build(enrollmentData);
        await enrollment.save();
        ctx.status = 201;
        ctx.body = enrollment;
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        const field = error.errors[0].path;
        ctx.status = 409;
        ctx.body = { error: error.message, field };
      } else {
        ctx.status = 400;
        ctx.body = { error: (error as Error).message };
      }
    }
  }

  async getAll(ctx: Context) {
    try {
      const enrollments = await Enrollment.findAll();
      ctx.body = enrollments;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async getById(ctx: Context) {
    try {
      const { id } = ctx.params;
      const enrollment = await Enrollment.findByPk(id);
      if (enrollment) {
        ctx.body = enrollment;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'Enrollment not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async update(ctx: Context) {
    try {
      const { id } = ctx.params;
      const enrollmentData = ctx.request.body as Omit<EnrollmentAttributes, 'id'>;
      const [updated] = await Enrollment.update(enrollmentData, { where: { id } });
      if (updated) {
        const updatedEnrollment = await Enrollment.findByPk(id);
        ctx.body = updatedEnrollment;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'Enrollment not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async delete(ctx: Context) {
    try {
      const { id } = ctx.params;
      const deleted = await Enrollment.destroy({ where: { id } });
      if (deleted) {
        ctx.status = 204;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'Enrollment not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }
}
