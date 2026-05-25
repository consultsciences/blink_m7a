import React, { useState, useEffect } from 'react';
import { Upload, Github, ExternalLink, Loader2, Check, X, ChevronDown } from 'lucide-react';
import { blink } from '../lib/blink';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface DeployButtonProps {
  projectId: string;
  files: Record<string, string>;
}

type DeployState = 'idle' | 'loading' | 'success' | 'error';

export function DeployButton({ projectId, files }: DeployButtonProps) {
  const [modal, setModal] = useState<'vercel' | 'github' | null>(null);
  const [deployState, setDeployState] = useState<DeployState>('idle');
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Vercel form state
  const [vercelToken, setVercelToken] = useState('');
  const [projectName, setProjectName] = useState('');

  // GitHub form state
  const [githubToken, setGithubToken] = useState('');
  const [repoName, setRepoName] = useState('');
  const [repoPrivate, setRepoPrivate] = useState(false);

  const reset = () => {
    setDeployState('idle');
    setDeployUrl(null);
    setErrorMsg(null);
  };

  const closeModal = () => {
    setModal(null);
    reset();
  };

  const getAuthHeader = async () => {
    const session = await (blink as any).auth.getSession();
    return session?.access_token ? `Bearer ${session.access_token}` : '';
  };

  const deployToVercel = async () => {
    if (!vercelToken.trim()) return;
    setDeployState('loading');
    setErrorMsg(null);

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch('/api/deploy/vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify({ projectId, files, vercelToken, projectName: projectName.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deployment failed');
      setDeployState('success');
      setDeployUrl(data.deploymentUrl);
    } catch (err: any) {
      setDeployState('error');
      setErrorMsg(err.message);
    }
  };

  const exportToGitHub = async () => {
    if (!githubToken.trim() || !repoName.trim()) return;
    setDeployState('loading');
    setErrorMsg(null);

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch('/api/github/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify({
          projectId,
          files,
          githubToken,
          repoName: repoName.trim(),
          isPrivate: repoPrivate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Export failed');
      setDeployState('success');
      setDeployUrl(data.repo?.url);
    } catch (err: any) {
      setDeployState('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Upload className="w-3 h-3" />
            Deploy
            <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#111] border-border/50 text-xs w-44">
          <DropdownMenuItem
            className="gap-2 cursor-pointer focus:bg-white/5"
            onClick={() => { reset(); setModal('vercel'); }}
          >
            <Upload size={12} className="text-muted-foreground" />
            Deploy to Vercel
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/30" />
          <DropdownMenuItem
            className="gap-2 cursor-pointer focus:bg-white/5"
            onClick={() => { reset(); setModal('github'); }}
          >
            <Github size={12} className="text-muted-foreground" />
            Export to GitHub
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Vercel Deploy Dialog ─────────────────────────── */}
      <Dialog open={modal === 'vercel'} onOpenChange={open => !open && closeModal()}>
        <DialogContent className="max-w-md bg-[#0d0d0d] border-[#2d2d2d] text-foreground gap-0 p-0 overflow-hidden">
          <DialogHeader className="p-5 border-b border-[#2d2d2d] bg-[#0a0a0a]">
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Upload size={15} /> Deploy to Vercel
            </DialogTitle>
          </DialogHeader>

          {deployState === 'success' ? (
            <div className="p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Deployment triggered!</p>
                <p className="text-xs text-muted-foreground mt-1">Your app is building on Vercel.</p>
              </div>
              {deployUrl && (
                <a
                  href={deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <ExternalLink size={12} /> {deployUrl}
                </a>
              )}
              <Button size="sm" variant="outline" onClick={closeModal} className="mt-2 text-xs border-border/50">
                Done
              </Button>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {deployState === 'error' && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <X size={12} className="mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Vercel Token <span className="text-red-400">*</span></label>
                <Input
                  type="password"
                  value={vercelToken}
                  onChange={e => setVercelToken(e.target.value)}
                  placeholder="vercel_…"
                  className="h-8 text-xs bg-[#141414] border-[#2d2d2d] focus:border-[#3d3d3d]"
                />
                <p className="text-[10px] text-muted-foreground/40">
                  Get one at{' '}
                  <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:underline">
                    vercel.com/account/tokens
                  </a>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Project name (optional)</label>
                <Input
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="my-app"
                  className="h-8 text-xs bg-[#141414] border-[#2d2d2d] focus:border-[#3d3d3d]"
                />
              </div>

              <Button
                onClick={deployToVercel}
                disabled={!vercelToken.trim() || deployState === 'loading'}
                className="w-full h-8 text-xs"
              >
                {deployState === 'loading' ? (
                  <><Loader2 className="w-3 h-3 animate-spin mr-2" /> Deploying…</>
                ) : (
                  <><Upload className="w-3 h-3 mr-2" /> Deploy</>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── GitHub Export Dialog ─────────────────────────── */}
      <Dialog open={modal === 'github'} onOpenChange={open => !open && closeModal()}>
        <DialogContent className="max-w-md bg-[#0d0d0d] border-[#2d2d2d] text-foreground gap-0 p-0 overflow-hidden">
          <DialogHeader className="p-5 border-b border-[#2d2d2d] bg-[#0a0a0a]">
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Github size={15} /> Export to GitHub
            </DialogTitle>
          </DialogHeader>

          {deployState === 'success' ? (
            <div className="p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Exported successfully!</p>
                <p className="text-xs text-muted-foreground mt-1">Your code is now on GitHub.</p>
              </div>
              {deployUrl && (
                <a
                  href={deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <ExternalLink size={12} /> {deployUrl}
                </a>
              )}
              <Button size="sm" variant="outline" onClick={closeModal} className="mt-2 text-xs border-border/50">
                Done
              </Button>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {deployState === 'error' && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <X size={12} className="mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">GitHub Token <span className="text-red-400">*</span></label>
                <Input
                  type="password"
                  value={githubToken}
                  onChange={e => setGithubToken(e.target.value)}
                  placeholder="ghp_…"
                  className="h-8 text-xs bg-[#141414] border-[#2d2d2d] focus:border-[#3d3d3d]"
                />
                <p className="text-[10px] text-muted-foreground/40">
                  Create one at{' '}
                  <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:underline">
                    github.com/settings/tokens
                  </a>{' '}
                  with <code>repo</code> scope.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Repository name <span className="text-red-400">*</span></label>
                <Input
                  value={repoName}
                  onChange={e => setRepoName(e.target.value)}
                  placeholder="my-app"
                  className="h-8 text-xs bg-[#141414] border-[#2d2d2d] focus:border-[#3d3d3d]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={repoPrivate}
                  onChange={e => setRepoPrivate(e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-xs text-muted-foreground">Private repository</span>
              </label>

              <Button
                onClick={exportToGitHub}
                disabled={!githubToken.trim() || !repoName.trim() || deployState === 'loading'}
                className="w-full h-8 text-xs"
              >
                {deployState === 'loading' ? (
                  <><Loader2 className="w-3 h-3 animate-spin mr-2" /> Exporting…</>
                ) : (
                  <><Github className="w-3 h-3 mr-2" /> Export</>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
