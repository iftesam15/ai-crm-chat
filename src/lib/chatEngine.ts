import { Deal, Pipeline, Contact, PipelineStage } from './crmData';

export interface WidgetOption {
  id: string;
  label: string;
  description?: string;
  badge?: string;
  icon?: string;
}

export interface ChatWidget {
  type: 'single_choice' | 'multi_choice' | 'pipeline_preview' | 'deal_table' | 'confirmation_action' | 'custom_pipeline_builder';
  title: string;
  description?: string;
  options?: WidgetOption[];
  selectedIds?: string[];
  isAnswered?: boolean;
  isDeployed?: boolean;
  actionText?: string;
  pipelineDraft?: Partial<Pipeline>;
  dealList?: Deal[];
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  thinking?: string;
  widget?: ChatWidget;
  suggestions?: string[];
}

export interface ChatSessionState {
  pendingWorkflow?: 'create_pipeline' | 'filter_deals' | 'update_deal' | null;
  pipelineDraft?: {
    name?: string;
    type?: 'enterprise' | 'product_led' | 'velocity' | 'custom';
    stages?: PipelineStage[];
  };
}

export function generateInitialGreeting(): ChatMessage {
  return {
    id: 'msg-welcome',
    role: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    thinking: 'Initialized CRM conversational context. Loaded active pipelines (2), deals ($428k active pipeline), and contacts.',
    content: `Hello! I'm your **Claude CRM AI Assistant**. 

I can query your live CRM database, analyze revenue and conversion metrics, update deal statuses, or guide you through creating custom sales pipelines with interactive option selectors.

What would you like to explore today?`,
    suggestions: [
      '🔨 Build a new Sales Pipeline',
      '📊 Show high-value deals in negotiation',
      '📈 Calculate total active pipeline ARR',
      '👤 Review qualified leads & accounts',
    ],
  };
}

