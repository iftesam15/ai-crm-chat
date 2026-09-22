'use client';

import React, { useState } from 'react';
import { X, Layers, DollarSign, Users, RefreshCw, Search, CheckCircle2, TrendingUp, Briefcase } from 'lucide-react';
import { Pipeline, Deal, Contact, CrmStats } from '@/lib/crmData';

interface CrmDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pipelines: Pipeline[];
  deals: Deal[];
  contacts: Contact[];
  crmStats: CrmStats;
  onResetData: () => void;
}

export const CrmDrawer: React.FC<CrmDrawerProps> = ({
  isOpen,
  onClose,
  pipelines,
  deals,
  contacts,
  crmStats,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'pipelines' | 'deals' | 'contacts'>('pipelines');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredDeals = deals.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.stageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '460px',
        maxWidth: '92vw',
        backgroundColor: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: '-8px 0 28px rgba(0, 0, 0, 0.45)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}
      className="animate-fade-in"
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={18} style={{ color: 'var(--accent-terracotta)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Live CRM Database</h3>
          <span
            style={{
              fontSize: '0.72rem',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              padding: '2px 6px',
              borderRadius: '6px',
            }}
          >
            Mock CRUD
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onResetData}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Reset database to default seed state"
          >
            <RefreshCw size={12} />
            <span>Reset DB</span>
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div
        style={{
          padding: '14px 20px',
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        <div
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active ARR</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-terracotta)' }}>
            ${(crmStats.totalPipelineValue / 1000).toFixed(0)}k
          </div>
        </div>

        <div
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Weighted Forecast</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
            ${(crmStats.weightedPipelineValue / 1000).toFixed(0)}k
          </div>
        </div>

        <div
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Closed Won</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
            ${(crmStats.closedWonValue / 1000).toFixed(0)}k
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0 12px',
        }}
      >
        <button
          onClick={() => setActiveTab('pipelines')}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: activeTab === 'pipelines' ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
            borderBottom: `2px solid ${activeTab === 'pipelines' ? 'var(--accent-terracotta)' : 'transparent'}`,
          }}
        >
          <Layers size={15} />
          <span>Pipelines ({pipelines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deals')}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: activeTab === 'deals' ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
            borderBottom: `2px solid ${activeTab === 'deals' ? 'var(--accent-terracotta)' : 'transparent'}`,
          }}
        >
          <DollarSign size={15} />
          <span>Deals ({deals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: activeTab === 'contacts' ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
            borderBottom: `2px solid ${activeTab === 'contacts' ? 'var(--accent-terracotta)' : 'transparent'}`,
          }}
        >
          <Users size={15} />
          <span>Contacts ({contacts.length})</span>
        </button>
      </div>

      {/* Search Input for Deals/Contacts */}
      {activeTab !== 'pipelines' && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
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
      )}

      {/* Tab Content List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* PIPELINES TAB */}
        {activeTab === 'pipelines' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pipelines.map((pipe) => (
              <div
                key={pipe.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{pipe.name}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {pipe.description}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--accent-blue)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {pipe.type}
                  </span>
                </div>

                {/* Visual Stages Progress */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
                    Funnel Stages ({pipe.stages.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pipe.stages.map((stg) => (
                      <div
                        key={stg.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.78rem',
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
                          <span style={{ fontWeight: 500 }}>{stg.order}. {stg.name}</span>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                          {stg.probability}% win prob
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DEALS TAB */}
        {activeTab === 'deals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredDeals.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px', fontSize: '0.85rem' }}>
                No deals match your search.
              </div>
            ) : (
              filteredDeals.map((deal) => (
                <div
                  key={deal.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{deal.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{deal.company}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-emerald)' }}>
                        ${deal.value.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {deal.probability}% probability
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: deal.stageName === 'Closed Won' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(218, 119, 86, 0.15)',
                        color: deal.stageName === 'Closed Won' ? 'var(--accent-emerald)' : 'var(--accent-terracotta)',
                        fontWeight: 500,
                      }}
                    >
                      {deal.stageName}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>Owner: {deal.owner}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CONTACTS TAB */}
        {activeTab === 'contacts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredContacts.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px', fontSize: '0.85rem' }}>
                No contacts match your search.
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{contact.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        {contact.role} · {contact.company}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
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
                    <div style={{ marginTop: '6px', fontSize: '0.73rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      &ldquo;{contact.lastActivity}&rdquo;
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
