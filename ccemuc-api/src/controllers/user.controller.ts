import { Context } from 'koa';
import User from '../models/user.model';
import { UserAttributes } from '../interfaces/user.interfaces';
import { ValidationError } from 'sequelize';

export class UserController {
  async create(ctx: Context) {
    const userData = ctx.request.body as Omit<UserAttributes, 'id'>;
    try {
      const existingUser = await User.findOne({ where: { rut: userData.rut } });

      if (existingUser) {
        ctx.status = 200;
        ctx.body = existingUser;
      } else {
        const user = User.build(userData);
        await user.save();
        ctx.status = 201;
        ctx.body = user;
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        const field = error.errors[0].path;
        ctx.status = 409;
          ctx.body = { error: `Error de duplicidad en el campo '${field}'` };
      } else {
        ctx.status = 400;
        ctx.body = { error: (error as Error).message };
      }
    }
  }

  async getAll(ctx: Context) {
    try {
      const users = await User.findAll();
      ctx.body = users;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async getById(ctx: Context) {
    try {
      const { id } = ctx.params;
      const user = await User.findByPk(id);
      if (user) {
        ctx.body = user;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'User not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async update(ctx: Context) {
    try {
      const { id } = ctx.params;
      const userData = ctx.request.body as Omit<UserAttributes, 'id'>; // Excluir el id en la actualización
      const [updated] = await User.update(userData, { where: { id } });
      if (updated) {
        const updatedUser = await User.findByPk(id);
        ctx.body = updatedUser;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'User not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async delete(ctx: Context) {
    try {
      const { id } = ctx.params;
      const deleted = await User.destroy({ where: { id } });
      if (deleted) {
        ctx.status = 204;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'User not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }
}
