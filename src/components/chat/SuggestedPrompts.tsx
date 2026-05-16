import React from 'react';
import { SUGGESTED_PROMPTS } from '../../lib/constants';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  compact?: boolean;
}

export function SuggestedPrompts({ onSelect, compact = false }: SuggestedPromptsProps) {
  const items = compact ? SUGGESTED_PROMPTS.slice(0, 4) : SUGGESTED_PROMPTS;

  if (compact) {
    return (
      <div className="w-full space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/40 font-semibold text-center mb-3">
          Suggestions
        </p>
        <div className="grid grid-cols-1 gap-2">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => onSelect(item.prompt)}
              className="group flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/30 hover:bg-secondary hover:border-border/60 transition-all text-left w-full"
            >
              <div className="p-1.5 rounded-md bg-background/50 text-muted-foreground group-hover:text-foreground transition-colors">
                <item.icon size={14} />
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="grid grid-cols-2 gap-3 text-left">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item.prompt)}
            className="group flex items-center gap-3 p-3 rounded-xl bg-[#18181b] border border-white/[0.03] hover:border-white/[0.08] hover:bg-[#202020] transition-all"
          >
            <div className="p-2 rounded-lg bg-white/[0.03] text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
              <item.icon size={16} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground transition-colors truncate">
                {item.title}
              </span>
              <span className="text-[11px] text-muted-foreground/50 truncate">
                {item.prompt.slice(0, 42)}…
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
