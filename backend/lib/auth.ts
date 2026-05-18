import { Context } from 'hono';
import { verify } from 'hono/jwt'; // Native cryptographic verification out-of-the-box

export interface AuthenticatedUser {
  userId: string;
  valid: boolean;
}

export async function requireAuth(c: Context): Promise<AuthenticatedUser | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const env = c.env as Record<string, string>;
  
  // Use an independent JWT Secret Key injected from your host's environment variables
  const jwtSecret = env.JWT_SECRET; 

  try {
    // Cryptographically decrypt and validate the signature on your own compute instance
    const payload = await verify(token, jwtSecret);
    
    if (!payload || !payload.sub) {
      return null;
    }

    return {
      userId: payload.sub as string, // Your standard User ID identifier
      valid: true
    };
  } catch (error) {
    console.error('Independent JWT Verification Fail:', error);
    return null;
  }
}
