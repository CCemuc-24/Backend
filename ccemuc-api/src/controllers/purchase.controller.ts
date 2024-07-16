import { Context } from 'koa';
import Purchase from '../models/purchase.model';
import { PurchaseAttributes } from '../interfaces/purchase.interface';

export class PurchaseController {
  async create(ctx: Context) {
    try {
      const purchaseData = ctx.request.body as Omit<PurchaseAttributes, 'id'>;
      const purchase = Purchase.build(purchaseData);
      await purchase.save();
      ctx.status = 201;
      ctx.body = purchase;
    } catch (error) {
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
}