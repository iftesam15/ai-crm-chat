'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { CrmDrawer } from '@/components/CrmDrawer';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import {
  INITIAL_PIPELINES,
  INITIAL_DEALS,
  INITIAL_CONTACTS,
  calculateCrmStats,
  Pipeline,
  Deal,
  Contact,
} from '@/lib/crmData';
import {
  ChatMessage as ChatMessageType,
  ChatSessionState,
  generateInitialGreeting,
  processUserInteraction,
} from '@/lib/chatEngine';

export default function Home() {
  // CRM Database State (frontend mock — seeded locally, no backend)
  const [pipelines, setPipelines] = useState<Pipeline[]>(INITIAL_PIPELINES);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);

  // Chat State
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [sessionState, setSessionState] = useState<ChatSessionState>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // API Key & Modal State (kept for UI; chat uses local mock engine)
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // UI State
  const [isCrmDrawerOpen, setIsCrmDrawerOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting + optional stored API key (mock CRM uses INITIAL_* seed data)
  useEffect(() => {
    setMessages([generateInitialGreeting()]);

    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Theme synchronization
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const crmStats = calculateCrmStats(deals, pipelines, contacts);

  // Frontend-only mock: pipeline wizard + CRM replies via chatEngine (no /api/chat)
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessageType = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Brief delay so the loading indicator feels like a co-pilot response
    await new Promise((resolve) => setTimeout(resolve, 450));

    try {
      const { response, updatedState, crmAction } = processUserInteraction(
        userText,
        sessionState,
        { deals, pipelines, contacts }
      );

      if (crmAction?.type === 'ADD_PIPELINE') {
        setPipelines((prev) => [...prev, crmAction.data as Pipeline]);
      } else if (crmAction?.type === 'UPDATE_DEAL') {
        const patch = crmAction.data as { id: string; stageName: string; probability: number };
        setDeals((prev) =>
          prev.map((d) =>
            d.id === patch.id
              ? { ...d, stageName: patch.stageName, probability: patch.probability }
              : d
          )
        );
      }

      const isPipelineSaved =
        response.content?.includes('Pipeline Successfully') ||
        response.widget?.isDeployed ||
        (updatedState.pendingWorkflow === null &&
          Boolean(sessionState.pipelineDraft?.stages));

      setMessages((prev) => {
        const updatedPrev = isPipelineSaved
          ? prev.map((m) => {
              if (m.widget?.type === 'pipeline_preview') {
                return {
                  ...m,
                  widget: {
                    ...m.widget,
                    actionText: undefined,
                    isDeployed: true,
                  },
                };
              }
              return m;
            })
          : prev;

        return [...updatedPrev, response];
      });
      setSessionState(updatedState);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Chat mock error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Co-pilot mock failed: ${message}`,
          timestamp: time,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCrmData = () => {
    setPipelines(INITIAL_PIPELINES);
    setDeals(INITIAL_DEALS);
    setContacts(INITIAL_CONTACTS);
    setSessionState({});
  };

  const handleClearChat = () => {
    setMessages([generateInitialGreeting()]);
    setSessionState({});
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem('gemini_api_key', newKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Top Header */}
      <Header
        crmStats={crmStats}
        isCrmDrawerOpen={isCrmDrawerOpen}
        onToggleCrmDrawer={() => setIsCrmDrawerOpen(!isCrmDrawerOpen)}
        onClearChat={handleClearChat}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        apiKey={apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Chat Scroll Area */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          paddingBottom: '20px',
        }}
      >
        <div style={{ flex: 1 }}>
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSelectOption={handleSendMessage}
              onSuggestionClick={handleSendMessage}
              isLatest={index === messages.length - 1}
            />
          ))}

          {/* AI Thinking Indicator */}
          {isLoading && (
            <div
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px 20px',
                maxWidth: '840px',
                margin: '0 auto',
                width: '100%',
              }}
              className="animate-fade-in"
            >
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
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    animation: 'pulseGlow 1.2s infinite',
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Co-pilot is building your response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onQuickPrompt={handleSendMessage}
        />
      </main>

      {/* Live CRM Database Inspector Drawer */}
      <CrmDrawer
        isOpen={isCrmDrawerOpen}
        onClose={() => setIsCrmDrawerOpen(false)}
        pipelines={pipelines}
        deals={deals}
        contacts={contacts}
        crmStats={crmStats}
        onResetData={handleResetCrmData}
      />

      {/* Google Gemini API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />
    </div>
  );
}
