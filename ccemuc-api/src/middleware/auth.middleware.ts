import { Context, Next } from 'koa';

export async function authMiddleware(ctx: Context, next: Next) {
  const token = ctx.headers['authorization']?.replace('Bearer ', '');

  console.log('Token:', token);
  console.log('Auth token:', process.env.AUTH_TOKEN);

  if (!token || token !== process.env.AUTH_TOKEN) {
    ctx.status = 403;
    ctx.body = { error: 'Unauthorized' };
    return;
  }

  await next();
}