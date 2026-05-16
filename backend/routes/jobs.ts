import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import { getDB, generateId, now } from '../lib/db';

const jobs = new Hono();

// POST /api/jobs — create a build job
jobs.post('/', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const { projectId, prompt, sandboxId, modelId, agentMode } = body;
  if (!projectId || !prompt) return c.json({ error: 'projectId and prompt required' }, 400);

  const blink = getDB(c.env as any);
  const ts = now();
  const id = generateId('job');

  // Check subscription credits
  const subs = await blink.db.subscriptions.list({ where: { userId: auth.userId }, limit: 1 });
  if (subs.length > 0) {
    const sub = subs[0] as any;
    if (sub.creditsUsed >= sub.creditsLimit) {
      return c.json({ error: 'Credit limit reached. Please upgrade your plan.' }, 402);
    }
  }

  const job = await blink.db.buildJobs.create({
    id,
    projectId,
    userId: auth.userId,
    sandboxId: sandboxId || null,
    status: 'pending',
    jobType: 'build',
    prompt,
    modelId: modelId || 'google/gemini-3-flash',
    agentMode: agentMode || 'agent',
    attempts: 0,
    maxAttempts: 3,
    createdAt: ts,
    updatedAt: ts,
  });

  // Log job creation
  await blink.db.buildLogs.create({
    id: generateId('log'),
    jobId: id,
    level: 'info',
    message: 'Build job created',
    data: JSON.stringify({ prompt: prompt.slice(0, 100) }),
    createdAt: ts,
  });

  return c.json({ job }, 201);
});

// GET /api/jobs/:id — get job status + logs
jobs.get('/:id', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const jobId = c.req.param('id');
  const blink = getDB(c.env as any);

  const job = await blink.db.buildJobs.get(jobId);
  if (!job || (job as any).userId !== auth.userId) {
    return c.json({ error: 'Not found' }, 404);
  }

  const logs = await blink.db.buildLogs.list({
    where: { jobId },
    orderBy: { createdAt: 'asc' },
    limit: 500,
  });

  return c.json({ job, logs });
});

// PATCH /api/jobs/:id — update job status (called by agent runner)
jobs.patch('/:id', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const jobId = c.req.param('id');
  const blink = getDB(c.env as any);

  const job = await blink.db.buildJobs.get(jobId);
  if (!job || (job as any).userId !== auth.userId) {
    return c.json({ error: 'Not found' }, 404);
  }

  const body = await c.req.json();
  const allowed = ['status', 'sandboxId', 'result', 'lastError', 'startedAt', 'completedAt', 'attempts'];
  const updates: Record<string, any> = { updatedAt: now() };
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  await blink.db.buildJobs.update(jobId, updates);

  // If completed, increment credits_used
  if (body.status === 'completed') {
    const subs = await blink.db.subscriptions.list({ where: { userId: auth.userId }, limit: 1 });
    if (subs.length > 0) {
      const sub = subs[0] as any;
      await blink.db.subscriptions.update(sub.id, {
        creditsUsed: (sub.creditsUsed || 0) + 1,
        updatedAt: now(),
      });
    }
  }

  return c.json({ ok: true });
});

// POST /api/jobs/:id/logs — append a log entry
jobs.post('/:id/logs', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const jobId = c.req.param('id');
  const blink = getDB(c.env as any);

  const job = await blink.db.buildJobs.get(jobId);
  if (!job || (job as any).userId !== auth.userId) {
    return c.json({ error: 'Not found' }, 404);
  }

  const body = await c.req.json();
  const { level = 'info', message, data } = body;

  if (!message) return c.json({ error: 'message required' }, 400);

  await blink.db.buildLogs.create({
    id: generateId('log'),
    jobId,
    level,
    message,
    data: data ? JSON.stringify(data) : null,
    createdAt: now(),
  });

  return c.json({ ok: true });
});

// GET /api/jobs — list user's recent jobs
jobs.get('/', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const blink = getDB(c.env as any);
  const rows = await blink.db.buildJobs.list({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
    limit: 50,
  });

  return c.json({ jobs: rows });
});

export default jobs;
