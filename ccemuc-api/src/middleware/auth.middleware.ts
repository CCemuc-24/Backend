import { Context, Next } from 'koa';

export async function authMiddleware(ctx: Context, next: Next) {
  const token = ctx.headers['authorization']?.replace('Bearer ', '');

  if (!token || token !== process.env.AUTH_TOKEN) {
    ctx.status = 403;
    ctx.body = { error: 'Unauthorized' };
    return;
  }

  await next();
}