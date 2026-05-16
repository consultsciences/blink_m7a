import React from 'react';
import { Send, Loader2, AtSign, Globe, Image as ImageIcon, ChevronDown, Check } from 'lucide-react';
import { AI_MODELS, AGENT_MODES } from '../../lib/constants';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  sandboxId: string | null;
  agentMode: typeof AGENT_MODES[0];
  onAgentModeChange: (mode: typeof AGENT_MODES[0]) => void;
  selectedModel: typeof AI_MODELS[0];
  onModelChange: (model: typeof AI_MODELS[0]) => void;
  minHeight?: number;
}

export function ChatInput({
  value, onChange, onSubmit, isLoading, sandboxId,
  agentMode, onAgentModeChange, selectedModel, onModelChange,
  minHeight = 80,
}: ChatInputProps) {
  return (
    <div className="p-3 border-t border-border bg-background shrink-0">
      <form
        onSubmit={onSubmit}
        className="relative bg-[#18181b] rounded-xl border border-border/40 focus-within:border-border/60 focus-within:ring-1 focus-within:ring-border/40 transition-all shadow-sm"
      >
        <textarea
          value={value}
          onChange={onChange}
          placeholder={isLoading ? "Agent is working…" : !sandboxId ? "Initializing sandbox…" : "Describe what to build…"}
          className="w-full bg-transparent px-4 py-3 text-[13px] leading-relaxed focus:outline-none focus:ring-0 resize-none placeholder:text-muted-foreground/50 font-normal"
          style={{ minHeight }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!isLoading && sandboxId && value.trim()) onSubmit(e as any);
            }
          }}
          disabled={!sandboxId}
        />

        <div className="px-3 pb-2 flex items-center justify-between">
          {/* Left: mode + model */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 hover:text-foreground/80 transition-colors focus:outline-none focus:ring-0 px-1">
                  <agentMode.icon size={12} />
                  <span>{agentMode.name}</span>
                  <ChevronDown size={10} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-border/50 text-xs z-50">
                {AGENT_MODES.map(mode => (
                  <DropdownMenuItem key={mode.id} onClick={() => onAgentModeChange(mode)} className="gap-2 cursor-pointer focus:bg-[#252525]">
                    <mode.icon size={12} />{mode.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-[1px] h-3 bg-border/50 mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 hover:text-foreground/80 transition-colors focus:outline-none focus:ring-0 px-1">
                  <span>{selectedModel.name}</span>
                  <ChevronDown size={10} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-border/50 text-xs min-w-[140px] z-50">
                {AI_MODELS.map(model => (
                  <DropdownMenuItem key={model.id} onClick={() => onModelChange(model)} className="flex items-center justify-between gap-2 cursor-pointer focus:bg-[#252525] py-2 px-3">
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-medium text-foreground">{model.name}</span>
                      <span className="text-[10px] text-muted-foreground/60">{model.provider}</span>
                    </div>
                    {selectedModel.id === model.id && <Check size={12} className="text-foreground" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-1 text-muted-foreground/40">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:text-foreground">
              <AtSign size={14} />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:text-foreground">
              <Globe size={14} />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:text-foreground">
              <ImageIcon size={14} />
            </Button>
            {isLoading ? (
              <div className="ml-2 p-1.5 bg-amber-500/10 text-amber-500 rounded-md flex items-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
            ) : (
              <button
                type="submit"
                disabled={!value.trim() || !sandboxId}
                className="ml-2 p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
