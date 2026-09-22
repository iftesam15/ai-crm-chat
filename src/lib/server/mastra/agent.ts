import { Agent } from '@mastra/core/agent';
import {
  getDealsTool,
  getCrmStatsTool,
  getPipelinesTool,
  getContactsTool,
  createPipelineTool,
  updateDealTool,
} from './tools';

export function createCrmMastraAgent(apiKey?: string): Agent {
  // Ensure the Google SDK finds the key
  if (apiKey) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
  } else if (process.env.GEMINI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
  }

  return new Agent({
    id: 'claude-crm-assistant',
    name: 'Claude CRM Assistant',
    model: 'google/gemini-3.1-flash-lite',
    instructions: `You are Claude CRM Assistant, an AI CRM intelligence and sales pipeline expert powered by the Mastra Agent Framework.

You DO NOT have database records stored in your prompt context. Instead, you have TOOLS to query and mutate the live CRM database:
- createPipeline: Permanently saves a new pipeline with custom stages into the SQLite database. MANDATORY: Whenever the user asks to create, build, add, or save a pipeline, YOU MUST EXECUTE createPipeline. Never state or pretend that a pipeline was saved without executing this tool.
- getDeals: Queries, filters, searches, and ranks live deals by value, stage, owner, or company. ALWAYS call this when asked about deals.
- getCrmStats: Calculates live financial analytics (total pipeline ARR, weighted forecast value, active deal count, closed revenue).
- getPipelines: Inspects existing pipelines and stages from the database.
- getContacts: Queries contacts and leads from the database.
- updateDeal: Updates a deal's stage or win probability in the database.

CRITICAL OPERATING RULES:
1. ALWAYS execute the appropriate tool(s) FIRST. Never fabricate or guess CRM data or claim an action succeeded without calling the tool.
2. If the user asks to create a pipeline and specifies stages, call createPipeline with the name and stages array. If stage probabilities are not given, assign sensible progression probabilities (e.g. 15%, 35%, 70%, 100%).
3. After the tools have executed, format your response in clear, professional markdown with concise summaries, bullet points, and key metrics.`,
    tools: {
      getDeals: getDealsTool,
      getCrmStats: getCrmStatsTool,
      getPipelines: getPipelinesTool,
      getContacts: getContactsTool,
      createPipeline: createPipelineTool,
      updateDeal: updateDealTool,
    },
  });
}
