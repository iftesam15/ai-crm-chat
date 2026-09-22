import { NextRequest, NextResponse } from 'next/server';
import { processChatWithGemini } from '@/lib/server/geminiService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], sessionState = {} } = body;

    // Check for API key in custom header or body
    const clientApiKey = req.headers.get('x-gemini-key') || body.apiKey;
    const maskedKey = clientApiKey
      ? `${clientApiKey.slice(0, 6)}...${clientApiKey.slice(-4)}`
      : 'None (using local fallback engine)';

    // PRINT CLEAR FORMATTED LOG IN TERMINAL
    console.log('\n' + '='.repeat(60));
    console.log(`📥 [POST /api/chat] INCOMING PAYLOAD RECEIVED`);
    console.log(`🕒 Timestamp: ${new Date().toLocaleTimeString()}`);
    console.log(`🔑 Gemini Key: ${maskedKey}`);
    console.log(`💬 User Message: "${message}"`);
    console.log(`📜 Conversation History Length: ${history.length} messages`);
    console.log(`⚙️ Session State:`, JSON.stringify(sessionState, null, 2));
    console.log(`📦 Full Raw Payload Body:`);
    console.log(JSON.stringify(body, null, 2));
    console.log('='.repeat(60) + '\n');

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const result = await processChatWithGemini(message, history, sessionState, clientApiKey);

    console.log('\n' + '-'.repeat(60));
    console.log(`📤 [POST /api/chat] OUTGOING RESPONSE TO CLIENT`);
    console.log(`🤖 Engine Source: ${result.source}`);
    console.log(`📝 Content Preview: ${result.message.content.slice(0, 120)}...`);
    if (result.message.widget) {
      console.log(`🧩 Widget Attached:`, result.message.widget.type, `(${result.message.widget.title})`);
    }
    console.log('-'.repeat(60) + '\n');

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('❌ API /api/chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
