import { Context } from 'hono';
import { getDB } from './db';

export interface AuthenticatedUser {
  userId: string;
  valid: boolean;
}

export async function requireAuth(c: Context): Promise<AuthenticatedUser | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  try {
    const blink = getDB(c.env as Record<string, string>);
    const result = await (blink as any).auth.verifyToken(authHeader);
    if (!result?.valid || !result?.userId) return null;
    return { userId: result.userId, valid: true };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}
