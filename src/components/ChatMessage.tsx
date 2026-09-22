'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  User,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  CheckSquare,
  Square,
  ArrowRight,
  Send,
  Layers,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Wand2,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, ChatWidget } from '@/lib/chatEngine';

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectOption: (optionLabel: string) => void;
  onSuggestionClick: (suggestion: string) => void;
  isLatest: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectOption,
  onSuggestionClick,
  isLatest,
}) => {
  const [isThinkingOpen, setIsThinkingOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Multi-choice state inside this message
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>(
    message.widget?.selectedIds || message.widget?.options?.map((o) => o.id) || []
  );
  const [hasSaved, setHasSaved] = useState<boolean>(message.widget?.isDeployed || false);

  // Custom Pipeline Builder state
  const [customName, setCustomName] = useState('Custom Enterprise Funnel');
  const [customStages, setCustomStages] = useState<Array<{ name: string; probability: number }>>([
    { name: 'Prospecting & Outreach', probability: 15 },
    { name: 'Discovery Call & Demo', probability: 40 },
    { name: 'Proposal & Negotiation', probability: 75 },
    { name: 'Contract Signed (Closed Won)', probability: 100 },
  ]);

  const presetTemplates = [
    {
      name: '🏡 Real Estate',
      pipelineName: 'Real Estate Acquisition Funnel',
      stages: [
        { name: 'New Property Listing', probability: 10 },
        { name: 'Buyer Showing / Open House', probability: 30 },
        { name: 'Formal Purchase Offer', probability: 65 },
        { name: 'Escrow & Legal Inspection', probability: 85 },
        { name: 'Deed Transfer & Closed', probability: 100 },
      ],
    },
    {
      name: '💼 Consulting Agency',
      pipelineName: 'Agency Client Retainer Funnel',
      stages: [
        { name: 'Discovery & Needs Audit', probability: 15 },
        { name: 'Strategy Pitch & SOW', probability: 45 },
        { name: 'Contract Review', probability: 80 },
        { name: 'Retainer Signed & Onboarding', probability: 100 },
      ],
    },
    {
      name: '🚀 B2B SaaS',
      pipelineName: 'SaaS Inbound Expansion',
      stages: [
        { name: 'Inbound Trial Signup', probability: 15 },
        { name: 'Product Qualified Lead (PQL)', probability: 40 },
        { name: 'Executive Demo', probability: 70 },
        { name: 'Annual License Activated', probability: 100 },
      ],
    },
    {
      name: '🛍️ High-Ticket Commerce',
      pipelineName: 'High-Ticket Sales Pipeline',
      stages: [
        { name: 'Inquiry Submitted', probability: 20 },
        { name: 'VIP Consultation', probability: 50 },
        { name: 'Custom Quote Delivered', probability: 75 },
        { name: 'Payment Processed', probability: 100 },
      ],
    },
  ];

  const handleAddStage = () => {
    const nextNum = customStages.length + 1;
    const nextProb = Math.min(100, Math.round((nextNum / (nextNum + 1)) * 100));
    setCustomStages([...customStages, { name: `Custom Stage ${nextNum}`, probability: nextProb }]);
  };

  const handleRemoveStage = (index: number) => {
    if (customStages.length <= 1) return;
    setCustomStages(customStages.filter((_, i) => i !== index));
  };

  const handleStageNameChange = (index: number, val: string) => {
    setCustomStages(customStages.map((s, i) => (i === index ? { ...s, name: val } : s)));
  };

  const handleStageProbChange = (index: number, val: number) => {
    const clamped = Math.min(100, Math.max(0, isNaN(val) ? 0 : val));
    setCustomStages(customStages.map((s, i) => (i === index ? { ...s, probability: clamped } : s)));
  };

  const handleApplyTemplate = (tmpl: (typeof presetTemplates)[0]) => {
    setCustomName(tmpl.pipelineName);
    setCustomStages(tmpl.stages);
  };

  const handleGenerateCustomFunnel = () => {
    if (!customName.trim()) {
      alert('Please enter a name for your pipeline.');
      return;
    }
    if (customStages.some((s) => !s.name.trim())) {
      alert('Please provide a name for all stages.');
      return;
    }
    const stagesSummary = customStages.map((s) => `${s.name} (${s.probability}%)`).join(', ');
    onSelectOption(`Custom pipeline named "${customName}" with stages: ${stagesSummary}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const toggleMultiSelect = (id: string) => {
    setSelectedMultiIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const submitMultiChoice = () => {
    if (!message.widget?.options) return;
    const selectedOptions = message.widget.options.filter((o) => selectedMultiIds.includes(o.id));
    if (selectedOptions.length === 0) {
      alert('Please select at least one stage for your pipeline.');
      return;
    }
    const summary = selectedOptions.map((o) => o.label).join(', ');
    const selectedIds = selectedOptions.map((o) => o.id).join(',');
    onSelectOption(`I choose stages [${selectedIds}]: ${summary}`);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        padding: '24px 20px',
        maxWidth: '840px',
        margin: '0 auto',
        width: '100%',
      }}
      className="animate-fade-in"
    >
      {/* Avatar */}
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {message.role === 'assistant' ? (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(218, 119, 86, 0.35)',
            }}
          >
            <Sparkles size={17} />
          </div>
        ) : (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <User size={17} />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Author Header & Timestamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
              {message.role === 'assistant' ? 'Claude' : 'You'}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {message.timestamp}
            </span>
          </div>

          <button
            onClick={handleCopy}
            style={{
              padding: '4px 6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Copy message"
          >
            {copied ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : ''}</span>
          </button>
        </div>

        {/* Collapsible Claude Thinking Process */}
        {message.thinking && (
          <div
            style={{
              marginBottom: '14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-card)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setIsThinkingOpen(!isThinkingOpen)}
              style={{
                width: '100%',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-terracotta)',
                  }}
                />
                <span style={{ fontWeight: 500 }}>Claude Reasoning Process</span>
              </div>
              {isThinkingOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isThinkingOpen && (
              <div
                style={{
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-subtle)',
                  fontFamily: 'monospace',
                  lineHeight: '1.5',
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                {message.thinking}
              </div>
            )}
          </div>
        )}

        {/* Markdown Rendered Content */}
        <div
          style={{
            fontSize: '0.95rem',
            lineHeight: '1.68',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {renderFormattedText(message.content)}
        </div>

        {/* INTERACTIVE WIDGET (Claude-style selectable cards, stages, tables) */}
        {message.widget && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-warm)',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 600 }}>{message.widget.title}</h4>
              {message.widget.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {message.widget.description}
                </p>
              )}
            </div>

            {/* 1. SINGLE CHOICE (e.g. Sales Motion Architecture) */}
            {message.widget.type === 'single_choice' && message.widget.options && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {message.widget.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onSelectOption(opt.label)}
                    style={{
                      textAlign: 'left',
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-terracotta)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: 'rgba(218, 119, 86, 0.15)',
                            color: 'var(--accent-terracotta)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.description && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {opt.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* 2. MULTI CHOICE (e.g. Stage Configuration Checkboxes) */}
            {message.widget.type === 'multi_choice' && message.widget.options && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {message.widget.options.map((opt) => {
                    const isChecked = selectedMultiIds.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => toggleMultiSelect(opt.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isChecked ? 'rgba(218, 119, 86, 0.08)' : 'var(--bg-secondary)',
                          border: `1px solid ${isChecked ? 'var(--accent-terracotta)' : 'var(--border-subtle)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {isChecked ? (
                            <CheckSquare size={18} style={{ color: 'var(--accent-terracotta)' }} />
                          ) : (
                            <Square size={18} style={{ color: 'var(--text-muted)' }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.86rem' }}>{opt.label}</div>
                            {opt.description && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {opt.description}
                              </div>
                            )}
                          </div>
                        </div>
                        {opt.badge && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--accent-amber)',
                              fontWeight: 600,
                              backgroundColor: 'var(--bg-primary)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {opt.badge} prob
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={submitMultiChoice}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-terracotta)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 10px rgba(218, 119, 86, 0.3)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-terracotta-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-terracotta)')}
                >
                  <span>{message.widget.actionText || 'Confirm Selected Stages'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* 2.5 CUSTOM PIPELINE BUILDER (FROM SCRATCH) */}
            {message.widget.type === 'custom_pipeline_builder' && (
              <div>
                {/* Templates row */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                    QUICK PRESET TEMPLATES (CLICK TO AUTO-FILL)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {presetTemplates.map((tmpl) => (
                      <button
                        key={tmpl.name}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '0.76rem',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-terracotta)';
                          e.currentTarget.style.backgroundColor = 'rgba(218, 119, 86, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        }}
                      >
                        <span>{tmpl.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pipeline Name input */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '6px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    PIPELINE NAME
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Strategic Global Sales Funnel"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-terracotta)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  />
                </div>

                {/* Stages List */}
                <div style={{ marginBottom: '14px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                      CUSTOM STAGES ({customStages.length})
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Win Probabilities
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {customStages.map((stg, i) => {
                      const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                      const stageColor = colors[i % colors.length];

                      return (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: stageColor,
                              color: '#ffffff',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}
                          </span>

                          <input
                            type="text"
                            value={stg.name}
                            onChange={(e) => handleStageNameChange(i, e.target.value)}
                            placeholder={`Stage ${i + 1} name`}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--bg-primary)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-primary)',
                              fontSize: '0.86rem',
                              outline: 'none',
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-terracotta)')}
                            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                          />

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={stg.probability}
                              onChange={(e) => handleStageProbChange(i, parseInt(e.target.value, 10))}
                              style={{
                                width: '56px',
                                padding: '6px 4px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--bg-primary)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                fontSize: '0.84rem',
                                textAlign: 'center',
                                outline: 'none',
                              }}
                              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-terracotta)')}
                              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>%</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveStage(i)}
                            disabled={customStages.length <= 1}
                            title="Remove Stage"
                            style={{
                              padding: '6px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: customStages.length <= 1 ? 'var(--border-subtle)' : 'var(--text-muted)',
                              cursor: customStages.length <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => {
                              if (customStages.length > 1) e.currentTarget.style.color = 'var(--accent-rose)';
                            }}
                            onMouseLeave={(e) => {
                              if (customStages.length > 1) e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add Stage Button */}
                <button
                  type="button"
                  onClick={handleAddStage}
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px dashed var(--border-subtle)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-terracotta)';
                    e.currentTarget.style.color = 'var(--accent-terracotta)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Plus size={15} />
                  <span>+ Add Another Custom Stage</span>
                </button>

                {/* Confirm Action Button */}
                <button
                  type="button"
                  onClick={handleGenerateCustomFunnel}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-terracotta)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 12px rgba(218, 119, 86, 0.3)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-terracotta-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-terracotta)')}
                >
                  <Wand2 size={16} />
                  <span>{message.widget.actionText || '⚡ Generate & Preview Custom Funnel'}</span>
                </button>
              </div>
            )}

            {/* 3. PIPELINE FUNNEL PREVIEW */}
            {message.widget.type === 'pipeline_preview' && message.widget.pipelineDraft && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginBottom: '16px',
                  }}
                >
                  {message.widget.pipelineDraft.stages?.map((stg, i) => (
                    <div
                      key={stg.id || i}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: stg.color,
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {stg.order}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{stg.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Conversion Expectation: {stg.probability}%
                          </div>
                        </div>
                      </div>

                      {/* Visual probability bar */}
                      <div style={{ width: '90px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            flex: 1,
                            height: '6px',
                            backgroundColor: 'var(--bg-primary)',
                            borderRadius: '999px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${stg.probability}%`,
                              height: '100%',
                              backgroundColor: stg.color,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {stg.probability}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {message.widget.isDeployed || !message.widget.actionText || hasSaved ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 16px',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--accent-emerald)',
                        fontWeight: 600,
                        fontSize: '0.86rem',
                      }}
                    >
                      <CheckCircle2 size={17} />
                      <span>Pipeline Deployed & Active in Database</span>
                    </div>
                    <a
                      href="/records"
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--accent-emerald)',
                        textDecoration: 'underline',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      View in Records <ExternalLink size={12} />
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setHasSaved(true);
                      onSelectOption('🚀 Save & Deploy Pipeline to Live CRM Database');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 18px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--accent-emerald)',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 12px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <Layers size={17} />
                    <span>{message.widget.actionText || 'Save Pipeline to CRM Database'}</span>
                  </button>
                )}
              </div>
            )}

            {/* 4. DEAL TABLE PREVIEW */}
            {message.widget.type === 'deal_table' && message.widget.dealList && (
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.82rem',
                    textAlign: 'left',
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px' }}>Opportunity</th>
                      <th style={{ padding: '8px' }}>Value</th>
                      <th style={{ padding: '8px' }}>Stage</th>
                      <th style={{ padding: '8px' }}>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {message.widget.dealList.map((deal) => (
                      <tr
                        key={deal.id}
                        style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                      >
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{deal.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{deal.company}</div>
                        </td>
                        <td style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                          ${deal.value.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              backgroundColor: 'rgba(218, 119, 86, 0.15)',
                              color: 'var(--accent-terracotta)',
                              fontWeight: 500,
                            }}
                          >
                            {deal.stageName} ({deal.probability}%)
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{deal.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* FOLLOW-UP SUGGESTION CHIPS (Claude style) */}
        {message.suggestions && message.suggestions.length > 0 && isLatest && (
          <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {message.suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick(sug)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-terracotta)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
              >
                <span>{sug}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Formats basic markdown elements (bold, bullet points, headers) cleanly
function renderFormattedText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIndex) => {
    // Header
    if (line.startsWith('### ')) {
      return (
        <h3 key={lineIndex} style={{ fontSize: '1.05rem', fontWeight: 700, margin: '12px 0 6px 0' }}>
          {line.replace('### ', '')}
        </h3>
      );
    }
    if (line.startsWith('#### ')) {
      return (
        <h4 key={lineIndex} style={{ fontSize: '0.95rem', fontWeight: 600, margin: '10px 0 4px 0' }}>
          {line.replace('#### ', '')}
        </h4>
      );
    }
    // Blockquote
    if (line.startsWith('> ')) {
      return (
        <div
          key={lineIndex}
          style={{
            borderLeft: '3px solid var(--accent-terracotta)',
            paddingLeft: '10px',
            margin: '8px 0',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}
        >
          {line.replace('> ', '')}
        </div>
      );
    }

    // Line with bold / code replacements
    const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
    return (
      <div key={lineIndex} style={{ minHeight: line.trim() === '' ? '8px' : undefined }}>
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={pIdx}>
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={pIdx}>{part}</span>;
        })}
      </div>
    );
  });
}
