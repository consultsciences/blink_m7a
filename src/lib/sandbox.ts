import { blink } from './blink';

export async function createSandbox() {
  const sandbox = await (blink as any).sandbox.create({
    template: 'devtools-base',
    metadata: { type: 'code-editor' }
  });
  return sandbox;
}

export function getPreviewUrl(sandboxId: string, port: number = 5173) {
  // Use the internal getHost method if we have a sandbox object, 
  // but since we only have the ID here, we use the standard format.
  return `https://${port}-${sandboxId}.preview-blink.com`;
}

export async function connectSandbox(sandboxId: string) {
  return await (blink as any).sandbox.connect(sandboxId);
}
