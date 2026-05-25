import { createClient } from '@blinkdotnew/sdk';

export function getDB(env: Record<string, string>) {
  return createClient({
    projectId: env.BLINK_PROJECT_ID,
    secretKey: env.BLINK_SECRET_KEY,
  });
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function now() {
  return new Date().toISOString();
}
