import { blink } from './blink';

export async function createSandbox() {
  const sandbox = await (blink as any).sandbox.create({
    template: 'devtools-base',
    metadata: { type: 'code-editor' }
  });
  return sandbox;
}

export function getPreviewUrl(sandboxId: string, port: number = 5173) {
  return `https://${port}-${sandboxId}.preview-blink.com`;
}

export async function connectSandbox(sandboxId: string) {
  return await (blink as any).sandbox.connect(sandboxId);
}

/** Poll the preview URL until it responds with a non-error status, or timeout. */
export async function waitForDevServer(
  sandboxId: string,
  { timeoutMs = 30_000, intervalMs = 1_000 } = {}
): Promise<boolean> {
  const url = getPreviewUrl(sandboxId);
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3_000) });
      if (res.ok || res.status === 404) return true; // server is up
    } catch {
      // not ready yet
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return false; // timed out
}
