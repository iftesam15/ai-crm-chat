export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number; // e.g. 20 for 20%
  dealCount: number;
  color: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  type: 'enterprise' | 'product_led' | 'velocity' | 'custom';
  stages: PipelineStage[];
  createdAt: string;
}

export interface Deal {
  id: string;
  name: string;
  company: string;
  value: number; // in USD
  pipelineId: string;
  stageName: string;
  probability: number;
  owner: string;
  expectedClose: string;
  contactName: string;
  contactEmail: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  status: 'Lead' | 'Qualified' | 'Customer' | 'Churned';
  lastActivity: string;
  dealValue?: number;
}

// Initial Seed Data
export const INITIAL_PIPELINES: Pipeline[] = [
  {
    id: 'pipe-enterprise',
    name: 'Enterprise B2B Pipeline',
    description: 'High ACV enterprise sales with legal, security, and procurement stages.',
    type: 'enterprise',
    createdAt: '2026-01-15',
    stages: [
      { id: 'stg-1', name: 'Discovery', order: 1, probability: 10, dealCount: 4, color: '#3b82f6' },
      { id: 'stg-2', name: 'Demo & Scope', order: 2, probability: 30, dealCount: 3, color: '#6366f1' },
      { id: 'stg-3', name: 'Security Review', order: 3, probability: 55, dealCount: 2, color: '#a855f7' },
      { id: 'stg-4', name: 'Contract Negotiation', order: 4, probability: 80, dealCount: 3, color: '#f59e0b' },
      { id: 'stg-5', name: 'Closed Won', order: 5, probability: 100, dealCount: 6, color: '#10b981' },
      { id: 'stg-6', name: 'Closed Lost', order: 6, probability: 0, dealCount: 2, color: '#ef4444' },
    ],
  },
  {
    id: 'pipe-saas',
    name: 'Product-Led SaaS Growth',
    description: 'Self-serve trials converting to mid-market team licenses.',
    type: 'product_led',
    createdAt: '2026-02-01',
    stages: [
      { id: 'plg-1', name: 'Free Trial Signup', order: 1, probability: 15, dealCount: 12, color: '#06b6d4' },
      { id: 'plg-2', name: 'Product Qualified (PQL)', order: 2, probability: 45, dealCount: 8, color: '#3b82f6' },
      { id: 'plg-3', name: 'Upgrade Call', order: 3, probability: 70, dealCount: 5, color: '#f59e0b' },
      { id: 'plg-4', name: 'Active Subscription', order: 4, probability: 100, dealCount: 18, color: '#10b981' },
    ],
  },
];

