import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@blinkdotnew/sdk';
import projectsRouter from './routes/projects';
import stripeRouter from './routes/stripe-webhook';
import jobsRouter from './routes/jobs';
import githubRouter from './routes/github';
import deployRouter from './routes/deploy';
import templatesRouter from './routes/templates';

const app = new Hono();

// CORS — allow the m7a frontend
app.use('*', cors({
  origin: ['https://cursorai-code-studio-lqc5wfwd.sites.blink.new', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  exposeHeaders: ['Content-Length'],
  credentials: true,
}));

// Health
app.get('/health', (c) => c.json({ ok: true, service: 'm7a-backend', ts: new Date().toISOString() }));

// Subscription check helper — used by frontend
app.get('/api/me/subscription', async (c) => {
  const env = c.env as any;
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401);

  const blink = createClient({
    projectId: env.BLINK_PROJECT_ID,
    secretKey: env.BLINK_SECRET_KEY,
  });

  const result = await blink.auth.verifyToken(authHeader);
  if (!result.valid) return c.json({ error: 'Unauthorized' }, 401);

  const rows = await blink.db.subscriptions.list({
    where: { userId: result.userId },
    limit: 1,
  });

  if (rows.length === 0) {
    return c.json({
      plan: 'free',
      status: 'inactive',
      creditsUsed: 0,
      creditsLimit: 5,
    });
  }

  const sub = rows[0] as any;
  return c.json({
    plan: sub.plan,
    status: sub.status,
    creditsUsed: sub.creditsUsed,
    creditsLimit: sub.creditsLimit,
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: Number(sub.cancelAtPeriodEnd) > 0,
  });
});

// Mount routers
app.route('/api/projects', projectsRouter);
app.route('/api/stripe', stripeRouter);
app.route('/api/jobs', jobsRouter);
app.route('/api/github', githubRouter);
app.route('/api/deploy', deployRouter);
app.route('/api/templates', templatesRouter);

// 404
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Backend error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