export function processUserInteraction(
  userText: string,
  state: ChatSessionState,
  crmState: { deals: Deal[]; pipelines: Pipeline[]; contacts: Contact[] }
): { response: ChatMessage; updatedState: ChatSessionState; crmAction?: { type: 'ADD_PIPELINE' | 'UPDATE_DEAL'; data: any } } {
  const normalized = userText.toLowerCase().trim();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. WORKFLOW: PIPELINE CREATION
  if (
    normalized.includes('build') ||
    normalized.includes('create') ||
    normalized.includes('make') ||
    normalized.includes('pipeline') ||
    normalized.includes('piple') ||
    normalized.includes('funnel')
  ) {
    if (!state.pendingWorkflow || state.pendingWorkflow !== 'create_pipeline') {
      const updatedState: ChatSessionState = {
        pendingWorkflow: 'create_pipeline',
        pipelineDraft: {},
      };

      return {
        response: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          timestamp: time,
          thinking: 'The user wants to configure a sales pipeline. To tailor the stages, win probabilities, and cycle duration appropriately, I should present standard sales models with distinct qualification structures.',
          content: `I'd love to help you build a new CRM pipeline! 

To tailor the appropriate deal velocity and qualification stages, **select the sales motion** that best matches your go-to-market strategy:`,
          widget: {
            type: 'single_choice',
            title: 'Select Sales Motion Architecture',
            description: 'Choose the operational model for this pipeline',
            options: [
              {
                id: 'opt-enterprise',
                label: '🏢 Enterprise B2B Sales',
                description: 'For high ACV ($50k+) deals with security review, multiple stakeholders, and legal contracting.',
                badge: 'High Value / 60-90 days',
              },
              {
                id: 'opt-plg',
                label: '⚡ Product-Led Growth (PLG)',
                description: 'For self-serve trial users upgrading to paid team plans based on product engagement (PQLs).',
                badge: 'High Volume / 7-14 days',
              },
              {
                id: 'opt-inbound',
                label: '🎯 High-Velocity Inside Sales',
                description: 'Fast inbound lead qualification, immediate product demonstration, and quick closing.',
                badge: 'Mid Value / 14-30 days',
              },
              {
                id: 'opt-partnership',
                label: '🤝 Strategic Channel & Partnerships',
                description: 'Partner co-selling, reseller referrals, and strategic ecosystem alliances.',
                badge: 'Strategic GTM',
              },
              {
                id: 'opt-scratch',
                label: '✨ Build Pipeline From Scratch',
                description: 'Design custom stages, win probabilities, and pipeline name from scratch with an interactive visual builder.',
                badge: '100% Customizable',
              },
            ],
          },
          suggestions: ['🏢 Enterprise B2B Sales', '⚡ Product-Led Growth', '✨ Build Pipeline From Scratch'],
        },
        updatedState,
      };
    }
  }

  // 2. WORKFLOW: OPTION SELECTION FOR PIPELINE MODEL
  if (state.pendingWorkflow === 'create_pipeline' && !state.pipelineDraft?.type) {
    if (
      normalized.includes('scratch') ||
      normalized.includes('from scratch') ||
      normalized.includes('build pipeline from scratch') ||
      normalized === 'custom'
    ) {
      const updatedState: ChatSessionState = {
        ...state,
        pendingWorkflow: 'create_pipeline',
        pipelineDraft: {
          name: 'Custom Sales Pipeline',
          type: 'custom',
        },
      };

      return {
        response: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          timestamp: time,
          thinking: 'User selected to build a custom pipeline from scratch. Presenting the interactive Custom Pipeline Builder allowing live stage addition, custom naming, and probability calibration.',
          content: `### 🎨 Custom Pipeline Builder (From Scratch)

You can build your custom sales pipeline from scratch! 

Use the **interactive funnel designer** below to set your **pipeline name**, add, rename, or delete **custom stages**, and configure their **win probabilities**. You can also load an industry template preset with one click:`,
          widget: {
            type: 'custom_pipeline_builder',
            title: 'Custom Funnel Designer',
            description: 'Define your custom pipeline name and progression milestones',
            actionText: '⚡ Preview & Confirm Custom Funnel',
          },
          suggestions: [
            'Load Real Estate Template',
            'Load Consulting Agency Template',
            'Load SaaS Funnel Template',
          ],
        },
        updatedState,
      };
    }

    let selectedType: 'enterprise' | 'product_led' | 'velocity' | 'custom' = 'enterprise';
    let pipelineName = 'Enterprise Sales Pipeline';

    if (normalized.includes('plg') || normalized.includes('product-led')) {
      selectedType = 'product_led';
      pipelineName = 'PLG Expansion Pipeline';
    } else if (normalized.includes('velocity') || normalized.includes('inbound')) {
      selectedType = 'velocity';
      pipelineName = 'Velocity Inbound Pipeline';
    } else if (normalized.includes('partner') || normalized.includes('channel')) {
      selectedType = 'custom';
      pipelineName = 'Partner Co-Sell Pipeline';
    }

    // Prepare default selectable stages based on type
    const stageOptions = getStageOptionsForType(selectedType);

    const updatedState: ChatSessionState = {
      ...state,
      pipelineDraft: {
        name: pipelineName,
        type: selectedType,
      },
    };

    return {
      response: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: time,
        thinking: `User selected "${pipelineName}". Now presenting granular pipeline stages for selection. Multi-select checkboxes allow toggling key milestones like security review or technical validation.`,
        content: `Great choice! I have configured the baseline for **${pipelineName}**.

Now, choose which **deal stages** you want to include in this pipeline. You can select all relevant stages or uncheck any steps that your team doesn't require:`,
        widget: {
          type: 'multi_choice',
          title: `Configure Stages for ${pipelineName}`,
          description: 'Select stages to include in your active sales funnel',
          options: stageOptions,
          selectedIds: stageOptions.map((s) => s.id), // All pre-checked by default
          actionText: 'Confirm Selected Stages & Generate Funnel',
        },
        suggestions: ['Select all standard stages', 'Exclude Security Review', 'Only 4 fast stages'],
      },
      updatedState,
    };
  }

  // 3. WORKFLOW: STAGES CONFIRMED -> PREVIEW PIPELINE
  if (state.pendingWorkflow === 'create_pipeline' && state.pipelineDraft?.type && !state.pipelineDraft.stages) {
    // Check if input is a custom pipeline definition from scratch
    const customMatch = userText.match(
      /(?:custom pipeline named|pipeline named|called)\s+["']?([^"']+)["']?\s+with stages:?\s*(.+)$/i
    );

    if (customMatch || (normalized.includes('stages:') && (state.pipelineDraft?.type === 'custom' || normalized.includes('custom pipeline')))) {
      let customPipelineName = state.pipelineDraft?.name || 'Custom Sales Pipeline';
      let rawStagesStr = '';

      if (customMatch) {
        customPipelineName = customMatch[1].trim();
        rawStagesStr = customMatch[2].trim();
      } else {
        const parts = userText.split(/stages:?/i);
        rawStagesStr = parts[1] || '';
      }

      const stageParts = rawStagesStr.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
      const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

      const configuredStages: PipelineStage[] = stageParts.map((part, index) => {
        const probMatch = part.match(/\((\d+)%\)/);
        const stageName = part.replace(/\(\d+%\)/, '').replace(/^\d+\.\s*/, '').trim();
        let prob = probMatch
          ? parseInt(probMatch[1], 10)
          : Math.round(((index + 1) / (stageParts.length || 1)) * 100);

        return {
          id: `stg-${Date.now()}-${index}`,
          name: stageName || `Stage ${index + 1}`,
          order: index + 1,
          probability: Math.min(100, Math.max(0, prob)),
          dealCount: 0,
          color: colors[index % colors.length],
        };
      });

      const fullPipelineDraft: Pipeline = {
        id: `pipe-${Date.now().toString(36)}`,
        name: customPipelineName,
        description: `Bespoke custom pipeline built from scratch with ${configuredStages.length} structured stages.`,
        type: 'custom',
        stages: configuredStages,
        createdAt: new Date().toISOString().split('T')[0],
      };

      const updatedState: ChatSessionState = {
        ...state,
        pipelineDraft: fullPipelineDraft,
      };

      return {
        response: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          timestamp: time,
          thinking: `Custom pipeline "${fullPipelineDraft.name}" generated with ${configuredStages.length} custom stages from scratch. Ready for confirmation and database deployment.`,
          content: `### 🎯 Pipeline Preview: **${fullPipelineDraft.name}**

Your custom pipeline has been configured from scratch with **${configuredStages.length} bespoke stages**. Review the funnel below:`,
          widget: {
            type: 'pipeline_preview',
            title: fullPipelineDraft.name,
            description: `Bespoke funnel with ${configuredStages.length} customized milestones.`,
            pipelineDraft: fullPipelineDraft,
            actionText: '🚀 Save & Deploy Pipeline to Live CRM Database',
          },
          suggestions: ['🚀 Save Pipeline to CRM', 'Modify stages', 'Start over'],
        },
        updatedState,
      };
    }

    // If user clicked or confirmed stages
    const type = state.pipelineDraft.type || 'enterprise';
    const allOptions = getStageOptionsForType(type);

    // 1. Check for explicit stage IDs in brackets [stg-disco,stg-security]
    const idMatch = userText.match(/\[([a-zA-Z0-9_,-]+)\]/);
    let selectedOptions: WidgetOption[] = [];

    if (idMatch && idMatch[1]) {
      const parsedIds = idMatch[1].split(',').map((s) => s.trim());
      selectedOptions = allOptions.filter((o) => parsedIds.includes(o.id));
    }

    // 2. Handle natural text or suggestion chips (e.g. "Exclude Security Review", "Only 4 fast stages")
    if (selectedOptions.length === 0) {
      if (normalized.includes('exclude') || normalized.includes('without')) {
        selectedOptions = allOptions.filter((o) => {
          const cleanLabel = o.label.replace(/^\d+\.\s*/, '').toLowerCase();
          const cleanId = o.id.replace(/^stg-/, '').toLowerCase();
          const isSecurityMatch =
            (normalized.includes('security') || normalized.includes('infosec')) &&
            (cleanLabel.includes('infosec') || cleanId.includes('security'));
          const isExcluded =
            normalized.includes(cleanLabel) ||
            normalized.includes(cleanId) ||
            isSecurityMatch;
          return !isExcluded;
        });
      } else if (normalized.includes('only 4') || normalized.includes('fast stages')) {
        selectedOptions = allOptions.slice(0, 4);
      } else if (normalized.includes('select all') || normalized.includes('standard stages')) {
        selectedOptions = allOptions;
      } else {
        const matched = allOptions.filter((o) => {
          const cleanLabel = o.label.replace(/^\d+\.\s*/, '').toLowerCase();
          const cleanId = o.id.replace(/^stg-/, '').toLowerCase();
          const words = cleanLabel.split(/\s+/).filter((w) => w.length > 3);
          return (
            normalized.includes(cleanLabel) ||
            normalized.includes(cleanId) ||
            words.some((w) => normalized.includes(w))
          );
        });
        if (matched.length > 0) {
          selectedOptions = matched;
        }
      }
    }

    // Fallback: if nothing matched, use all options
    if (selectedOptions.length === 0) {
      selectedOptions = allOptions;
    }

    const configuredStages: PipelineStage[] = selectedOptions.map((opt, index) => {
      let prob = 20;
      if (opt.badge) {
        const parsed = parseInt(opt.badge.replace('%', ''), 10);
        if (!isNaN(parsed)) prob = parsed;
      } else {
        prob = Math.round(((index + 1) / (selectedOptions.length || 1)) * 100);
      }

      const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
      return {
        id: `stg-${Date.now()}-${index}`,
        name: opt.label.replace(/^\d+\.\s*/, '').trim(),
        order: index + 1,
        probability: Math.min(100, Math.max(0, prob)),
        dealCount: 0,
        color: colors[index % colors.length],
      };
    });

    const fullPipelineDraft: Pipeline = {
      id: `pipe-${Date.now().toString(36)}`,
      name: state.pipelineDraft.name || 'New Custom Pipeline',
      description: `Generated via Claude CRM Assistant with ${configuredStages.length} structured stages.`,
      type: state.pipelineDraft.type || 'enterprise',
      stages: configuredStages,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedState: ChatSessionState = {
      ...state,
      pipelineDraft: fullPipelineDraft,
    };

    return {
      response: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: time,
        thinking: 'All stages chosen. Synthesizing visual funnel preview with ordered probabilities. Presenting final confirmation card to commit to the live CRM database.',
        content: `### Pipeline Preview: **${fullPipelineDraft.name}**

Here is the visual funnel layout generated based on your selections. Review the progression order and estimated win probabilities:`,
        widget: {
          type: 'pipeline_preview',
          title: fullPipelineDraft.name,
          description: `Total ${configuredStages.length} progression milestones from initial outreach to revenue realization.`,
          pipelineDraft: fullPipelineDraft,
          actionText: '🚀 Save & Deploy Pipeline to Live CRM Database',
        },
        suggestions: ['🚀 Save Pipeline to CRM', 'Modify stages', 'Start over'],
      },
      updatedState,
    };
  }

  // 4. WORKFLOW: SAVE PIPELINE TO CRM
  if (state.pendingWorkflow === 'create_pipeline' && state.pipelineDraft?.stages && (normalized.includes('save') || normalized.includes('deploy') || normalized.includes('confirm') || normalized.includes('yes'))) {
    const newPipeline = state.pipelineDraft as Pipeline;
    const updatedState: ChatSessionState = {
      pendingWorkflow: null,
      pipelineDraft: undefined,
    };

    return {
      response: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: time,
        thinking: `Pipeline "${newPipeline.name}" successfully committed to CRM store. Updating stats and providing follow-up options.`,
        content: `✅ **Pipeline Successfully Created & Deployed!**

The pipeline **"${newPipeline.name}"** is now active in your CRM database with **${newPipeline.stages.length} stages**:

${newPipeline.stages.map((stg) => `• **Stage ${stg.order}**: ${stg.name} *(Default Probability: ${stg.probability}%)*`).join('\n')}

> You can open the **Live CRM Database** inspector on the top-right to inspect it alongside your deals and contacts.

What would you like to do next?`,
        suggestions: [
          '📊 Query deals in negotiation',
          '➕ Add a deal to this new pipeline',
          '📈 Show total pipeline revenue',
        ],
      },
      updatedState,
      crmAction: {
        type: 'ADD_PIPELINE',
        data: newPipeline,
      },
    };
  }

  // 5. CRM QUERY: TOP DEALS, HIGH VALUE DEALS, OR GENERAL DEAL INQUIRIES
  if (
    normalized.includes('deal') ||
    normalized.includes('opportunity') ||
    normalized.includes('opportunities') ||
    normalized.includes('top') ||
    normalized.includes('biggest') ||
    normalized.includes('highest') ||
    normalized.includes('largest')
  ) {
    let dealsInScope = [...crmState.deals];
    let queryTitle = 'Current CRM Deals';

    // Check for "top N" (e.g., top 3, top 5) or highest value
    const topMatch = normalized.match(/top\s*(\d+)/i);
    const isTopQuery = Boolean(topMatch) || normalized.includes('top') || normalized.includes('biggest') || normalized.includes('highest') || normalized.includes('largest');

    // 1. Check for dynamic owner match from current deals in database
    const allOwners = Array.from(new Set(crmState.deals.map((d) => d.owner)));
    const matchedOwner = allOwners.find((owner) => {
      const lower = owner.toLowerCase();
      return normalized.includes(lower) || lower.split(' ').some((part) => part.length > 2 && normalized.includes(part));
    });

    // 2. Check for dynamic stage match from current deals in database
    const allStages = Array.from(new Set(crmState.deals.map((d) => d.stageName)));
    const matchedStage = allStages.find((stg) => normalized.includes(stg.toLowerCase()));

    // 3. Check for dynamic company match
    const allCompanies = Array.from(new Set(crmState.deals.map((d) => d.company)));
    const matchedCompany = allCompanies.find((comp) => {
      const lower = comp.toLowerCase();
      return normalized.includes(lower) || lower.split(' ').some((part) => part.length > 3 && normalized.includes(part));
    });

    if (isTopQuery) {
      const count = topMatch ? parseInt(topMatch[1], 10) : 3;
      dealsInScope = [...crmState.deals]
        .sort((a, b) => b.value - a.value)
        .slice(0, count);
      queryTitle = `Top ${dealsInScope.length} Deals by Revenue`;
    } else if (matchedOwner) {
      dealsInScope = crmState.deals.filter((d) => d.owner === matchedOwner);
      queryTitle = `Deals Managed by ${matchedOwner}`;
    } else if (matchedStage) {
      dealsInScope = crmState.deals.filter((d) => d.stageName.toLowerCase() === matchedStage.toLowerCase());
      queryTitle = `Deals in "${matchedStage}" Stage`;
    } else if (matchedCompany) {
      dealsInScope = crmState.deals.filter((d) => d.company.toLowerCase() === matchedCompany.toLowerCase());
      queryTitle = `Deals with ${matchedCompany}`;
    } else {
      dealsInScope = [...crmState.deals].sort((a, b) => b.value - a.value);
    }

    const totalVal = dealsInScope.reduce((sum, d) => sum + d.value, 0);

    // Format list details
    const listSummary = dealsInScope
      .map(
        (d, idx) =>
          `${idx + 1}. **${d.name}** (${d.company})\n   • Value: **$${d.value.toLocaleString()} USD**\n   • Stage: \`${d.stageName}\` (${d.probability}% prob) · Owner: *${d.owner}*`
      )
      .join('\n\n');

    return {
      response: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: time,
        thinking: `Processed deal query: "${userText}". Filtered and sorted ${dealsInScope.length} deals totaling $${totalVal.toLocaleString()} USD.`,
        content: `Here are the **${queryTitle.toLowerCase()}** in your CRM database totaling **$${totalVal.toLocaleString()} USD**:

${listSummary}

You can select a follow-up action below:`,
        widget: {
          type: 'deal_table',
          title: queryTitle,
          dealList: dealsInScope,
        },
        suggestions: [
          '💰 Calculate weighted expected revenue',
          '⚡ Move Acme Corp to Closed Won',
          '🔨 Build a new Sales Pipeline',
          '👤 View all contacts & leads',
        ],
      },
      updatedState: state,
    };
  }

  // 6. CRM QUERY: PIPELINE ARR / METRICS
  if (
    normalized.includes('arr') ||
    normalized.includes('revenue') ||
    normalized.includes('metrics') ||
    normalized.includes('total') ||
    normalized.includes('stats')
  ) {
    const activeDeals = crmState.deals.filter((d) => d.stageName !== 'Closed Won' && d.stageName !== 'Closed Lost');
    const totalPipeline = activeDeals.reduce((sum, d) => sum + d.value, 0);
    const weightedPipeline = activeDeals.reduce((sum, d) => sum + Math.round((d.value * d.probability) / 100), 0);
    const closedWon = crmState.deals.filter((d) => d.stageName === 'Closed Won').reduce((sum, d) => sum + d.value, 0);

    return {
      response: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: time,
        thinking: 'Aggregated unweighted and probability-weighted pipeline ARR metrics across all active pipelines.',
        content: `### 📈 CRM Revenue & Pipeline Analysis

Here is your current real-time sales pipeline valuation:

- **Total Active Pipeline**: **$${totalPipeline.toLocaleString()} USD** across ${activeDeals.length} opportunities.
- **Weighted Forecast Value**: **$${weightedPipeline.toLocaleString()} USD** *(adjusted by deal stage probabilities)*.
- **Closed Won (Realized)**: **$${closedWon.toLocaleString()} USD**.

#### Key Deal Highlights:
- **Top Opportunity**: FinTech Nexus ($120,000 at 80% probability - Contract Negotiation).
- **Secondary Opportunity**: Vanguard Labs ($95,000 at 55% probability - Security Review).

Would you like to drill into any specific sales rep, pipeline, or stage?`,
        suggestions: [
          '📊 Show deals in negotiation',
          '🔨 Build a new Sales Pipeline',
          '👤 View qualified contacts',
        ],
      },
      updatedState: state,
    };
  }

  // 7. CRM ACTION: MOVE DEAL TO CLOSED WON
  if (normalized.includes('move') && (normalized.includes('closed won') || normalized.includes('won'))) {
    const targetDeal = crmState.deals.find((d) => d.company.toLowerCase().includes('acme') || d.name.toLowerCase().includes('acme'));
    if (targetDeal) {
      return {
        response: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          timestamp: time,
          thinking: `Executing deal status update for "${targetDeal.name}" to Closed Won. This adds $${targetDeal.value.toLocaleString()} to realized ARR.`,
          content: `🎉 **Deal Updated to Closed Won!**

**${targetDeal.name}** has been marked as **Closed Won** at **100% win probability**.

- **Revenue Realized**: +$${targetDeal.value.toLocaleString()} USD
- **Account**: ${targetDeal.company}
- **Owner**: ${targetDeal.owner}
- **Contact**: ${targetDeal.contactName} (${targetDeal.contactEmail})

Your CRM metrics and deal table have been updated.`,
          suggestions: [
            '📈 Recalculate total pipeline ARR',
            '📊 Show remaining active deals',
            '🔨 Build a new Sales Pipeline',
          ],
        },
        updatedState: state,
        crmAction: {
          type: 'UPDATE_DEAL',
          data: { id: targetDeal.id, stageName: 'Closed Won', probability: 100 },
        },
      };
    }
  }

  // 8. CRM QUERY: CONTACTS / LEADS
  if (normalized.includes('contact') || normalized.includes('lead') || normalized.includes('account')) {
    return {
      response: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: time,
        thinking: `Fetched ${crmState.contacts.length} CRM contacts. Categorized by qualification status.`,
        content: `You currently have **${crmState.contacts.length} key contacts** in your CRM database:

${crmState.contacts
            .map(
              (c) =>
                `• **${c.name}** (${c.role} at **${c.company}**)\n  Status: \`${c.status}\` | Deal Association: $${(c.dealValue || 0).toLocaleString()} | Recent: *${c.lastActivity}*`
            )
            .join('\n\n')}