export const INITIAL_DEALS: Deal[] = [
  {
    id: 'deal-1',
    name: 'Acme Corp - Global SOC2 Rollout',
    company: 'Acme Global Inc.',
    value: 84000,
    pipelineId: 'pipe-enterprise',
    stageName: 'Contract Negotiation',
    probability: 80,
    owner: 'Sarah Connor',
    expectedClose: '2026-10-15',
    contactName: 'Sarah Jenkins',
    contactEmail: 'sarah.jenkins@acme.com',
  },
  {
    id: 'deal-2',
    name: 'Starlight Analytics - Enterprise Plan',
    company: 'Starlight AI Ltd.',
    value: 48000,
    pipelineId: 'pipe-enterprise',
    stageName: 'Demo & Scope',
    probability: 30,
    owner: 'Alex Mercer',
    expectedClose: '2026-11-01',
    contactName: 'Chloe Zhang',
    contactEmail: 'chloe@starlight.ai',
  },
  {
    id: 'deal-3',
    name: 'FinTech Nexus - Cloud Security Migration',
    company: 'FinTech Nexus',
    value: 120000,
    pipelineId: 'pipe-enterprise',
    stageName: 'Contract Negotiation',
    probability: 80,
    owner: 'Sarah Connor',
    expectedClose: '2026-10-30',
    contactName: 'David Miller',
    contactEmail: 'dmiller@fintechnexus.io',
  },
  {
    id: 'deal-4',
    name: 'Vanguard Labs - Custom API Integration',
    company: 'Vanguard Laboratories',
    value: 95000,
    pipelineId: 'pipe-enterprise',
    stageName: 'Security Review',
    probability: 55,
    owner: 'Elena Ramos',
    expectedClose: '2026-11-15',
    contactName: 'Elena Rostova',
    contactEmail: 'elena@vanguardlabs.dev',
  },
  {
    id: 'deal-5',
    name: 'HyperScale Systems - Annual Enterprise',
    company: 'HyperScale IO',
    value: 62000,
    pipelineId: 'pipe-enterprise',
    stageName: 'Closed Won',
    probability: 100,
    owner: 'Alex Mercer',
    expectedClose: '2026-09-10',
    contactName: 'Thomas Wright',
    contactEmail: 'twright@hyperscale.io',
  },
  {
    id: 'deal-6',
    name: 'CyberShield - Team Expansion (50 seats)',
    company: 'CyberShield Security',
    value: 19500,
    pipelineId: 'pipe-saas',
    stageName: 'Upgrade Call',
    probability: 70,
    owner: 'Elena Ramos',
    expectedClose: '2026-10-05',
    contactName: 'Marcus Vance',
    contactEmail: 'marcus@cybershield.net',
  },
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'cnt-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@acme.com',
    company: 'Acme Global Inc.',
    role: 'VP of Operations',
    status: 'Qualified',
    lastActivity: 'Negotiating MSAs with legal',
    dealValue: 84000,
  },
  {
    id: 'cnt-2',
    name: 'David Miller',
    email: 'dmiller@fintechnexus.io',
    company: 'FinTech Nexus',
    role: 'Head of Information Security',
    status: 'Qualified',
    lastActivity: 'Requested DPA and ISO certs',
    dealValue: 120000,
  },
  {
    id: 'cnt-3',
    name: 'Elena Rostova',
    email: 'elena@vanguardlabs.dev',
    company: 'Vanguard Laboratories',
    role: 'Chief Technology Officer',
    status: 'Qualified',
    lastActivity: 'API sandbox testing underway',
    dealValue: 95000,
  },
  {
    id: 'cnt-4',
    name: 'Chloe Zhang',
    email: 'chloe@starlight.ai',
    company: 'Starlight AI Ltd.',
    role: 'VP Product',
    status: 'Lead',
    lastActivity: 'Attended product demo yesterday',
    dealValue: 48000,
  },
  {
    id: 'cnt-5',
    name: 'Marcus Vance',
    email: 'marcus@cybershield.net',
    company: 'CyberShield Security',
    role: 'Director of IT',
    status: 'Qualified',
    lastActivity: 'Requested team license pricing',
    dealValue: 19500,
  },
  {
    id: 'cnt-6',
    name: 'Thomas Wright',
    email: 'twright@hyperscale.io',
    company: 'HyperScale IO',
    role: 'COO',
    status: 'Customer',
    lastActivity: 'Onboarding completed',
    dealValue: 62000,
  },
];

export interface CrmStats {
  totalPipelineValue: number;
  weightedPipelineValue: number;
  activeDealsCount: number;
  closedWonValue: number;
  pipelinesCount: number;
  contactsCount: number;
}

export function calculateCrmStats(deals: Deal[], pipelines: Pipeline[], contacts: Contact[]): CrmStats {
  const activeDeals = deals.filter((d) => d.stageName !== 'Closed Lost' && d.stageName !== 'Closed Won');
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const weightedPipelineValue = activeDeals.reduce((sum, d) => sum + Math.round((d.value * d.probability) / 100), 0);
  const closedWonValue = deals.filter((d) => d.stageName === 'Closed Won').reduce((sum, d) => sum + d.value, 0);

  return {
    totalPipelineValue,
    weightedPipelineValue,
    activeDealsCount: activeDeals.length,
    closedWonValue,
    pipelinesCount: pipelines.length,
    contactsCount: contacts.length,
  };
}
