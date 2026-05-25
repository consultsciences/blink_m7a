/**
 * ChatPanel — AI chat orchestrator.
 * Delegates UI to chat/* sub-components.
 */
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useAgent } from '@blinkdotnew/react';
import { codingAgent, askAgent } from '../lib/agent';
import { AI_MODELS, AGENT_MODES } from '../lib/constants';
import { getPreviewUrl } from '../lib/sandbox';
import { cn } from '../lib/utils';
import gsap from 'gsap';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { SuggestedPrompts } from './chat/SuggestedPrompts';
import { PreviewPane } from './chat/PreviewPane';

interface ChatPanelProps {
  sandbox: any | null;
  isEmbedded?: boolean;
  initialPrompt?: string | null;
  onBuildStatusChange?: (isBuilding: boolean) => void;
}

export function ChatPanel({ sandbox, isEmbedded = false, initialPrompt = null, onBuildStatusChange }: ChatPanelProps) {
  const sandboxId = sandbox?.id || null;

  const [previewKey, setPreviewKey] = useState(0);
  const [trustDelayPassed, setTrustDelayPassed] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [agentMode, setAgentMode] = useState(AGENT_MODES[0]);

  const currentAgent = agentMode.id === 'ask' ? askAgent : codingAgent;

  const savedMessages = React.useMemo(() => {
    if (!sandboxId) return [];
    try {
      const saved = (() => { try { return localStorage.getItem(`chat_history_${sandboxId}`); } catch { return null; } })();
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }, [sandboxId]);

  const { messages, input, handleInputChange, isLoading, sendMessage, setInput } = useAgent({
    agent: currentAgent,
    sandbox,
    initialMessages: savedMessages,
  });

  // Persist chat
  useEffect(() => {
    if (messages.length > 0 && sandboxId) {
      try { localStorage.setItem(`chat_history_${sandboxId}`, JSON.stringify(messages)); } catch {}
    }
  }, [messages, sandboxId]);

  // Report build status
  useEffect(() => {
    onBuildStatusChange?.(agentMode.id !== 'ask' && isLoading);
  }, [isLoading, agentMode.id, onBuildStatusChange]);

  // Handle initial prompt (once per sandbox)
  const initialPromptProcessed = useRef(false);
  useEffect(() => { if (sandboxId) initialPromptProcessed.current = false; }, [sandboxId]);
  useEffect(() => {
    if (initialPrompt && sandboxId && !initialPromptProcessed.current) {
      initialPromptProcessed.current = true;
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, sandboxId]);

  // Trust delay for preview iframe
  useEffect(() => {
    if (isLoading) { setTrustDelayPassed(false); return; }
    const t = setTimeout(() => setTrustDelayPassed(true), 3000);
    return () => clearTimeout(t);
  }, [isLoading]);

  // GSAP entrance animation (sidebar + preview when first messages arrive)
  const sidebarRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const prevHasMessages = useRef(false);
  const hasMessages = messages.length > 0;

  useLayoutEffect(() => {
    if (!hasMessages || prevHasMessages.current) return;
    if (!sidebarRef.current || !previewRef.current) return;
    prevHasMessages.current = true;

    gsap.set(sidebarRef.current, { x: -320, opacity: 0 });
    gsap.set(previewRef.current, { opacity: 0, scale: 0.97, x: 40 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(sidebarRef.current, { x: 0, opacity: 1, duration: 0.7, ease: 'power4.out' });
    tl.to(previewRef.current, { opacity: 1, scale: 1, x: 0, duration: 0.6 }, '-=0.45');

    const msgs = sidebarRef.current.querySelectorAll('[data-chat-message]');
    if (msgs.length) tl.fromTo(msgs, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.08 }, '-=0.3');
  }, [hasMessages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandbox || !input.trim()) return;
    await sendMessage(input);
  };

  // ── Embedded (3-panel) mode ────────────────────────────────────────────────
  if (isEmbedded) {
    return (
      <div className="h-full flex flex-col bg-secondary/30 overflow-hidden">
        <ChatMessages messages={messages} isLoading={isLoading} onSuggestedPrompt={setInput} compact />
        <ChatInput
          value={input} onChange={handleInputChange} onSubmit={onSubmit}
          isLoading={isLoading} sandboxId={sandboxId}
          agentMode={agentMode} onAgentModeChange={setAgentMode}
          selectedModel={selectedModel} onModelChange={setSelectedModel}
        />
      </div>
    );
  }

  // ── Full standalone mode: empty state ────────────────────────────────────
  if (!hasMessages) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background px-6 gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src="/m7a_logo.png" alt="m7a" className="w-12 h-12 object-contain opacity-40" />
          <p className="text-sm text-muted-foreground/60 max-w-xs">
            Describe what you want to build. The AI agent will scaffold, code, and preview it live.
          </p>
        </div>

        <SuggestedPrompts onSelect={setInput} />

        <div className="w-full max-w-2xl">
          <ChatInput
            value={input} onChange={handleInputChange} onSubmit={onSubmit}
            isLoading={isLoading} sandboxId={sandboxId}
            agentMode={agentMode} onAgentModeChange={setAgentMode}
            selectedModel={selectedModel} onModelChange={setSelectedModel}
            minHeight={120}
          />
        </div>
      </div>
    );
  }

  // ── Full standalone mode: chat + preview ─────────────────────────────────
  return (
    <div className="h-full flex bg-background overflow-hidden">
      {/* Chat sidebar */}
      <div ref={sidebarRef} className="w-[340px] shrink-0 border-r border-border flex flex-col bg-secondary/20">
        <ChatMessages messages={messages} isLoading={isLoading} onSuggestedPrompt={setInput} compact />
        <ChatInput
          value={input} onChange={handleInputChange} onSubmit={onSubmit}
          isLoading={isLoading} sandboxId={sandboxId}
          agentMode={agentMode} onAgentModeChange={setAgentMode}
          selectedModel={selectedModel} onModelChange={setSelectedModel}
        />
      </div>

      {/* Live preview */}
      <div ref={previewRef} className="flex-1 min-w-0">
        <PreviewPane
          sandboxId={sandboxId}
          isBuilding={isLoading}
          trustDelayPassed={trustDelayPassed}
          previewKey={previewKey}
          onRefresh={() => setPreviewKey(k => k + 1)}
        />
      </div>
    </div>
  );
}
