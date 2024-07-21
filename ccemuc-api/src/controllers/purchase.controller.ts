import { Context } from 'koa';
import Purchase from '../models/purchase.model';
import { PurchaseAttributes } from '../interfaces/purchase.interface';
import Course from '../models/course.model';
import { CourseType } from '../enums/course-type.enum';
import { ValidationError } from 'sequelize';
import { WebpayPlus } from 'transbank-sdk';
import { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';

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
      const course = await Course.findByPk(purchaseData.courseId);

      if (!course) {
        ctx.status = 404;
        ctx.body = { error: 'Course not found' };
        return;
      }

      const purchaseCount = await Purchase.count({
        where: { courseId: purchaseData.courseId }
      });

      if (purchaseCount >= course.capacity) {
        ctx.status = 400;
        ctx.body = { error: 'Course capacity is full' };
        return;
      }

      const existingPurchase = await Purchase.findOne({
        where: {
          userId: purchaseData.userId,
          courseId: purchaseData.courseId,
        },
      });

      let purchase;
      if (existingPurchase) {
        ctx.status = 200;
        purchase = existingPurchase;
      } else {
        purchase = Purchase.build(purchaseData);
        await purchase.save();
      }
      const webPayResponse = await this.createWebPayTransaction(purchase);
      ctx.status = 201;
      ctx.body = { purchase, webPayResponse }

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

  private async createWebPayTransaction(purchase: Purchase) {
    try {
      const { id, userId, courseId, buyOrder } = purchase;
      const course = await Course.findByPk(courseId);
      if (course) {
        const amount = course.price;
        const sessionId = userId.toString();
        const returnUrl = `${process.env.WEBPAY_RETURN_URL}?purchaseId=${id}`;
        const transaction = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
        const response = await transaction.create(
          buyOrder,
          sessionId,
          amount,
          returnUrl,
        );
        return response;
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
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
      const { token_ws } = ctx.request.body as { token_ws?: string };
      
      if (!token_ws) {
        ctx.status = 400;
        ctx.body = { error: 'Missing token_ws' };
        return;
      }
      
      const purchase = await Purchase.findByPk(id);
      if (purchase) {
        if (!purchase.isPaid) {
          const { webPayResponse, transactionStatus } = await this.confirmWebPayTransaction(purchase, token_ws);
          if (transactionStatus === 'AUTHORIZED') {
            ctx.status = 200;
            ctx.body = { purchase, webPayResponse };
          } else {
            ctx.status = 400;
            ctx.body = { error: `Transaction not authorized. Status: ${transactionStatus}` };
          }
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

  private async confirmWebPayTransaction(purchase: Purchase, token_ws: string) {
    try {
      const transaction = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
      const response = await transaction.commit(token_ws);
      const transactionStatus = response.status;

      if (transactionStatus === 'AUTHORIZED') {
        purchase.isPaid = true;
        await purchase.save();
        await this.updateCourseCapacity(purchase);
        await this.createPaidPurchaseForAllCoreCourses(purchase);
      }

      return { webPayResponse: response, transactionStatus };
    } catch (error) {
      console.error('Error confirming transaction:', error);
      throw error;
    }
  }

  private async createPaidPurchaseForAllCoreCourses(purchase: Purchase) {
    try {
      const { userId, buyOrder } = purchase;
      const coreCourses = await Course.findAll({ where: { type: CourseType.CORE } });

      for (const course of coreCourses) {
        const existingCorePurchase = await Purchase.findOne({
          where: {
            userId,
            courseId: course.id,
          },
        });

        if (!existingCorePurchase) {
          const corePurchase = {
            userId,
            courseId: course.id,
            buyOrder,
            isPaid: true,
          };

          const newPurchase = Purchase.build(corePurchase);
          await newPurchase.save();
          await this.updateCourseCapacity(newPurchase);
        }
      }

    } catch (error) {
      console.error('Error creating paid purchases for core courses:', error);
      throw error;
    }
  }

  private async updateCourseCapacity(purchase: Purchase) {
    try {
      const course = await Course.findByPk(purchase.courseId);
      if (course && course.capacity > 0) {
        course.capacity -= 1;
        await course.save();
      }
    } catch (error) {
      console.error('Error updating course capacity:', error);
      throw error;
    }
  }
}
