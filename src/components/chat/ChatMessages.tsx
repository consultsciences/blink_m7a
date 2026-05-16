import React, { useRef, useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ToolStep } from './ToolStep';
import { SuggestedPrompts } from './SuggestedPrompts';

interface ChatMessagesProps {
  messages: any[];
  isLoading: boolean;
  onSuggestedPrompt: (prompt: string) => void;
  compact?: boolean;
}

export function ChatMessages({ messages, isLoading, onSuggestedPrompt, compact = false }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleTool = (toolId: string) => {
    setExpandedTools(prev => {
      const next = new Set(prev);
      next.has(toolId) ? next.delete(toolId) : next.add(toolId);
      return next;
    });
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Bot size={24} className="text-primary" />
            </div>
            <h3 className="text-sm font-medium text-foreground">AI Coding Agent</h3>
            <p className="text-xs text-muted-foreground/60 max-w-[240px] mx-auto">
              Describe what you want to build. The agent writes code, runs commands, and shows a live preview.
            </p>
          </div>
          <SuggestedPrompts onSelect={onSuggestedPrompt} compact />
        </div>
      ) : (
        messages.map((m, i) => (
          <div
            key={m.id || i}
            className={cn(
              "flex flex-col gap-1",
              m.role === 'user' ? "items-end" : "items-start"
            )}
            data-chat-message
          >
            {m.role === 'user' && (
              <div className="bg-[#2d2d2d] text-foreground rounded-2xl px-4 py-2.5 text-[13px] max-w-[90%] shadow-sm">
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            )}

            {m.role !== 'user' && (
              <div className="text-foreground/90 text-[13px] px-1 max-w-full overflow-hidden">
                {m.content && (
                  <p className="whitespace-pre-wrap leading-relaxed mb-2">{m.content}</p>
                )}
                {m.parts?.filter((p: any) => p.type === 'tool-invocation').map((part: any, idx: number) => {
                  const toolId = `${m.id || i}-${idx}`;
                  return (
                    <ToolStep
                      key={idx}
                      part={part}
                      toolId={toolId}
                      isExpanded={expandedTools.has(toolId)}
                      onToggle={toggleTool}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}

      {isLoading && (
        <div className="flex items-start px-1 mt-1">
          <span className="text-[13px] font-medium animate-shimmer bg-clip-text text-transparent bg-[linear-gradient(110deg,#939393,45%,#e5e5e5,55%,#939393)] bg-[length:250%_100%]">
            Thinking…
          </span>
        </div>
      )}
    </div>
  );
}
