import { NextRequest, NextResponse } from 'next/server';
import { waterEngine } from '@/lib/waterEngine';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = waterEngine.getState();
  return NextResponse.json(state.schedules);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'TOGGLE') {
      waterEngine.toggleSchedule(body.id);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'DELETE') {
      waterEngine.deleteSchedule(body.id);
      return NextResponse.json({ success: true });
    }

    waterEngine.addSchedule({
      name: body.name || 'New Water Schedule',
      startTime: body.startTime || '07:00',
      durationMinutes: Number(body.durationMinutes) || 30,
      daysOfWeek: body.daysOfWeek || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      enabled: body.enabled ?? true,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to manage schedule.' }, { status: 500 });
  }
}
