import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { crmStore } from '../crmStore';

// Tool 1: Query & Filter Deals from SQLite Database
export const getDealsTool = createTool({
  id: 'getDeals',
  description: 'Search, filter, and retrieve deals from the CRM database. Use this tool whenever the user asks about deals, top deals, revenue values, deals by sales rep, or deals by stage.',
  inputSchema: z.object({
    limit: z.number().optional().describe('Maximum number of deals to return (e.g., 3 for top 3)'),
    sortBy: z.enum(['value', 'probability']).optional().describe('Field to sort descending by'),
    stage: z.string().optional().describe('Filter deals by pipeline stage name (e.g., "Contract Negotiation", "Closed Won")'),
    owner: z.string().optional().describe('Filter deals by sales rep name (e.g., "Sarah Connor", "Elena Ramos")'),
    company: z.string().optional().describe('Filter deals by company name (e.g., "Acme", "FinTech Nexus")'),
  }),
  execute: async (input) => {
    console.log('🛠️ [Mastra Tool Called] getDeals with args:', input);
    const allDeals = await crmStore.getDeals();
    let deals = [...allDeals];

    if (input?.stage) {
      deals = deals.filter((d) => d.stageName.toLowerCase().includes(input.stage!.toLowerCase()));
    }
    if (input?.owner) {
      deals = deals.filter((d) => d.owner.toLowerCase().includes(input.owner!.toLowerCase()));
    }
    if (input?.company) {
      deals = deals.filter((d) => d.company.toLowerCase().includes(input.company!.toLowerCase()));
    }

    if (input?.sortBy === 'value' || !input?.sortBy) {
      deals.sort((a, b) => b.value - a.value);
    } else if (input?.sortBy === 'probability') {
      deals.sort((a, b) => b.probability - a.probability);
    }

    if (input?.limit && input.limit > 0) {
      deals = deals.slice(0, input.limit);
    }

    return {
      count: deals.length,
      deals,
    };
  },
});

// Tool 2: Get CRM Revenue & Pipeline Stats
export const getCrmStatsTool = createTool({
  id: 'getCrmStats',
  description: 'Retrieve real-time CRM financial analytics including total active pipeline ARR, weighted forecast value, active deal counts, and closed-won revenue.',
  inputSchema: z.object({}),
  execute: async () => {
    console.log('🛠️ [Mastra Tool Called] getCrmStats');
    return await crmStore.getStats();
  },
});

// Tool 3: Get Pipelines & Stages from SQLite Database
export const getPipelinesTool = createTool({
  id: 'getPipelines',
  description: 'Get existing sales pipelines and their ordered stages with conversion win probabilities.',
  inputSchema: z.object({
    pipelineId: z.string().optional().describe('Optional specific pipeline ID to fetch'),
  }),
  execute: async (input) => {
    console.log('🛠️ [Mastra Tool Called] getPipelines with args:', input);
    const pipelines = await crmStore.getPipelines();
    if (input?.pipelineId) {
      return pipelines.filter((p) => p.id === input.pipelineId);
    }
    return pipelines;
  },
});

// Tool 4: Get Contacts / Accounts from SQLite Database
export const getContactsTool = createTool({
  id: 'getContacts',
  description: 'Retrieve contacts, customer leads, and account representatives from the CRM database.',
  inputSchema: z.object({
    status: z.enum(['Lead', 'Qualified', 'Customer', 'Churned']).optional().describe('Filter by qualification status'),
    company: z.string().optional().describe('Filter contacts by company name'),
  }),
  execute: async (input) => {
    console.log('🛠️ [Mastra Tool Called] getContacts with args:', input);
    const allContacts = await crmStore.getContacts();
    let contacts = [...allContacts];
    if (input?.status) {
      contacts = contacts.filter((c) => c.status === input.status);
    }
    if (input?.company) {
      contacts = contacts.filter((c) => c.company.toLowerCase().includes(input.company!.toLowerCase()));
    }
    return contacts;
  },
});

// Tool 5: Create New Pipeline in SQLite Database
export const createPipelineTool = createTool({
  id: 'createPipeline',
  description: 'MANDATORY: Call this tool to permanently save a new sales pipeline with custom stages and probabilities into the SQLite database. You MUST call this whenever a pipeline is created or saved.',
  inputSchema: z.object({
    name: z.string().describe('Name of the new sales pipeline'),
    type: z.string().optional().describe('Sales motion architecture (e.g. enterprise, product_led, velocity, custom)'),
    description: z.string().optional().describe('Short description of the pipeline'),
    stages: z.array(
      z.object({
        name: z.string().describe('Stage name'),
        order: z.number().optional().describe('Stage sequence order index (1, 2, 3...)'),
        probability: z.number().optional().describe('Estimated win probability % (0 to 100 or 0.0 to 1.0)'),
      })
    ).describe('Ordered stages for this pipeline'),
  }),
  execute: async (input) => {
    console.log('🛠️ [Mastra Tool Called] createPipeline:', input);
    const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    const normalizedStages = input.stages.map((stg, i) => {
      let prob = 20;
      if (stg.probability !== undefined) {
        prob = stg.probability <= 1 && stg.probability > 0 ? Math.round(stg.probability * 100) : Math.round(stg.probability);
      } else {
        prob = Math.round(((i + 1) / (input.stages.length || 1)) * 100);
      }
      return {
        name: stg.name,
        order: stg.order || i + 1,
        probability: Math.min(100, Math.max(0, prob)),
        color: colors[i % colors.length],
      };
    });

    const newPipeline = await crmStore.addPipeline({
      name: input.name,
      description: input.description,
      type: input.type || 'custom',
      stages: normalizedStages,
    });

    console.log(`✅ [Mastra createPipeline] Successfully persisted "${newPipeline.name}" with ${newPipeline.stages.length} stages to SQLite!`);

    return {
      success: true,
      message: `Pipeline "${newPipeline.name}" successfully saved to SQLite database with ${newPipeline.stages.length} stages.`,
      pipeline: newPipeline,
    };
  },
});

// Tool 6: Update Deal Status / Stage in SQLite Database
export const updateDealTool = createTool({
  id: 'updateDeal',
  description: 'Update the stage, win probability, or details of a deal in the CRM database.',
  inputSchema: z.object({
    companyOrName: z.string().describe('Company or deal name to search for (e.g. "Acme Corp")'),
    stageName: z.string().describe('New stage name (e.g. "Closed Won", "Contract Negotiation")'),
    probability: z.number().describe('Updated win probability (e.g. 100 for Closed Won)'),
  }),
  execute: async (input) => {
    console.log('🛠️ [Mastra Tool Called] updateDeal:', input);
    const deals = await crmStore.getDeals();
    const target = deals.find(
      (d) =>
        d.company.toLowerCase().includes(input.companyOrName.toLowerCase()) ||
        d.name.toLowerCase().includes(input.companyOrName.toLowerCase())
    );

    if (!target) {
      return { success: false, error: `No deal found matching "${input.companyOrName}"` };
    }

    const updated = await crmStore.updateDeal(target.id, {
      stageName: input.stageName,
      probability: input.probability,
    });

    return {
      success: true,
      message: `Deal "${target.name}" updated to stage "${input.stageName}" (${input.probability}%) in database.`,
      deal: updated,
    };
  },
});
