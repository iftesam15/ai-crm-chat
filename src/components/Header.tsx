'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Database, Trash2, Moon, Sun, ChevronRight, Key, Table } from 'lucide-react';
import { CrmStats } from '@/lib/crmData';

interface HeaderProps {
  crmStats: CrmStats;
  isCrmDrawerOpen: boolean;
  onToggleCrmDrawer: () => void;
  onClearChat: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  apiKey: string;
  onOpenApiKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  crmStats,
  isCrmDrawerOpen,
  onToggleCrmDrawer,
  onClearChat,
  theme,
  onToggleTheme,
  apiKey,
  onOpenApiKeyModal,
}) => {
  const hasKey = Boolean(apiKey && apiKey.trim().length > 5);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Brand & Model Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'var(--accent-terracotta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(218, 119, 86, 0.4)',
          }}
        >
          <Sparkles size={20} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
              Claude CRM
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: hasKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(218, 119, 86, 0.15)',
                color: hasKey ? 'var(--accent-emerald)' : 'var(--accent-terracotta)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: hasKey ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                }}
              />
              {hasKey ? 'Gemini 2.5 Flash' : 'Claude 3.7 / Local Engine'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Interactive Sales Pipeline Builder & Deal Intelligence
          </div>
        </div>
      </div>

      {/* Action Buttons & Live CRM Inspector Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Gemini API Key Toggle */}
        <button
          onClick={onOpenApiKeyModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: hasKey ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-tertiary)',
            color: hasKey ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            border: `1px solid ${hasKey ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
            fontSize: '0.82rem',
            fontWeight: 500,
          }}
          title={hasKey ? 'Google Gemini API Key Configured' : 'Configure Google Gemini API Key'}
        >
          <Key size={14} />
          <span>{hasKey ? 'Gemini Key Active' : 'Set Gemini Key'}</span>
        </button>

        {/* Link to Full Records Page */}
        <Link
          href="/records"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            fontWeight: 500,
            textDecoration: 'none',
          }}
          title="Open Full CRM Records Dashboard"
        >
          <Table size={15} />
          <span>Records</span>
        </Link>

        {/* Toggle Live CRM DB Drawer */}
        <button
          onClick={onToggleCrmDrawer}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isCrmDrawerOpen ? 'var(--accent-terracotta)' : 'var(--bg-tertiary)',
            color: isCrmDrawerOpen ? '#ffffff' : 'var(--text-primary)',
            border: `1px solid ${isCrmDrawerOpen ? 'transparent' : 'var(--border-subtle)'}`,
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
          title="Open Live CRM Database Inspector"
        >
          <Database size={16} />
          <span>Live CRM DB</span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              backgroundColor: isCrmDrawerOpen ? 'rgba(255,255,255,0.25)' : 'var(--bg-primary)',
              color: isCrmDrawerOpen ? '#ffffff' : 'var(--accent-amber)',
              fontWeight: 600,
            }}
          >
            ${(crmStats.totalPipelineValue / 1000).toFixed(0)}k ARR
          </span>
          <ChevronRight
            size={14}
            style={{
              transform: isCrmDrawerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        {/* Clear Chat */}
        <button
          onClick={onClearChat}
          style={{
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
          }}
          title="Reset conversation"
        >
          <Trash2 size={15} />
          <span>Reset</span>
        </button>

        {/* Dark/Light Mode */}
        <button
          onClick={onToggleTheme}
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};
