import { NextRequest, NextResponse } from 'next/server';
import { crmStore } from '@/lib/server/crmStore';

export async function GET() {
  try {
    console.log(`📡 [GET /api/crm] Client requested live CRM database snapshot.`);
    const snapshot = await crmStore.getFullSnapshot();
    return NextResponse.json({
      success: true,
      data: snapshot,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(`📥 [POST /api/crm] Received action:`, body);

    if (body.action === 'reset') {
      await crmStore.reset();
      console.log(`🔄 [POST /api/crm] Reset SQLite database to default seed state.`);
      const snapshot = await crmStore.getFullSnapshot();
      return NextResponse.json({
        success: true,
        message: 'CRM database reset to default seed data',
        data: snapshot,
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
