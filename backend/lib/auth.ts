import { createClient } from '@blinkdotnew/sdk';
import type { Context } from 'hono';

export async function requireAuth(c: Context): Promise<{ userId: string; email: string } | null> {
  const blink = createClient({
    projectId: (c.env as any).BLINK_PROJECT_ID,
    secretKey: (c.env as any).BLINK_SECRET_KEY,
  });

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const result = await blink.auth.verifyToken(authHeader);
    if (!result.valid) return null;
    return { userId: result.userId!, email: result.email! };
  } catch {
    return null;
  }
}
