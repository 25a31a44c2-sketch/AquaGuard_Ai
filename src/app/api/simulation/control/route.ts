import { NextRequest, NextResponse } from 'next/server';
import { waterEngine } from '@/lib/waterEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    switch (action) {
      case 'TOGGLE_RUN':
        waterEngine.toggleSimulation();
        break;
      case 'SET_SPEED':
        waterEngine.setSimulationSpeed(Number(body.speed) || 1);
        break;
      case 'DRAIN_WATER':
        waterEngine.drainWater(Number(body.liters) || 300);
        break;
      case 'DRAIN_SOURCE':
        waterEngine.drainSource(Number(body.liters) || 500);
        break;
      case 'REFILL_SOURCE':
        waterEngine.refillSource(Number(body.liters) || 1000);
        break;
      case 'TOGGLE_FAULT':
        waterEngine.toggleFaultInjection();
        break;
      case 'TOGGLE_POWER':
        waterEngine.togglePowerOutage();
        break;
      case 'TOGGLE_INTERNET':
        waterEngine.toggleInternetOffline();
        break;
      case 'RESET':
        waterEngine.resetSimulation();
        break;
      default:
        return NextResponse.json({ error: `Unknown action ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, state: waterEngine.getState() });
  } catch {
    return NextResponse.json({ error: 'Failed to apply simulation action.' }, { status: 500 });
  }
}
