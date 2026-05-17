import { Context } from 'hono';
import { createClient } from '@blinkdotnew/sdk';

export interface AuthenticatedUser {
  userId: string;
  valid: boolean;
}

/**
 * Validates incoming Bearer tokens using the unified platform authentication client
 */
export async function requireAuth(c: Context): Promise<AuthenticatedUser | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return null;
  }

  const env = c.env as Record<string, string>;
  
  try {
    const blink = createClient({
      projectId: env.BLINK_PROJECT_ID,
      secretKey: env.BLINK_SECRET_KEY,
    });

    // Pass down direct token verification sequences safely to platform servers
    const result = await blink.auth.verifyToken(authHeader);
    
    if (!result || !result.valid) {
      return null;
    }

    return {
      userId: result.userId,
      valid: true
    };
  } catch (error) {
    console.error('Middleware Security Token Exception:', error);
    return null;
  }
}
