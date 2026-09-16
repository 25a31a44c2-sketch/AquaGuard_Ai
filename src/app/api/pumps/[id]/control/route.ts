import { NextRequest, NextResponse } from 'next/server';
import { waterEngine } from '@/lib/waterEngine';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const action = body.action as 'ON' | 'OFF' | undefined;
    const mode = body.mode as 'AUTO' | 'MANUAL' | undefined;
    const initiatedBy = body.initiatedBy || 'Authorized User';

    if (mode) {
      if (mode !== 'AUTO' && mode !== 'MANUAL') {
        return NextResponse.json({ error: 'Invalid mode. Must be AUTO or MANUAL.' }, { status: 400 });
      }
      waterEngine.setPumpMode(id, mode, initiatedBy);
      if (!action) {
        return NextResponse.json({ success: true, message: `Pump mode updated to ${mode}` }, { status: 200 });
      }
    }

    if (action) {
      if (action !== 'ON' && action !== 'OFF') {
        return NextResponse.json({ error: 'Invalid action. Must be ON or OFF.' }, { status: 400 });
      }

      const result = waterEngine.setPumpState(id, action, initiatedBy);

      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json({ error: 'Missing action or mode in request.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to dispatch pump command.' }, { status: 500 });
  }
}
