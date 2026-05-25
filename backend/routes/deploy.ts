import { Hono } from 'hono';
import { requireAuth } from '../lib/auth';
import { getDB, generateId, now } from '../lib/db';

const deploy = new Hono();

// POST /api/deploy/vercel — deploy files to Vercel
deploy.post('/vercel', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const { projectId, files, vercelToken, projectName, framework = 'vite' } = body;

  if (!projectId || !files || !vercelToken) {
    return c.json({ error: 'projectId, files, and vercelToken are required' }, 400);
  }

  const blink = getDB(c.env as any);

  const project = await blink.db.projects.get(projectId);
  if (!project || (project as any).userId !== auth.userId) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const vHeaders = {
    'Authorization': `Bearer ${vercelToken}`,
    'Content-Type': 'application/json',
  };

  const cleanName = (projectName || (project as any).name || 'm7a-project')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 52);

  // Check if we already have a Vercel deployment for this project
  const existing = await blink.db.vercelDeployments.list({
    where: { projectId, userId: auth.userId },
    limit: 1,
  });

  let vercelProjectId: string | null = null;
  if (existing.length > 0 && (existing[0] as any).vercelProjectId) {
    vercelProjectId = (existing[0] as any).vercelProjectId;
  } else {
    // Create Vercel project
    const createRes = await fetch('https://api.vercel.com/v9/projects', {
      method: 'POST',
      headers: vHeaders,
      body: JSON.stringify({
        name: cleanName,
        framework: framework === 'vite' ? 'vite' : null,
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
        installCommand: 'npm install',
      }),
    });

    if (createRes.ok) {
      const created = await createRes.json() as any;
      vercelProjectId = created.id;
    } else {
      // Project might already exist under this name
      const listRes = await fetch(`https://api.vercel.com/v9/projects/${cleanName}`, { headers: vHeaders });
      if (listRes.ok) {
        const existingProject = await listRes.json() as any;
        vercelProjectId = existingProject.id;
      } else {
        const err = await createRes.json() as any;
        return c.json({ error: err.error?.message || 'Failed to create Vercel project' }, 400);
      }
    }
  }

  // Build file list for deployment
  const deployFiles = Object.entries(files as Record<string, string>).map(([path, content]) => ({
    file: path,
    data: content,
    encoding: 'utf-8',
  }));

  // Create deployment
  const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: vHeaders,
    body: JSON.stringify({
      name: cleanName,
      project: vercelProjectId,
      files: deployFiles,
      target: 'production',
      projectSettings: {
        framework: 'vite',
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
        installCommand: 'npm install',
        devCommand: 'npm run dev',
      },
    }),
  });

  if (!deployRes.ok) {
    const err = await deployRes.json() as any;
    return c.json({ error: err.error?.message || 'Deployment failed' }, 400);
  }

  const deployment = await deployRes.json() as any;
  const deploymentId = deployment.id;
  const deploymentUrl = `https://${deployment.url}`;
  const ts = now();

  const deployData = {
    projectId,
    userId: auth.userId,
    vercelProjectId: vercelProjectId!,
    vercelDeploymentId: deploymentId,
    deploymentUrl,
    status: deployment.readyState || 'BUILDING',
    // Store token encrypted in production; omit here for brevity
    updatedAt: ts,
  };

  if (existing.length > 0) {
    await blink.db.vercelDeployments.update((existing[0] as any).id, deployData);
  } else {
    await blink.db.vercelDeployments.create({
      id: generateId('vdep'),
      ...deployData,
      createdAt: ts,
    });
  }

  await blink.db.projectVersions.create({
    id: generateId('ver'),
    projectId,
    userId: auth.userId,
    versionNumber: 1,
    description: `Deployed to Vercel: ${deploymentUrl}`,
    vercelDeploymentUrl: deploymentUrl,
    createdAt: ts,
  });

  return c.json({
    ok: true,
    deploymentId,
    deploymentUrl,
    vercelProjectId,
    status: deployment.readyState || 'BUILDING',
    inspectorUrl: `https://vercel.com/dashboard`,
  });
});

// GET /api/deploy/vercel/:projectId — get deployment status
deploy.get('/vercel/:projectId', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');
  const blink = getDB(c.env as any);

  const rows = await blink.db.vercelDeployments.list({
    where: { projectId, userId: auth.userId },
    limit: 1,
  });

  if (rows.length === 0) return c.json({ deployment: null });

  const dep = rows[0] as any;
  const { vercelDeploymentId } = dep;
  const vercelToken = c.req.header('x-vercel-token');

  if (vercelDeploymentId && vercelToken) {
    try {
      const res = await fetch(`https://api.vercel.com/v13/deployments/${vercelDeploymentId}`, {
        headers: { 'Authorization': `Bearer ${vercelToken}` },
      });
      if (res.ok) {
        const live = await res.json() as any;
        const liveStatus = live.readyState || dep.status;
        if (liveStatus !== dep.status) {
          await blink.db.vercelDeployments.update(dep.id, {
            status: liveStatus,
            deploymentUrl: live.url ? `https://${live.url}` : dep.deploymentUrl,
            updatedAt: now(),
          });
          dep.status = liveStatus;
          if (live.url) dep.deploymentUrl = `https://${live.url}`;
        }
      }
    } catch { /* return cached */ }
  }

  return c.json({ deployment: dep });
});

// GET /api/deploy/vercel/:projectId/check-status
deploy.get('/vercel/:projectId/check-status', async (c) => {
  const auth = await requireAuth(c);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');
  const blink = getDB(c.env as any);

  const rows = await blink.db.vercelDeployments.list({
    where: { projectId, userId: auth.userId },
    limit: 1,
  });

  if (rows.length === 0) return c.json({ status: 'none' });

  const dep = rows[0] as any;
  return c.json({
    status: dep.status,
    deploymentUrl: dep.deploymentUrl,
    aliasUrl: dep.aliasUrl,
  });
});

export default deploy;
