import { NextRequest, NextResponse } from 'next/server';
import { waterEngine } from '@/lib/waterEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action; // 'TRIGGER' | 'RESET'
    const initiatedBy = body.initiatedBy || 'Operator';

    if (action === 'TRIGGER') {
      waterEngine.triggerEmergencyStop(initiatedBy);
      return NextResponse.json({ success: true, message: '🚨 EMERGENCY STOP ENGAGED. Pump contactor tripped.' });
    } else if (action === 'RESET') {
      waterEngine.resetEmergencyStop(initiatedBy);
      return NextResponse.json({ success: true, message: 'Emergency Stop successfully reset.' });
    }

    return NextResponse.json({ error: 'Action must be TRIGGER or RESET.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to toggle emergency stop.' }, { status: 500 });
  }
}
