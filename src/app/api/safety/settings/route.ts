import { NextRequest, NextResponse } from 'next/server';
import { waterEngine } from '@/lib/waterEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const initiatedBy = body.initiatedBy || 'Lead Admin';

    waterEngine.updateSafetySettings(
      {
        lowThreshold: body.lowThreshold !== undefined ? Number(body.lowThreshold) : undefined,
        fullThreshold: body.fullThreshold !== undefined ? Number(body.fullThreshold) : undefined,
        minSafeLevel: body.minSafeLevel !== undefined ? Number(body.minSafeLevel) : undefined,
        maxRuntime: body.maxRuntime !== undefined ? Number(body.maxRuntime) : undefined,
        overheadCapacity: body.overheadCapacity !== undefined ? Number(body.overheadCapacity) : undefined,
        sourceCapacity: body.sourceCapacity !== undefined ? Number(body.sourceCapacity) : undefined,
      },
      initiatedBy
    );

    return NextResponse.json({ success: true, message: 'Safety thresholds updated successfully.' });
  } catch {
    return NextResponse.json({ error: 'Failed to update safety settings.' }, { status: 500 });
  }
}
