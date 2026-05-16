import React, { useState } from 'react';
import { ArrowUp, ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { SUGGESTED_PROMPTS, AI_MODELS, AGENT_MODES as MODES } from '../lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface PromptScreenProps {
  onStart: (prompt: string) => void;
}

export function PromptScreen({ onStart }: PromptScreenProps) {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[2]); // Default to Gemini 3 Flash
  const [selectedMode, setSelectedMode] = useState(MODES[0]); // Default to Agent

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim()) {
      onStart(input);
    }
  };

  const ModeIcon = selectedMode.icon;

  return (
    <div className="h-screen w-screen bg-[#0d0d0d] flex flex-col items-center justify-center relative font-sans text-foreground">
      <div className="w-full max-w-3xl px-6 space-y-12">
        {/* Input Area */}
        <form onSubmit={handleSubmit} className="relative group">
          <div className="bg-[#202020] border border-border/40 rounded-xl overflow-hidden focus-within:border-white/20 transition-all shadow-2xl backdrop-blur-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Build a modern landing page for an AI startup that helps teams automate customer support..."
              className="w-full bg-transparent px-6 py-6 pr-14 text-[17px] leading-relaxed focus:outline-none min-h-[120px] max-h-[400px] resize-none placeholder:text-[#616161] font-normal"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            
            <div className="px-6 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-1 bg-[#252525]/30 border border-border/30 rounded-lg px-2 py-1.5 transition-colors">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 hover:text-foreground/80 text-[11px] text-muted-foreground transition-colors px-1 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                      <ModeIcon size={12} className="text-muted-foreground/60" />
                      <span>{selectedMode.name}</span>
                      <ChevronDown size={10} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-border/50 text-xs">
                    {MODES.map((mode) => (
                      <DropdownMenuItem 
                        key={mode.id} 
                        onClick={() => setSelectedMode(mode)}
                        className="gap-2 cursor-pointer focus:bg-[#252525]"
                      >
                        <mode.icon size={12} />
                        {mode.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-[1px] h-3 bg-border/50 mx-1" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 hover:text-foreground/80 text-[11px] text-muted-foreground transition-colors px-1 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                      <span>{selectedModel.name}</span>
                      <ChevronDown size={10} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-border/50 text-xs min-w-[140px]">
                    {AI_MODELS.map((model) => (
                      <DropdownMenuItem 
                        key={model.id} 
                        onClick={() => setSelectedModel(model)}
                        className="flex items-center justify-between gap-2 cursor-pointer focus:bg-[#252525] py-2 px-3"
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-medium text-foreground">{model.name}</span>
                          <span className="text-[10px] text-muted-foreground/60">{model.provider}</span>
                        </div>
                        {selectedModel.id === model.id && (
                          <Check size={12} className="text-foreground" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center">
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={cn(
                    "p-2 rounded-full transition-all duration-200 flex items-center justify-center",
                    input.trim() 
                      ? "bg-white text-black hover:opacity-90 shadow-lg transform hover:scale-105" 
                      : "bg-[#333] text-[#666] cursor-not-allowed"
                  )}
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Suggestions */}
        <div className="space-y-6">
          <p className="text-[12px] text-muted-foreground/30 font-medium text-center">Or try one of these suggestions</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUGGESTED_PROMPTS.map((item, i) => (
              <button
                key={i}
                onClick={() => onStart(item.prompt)}
                className="group flex flex-col text-left p-4 rounded-2xl bg-[#181818] border border-white/[0.03] hover:border-white/[0.08] hover:bg-[#181818]/80 transition-all duration-300"
              >
                <h3 className="text-[13px] font-medium flex items-center gap-2">
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors"><item.icon size={16} /></span>
                  <span className="text-foreground/80 group-hover:text-foreground transition-colors">{item.title}</span>
                </h3>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Made with Blink badge would be here (platform provided) */}
    </div>
  );
}
