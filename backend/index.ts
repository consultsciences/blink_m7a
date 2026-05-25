import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getDB } from './lib/db';
import { requireAuth } from './lib/auth';
import projectsRouter from './routes/projects';
import stripeRouter from './routes/stripe-webhook';
import jobsRouter from './routes/jobs';
import githubRouter from './routes/github';
import deployRouter from './routes/deploy';
import templatesRouter from './routes/templates';

const app = new Hono();

// CORS — allow m7a frontend origins
app.use('*', cors({
  origin: (origin) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    // Allow all *.blink.new and *.sites.blink.new origins
    if (!origin) return null;
    if (allowed.includes(origin)) return origin;
    if (origin.endsWith('.blink.new') || origin.endsWith('.sites.blink.new')) return origin;
    return null;
  },
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  exposeHeaders: ['Content-Length'],
  credentials: true,
}));

// Health
app.get('/health', (c) => c.json({ ok: true, service: 'm7a-backend', ts: new Date().toISOString() }));

// Subscription check helper
app.get('/api/me/subscription', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const blink = getDB(c.env as any);

  const rows = await blink.db.subscriptions.list({
    where: { userId: auth.userId },
    limit: 1,
  });

  if (!rows || rows.length === 0) {
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
