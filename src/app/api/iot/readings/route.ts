import { NextRequest, NextResponse } from 'next/server';
import { waterEngine } from '@/lib/waterEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.eventId || !body.deviceId || body.waterLevel === undefined) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Missing required fields: eventId, deviceId, waterLevel' },
        { status: 400 }
      );
    }

    const result = waterEngine.ingestIoTReading({
      eventId: String(body.eventId),
      deviceId: String(body.deviceId),
      tankId: body.tankId,
      waterLevel: Number(body.waterLevel),
      sourceLevel: body.sourceLevel !== undefined ? Number(body.sourceLevel) : undefined,
      flowRate: body.flowRate !== undefined ? Number(body.flowRate) : undefined,
      temperature: body.temperature !== undefined ? Number(body.temperature) : undefined,
      pumpStatus: body.pumpStatus,
      timestamp: body.timestamp,
    });

    if (!result.success) {
      if (result.duplicate) {
        return NextResponse.json(result, { status: 409 }); // Idempotent conflict
      }
      return NextResponse.json(result, { status: 422 }); // Validation error
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to process IoT telemetry' }, { status: 500 });
  }
}
