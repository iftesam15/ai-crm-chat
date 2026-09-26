'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, Paperclip, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onQuickPrompt: (prompt: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onQuickPrompt,
}) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const starterPrompts = [
    {
      label: '🔨 Build Sales Pipeline',
      prompt: 'I want to build a new sales pipeline with options.',
    },
    {
      label: '✨ Custom Pipeline From Scratch',
      prompt: 'Build a pipeline from scratch with a custom funnel designer.',
    },
    {
      label: '📊 Deals in Negotiation',
      prompt: 'Show me all deals in contract negotiation with revenue.',
    },
    {
      label: '📈 Calculate Pipeline ARR',
      prompt: 'What is our total active pipeline ARR and weighted forecast?',
    },
  ];

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'var(--bg-primary)',
        padding: '12px 20px 24px 20px',
        maxWidth: '840px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Starter Quick Actions */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '10px',
          scrollbarWidth: 'none',
        }}
      >
        {starterPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onQuickPrompt(p.prompt)}
            style={{
              whiteSpace: 'nowrap',
              padding: '6px 12px',
              borderRadius: '999px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-terracotta)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Main Input Box */}
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-warm)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          transition: 'border-color 0.2s ease',
        }}
      >
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Claude about your CRM database, or say 'make a pipeline with options'..."
          rows={1}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.94rem',
            resize: 'none',
            lineHeight: '1.5',
            maxHeight: '180px',
            fontFamily: 'inherit',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} style={{ color: 'var(--accent-terracotta)' }} />
              Interactive AI Dialogue
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Enter to send · Shift+Enter for new line
            </span>
            <button
              onClick={handleSubmit}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: inputText.trim() && !isLoading ? 'var(--accent-terracotta)' : 'var(--bg-tertiary)',
                color: inputText.trim() && !isLoading ? '#ffffff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.18s ease',
              }}
              title="Send message"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        Claude CRM AI can query, mutate mock deals, and construct pipelines. Built with Next.js.
      </div>
    </div>
  );
};
