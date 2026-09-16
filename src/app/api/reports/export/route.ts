import { NextRequest, NextResponse } from 'next/server';
import { waterEngine } from '@/lib/waterEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'consumption'; // 'consumption' | 'audit' | 'sustainability'
  const state = waterEngine.getState();

  if (type === 'audit') {
    const csvHeader = 'Timestamp,Actor,Role,Action,Details,Severity\n';
    const csvRows = state.auditLogs
      .map(
        (l) =>
          `"${l.timestamp}","${l.actor}","${l.role}","${l.action}","${l.details.replace(/"/g, '""')}","${l.severity}"`
      )
      .join('\n');

    return new Response(csvHeader + csvRows, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="aquaguard-audit-log-${Date.now()}.csv"`,
      },
    });
  }

  // Default: Consumption report
  const csvHeader = 'TimeSlot,ActualUsageLiters,PredictedUsageLiters,PumpRuntimeMinutes\n';
  const csvRows = state.hourlyHistory
    .map((h) => `"${h.hour}",${h.usage},${h.predicted},${h.pumpOnMinutes}`)
    .join('\n');

  return new Response(csvHeader + csvRows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="aquaguard-consumption-report-${Date.now()}.csv"`,
    },
  });
}
