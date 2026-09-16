import { NextResponse } from 'next/server';
import { waterEngine } from '@/lib/waterEngine';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(waterEngine.getState(), {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
