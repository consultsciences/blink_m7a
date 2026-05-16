import { Hono } from 'hono';
import { getDB } from '../lib/db';

const templates = new Hono();

// GET /api/templates — list all templates (public)
templates.get('/', async (c) => {
  const blink = getDB(c.env as any);
  const category = c.req.query('category');
  const featured = c.req.query('featured');

  const where: Record<string, any> = {};
  if (category) where.category = category;
  if (featured === 'true') where.isFeatured = '1';

  const rows = await blink.db.templates.list({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: { useCount: 'desc' },
    limit: 50,
  });

  return c.json({ templates: rows });
});

// GET /api/templates/:id — get a single template
templates.get('/:id', async (c) => {
  const blink = getDB(c.env as any);
  const id = c.req.param('id');

  const template = await blink.db.templates.get(id);
  if (!template) return c.json({ error: 'Not found' }, 404);

  // Increment use count
  await blink.db.templates.update(id, {
    useCount: ((template as any).useCount || 0) + 1,
  });

  return c.json({ template });
});

export default templates;
