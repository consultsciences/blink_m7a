import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PanelLeft, FolderTree, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { ChatPanel } from './ChatPanel';
import { PreviewPane } from './chat/PreviewPane';
import { FileExplorer } from './FileExplorer';
import { waitForDevServer } from '../lib/sandbox';

interface EditorLayoutProps {
  sandbox: any | null;
  initialPrompt?: string | null;
  projectId?: string;
}

export function EditorLayout({ sandbox, initialPrompt, projectId }: EditorLayoutProps) {
  const sandboxId = sandbox?.id ?? null;
  const [isBuilding, setIsBuilding] = useState(false);
  const [isWaitingForReload, setIsWaitingForReload] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [trustDelayPassed, setTrustDelayPassed] = useState(false);
  const [chatWidth, setChatWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const prevBuildingRef = useRef(false);

  // Active health-check instead of fixed delay
  useEffect(() => {
    if (!sandboxId) return;
    setTrustDelayPassed(false);
    let cancelled = false;
    waitForDevServer(sandboxId).then(ready => {
      if (!cancelled) setTrustDelayPassed(ready);
    });
    return () => { cancelled = true; };
  }, [sandboxId]);

  // Auto-refresh preview when build finishes
  useEffect(() => {
    if (prevBuildingRef.current && !isBuilding) {
      setIsWaitingForReload(true);
      const t = setTimeout(() => {
        setPreviewKey(k => k + 1);
        setIsWaitingForReload(false);
      }, 2500);
      return () => clearTimeout(t);
    }
    prevBuildingRef.current = isBuilding;
  }, [isBuilding]);

  // Drag-to-resize chat panel
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const w = e.clientX - (showFileExplorer ? 200 : 0);
    if (w > 280 && w < 760) setChatWidth(w);
  }, [isResizing, showFileExplorer]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <>
      {/* ── Desktop layout (md+) ────────────────────────────────── */}
      <div className={cn(
        'relative h-full w-full flex-row bg-background overflow-hidden hidden md:flex',
        isResizing && 'select-none'
      )}>

        {/* File explorer panel */}
        {showFileExplorer && (
          <div className="w-[200px] shrink-0 h-full z-10 flex flex-col border-r border-border bg-[#181818]">
            <div className="h-9 px-3 flex items-center justify-between border-b border-[#2b2b2b] shrink-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explorer</span>
              <button
                onClick={() => setShowFileExplorer(false)}
                className="p-1 rounded hover:bg-[#333] text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={12} />
              </button>
            </div>
            <FileExplorer
              sandbox={sandbox}
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              className="flex-1 min-h-0"
            />
          </div>
        )}

        {/* Chat panel */}
        <div
          className="h-full z-20 bg-background border-r border-border flex flex-col relative shrink-0"
          style={{ width: chatWidth }}
        >
          {/* File explorer toggle */}
          <button
            onClick={() => setShowFileExplorer(v => !v)}
            title={showFileExplorer ? 'Hide file explorer' : 'Show file explorer'}
            className={cn(
              'absolute top-2 -right-8 z-30 p-1.5 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground transition-colors',
              showFileExplorer && 'text-primary border-primary/40'
            )}
          >
            <FolderTree size={13} />
          </button>

          <ChatPanel
            key={sandboxId || 'no-sandbox'}
            sandbox={sandbox}
            isEmbedded
            initialPrompt={initialPrompt}
            onBuildStatusChange={setIsBuilding}
          />

          {/* Resize handle */}
          <div
            onMouseDown={startResizing}
            className="absolute right-0 top-0 bottom-0 w-1 -mr-0.5 cursor-ew-resize hover:bg-primary/30 transition-colors z-30 group flex items-center justify-center"
          >
            <div className="w-[1px] h-8 bg-border group-hover:bg-primary transition-colors" />
          </div>
        </div>

        {/* Preview panel */}
        <div className="flex-1 h-full min-w-0">
          <PreviewPane
            sandboxId={sandboxId}
            isBuilding={isBuilding || isWaitingForReload}
            trustDelayPassed={trustDelayPassed}
            previewKey={previewKey}
            onRefresh={() => setPreviewKey(k => k + 1)}
            projectId={projectId}
          />
        </div>

        {isResizing && <div className="fixed inset-0 z-50 cursor-ew-resize" />}
      </div>

      {/* ── Mobile layout (< md) ─────────────────────────────────── */}
      <div className="flex flex-col h-full w-full bg-background overflow-hidden md:hidden">
        {/* Top bar */}
        <div className="h-10 border-b border-border flex items-center justify-between px-3 bg-[#0a0a0a] shrink-0">
          <span className="text-xs font-medium text-foreground/70">m7a</span>
          <button
            onClick={() => setIsMobileChatOpen(v => !v)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs rounded border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <PanelLeft size={12} />
            {isMobileChatOpen ? 'Preview' : 'Chat'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {isMobileChatOpen ? (
            <div className="absolute inset-0">
              <ChatPanel
                key={sandboxId || 'no-sandbox'}
                sandbox={sandbox}
                isEmbedded
                initialPrompt={initialPrompt}
                onBuildStatusChange={setIsBuilding}
              />
            </div>
          ) : (
            <div className="absolute inset-0">
              <PreviewPane
                sandboxId={sandboxId}
                isBuilding={isBuilding || isWaitingForReload}
                trustDelayPassed={trustDelayPassed}
                previewKey={previewKey}
                onRefresh={() => setPreviewKey(k => k + 1)}
                projectId={projectId}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
