import { Context } from 'koa';
import Purchase from '../models/purchase.model';
import { PurchaseAttributes } from '../interfaces/purchase.interface';
import Course from '../models/course.model';
import { CourseType } from '../enums/course-type.enum';
import { ValidationError } from 'sequelize';

export class PurchaseController {
  constructor() {
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.confirm = this.confirm.bind(this);
    this.createPaidPurchaseForAllCoreCourses = this.createPaidPurchaseForAllCoreCourses.bind(this);
  }

  async create(ctx: Context) {
    const purchaseData = ctx.request.body as Omit<PurchaseAttributes, 'id'>;
    try {
      const existingPurchase = await Purchase.findOne({
        where: {
          userId: purchaseData.userId,
          courseId: purchaseData.courseId,
        },
      });

      if (existingPurchase) {
        ctx.status = 200;
        ctx.body = existingPurchase;
      } else {
        const purchase = Purchase.build(purchaseData);
        await purchase.save();
        ctx.status = 201;
        ctx.body = purchase;
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
      const purchases = await Purchase.findAll();
      ctx.body = purchases;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async getById(ctx: Context) {
    try {
      const { id } = ctx.params;
      const purchase = await Purchase.findByPk(id);
      if (purchase) {
        ctx.body = purchase;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'Purchase not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async update(ctx: Context) {
    try {
      const { id } = ctx.params;
      const purchaseData = ctx.request.body as Omit<PurchaseAttributes, 'id'>;
      const [updated] = await Purchase.update(purchaseData, { where: { id } });
      if (updated) {
        const updatedPurchase = await Purchase.findByPk(id);
        ctx.body = updatedPurchase;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'Purchase not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async delete(ctx: Context) {
    try {
      const { id } = ctx.params;
      const deleted = await Purchase.destroy({ where: { id } });
      if (deleted) {
        ctx.status = 204;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'Purchase not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async confirm(ctx: Context) {
    try {
      const { id } = ctx.params;
      const purchase = await Purchase.findByPk(id);
      if (purchase) {
        if (!purchase.isPaid) {
          purchase.isPaid = true;
          await purchase.save();
          ctx.body = purchase;
          await this.createPaidPurchaseForAllCoreCourses(purchase);
        } else {
          ctx.status = 400;
          ctx.body = { error: 'Purchase already confirmed as paid' };
        }
      } else {
        ctx.status = 404;
        ctx.body = { error: 'Purchase not found' };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }
  

  private async createPaidPurchaseForAllCoreCourses(purchase: Purchase) {
    try {
      console.log('Creating paid purchases for all core courses');
      const { userId, confirmationCode } = purchase;
      const coreCourses = await Course.findAll({ where: { type: CourseType.CORE } });
      const corePurchases = coreCourses.map(course => ({
        userId,
        courseId: course.id,
        confirmationCode,
        isPaid: true,
      }));
      
      await Purchase.bulkCreate(corePurchases);

      console.log('Paid purchases for core courses created successfully');
    } catch (error) {
      console.error('Error creating paid purchases for core courses:', error);
      throw error;
    }
  }
}
