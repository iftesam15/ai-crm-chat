'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  DollarSign,
  Users,
  Search,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { Pipeline, Deal, Contact, CrmStats } from '@/lib/crmData';

export default function RecordsPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'deals' | 'pipelines' | 'contacts'>('deals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/crm');
      const json = await res.json();
      if (json?.data) {
        setPipelines(json.data.pipelines);
        setDeals(json.data.deals);
        setContacts(json.data.contacts);
        setStats(json.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the SQLite database to the initial seed state?')) return;
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
        setStats(json.data.stats);
      }
    } catch (err) {
      console.error('Failed to reset DB:', err);
    }
  };

  // Filter deals
  const uniqueStages = ['ALL', ...Array.from(new Set(deals.map((d) => d.stageName)))];
  const filteredDeals = deals.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = selectedStage === 'ALL' || d.stageName === selectedStage;
    return matchesSearch && matchesStage;
  });

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: '0.84rem',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Claude Chat</span>
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                CRM Database Records
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--accent-emerald)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 600,
                }}
              >
                SQLite · prisma/dev.db
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time persistent database view for pipelines, opportunities, and contacts
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchRecords}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
            }}
            title="Refresh database records"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
            }}
            title="Reset database to default seed state"
          >
            Reset to Seed Data
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '24px 20px' }}>
        {/* KPI Metrics Cards */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active Pipeline ARR</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--accent-terracotta)', marginTop: '4px' }}>
                ${(stats.totalPipelineValue / 1000).toFixed(0)}k USD
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {stats.activeDealsCount} active opportunities
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Weighted Forecast</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--accent-amber)', marginTop: '4px' }}>
                ${(stats.weightedPipelineValue / 1000).toFixed(0)}k USD
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Probability-adjusted
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Closed Won Revenue</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                ${(stats.closedWonValue / 1000).toFixed(0)}k USD
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                100% realized ARR
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Entities in SQLite</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {deals.length} Deals · {pipelines.length} Pipelines
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {contacts.length} verified accounts
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs & Search Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('deals')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeTab === 'deals' ? 'var(--accent-terracotta)' : 'var(--bg-secondary)',
                color: activeTab === 'deals' ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === 'deals' ? 'transparent' : 'var(--border-subtle)'}`,
                fontWeight: 600,
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <DollarSign size={16} />
              <span>Deals ({deals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('pipelines')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeTab === 'pipelines' ? 'var(--accent-terracotta)' : 'var(--bg-secondary)',
                color: activeTab === 'pipelines' ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === 'pipelines' ? 'transparent' : 'var(--border-subtle)'}`,
                fontWeight: 600,
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Layers size={16} />
              <span>Pipelines ({pipelines.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeTab === 'contacts' ? 'var(--accent-terracotta)' : 'var(--bg-secondary)',
                color: activeTab === 'contacts' ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === 'contacts' ? 'transparent' : 'var(--border-subtle)'}`,
                fontWeight: 600,
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Users size={16} />
              <span>Contacts ({contacts.length})</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeTab === 'deals' && (
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  padding: '8px 12px',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              >
                {uniqueStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage === 'ALL' ? 'All Stages' : stage}
                  </option>
                ))}
              </select>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                minWidth: '220px',
              }}
            >
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  width: '100%',
                }}
              />
            </div>
          </div>
        </div>

        {/* TAB 1: DEALS TABLE */}
        {activeTab === 'deals' && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Opportunity</th>
                  <th style={{ padding: '12px 16px' }}>Value</th>
                  <th style={{ padding: '12px 16px' }}>Stage</th>
                  <th style={{ padding: '12px 16px' }}>Win Probability</th>
                  <th style={{ padding: '12px 16px' }}>Owner</th>
                  <th style={{ padding: '12px 16px' }}>Expected Close</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No deals found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal) => (
                    <tr
                      key={deal.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{deal.name}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{deal.company}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>
                        ${deal.value.toLocaleString()} USD
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.74rem',
                            fontWeight: 500,
                            backgroundColor:
                              deal.stageName === 'Closed Won'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(218, 119, 86, 0.15)',
                            color:
                              deal.stageName === 'Closed Won'
                                ? 'var(--accent-emerald)'
                                : 'var(--accent-terracotta)',
                          }}
                        >
                          {deal.stageName}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '60px',
                              height: '6px',
                              backgroundColor: 'var(--bg-primary)',
                              borderRadius: '999px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${deal.probability}%`,
                                height: '100%',
                                backgroundColor: deal.probability === 100 ? 'var(--accent-emerald)' : 'var(--accent-terracotta)',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{deal.probability}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{deal.owner}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{deal.expectedClose}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PIPELINES & STAGES */}
        {activeTab === 'pipelines' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pipelines.map((pipe) => (
              <div
                key={pipe.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{pipe.name}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {pipe.description}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--accent-blue)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {pipe.type}
                  </span>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                    Funnel Stages ({pipe.stages.length} Milestones)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    {pipe.stages.map((stg) => (
                      <div
                        key={stg.id}
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: stg.color,
                            }}
                          />
                          <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                            {stg.order}. {stg.name}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {stg.probability}% win probability
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: CONTACTS */}
        {activeTab === 'contacts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 600 }}>{contact.name}</h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {contact.role} · {contact.company}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {contact.email}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor:
                        contact.status === 'Qualified'
                          ? 'rgba(59, 130, 246, 0.15)'
                          : contact.status === 'Customer'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(168, 85, 247, 0.15)',
                      color:
                        contact.status === 'Qualified'
                          ? 'var(--accent-blue)'
                          : contact.status === 'Customer'
                          ? 'var(--accent-emerald)'
                          : 'var(--accent-purple)',
                      fontWeight: 600,
                    }}
                  >
                    {contact.status}
                  </span>
                </div>

                {contact.lastActivity && (
                  <div
                    style={{
                      marginTop: '10px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                    }}
                  >
                    Recent Activity: &ldquo;{contact.lastActivity}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
