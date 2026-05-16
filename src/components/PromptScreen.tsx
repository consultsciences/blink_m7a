import React, { useState } from 'react';
import { ArrowUp, ChevronDown, Check, Globe, Smartphone, LayoutGrid, Puzzle, Paperclip, Infinity, MessageSquareText } from 'lucide-react';
import { cn } from '../lib/utils';
import { AI_MODELS } from '../lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const PROJECT_TYPES = [
  { id: 'fullstack', label: 'Full Stack App', shortLabel: 'Full Stack', icon: LayoutGrid },
  { id: 'mobile', label: 'Mobile App', shortLabel: 'Mobile', icon: Smartphone },
  { id: 'website', label: 'Website', shortLabel: 'Website', icon: Globe },
  { id: 'extension', label: 'Chrome Extension', shortLabel: 'Extension', icon: Puzzle },
];

const SUGGESTION_CHIPS = [
  'AI Testimonial Wall',
  'AI Product Photo Studio',
  'AI Headshot Generator',
  'SaaS CRM Dashboard',
  'Stripe Billing Portal',
  'AI Chat Support Bot',
  'Analytics Dashboard',
  'Project Management App',
];

const MODES = [
  { id: 'agent', name: 'Agent', icon: Infinity },
  { id: 'ask', name: 'Ask', icon: MessageSquareText },
];

interface PromptScreenProps {
  onStart: (prompt: string) => void;
  onShowHistory?: () => void;
  isAuthenticated?: boolean;
  onLogin?: () => void;
  userAvatar?: string | null;
  userInitial?: string;
}

export function PromptScreen({ onStart, onShowHistory, isAuthenticated, onLogin, userAvatar, userInitial = 'U' }: PromptScreenProps) {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [selectedType, setSelectedType] = useState(PROJECT_TYPES[0]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    if (!isAuthenticated && onLogin) {
      onLogin();
      return;
    }
    onStart(input);
  };

  const handleChipClick = (chip: string) => {
    if (!isAuthenticated && onLogin) {
      onLogin();
      return;
    }
    onStart(`Build a ${chip}`);
  };

  const ModeIcon = selectedMode.icon;

  return (
    <div className="h-screen w-screen flex flex-col font-sans text-foreground overflow-hidden relative" style={{ background: '#05050A' }}>
      
      {/* ── Top nav ───────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 h-14 shrink-0">
        {/* Left — logo */}
        <div className="flex items-center gap-2">
          <img src="/m7a_logo.png" alt="m7a" className="w-7 h-7 object-contain" />
          <span className="text-[15px] font-bold text-foreground tracking-tight">m7a</span>
        </div>

        {/* Right — auth buttons */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {onShowHistory && (
                <button
                  onClick={onShowHistory}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-[12px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                    <path d="M12 7v5l4 2"/>
                  </svg>
                  History
                </button>
              )}
              <div className="w-8 h-8 rounded-full bg-[#5b4af8] flex items-center justify-center text-[12px] font-bold text-white cursor-pointer overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="px-3.5 h-8 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={onLogin}
                className="px-3.5 h-8 rounded-lg bg-white text-black text-[13px] font-semibold hover:bg-white/90 transition-all"
              >
                Sign Up →
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 overflow-hidden">
        <div className="w-full max-w-[680px] flex flex-col gap-6">

          {/* Hero heading */}
          <div className="text-center space-y-3">
            <h1 className="text-[40px] sm:text-[48px] font-bold leading-tight tracking-tight">
              <span className="text-muted-foreground font-normal">Don't just think it — </span>
              <span className="text-foreground">m7a</span>
              <span className="text-muted-foreground font-normal"> it</span>
            </h1>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[500px] mx-auto">
              Build websites, SaaS, and mobile apps in minutes by chatting with AI.
              <br />
              <span className="text-muted-foreground/60 text-[13px]">Everything included: database, hosting, AI, and more.</span>
            </p>
          </div>

          {/* Project type tabs */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {PROJECT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 h-8 rounded-lg text-[12px] font-medium transition-all',
                    selectedType.id === type.id
                      ? 'bg-white/10 text-foreground border border-white/15'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
                  )}
                >
                  <Icon size={12} />
                  <span className="hidden sm:inline">{type.label}</span>
                  <span className="sm:hidden">{type.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Input card */}
          <form onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f14] overflow-hidden shadow-2xl focus-within:border-white/[0.16] transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Create an internal tool that..."
                className="w-full bg-transparent px-4 pt-4 pb-3 text-[14px] leading-relaxed focus:outline-none min-h-[120px] max-h-[280px] resize-none placeholder:text-muted-foreground/50 text-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                autoFocus
              />

              {/* Toolbar */}
              <div className="px-3 pb-3 flex items-center justify-between border-t border-white/[0.05] pt-2.5 bg-white/[0.02]">
                <div className="flex items-center gap-1">
                  {/* Attach */}
                  <button
                    type="button"
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                  >
                    <Paperclip size={14} />
                  </button>

                  {/* Version badge */}
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] font-medium text-muted-foreground/70 border border-white/[0.06]">
                    m7a 1.0
                  </span>

                  {/* Mode */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all focus:outline-none"
                      >
                        <ModeIcon size={12} />
                        <span>{selectedMode.name}</span>
                        <ChevronDown size={10} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-[#0f0f14] border-white/10 text-xs min-w-[100px]">
                      {MODES.map((mode) => (
                        <DropdownMenuItem
                          key={mode.id}
                          onClick={() => setSelectedMode(mode)}
                          className="gap-2 cursor-pointer focus:bg-white/5 text-muted-foreground focus:text-foreground"
                        >
                          <mode.icon size={12} />
                          {mode.name}
                          {selectedMode.id === mode.id && <Check size={10} className="ml-auto text-foreground" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Model */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all focus:outline-none"
                      >
                        <span>{selectedModel.name}</span>
                        <ChevronDown size={10} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-[#0f0f14] border-white/10 text-xs min-w-[160px]">
                      {AI_MODELS.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => setSelectedModel(model)}
                          className="flex items-center justify-between gap-2 cursor-pointer focus:bg-white/5 text-muted-foreground focus:text-foreground py-2 px-3"
                        >
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="font-medium text-foreground/90">{model.name}</span>
                            <span className="text-[10px] text-muted-foreground/60">{model.provider}</span>
                          </div>
                          {selectedModel.id === model.id && (
                            <Check size={10} className="text-foreground shrink-0" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0',
                    input.trim()
                      ? 'bg-white text-black hover:opacity-90 shadow-lg'
                      : 'bg-white/[0.06] text-muted-foreground/40 cursor-not-allowed'
                  )}
                >
                  <ArrowUp size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </form>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTION_CHIPS.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleChipClick(chip)}
                className="group flex items-center gap-1.5 px-3 h-9 rounded-md border border-border/50 hover:border-border bg-white/[0.04] hover:bg-white/[0.07] text-muted-foreground hover:text-foreground hover:-translate-y-px hover:shadow-sm active:scale-95 active:translate-y-0 active:shadow-none focus:outline-none transition-all text-[12px] font-medium"
              >
                {chip}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
