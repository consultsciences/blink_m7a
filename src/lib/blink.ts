import { createClient } from '@blinkdotnew/sdk';

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'cursorai-code-studio-lqc5wfwd',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_a7mDUnAdyRl7YDGtELgE0VjT6vC9Kp5I',
  auth: { mode: 'managed' }
});
