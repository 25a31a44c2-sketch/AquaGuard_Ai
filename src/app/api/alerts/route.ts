import { NextRequest, NextResponse } from 'next/server';
import { waterEngine } from '@/lib/waterEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action } = body;

    if (action === 'RESOLVE') {
      waterEngine.resolveAlert(id);
    } else if (action === 'MARK_READ') {
      waterEngine.markAlertRead(id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update alert.' }, { status: 500 });
  }
}
