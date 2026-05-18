import { createClient } from '@supabase/supabase-js'; // Or your preferred DB adapter/ORM

export function getDB(env: Record<string, string>) {
  // Replace the Blink client hook initialization with your independent persistent storage pool
  return createClient(
    env.SUPABASE_URL, 
    env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function now() {
  return new Date().toISOString();
}
