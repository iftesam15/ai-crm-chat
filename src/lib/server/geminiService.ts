import { crmStore } from './crmStore';
import { ChatMessage, ChatSessionState, processUserInteraction } from '../chatEngine';
import { createCrmMastraAgent } from './mastra/agent';

export interface ChatBackendResponse {
  message: ChatMessage;
  updatedState: ChatSessionState;
  crmSnapshot: Awaited<ReturnType<typeof crmStore.getFullSnapshot>>;
  source: 'mastra_gemini' | 'simulated_fallback';
  modelUsed?: string;
}

export async function processChatWithGemini(
  userText: string,
  history: ChatMessage[],
  sessionState: ChatSessionState,
  clientApiKey?: string
): Promise<ChatBackendResponse> {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const normalized = userText.toLowerCase().trim();

  // A. Check if the user confirmed/clicked to SAVE or DEPLOY the draft pipeline
  const isSaveAction =
    normalized.includes('save') ||
    normalized.includes('deploy') ||
    normalized.includes('confirm') ||
    userText.includes('Save & Deploy Pipeline');

  if (
    sessionState?.pendingWorkflow === 'create_pipeline' &&
    sessionState?.pipelineDraft?.stages &&
    sessionState.pipelineDraft.stages.length > 0 &&
    isSaveAction
  ) {
    console.log(
      `💾 [Interactive Pipeline Save] Persisting "${sessionState.pipelineDraft.name}" with ${sessionState.pipelineDraft.stages.length} stages to SQLite...`
    );
    const draft = sessionState.pipelineDraft;
    const stages = draft.stages || [];
    const savedPipeline = await crmStore.addPipeline({
      name: draft.name || 'New Custom Pipeline',
      type: draft.type || 'custom',
      description: `Generated via Claude CRM Assistant with ${stages.length} structured stages.`,
      stages: stages.map((stg, i) => ({
        name: stg.name,
        order: stg.order ?? i + 1,
        probability: stg.probability ?? 20,
        color: stg.color,
      })),
    });
    const updatedSnapshot = await crmStore.getFullSnapshot();

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: time,
      thinking: `Pipeline "${savedPipeline.name}" successfully committed to SQLite database. Synchronized with live CRM store.`,
      content: `✅ **Pipeline Successfully Created & Deployed to Database!**

The pipeline **"${savedPipeline.name}"** is now active in your SQLite CRM database with **${savedPipeline.stages.length} stages**:

${savedPipeline.stages.map((stg) => `• **Stage ${stg.order}**: ${stg.name} *(Default Probability: ${stg.probability}%)*`).join('\n')}

All changes have been synchronized. You can view it in the **CRM Records** page (/records) or assign deals to these newly configured stages.`,
      widget: {
        type: 'pipeline_preview',
        title: savedPipeline.name,
        description: `Live database pipeline with ${savedPipeline.stages.length} stages.`,
        pipelineDraft: savedPipeline,
        isDeployed: true,
      },
      suggestions: [
        '📊 View all pipelines in Records',
        '➕ Add a deal to this pipeline',
        '📈 Calculate total pipeline ARR',
      ],
    };

    return {
      message: assistantMsg,
      updatedState: {
        ...sessionState,
        pendingWorkflow: null,
        pipelineDraft: undefined,
      },
      crmSnapshot: updatedSnapshot,
      source: apiKey ? 'mastra_gemini' : 'simulated_fallback',
      modelUsed: apiKey ? 'Mastra (gemini-3.1-flash-lite via Tools)' : undefined,
    };
  }

  // B. Check if user is in the interactive pipeline builder wizard (selecting sales motion or stage checkboxes)
  const isPipelineWizardStep =
    sessionState?.pendingWorkflow === 'create_pipeline' ||
    (
      (normalized.includes('build') ||
        normalized.includes('funnel') ||
        normalized === 'create pipeline' ||
        normalized === 'build a pipeline' ||
        normalized === 'build a new sales pipeline') &&
      !normalized.includes('called') &&
      !normalized.includes('named') &&
      !normalized.includes('stages')
    );

  if (isPipelineWizardStep) {
    console.log(`🧙 [Interactive Pipeline Wizard] Processing step with chatEngine...`);
    const crmData = await crmStore.getFullSnapshot();
    const result = processUserInteraction(userText, sessionState, {
      deals: crmData.deals,
      pipelines: crmData.pipelines,
      contacts: crmData.contacts,
    });

    if (result.crmAction) {
      if (result.crmAction.type === 'ADD_PIPELINE') {
        await crmStore.addPipeline(result.crmAction.data);
      } else if (result.crmAction.type === 'UPDATE_DEAL') {
        await crmStore.updateDeal(result.crmAction.data.id, {
          stageName: result.crmAction.data.stageName,
          probability: result.crmAction.data.probability,
        });
      }
    }

    const updatedSnapshot = await crmStore.getFullSnapshot();

    return {
      message: result.response,
      updatedState: result.updatedState,
      crmSnapshot: updatedSnapshot,
      source: apiKey ? 'mastra_gemini' : 'simulated_fallback',
      modelUsed: apiKey ? 'Mastra Interactive Wizard' : undefined,
    };
  }

  // C. Fallback to local simulated CRM engine if no API key is available
  if (!apiKey || apiKey.trim() === '') {
    const crmData = await crmStore.getFullSnapshot();
    const result = processUserInteraction(userText, sessionState, {
      deals: crmData.deals,
      pipelines: crmData.pipelines,
      contacts: crmData.contacts,
    });

    if (result.crmAction) {
      if (result.crmAction.type === 'ADD_PIPELINE') {
        await crmStore.addPipeline(result.crmAction.data);
      } else if (result.crmAction.type === 'UPDATE_DEAL') {
        await crmStore.updateDeal(result.crmAction.data.id, {
          stageName: result.crmAction.data.stageName,
          probability: result.crmAction.data.probability,
        });
      }
    }

    const updatedSnapshot = await crmStore.getFullSnapshot();

    return {
      message: result.response,
      updatedState: result.updatedState,
      crmSnapshot: updatedSnapshot,
      source: 'simulated_fallback',
    };
  }

  // D. Call Mastra Agent with Google Gemini & Live Tool Calling
  try {
    console.log(`🤖 [Mastra Framework] Calling Mastra Agent with Tool Calling (model: gemini-3.1-flash-lite)...`);
    const agent = createCrmMastraAgent(apiKey);

    const prompt = `Conversation History:
${history.slice(-4).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Current User Request: "${userText}"`;

    const res = await agent.generate(prompt, { maxSteps: 5 });

    // Inspect tools executed during this run
    const toolResults: any[] = (res as any).toolResults || [];
    const executedToolNames = toolResults.map((t) => t.payload?.toolName || t.toolName).filter(Boolean);

    console.log(`🛠️ [Mastra Agent] Completed execution. Tools executed:`, executedToolNames);

    // Build intelligent thinking process text
    let thinking = 'Mastra Agent analyzed the conversation context.';
    if (executedToolNames.length > 0) {
      thinking = `Executed Mastra tool(s): [${executedToolNames.join(', ')}]. Live database synchronized with SQLite.`;
    }

    // Determine widgets to attach based on executed tools
    let attachedWidget: ChatMessage['widget'] = undefined;

    // 1. If createPipeline was executed:
    const createPipelineResult = toolResults.find(
      (t) => (t.payload?.toolName || t.toolName) === 'createPipeline'
    );
    if (createPipelineResult?.payload?.result?.pipeline || createPipelineResult?.result?.pipeline) {
      const p = createPipelineResult.payload?.result?.pipeline || createPipelineResult.result?.pipeline;
      attachedWidget = {
        type: 'pipeline_preview',
        title: p.name,
        description: `Persisted to SQLite database with ${p.stages?.length || 0} stages.`,
        pipelineDraft: p,
        isDeployed: true,
      };
    }

    // 2. If getDeals was executed:
    const getDealsResult = toolResults.find(
      (t) => (t.payload?.toolName || t.toolName) === 'getDeals'
    );
    if (getDealsResult?.payload?.result?.deals || getDealsResult?.result?.deals) {
      const deals = getDealsResult.payload?.result?.deals || getDealsResult.result?.deals;
      if (Array.isArray(deals) && deals.length > 0) {
        attachedWidget = {
          type: 'deal_table',
          title: `Live Deal Intelligence (${deals.length} deals)`,
          description: 'Data queried directly from SQLite database via Mastra tool.',
          dealList: deals,
        };
      }
    }

    // Parse content
    let content = res.text || 'Operation completed.';
    const rawTrimmed = (res.text || '').trim();
    if (rawTrimmed.startsWith('{') && rawTrimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(rawTrimmed);
        if (parsed.content) content = parsed.content;
        if (parsed.thinking) thinking = parsed.thinking;
        if (parsed.widget && !attachedWidget) attachedWidget = parsed.widget;
      } catch {
        // Not valid JSON, keep raw text
      }
    }

    // Fetch fresh database snapshot ensuring any mutations (e.g. createPipeline) are reflected
    const currentSnapshot = await crmStore.getFullSnapshot();

    const assistantMsg: ChatMessage = {
      id: `msg-mastra-${Date.now()}`,
      role: 'assistant',
      timestamp: time,
      content,
      thinking,
      widget: attachedWidget,
      suggestions: [
        '📊 Show deals in negotiation',
        '📈 Calculate total pipeline ARR',
        '🔨 Build a new Sales Pipeline',
      ],
    };

    return {
      message: assistantMsg,
      updatedState: sessionState,
      crmSnapshot: currentSnapshot,
      source: 'mastra_gemini',
      modelUsed: 'Mastra (gemini-3.1-flash-lite via Tools)',
    };
  } catch (error: any) {
    console.error('❌ Mastra Agent Error:', error);

    // Fall back to local CRM engine
    const crmData = await crmStore.getFullSnapshot();
    const fallback = processUserInteraction(userText, sessionState, {
      deals: crmData.deals,
      pipelines: crmData.pipelines,
      contacts: crmData.contacts,
    });

    if (fallback.crmAction?.type === 'ADD_PIPELINE') {
      await crmStore.addPipeline(fallback.crmAction.data);
    }

    const currentSnapshot = await crmStore.getFullSnapshot();

    return {
      message: {
        ...fallback.response,
        thinking: `Mastra agent encountered an error (${error.message || 'Check connection'}). Reverted to local CRM Engine.`,
      },
      updatedState: fallback.updatedState,
      crmSnapshot: currentSnapshot,
      source: 'simulated_fallback',
    };
  }
}
