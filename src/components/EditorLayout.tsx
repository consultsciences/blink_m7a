import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '../lib/utils';
import { ChatPanel } from './ChatPanel';
import { PreviewPane } from './chat/PreviewPane';
import { getPreviewUrl } from '../lib/sandbox';

interface EditorLayoutProps {
  sandbox: any | null;
  initialPrompt?: string | null;
}

export function EditorLayout({ sandbox, initialPrompt }: EditorLayoutProps) {
  const sandboxId = sandbox?.id ?? null;
  const [isBuilding, setIsBuilding] = useState(false);
  const [isWaitingForReload, setIsWaitingForReload] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [trustDelayPassed, setTrustDelayPassed] = useState(false);
  const [chatWidth, setChatWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const prevBuildingRef = useRef(false);

  // Trust delay: start timer once sandbox is available
  useEffect(() => {
    if (!sandboxId) return;
    const t = setTimeout(() => setTrustDelayPassed(true), 3500);
    return () => clearTimeout(t);
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

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const w = e.clientX;
    if (w > 280 && w < 760) setChatWidth(w);
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className={cn('relative h-full w-full flex flex-row bg-background overflow-hidden', isResizing && 'select-none')}>
      {/* ── Chat Panel (left) ─────────────────────────── */}
      <div
        className="h-full z-20 bg-background border-r border-border flex flex-col relative shrink-0"
        style={{ width: chatWidth }}
      >
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

      {/* ── Preview Panel (right) ─────────────────────── */}
      <div className="flex-1 h-full min-w-0">
        <PreviewPane
          sandboxId={sandboxId}
          isBuilding={isBuilding || isWaitingForReload}
          trustDelayPassed={trustDelayPassed}
          previewKey={previewKey}
          onRefresh={() => setPreviewKey(k => k + 1)}
        />
      </div>

      {/* Resize overlay prevents iframe stealing pointer events */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-ew-resize" />}
    </div>
  );
}
