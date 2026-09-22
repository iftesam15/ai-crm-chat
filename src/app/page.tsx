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
} from '@/lib/chatEngine';

export default function Home() {
  // CRM Database State (fetched from backend)
  const [pipelines, setPipelines] = useState<Pipeline[]>(INITIAL_PIPELINES);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);

  // Chat State
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [sessionState, setSessionState] = useState<ChatSessionState>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // API Key & Modal State
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // UI State
  const [isCrmDrawerOpen, setIsCrmDrawerOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Greeting & load key from localStorage & fetch backend CRM state
  useEffect(() => {
    setMessages([generateInitialGreeting()]);

    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }

    // Fetch live CRM data from backend API
    fetch('/api/crm')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setPipelines(json.data.pipelines);
          setDeals(json.data.deals);
          setContacts(json.data.contacts);
        }
      })
      .catch((err) => console.error('Failed to load initial CRM data from backend:', err));
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

  // Handle user sending a prompt or clicking an option
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add user message
    const userMsg: ChatMessageType = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. Call backend /api/chat route
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-gemini-key': apiKey } : {}),
        },
        body: JSON.stringify({
          message: userText,
          history: [...messages, userMsg],
          sessionState,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned error status: ${res.status}`);
      }

      const data = await res.json();

      if (data?.message) {
        setMessages((prev) => {
          const isPipelineSaved =
            data.message.content?.includes('Pipeline Successfully') ||
            data.message.widget?.isDeployed ||
            data.updatedState?.pendingWorkflow === null;

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

          return [...updatedPrev, data.message];
        });
      }

      if (data?.updatedState) {
        setSessionState(data.updatedState);
      }

      // Sync updated CRM store state from backend
      if (data?.crmSnapshot) {
        setPipelines(data.crmSnapshot.pipelines);
        setDeals(data.crmSnapshot.deals);
        setContacts(data.crmSnapshot.contacts);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessageType = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Failed to connect to backend: ${error.message}. Please check if the server is running.`,
        timestamp: time,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCrmData = async () => {
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const json = await res.json();
      if (json?.data) {
        setPipelines(json.data.pipelines);
        setDeals(json.data.deals);
        setContacts(json.data.contacts);
      }
    } catch (err) {
      console.error('Failed to reset CRM DB:', err);
    }
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
                <span>Backend is processing via {apiKey ? 'Google Gemini 2.5' : 'CRM dialogue engine'}...</span>
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
