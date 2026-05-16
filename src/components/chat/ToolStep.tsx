import React from 'react';
import { Wrench, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToolStepProps {
  part: any;
  toolId: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export function ToolStep({ part, toolId, isExpanded, onToggle }: ToolStepProps) {
  return (
    <div className="bg-secondary/50 rounded border border-border/30 overflow-hidden mb-1.5 last:mb-0">
      <button
        onClick={() => onToggle(toolId)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-left hover:bg-secondary/70 transition-colors"
      >
        <Wrench className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
        <span className="text-[10px] font-mono text-muted-foreground flex-1 truncate">
          {part.toolName}
        </span>
        <span className={cn(
          "text-[9px] px-1 py-0.5 rounded font-medium shrink-0",
          part.state === 'pending' ? "text-amber-500" : "text-emerald-500"
        )}>
          {part.state === 'pending' ? '...' : '✓'}
        </span>
        {isExpanded
          ? <ChevronDown className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
          : <ChevronRight className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
        }
      </button>

      {isExpanded && part.input && (
        <div className="px-2 pb-1.5 border-t border-border/20">
          <pre className="text-[9px] font-mono text-muted-foreground/60 mt-1.5 overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(part.input, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
