import { useEffect, useState, useRef, useCallback } from 'react';
import { useBlinkAuth } from '@blinkdotnew/react';
import { createSandbox, connectSandbox } from './lib/sandbox';
import { blink } from './lib/blink';
import { PromptScreen } from './components/PromptScreen';
import { EditorLayout } from './components/EditorLayout';
import { HistoryModal, Project } from './components/HistoryModal';
import { UserMenu } from './components/UserMenu';
import { History as HistoryIcon, Plus } from 'lucide-react';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';
import gsap from 'gsap';

export default function App() {
  const { isAuthenticated, isLoading: authLoading, user } = useBlinkAuth();
  const [sandbox, setSandbox] = useState<any>(null);
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  const hasUrlSandbox = typeof window !== 'undefined' && !!new URLSearchParams(window.location.search).get('sandboxId');
  const [hasPromptStarted, setHasPromptStarted] = useState(hasUrlSandbox);
  const [showEditor, setShowEditor] = useState(hasUrlSandbox);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [shouldCreateProject, setShouldCreateProject] = useState(false);

  const promptScreenRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // ── Sandbox initialization ─────────────────────────────────────────────────
  const initSandbox = useCallback(async () => {
    if (sandboxLoading || sandbox) return;
    setSandboxLoading(true);
    setSandboxError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      const sandboxId = params.get('sandboxId');
      if (sandboxId) {
        try {
          const sb = await connectSandbox(sandboxId);
          setSandbox(sb);
          setHasPromptStarted(true);
          setShowEditor(true);
          return;
        } catch {
          window.history.replaceState({}, '', '/');
          setHasPromptStarted(false);
          setShowEditor(false);
        }
      }
      const sb = await createSandbox();
      setSandbox(sb);
    } catch (err) {
      setSandboxError(err instanceof Error ? err.message : 'Failed to initialize sandbox');
    } finally {
      setSandboxLoading(false);
    }
  }, [sandbox, sandboxLoading]);

  useEffect(() => {
    if (isAuthenticated && !sandbox) initSandbox();
  }, [isAuthenticated, sandbox]);

  // ── Project creation ───────────────────────────────────────────────────────
  useEffect(() => {
    const save = async () => {
      if (!shouldCreateProject || !sandbox?.id || !initialPrompt || !isAuthenticated) return;
      try {
        const currentUser = await blink.auth.me();
        if (currentUser) {
          await blink.db.table('projects').create({
            userId: currentUser.id,
            name: initialPrompt.slice(0, 40) + (initialPrompt.length > 40 ? '…' : ''),
            prompt: initialPrompt,
            sandboxId: sandbox.id,
            createdAt: new Date().toISOString(),
          });
          setShouldCreateProject(false);
        }
      } catch (err) {
        console.error('Failed to save project', err);
      }
    };
    save();
  }, [shouldCreateProject, sandbox, initialPrompt, isAuthenticated]);

  // ── Prompt → Editor transition ─────────────────────────────────────────────
  const handleStartPrompt = async (prompt: string) => {
    setInitialPrompt(prompt);
    setHasPromptStarted(true);
    setShouldCreateProject(true);
    if (sandbox?.id) window.history.pushState({}, '', `?sandboxId=${sandbox.id}`);

    const tl = gsap.timeline({ onComplete: () => setShowEditor(true) });
    if (promptScreenRef.current) {
      tl.to(promptScreenRef.current, { opacity: 0, scale: 0.95, filter: 'blur(10px)', duration: 0.7, ease: 'power2.inOut' });
    }
    if (editorRef.current) {
      tl.fromTo(editorRef.current,
        { opacity: 0, scale: 1.04, filter: 'blur(10px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
        '-=0.4'
      );
    }
  };

  // ── History project selection ──────────────────────────────────────────────
  const handleSelectProject = async (project: Project) => {
    setShowHistory(false);
    setShouldCreateProject(false);
    if (sandbox?.id === project.sandboxId) return;
    window.history.pushState({}, '', `?sandboxId=${project.sandboxId}`);
    try {
      const newSandbox = await connectSandbox(project.sandboxId);
      setSandbox(newSandbox);
      setInitialPrompt(project.prompt);
      if (!showEditor) {
        setHasPromptStarted(true);
        setShowEditor(true);
        if (promptScreenRef.current) promptScreenRef.current.style.display = 'none';
        if (editorRef.current) {
          editorRef.current.style.opacity = '1';
          editorRef.current.style.visibility = 'visible';
          editorRef.current.style.filter = 'none';
          editorRef.current.style.transform = 'none';
        }
      }
    } catch {
      alert('Could not reconnect to this project. It may have expired.');
    }
  };

  const handleHome = () => {
    window.history.pushState({}, '', '/');
    window.location.reload();
  };

  const handleLogin = () => blink.auth.login();

  // User info for avatar
  const userInitial = (user as any)?.displayName?.[0]?.toUpperCase() || (user as any)?.email?.[0]?.toUpperCase() || 'U';
  const userAvatar = (user as any)?.avatarUrl || null;

  // ── Auth loading ───────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#111111]">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#444] border-t-white" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#111111] relative overflow-hidden">
      {isAuthenticated && (
        <HistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          onSelectProject={handleSelectProject}
          currentSandboxId={sandbox?.id}
        />
      )}

      {/* ── Prompt Screen ─────────────────────────────────────────────── */}
      <div
        ref={promptScreenRef}
        className={cn('absolute inset-0 z-50 bg-[#111111]', hasPromptStarted && 'pointer-events-none')}
        style={{ display: showEditor ? 'none' : 'block' }}
      >
        <PromptScreen
          onStart={handleStartPrompt}
          onShowHistory={() => setShowHistory(true)}
          isAuthenticated={isAuthenticated}
          onLogin={handleLogin}
          userAvatar={userAvatar}
          userInitial={userInitial}
        />
      </div>

      {/* ── Editor ────────────────────────────────────────────────────── */}
      <div
        ref={editorRef}
        className={cn('h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans', !hasPromptStarted ? 'opacity-0 invisible' : '')}
      >
        {/* Header */}
        <header className="h-10 border-b border-border flex items-center justify-between px-3 bg-[#0a0a0a] shrink-0 select-none">
          {/* Left — logo */}
          <div className="flex items-center gap-2 px-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleHome}>
            <img src="/m7a_logo.png" alt="m7a" className="w-5 h-5 object-contain" />
            <span className="text-[11px] font-semibold text-muted-foreground">m7a</span>
          </div>

          {/* Center — project name */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="text-[11px] font-medium text-muted-foreground/60 truncate max-w-[200px]">
              {initialPrompt ? initialPrompt.slice(0, 32) + (initialPrompt.length > 32 ? '…' : '') : 'New Project'}
            </span>
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-muted-foreground hover:text-foreground hover:bg-transparent gap-1.5 px-2" onClick={handleHome}>
              <Plus size={13} />
              <span className="text-[11px]">New</span>
            </Button>
            {isAuthenticated && (
              <Button variant="ghost" size="sm" className="h-7 text-muted-foreground hover:text-foreground hover:bg-transparent gap-1.5 px-2" onClick={() => setShowHistory(true)}>
                <HistoryIcon size={13} />
                <span className="text-[11px]">History</span>
              </Button>
            )}
            <div className="w-px h-4 bg-border/50 mx-1" />
            <div className="px-1">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main 3-panel layout */}
        <main className="flex-1 overflow-hidden">
          {sandboxError ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8">
              <p className="text-sm text-muted-foreground">Failed to initialize sandbox</p>
              <p className="text-xs text-muted-foreground/60">{sandboxError}</p>
              <Button size="sm" onClick={() => { setSandbox(null); setSandboxError(null); }}>Retry</Button>
            </div>
          ) : (
            <EditorLayout sandbox={sandbox} initialPrompt={initialPrompt} projectId={sandbox?.id} />
          )}
        </main>
      </div>
    </div>
  );
}
