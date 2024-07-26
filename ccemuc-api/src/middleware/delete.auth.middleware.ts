import { Context, Next } from 'koa';

export async function deleteAuthMiddleware(ctx: Context, next: Next) {
  const token = ctx.headers['authorization']?.replace('Bearer ', '');

  if (!token || token !== process.env.DELETE_AUTH_TOKEN) {
    ctx.status = 403;
    ctx.body = { error: 'Unauthorized' };
    return;
  }

  await next();
}