import { Context } from 'koa';
import Purchase from '../models/purchase.model';
import { PurchaseAttributes } from '../interfaces/purchase.interface';
import Course from '../models/course.model';
import { CourseType } from '../enums/course-type.enum';
import { ValidationError } from 'sequelize';
import { WebpayPlus } from 'transbank-sdk';
import { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import { get } from 'http';

export class PurchaseController {
  constructor() {
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.confirm = this.confirm.bind(this);
    this.createPaidPurchaseForAllCoreCourses = this.createPaidPurchaseForAllCoreCourses.bind(this);
    this.statusToken = this.statusToken.bind(this);
    this.createPurchase = this.createPurchase.bind(this);
    this.createWebPayTransaction = this.createWebPayTransaction.bind(this);
  }

  async create(ctx: Context) {
    const purchaseData = ctx.request.body as Omit<PurchaseAttributes, 'id'>;
    try {
      const purchase = await this.createPurchase(purchaseData);

      const webPayResponse = await this.createWebPayTransaction(purchase);
      ctx.status = 201;
      ctx.body = { purchase, webPayResponse };
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

  private async createPurchase(purchaseData: Omit<PurchaseAttributes, 'id'>): Promise<Purchase> {
    const course = await Course.findByPk(purchaseData.courseId);

    if (!course) {
      throw new Error('Course not found');
    }

    const purchaseCount = await Purchase.count({
      where: { courseId: purchaseData.courseId },
    });

    if (purchaseCount >= course.capacity) {
      throw new Error('Course capacity is full');
    }

    const existingPurchase = await Purchase.findOne({
      where: {
        userId: purchaseData.userId,
        courseId: purchaseData.courseId,
      },
    });

    if (existingPurchase) {
      return existingPurchase;
    } else {
      const purchase = Purchase.build(purchaseData);
      await purchase.save();
      return purchase;
    }
  }

  private async createWebPayTransaction(purchases: Purchase[] | Purchase) {
    try {
      const purchasesArray = Array.isArray(purchases) ? purchases : [purchases];

      const courses = await this.getCoursesFromPurchases(purchasesArray);
      await this.ensureAllCoursesExist(courses);

      const totalAmount = this.calculateTotalAmount(purchasesArray, courses);

      // Construct a combined buyOrder and sessionId
      const buyOrder = purchasesArray.map(p => p.buyOrder).join('-');
      const sessionId = purchasesArray[0].userId.toString();
      const returnUrl = `${process.env.WEBPAY_RETURN_URL}?buyOrder=${buyOrder}`;

      const transaction = new WebpayPlus.Transaction(
        new Options(
          IntegrationCommerceCodes.WEBPAY_PLUS,
          IntegrationApiKeys.WEBPAY,
          Environment.Integration
        )
      );
      const response = await transaction.create(buyOrder, sessionId, totalAmount, returnUrl);
      return response;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  private async getCoursesFromPurchases(purchases: Purchase[]) : Promise<(Course | null)[]> {
    const courseIds = purchases.map(p => p.courseId);
    const courses = await Course.findAll({ where: { id: courseIds } });
    return courseIds.map(id => courses.find(c => c.id === id) || null);
  }

  private async ensureAllCoursesExist(courses: (Course | null)[]) {
    if (courses.includes(null)) {
      throw new Error('One or more courses not found');
    }
  }

  private calculateTotalAmount(purchases: Purchase[], courses: (Course | null)[]) {
    return purchases.reduce((sum, purchase, index) => {
      const course = courses[index];
      return sum + (course ? course.price : 0);
    }, 0);
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

  async statusToken(ctx: Context) {
    try {
      const { token } = ctx.params
      if (!token) {
        ctx.status = 400;
        ctx.body = { error: 'Transbank no devolvió el código de confirmación' };
        return;
      }
      const transactionStatus = await this.confirmWebPayToken(token);
      ctx.status = 200;
      ctx.body = { transactionStatus };
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
        ctx.body = { error: 'Transbank no devolvió el código de confirmación' };
        return;
      }
      
      const purchase = await Purchase.findByPk(id);

      if (!purchase) {
        ctx.status = 404;
        ctx.body = { error: 'La compra no fue encontrada' };
        return;
      }
      
      const transactionStatus = await this.confirmWebPayToken(token_ws);
      
      if (transactionStatus.status === 'ERROR') {
        ctx.status = 402;
        ctx.body = { error: transactionStatus.error };
        return;
      }

      console.log(transactionStatus);
      
      if (purchase.isPaid) {
        ctx.status = 200;
        ctx.body = { purchase, transactionStatus }
        return;
      }

      console.log(transactionStatus.status);
      
      if (transactionStatus.status === 'AUTHORIZED') {
        await this.confirmPurchase(purchase);
        await this.createPaidPurchaseForAllCoreCourses(purchase);
        ctx.status = 200;
        ctx.body = { purchase, transactionStatus };
      } else {
        ctx.status = 400;
        ctx.body = { error: `Transacción no autorizada` };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  async confirmWebPayToken(token_ws: string) {
    try {
      const transaction = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
      const response = await transaction.commit(token_ws);
      return response;
    } catch (error) {
      return { status: 'ERROR', error: error };
    }
  }

  private async confirmPurchase(purchase: Purchase) {
    try {
      purchase.isPaid = true;
      await purchase.save();
      await this.updateCourseCapacity(purchase.courseId);
    } catch (error) {
      console.error('Error confirmando la compra:', error);
      throw error;
    }
  }

  private async createPaidPurchaseForAllCoreCourses(purchase: Purchase) {
    try {
      const { userId, buyOrder } = purchase;
      const coreCourses = await Course.findAll({ where: { type: CourseType.CORE } });

      for (const course of coreCourses) {

        if (!course) {
          console.error('Core course not found');
          continue;
        }

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
          await this.updateCourseCapacity(newPurchase.courseId);
        }
      }

    } catch (error) {
      console.error('Error creating paid purchases for core courses:', error);
      throw error;
    }
  }

  private async updateCourseCapacity(courseId: string) {
    try {
      const course = await Course.findByPk(courseId);

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
