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
  onShowHistory?: () => void;
  isAuthenticated?: boolean;
  onLogin?: () => void;
  userAvatar?: string | null;
  userInitial?: string;
}

export function PromptScreen({ onStart, onShowHistory, isAuthenticated, onLogin, userAvatar, userInitial = 'J' }: PromptScreenProps) {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[2]); // Default to GPT-5.2
  const [selectedMode, setSelectedMode] = useState(MODES[0]); // Default to Agent

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    if (!isAuthenticated && onLogin) {
      onLogin();
      return;
    }
    onStart(input);
  };

  const handleSuggestionClick = (prompt: string) => {
    if (!isAuthenticated && onLogin) {
      onLogin();
      return;
    }
    onStart(prompt);
  };

  const ModeIcon = selectedMode.icon;

  return (
    <div className="h-screen w-screen bg-[#111111] flex flex-col font-sans text-white overflow-hidden relative">
      {/* Top bar */}
      <div className="flex items-center justify-end px-4 h-12 gap-2 shrink-0">
        {onShowHistory && isAuthenticated && (
          <button
            onClick={onShowHistory}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-[12px] text-[#888] hover:text-white hover:bg-white/5 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M12 7v5l4 2"/>
            </svg>
            History
          </button>
        )}
        {isAuthenticated ? (
          <div className="w-8 h-8 rounded-full bg-[#5b4af8] flex items-center justify-center text-[12px] font-bold text-white cursor-pointer">
            {userAvatar ? (
              <img src={userAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              userInitial
            )}
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="px-3 h-8 rounded-lg text-[12px] text-[#888] hover:text-white hover:bg-white/5 transition-all"
          >
            Sign In
          </button>
        )}
        <button
          onClick={onLogin}
          className="px-3 h-8 rounded-lg bg-white text-black text-[12px] font-semibold hover:bg-white/90 transition-all"
        >
          {isAuthenticated ? 'New Project' : 'Sign Up →'}
        </button>
      </div>

      {/* Main content — centered vertically in remaining space */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 overflow-hidden">
        <div className="w-full max-w-[700px] flex flex-col gap-8">

          {/* Input area */}
          <form onSubmit={handleSubmit}>
            <div className="bg-[#1e1e1e] rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl focus-within:border-white/[0.15] transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Build a modern landing page for an AI startup that helps teams automate customer support..."
                className="w-full bg-transparent px-5 pt-5 pb-3 text-[15px] leading-relaxed focus:outline-none min-h-[100px] max-h-[300px] resize-none placeholder:text-[#555] text-white font-normal"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                autoFocus
              />

              <div className="px-4 pb-4 flex items-center justify-between">
                {/* Left — mode + model selectors */}
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-[#888] hover:text-white hover:bg-white/5 transition-all focus:outline-none focus-visible:outline-none">
                        <ModeIcon size={12} />
                        <span>{selectedMode.name}</span>
                        <ChevronDown size={10} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-white/10 text-xs min-w-[100px]">
                      {MODES.map((mode) => (
                        <DropdownMenuItem
                          key={mode.id}
                          onClick={() => setSelectedMode(mode)}
                          className="gap-2 cursor-pointer focus:bg-white/5 text-[#aaa] focus:text-white"
                        >
                          <mode.icon size={12} />
                          {mode.name}
                          {selectedMode.id === mode.id && <Check size={10} className="ml-auto text-white" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-[#888] hover:text-white hover:bg-white/5 transition-all focus:outline-none focus-visible:outline-none">
                        <span>{selectedModel.name}</span>
                        <ChevronDown size={10} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-white/10 text-xs min-w-[150px]">
                      {AI_MODELS.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => setSelectedModel(model)}
                          className="flex items-center justify-between gap-2 cursor-pointer focus:bg-white/5 text-[#aaa] focus:text-white py-2 px-3"
                        >
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="font-medium text-white/90">{model.name}</span>
                            <span className="text-[10px] text-[#666]">{model.provider}</span>
                          </div>
                          {selectedModel.id === model.id && (
                            <Check size={10} className="text-white shrink-0" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Right — submit */}
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                    input.trim()
                      ? 'bg-white text-black hover:opacity-90 shadow-lg'
                      : 'bg-[#2a2a2a] text-[#555] cursor-not-allowed'
                  )}
                >
                  <ArrowUp size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </form>

          {/* Suggestions */}
          <div className="space-y-3">
            <p className="text-center text-[12px] text-[#444]">Or try one of these suggestions</p>
            <div className="flex flex-col gap-2">
              {SUGGESTED_PROMPTS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(item.prompt)}
                  className="group flex items-center gap-4 w-full px-5 py-3.5 rounded-2xl bg-[#181818] border border-white/[0.04] hover:border-white/[0.1] hover:bg-[#1e1e1e] transition-all text-left"
                >
                  <item.icon size={17} className="text-[#555] group-hover:text-[#888] transition-colors shrink-0" />
                  <span className="text-[14px] font-medium text-[#777] group-hover:text-[#bbb] transition-colors">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
