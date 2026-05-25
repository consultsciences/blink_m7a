import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import { getDB, generateId, now } from '../lib/db';

const stripeWebhook = new Hono();

// POST /api/stripe/webhook
stripeWebhook.post('/', async (c) => {
  const env = c.env as any;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET || '';
  const stripeSecretKey = env.STRIPE_SECRET_KEY || '';

  if (!webhookSecret || !stripeSecretKey) {
    console.warn('Stripe not configured — webhook ignored');
    return c.json({ received: true, note: 'Stripe not configured' });
  }

  const body = await c.req.text();
  const signature = c.req.header('stripe-signature');
  if (!signature) return c.json({ error: 'Missing stripe-signature header' }, 400);

  let event: any;
  try {
    event = await verifyStripeSignature(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Stripe signature verification failed:', err.message);
    return c.json({ error: 'Invalid signature' }, 400);
  }

  const blink = getDB(env);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const customerId = sub.customer as string;

        const rows = await blink.db.subscriptions.list({
          where: { stripeCustomerId: customerId },
          limit: 1,
        });

        if (!rows || rows.length === 0) {
          console.warn(`No subscription found for customer ${customerId}`);
          break;
        }

        const existing = rows[0] as any;
        const plan = getPlanFromPriceId(sub.items?.data?.[0]?.price?.id, env);
        const creditsLimit = getCreditsForPlan(plan);

        await blink.db.subscriptions.update(existing.id, {
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items?.data?.[0]?.price?.id || null,
          plan,
          status: sub.status,
          currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: sub.cancel_at_period_end ? 1 : 0,
          trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          creditsLimit,
          updatedAt: now(),
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const rows = await blink.db.subscriptions.list({
          where: { stripeSubscriptionId: sub.id },
          limit: 1,
        });

        if (rows.length > 0) {
          await blink.db.subscriptions.update((rows[0] as any).id, {
            plan: 'free',
            status: 'canceled',
            cancelAtPeriodEnd: 0,
            creditsLimit: 5,
            updatedAt: now(),
          });
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'payment') {
          const metadata = session.metadata || {};
          const userId = metadata.userId;
          const creditsToAdd = parseInt(metadata.credits || '0');

          if (userId && creditsToAdd > 0) {
            const rows = await blink.db.subscriptions.list({ where: { userId }, limit: 1 });
            if (rows.length > 0) {
              const existing = rows[0] as any;
              await blink.db.subscriptions.update(existing.id, {
                creditsLimit: (existing.creditsLimit || 5) + creditsToAdd,
                updatedAt: now(),
              });
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const rows = await blink.db.subscriptions.list({
          where: { stripeCustomerId: invoice.customer as string },
          limit: 1,
        });
        if (rows.length > 0) {
          await blink.db.subscriptions.update((rows[0] as any).id, {
            status: 'past_due',
            updatedAt: now(),
          });
        }
        break;
      }
    }

    return c.json({ received: true });
  } catch (err: any) {
    console.error(`Error handling event ${event.type}:`, err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

// POST /api/stripe/create-checkout
stripeWebhook.post('/create-checkout', async (c) => {
  const env = c.env as any;
  const stripeSecretKey = env.STRIPE_SECRET_KEY || '';
  if (!stripeSecretKey) return c.json({ error: 'Stripe not configured.' }, 503);

  const body = await c.req.json();
  const { userId, email, priceId, planName, successUrl, cancelUrl } = body;
  if (!userId || !priceId || !successUrl) return c.json({ error: 'Missing required fields' }, 400);

  const blink = getDB(env);
  let rows = await blink.db.subscriptions.list({ where: { userId }, limit: 1 });
  let stripeCustomerId: string | null = (rows[0] as any)?.stripeCustomerId || null;

  if (!stripeCustomerId) {
    const customerRes = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${stripeSecretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email: email || '', 'metadata[userId]': userId }),
    });
    const customer = await customerRes.json() as any;
    stripeCustomerId = customer.id;

    const ts = now();
    if (rows.length === 0) {
      await blink.db.subscriptions.create({
        id: generateId('sub'),
        userId,
        stripeCustomerId,
        plan: 'free',
        status: 'inactive',
        creditsUsed: 0,
        creditsLimit: 5,
        createdAt: ts,
        updatedAt: ts,
      });
    } else {
      await blink.db.subscriptions.update((rows[0] as any).id, { stripeCustomerId, updatedAt: ts });
    }
  }

  const params = new URLSearchParams({
    'customer': stripeCustomerId!,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'mode': 'subscription',
    'success_url': successUrl,
    'cancel_url': cancelUrl || successUrl,
    'allow_promotion_codes': 'true',
    'metadata[userId]': userId,
    'metadata[planName]': planName || '',
  });

  const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${stripeSecretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const session = await sessionRes.json() as any;
  if (session.error) return c.json({ error: session.error.message }, 400);
  return c.json({ url: session.url, sessionId: session.id });
});

// GET /api/stripe/subscription
stripeWebhook.get('/subscription', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const blink = getDB(c.env as any);
  const rows = await blink.db.subscriptions.list({ where: { userId: auth.userId }, limit: 1 });

  if (rows.length === 0) {
    return c.json({ subscription: { plan: 'free', status: 'inactive', creditsUsed: 0, creditsLimit: 5 } });
  }

  const sub = { ...(rows[0] as any) };
  delete sub.stripeCustomerId; // Don't expose billing identifiers
  return c.json({ subscription: sub });
});

// POST /api/stripe/portal
stripeWebhook.post('/portal', async (c) => {
  const env = c.env as any;
  const stripeSecretKey = env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) return c.json({ error: 'Stripe not configured' }, 500);

  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const { returnUrl } = body;

  const blink = getDB(env);
  const rows = await blink.db.subscriptions.list({ where: { userId: auth.userId }, limit: 1 });
  if (rows.length === 0 || !(rows[0] as any).stripeCustomerId) {
    return c.json({ error: 'No billing account found' }, 404);
  }

  const stripeCustomerId = (rows[0] as any).stripeCustomerId;
  const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${stripeSecretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ 'customer': stripeCustomerId, 'return_url': returnUrl || 'https://m7a.blink.new' }),
  });

  const portal = await portalRes.json() as any;
  if (portal.error) return c.json({ error: portal.error.message }, 400);
  return c.json({ url: portal.url });
});

// --- Helpers ---
function getPlanFromPriceId(priceId: string | undefined, env: any): string {
  if (!priceId) return 'free';
  if (priceId === env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === env.STRIPE_PRICE_TEAM) return 'team';
  return 'starter';
}

function getCreditsForPlan(plan: string): number {
  const map: Record<string, number> = { free: 5, starter: 50, pro: 500, team: 2000 };
  return map[plan] ?? 5;
}

async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<any> {
  const parts = signature.split(',').reduce((acc: Record<string, string>, part) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts['t'];
  const expectedSig = parts['v1'];
  if (!timestamp || !expectedSig) throw new Error('Invalid signature format');

  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) throw new Error('Timestamp too old');

  const signedPayload = `${timestamp}.${payload}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signedPayload));
  const computedSig = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  if (computedSig !== expectedSig) throw new Error('Signature mismatch');
  return JSON.parse(payload);
}

export default stripeWebhook;