Select an action or ask a follow-up query:`,
        suggestions: [
          '📊 Show deals in negotiation',
          '🔨 Build a new Sales Pipeline',
          '📈 Calculate total active pipeline ARR',
        ],
      },
      updatedState: state,
    };
  }

  // 9. DEFAULT / ASSISTANT CONVERSATION WITH INTELLIGENT SUGGESTIONS
  return {
    response: {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: time,
      thinking: `Analyzing general CRM question: "${userText}". Formulating structured guidance with interactive follow-up paths.`,
      content: `I've analyzed your question regarding **"${userText}"**.

In modern CRM management, keeping deal stages transparent with clear exit criteria ensures reliable sales forecasting. You can ask me to:

1. **Build a customized sales pipeline** with interactive multi-stage selection.
2. **Query high-value opportunities** or filter by deal stage.
3. **Analyze pipeline velocity & conversion probabilities**.
4. **Inspect live CRM records** using the inspector panel.

How would you like to proceed?`,
      suggestions: [
        '🔨 Build a new Sales Pipeline',
        '📊 Show high-value deals in negotiation',
        '📈 Calculate total active pipeline ARR',
        '👤 Review qualified leads & accounts',
      ],
    },
    updatedState: state,
  };
}

function getStageOptionsForType(type: 'enterprise' | 'product_led' | 'velocity' | 'custom'): WidgetOption[] {
  switch (type) {
    case 'product_led':
      return [
        { id: 'stg-signup', label: '1. User Signup & Onboarding', description: 'User registers self-serve account', badge: '10%' },
        { id: 'stg-pql', label: '2. Product Qualified Lead (PQL)', description: 'Hits usage threshold or team invite limit', badge: '35%' },
        { id: 'stg-demo', label: '3. Expansion Consultation Call', description: 'Account Executive demos Enterprise features', badge: '60%' },
        { id: 'stg-proposal', label: '4. Commercial Team Tier Offer', description: 'Volume pricing or annual discount sent', badge: '80%' },
        { id: 'stg-won', label: '5. Upgraded to Annual Contract', description: 'Payment processed and ARR recognized', badge: '100%' },
      ];
    case 'velocity':
      return [
        { id: 'stg-inbound', label: '1. Inbound Demo Request', description: 'Form submitted on website or ad campaign', badge: '15%' },
        { id: 'stg-qualification', label: '2. BANT Qualification Call', description: 'Budget, Authority, Need, Timeline verified', badge: '40%' },
        { id: 'stg-pitch', label: '3. Solution Walkthrough', description: 'Core product demo focused on primary pain point', badge: '70%' },
        { id: 'stg-close', label: '4. Closed Won', description: 'Credit card or electronic invoice executed', badge: '100%' },
      ];
    case 'custom':
      return [
        { id: 'stg-partner', label: '1. Partner Discovery Call', description: 'Initial alignment on joint customer value', badge: '20%' },
        { id: 'stg-vetting', label: '2. Technical & GTM Vetting', description: 'Review security integration & revenue share', badge: '45%' },
        { id: 'stg-cosell', label: '3. Active Co-Sell Opportunity', description: 'Joint customer proposal submitted', badge: '75%' },
        { id: 'stg-signed', label: '4. Partnership Agreement Executed', description: 'Formal contract executed', badge: '100%' },
      ];
    case 'enterprise':
    default:
      return [
        { id: 'stg-disco', label: '1. Discovery & Pain Identification', description: 'Understand enterprise pain, budget, and stakeholders', badge: '10%' },
        { id: 'stg-eval', label: '2. Technical Evaluation / POC', description: 'Product proof-of-concept with engineering team', badge: '30%' },
        { id: 'stg-security', label: '3. InfoSec & Legal Compliance', description: 'SOC2, GDPR, pen tests, and DPA contract review', badge: '55%' },
        { id: 'stg-negotiate', label: '4. Executive Contract Negotiation', description: 'MSA redlines, SLA terms, and executive sign-off', badge: '80%' },
        { id: 'stg-closedwon', label: '5. Contract Signed (Closed Won)', description: 'Countersigned order form and provisioning', badge: '100%' },
      ];
  }
}
