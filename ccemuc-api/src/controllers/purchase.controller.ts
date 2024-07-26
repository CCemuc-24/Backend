import { Context } from 'koa';
import Purchase from '../models/purchase.model';
import { PurchaseAttributes } from '../interfaces/purchase.interface';
import Course from '../models/course.model';
import { CourseType } from '../enums/course-type.enum';
import { ValidationError } from 'sequelize';
import { WebpayPlus } from 'transbank-sdk';
import { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';
import Enrollment from '../models/enrollment.model';
import User from '../models/user.model';

export class PurchaseController {
  constructor() {
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.confirm = this.confirm.bind(this);
    this.statusToken = this.statusToken.bind(this);
    this.confirmWebPayToken = this.confirmWebPayToken.bind(this);
    this.createWebPayTransaction = this.createWebPayTransaction.bind(this);
    this.calculateTotalAmount = this.calculateTotalAmount.bind(this);
    this.changeIsPaidToTrue = this.changeIsPaidToTrue.bind(this);
    this.createEnrollments = this.createEnrollments.bind(this);
    this.updateCourseCapacity = this.updateCourseCapacity.bind(this);
    this.getUserPurchase = this.getUserPurchase.bind(this);
  }

  async create(ctx: Context) {
    const purchaseData = ctx.request.body as Omit<PurchaseAttributes, 'id'>;
    try {
      await this.validatePurchase(purchaseData);
      const purchase = await this.createOrRetrievePurchase(purchaseData);
      
      const response = await this.handleWebPayTransaction(purchase);
      
      ctx.status = 201;
      ctx.body = response;
    } catch (error) {
      this.handleError(ctx, error);
    }
  }

  private async validatePurchase(purchaseData: Omit<PurchaseAttributes, 'id'>) {
    const { coursesIds } = purchaseData;
    await this.ensureAllCoursesExist(coursesIds);
    await this.ensureAllCoursesHaveCapacity(coursesIds);
  }

  private async ensureAllCoursesExist(coursesIds: string[]) {
    const courses = await Course.findAll({ where: { id: coursesIds } });
    if (courses.length !== coursesIds.length) {
      throw new Error('One or more courses not found');
    }
  }

  private async ensureAllCoursesHaveCapacity(coursesIds: string[]) {
    const courses = await Course.findAll({ where: { id: coursesIds } });
    const fullCourses = courses.filter(c => c.capacity <= 0);
    if (fullCourses.length > 0) {
      throw new Error('One or more courses are full');
    }
  }

  private async createOrRetrievePurchase(purchaseData: Omit<PurchaseAttributes, 'id'>): Promise<Purchase> {

    const existingPurchase = await Purchase.findOne({
      where: {
        userId: purchaseData.userId,
        coursesIds: purchaseData.coursesIds,
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

  private async handleWebPayTransaction(purchase: Purchase) {
    if (!purchase.isPaid) {
      const webPayResponse = await this.createWebPayTransaction(purchase);
      return { purchase, webPayResponse };
    }
    return { purchase };
  }

  private async createWebPayTransaction(purchases: Purchase) {
    try {

      const totalAmount = await this.calculateTotalAmount(purchases.coursesIds);

      const buyOrder = purchases.buyOrder;
      const sessionId = purchases.userId;
      const returnUrl = `${process.env.WEBPAY_RETURN_URL}?purchaseId=${purchases.id}`;

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

  private async calculateTotalAmount(coursesIds: string[]): Promise<number> {
    let totalAmount = 0;
    for (const courseId of coursesIds) {
      const course = await Course.findByPk(courseId);
      if (course) {
        totalAmount += course.price;
      }
    }
    return totalAmount;
  }

  private handleError(ctx: Context, error: unknown) {
    if (error instanceof ValidationError) {
      const field = error.errors[0].path;
      console.log('Error', error);
      ctx.status = 409;
      ctx.body = { error: (error as Error).message, field };
    } else {
      ctx.status = 400;
      ctx.body = { error: (error as Error).message };
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
        await this.changeIsPaidToTrue(purchase);
        await this.createEnrollments(purchase);
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

  private async changeIsPaidToTrue(purchase: Purchase) {
    try {
      purchase.isPaid = true;
      await purchase.save();
    } catch (error) {
      console.error('Error confirmando la compra:', error);
      throw error;
    }
  }

  private async createEnrollments(purchase: Purchase) {
    try {
      const { userId, coursesIds } = purchase;
  
      const coreCourses = await Course.findAll({ where: { type: CourseType.CORE } });
  
      const coreCoursesIds = coreCourses.map(course => course.id);
  
      const allCoursesIds = [...coreCoursesIds, ...coursesIds];
  
      for (const courseId of allCoursesIds) {
        const existingEnrollment = await Enrollment.findOne({
          where: {
            userId,
            courseId,
          },
        });
  
        if (!existingEnrollment) {
          const enrollment = {
            userId,
            courseId,
            purchaseId: purchase.id,
          };
  
          const newEnrollment = Enrollment.build(enrollment);
          await newEnrollment.save();
          await this.updateCourseCapacity(newEnrollment.courseId);
        } else {
          console.log(`Enrollment already exists for userId: ${userId}, courseId: ${courseId}, purchaseId: ${purchase.id}`);
        }
      }
    } catch (error) {
      console.error('Error creando enrollments:', error);
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

  async getUserPurchase(ctx: Context) {
    try {
      const { userId } = ctx.params;
      const user = await User.findByPk(userId);
      if (!user) {
        ctx.status = 404;
        ctx.body = { error: 'User not found' };
        return;
      }
      const purchases = await Purchase.findAll({ where: { userId } });
      ctx.status = 200;
      ctx.body = purchases;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }
}
