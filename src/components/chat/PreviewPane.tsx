import React from 'react';
import { Eye, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { getPreviewUrl } from '../../lib/sandbox';
import { BuildingScreen } from '../BuildingScreen';

interface PreviewPaneProps {
  sandboxId: string | null;
  isBuilding: boolean;
  trustDelayPassed: boolean;
  previewKey: number;
  onRefresh: () => void;
}

export function PreviewPane({ sandboxId, isBuilding, trustDelayPassed, previewKey, onRefresh }: PreviewPaneProps) {
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
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {sandboxId && trustDelayPassed ? (
          <>
            <iframe
              key={previewKey}
              src={getPreviewUrl(sandboxId)}
              className="w-full h-full border-none"
              title="App Preview"
            />
            {isBuilding && <BuildingScreen />}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground bg-[#161616]">
            {!sandboxId ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin opacity-40" />
                <span className="text-xs">Initializing sandbox…</span>
              </>
            ) : (
              <>
                <Loader2 className="w-6 h-6 animate-spin opacity-40" />
                <span className="text-xs">Loading preview…</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
