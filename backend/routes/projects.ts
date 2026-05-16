import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import { getDB, generateId, now } from '../lib/db';

const projects = new Hono();

// GET /api/projects — list user's projects
projects.get('/', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const blink = getDB(c.env as any);
  const rows = await blink.db.projects.list({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
    limit: 100,
  });

  return c.json({ projects: rows });
});

// POST /api/projects — create project
projects.post('/', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const { name, prompt, sandboxId, projectType, techStack } = body;

  if (!prompt) return c.json({ error: 'prompt is required' }, 400);

  const blink = getDB(c.env as any);
  const ts = now();
  const id = generateId('proj');

  const project = await blink.db.projects.create({
    id,
    userId: auth.userId,
    name: name || prompt.slice(0, 40) + (prompt.length > 40 ? '…' : ''),
    prompt,
    sandboxId: sandboxId || null,
    status: 'active',
    projectType: projectType || 'fullstack',
    techStack: techStack || null,
    createdAt: ts,
    updatedAt: ts,
  });

  return c.json({ project }, 201);
});

// PATCH /api/projects/:id — update project
projects.patch('/:id', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('id');
  const blink = getDB(c.env as any);

  // Verify ownership
  const existing = await blink.db.projects.get(projectId);
  if (!existing || (existing as any).userId !== auth.userId) {
    return c.json({ error: 'Not found' }, 404);
  }

  const body = await c.req.json();
  const allowed = ['name', 'sandboxId', 'status', 'thumbnailUrl', 'isPublic', 'techStack'];
  const updates: Record<string, any> = { updatedAt: now() };
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  await blink.db.projects.update(projectId, updates);
  return c.json({ ok: true });
});

// DELETE /api/projects/:id
projects.delete('/:id', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('id');
  const blink = getDB(c.env as any);

  const existing = await blink.db.projects.get(projectId);
  if (!existing || (existing as any).userId !== auth.userId) {
    return c.json({ error: 'Not found' }, 404);
  }

  await blink.db.projects.delete(projectId);
  return c.json({ ok: true });
});

export default projects;
