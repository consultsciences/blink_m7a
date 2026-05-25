import React, { useState, useEffect, useRef } from 'react';
import { Eye, RefreshCw, ExternalLink, Loader2, Monitor, Smartphone } from 'lucide-react';
import { getPreviewUrl } from '../../lib/sandbox';
import { BuildingScreen } from '../BuildingScreen';
import { DeployButton } from '../DeployButton';

interface PreviewPaneProps {
  sandboxId: string | null;
  isBuilding: boolean;
  trustDelayPassed: boolean;
  previewKey: number;
  onRefresh: () => void;
  projectId?: string;
  projectFiles?: Record<string, string>;
}

type Viewport = 'desktop' | 'mobile';

export function PreviewPane({
  sandboxId,
  isBuilding,
  trustDelayPassed,
  previewKey,
  onRefresh,
  projectId,
  projectFiles,
}: PreviewPaneProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const openInNewTab = () => {
    if (sandboxId) window.open(getPreviewUrl(sandboxId), '_blank');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0" data-preview-panel>
      {/* Header */}
      <div className="h-10 border-b border-border flex items-center justify-between px-3 bg-[#0a0a0a] shrink-0" data-preview-header>
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground/70">Preview</span>
          {isBuilding && (
            <div className="flex items-center gap-1.5 ml-2 text-amber-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-[10px]">Building…</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Viewport toggle */}
          <button
            onClick={() => setViewport(v => v === 'desktop' ? 'mobile' : 'desktop')}
            className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
            title={viewport === 'desktop' ? 'Switch to mobile view' : 'Switch to desktop view'}
          >
            {viewport === 'desktop'
              ? <Smartphone className="w-3.5 h-3.5" />
              : <Monitor className="w-3.5 h-3.5" />
            }
          </button>

          <button
            onClick={openInNewTab}
            disabled={!sandboxId}
            className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
            title="Refresh preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Deploy button — only show when project exists */}
          {projectId && (
            <DeployButton projectId={projectId} files={projectFiles || {}} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-[#161616]">
        {sandboxId && trustDelayPassed ? (
          <div
            className="relative transition-all duration-300"
            style={
              viewport === 'mobile'
                ? { width: 390, height: '100%', maxHeight: '100%', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }
                : { width: '100%', height: '100%' }
            }
          >
            <iframe
              ref={iframeRef}
              key={previewKey}
              src={getPreviewUrl(sandboxId)}
              className="w-full h-full border-none"
              title="App Preview"
            />
            {isBuilding && <BuildingScreen />}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground w-full h-full">
            {!sandboxId ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin opacity-40" />
                <span className="text-xs">Initializing sandbox…</span>
              </>
            ) : (
              <>
                <Loader2 className="w-6 h-6 animate-spin opacity-40" />
                <span className="text-xs">Starting dev server…</span>
                <span className="text-[10px] text-muted-foreground/40">This usually takes 5–15 seconds</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
