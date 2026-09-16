'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { waterEngine } from '@/lib/waterEngine';
import { PublicWebsite } from '@/components/PublicWebsite';
import { AuthenticatedApp } from '@/components/AuthenticatedApp';
import { SimulationDock } from '@/components/SimulationDock';

export default function Home() {
  const [data, setData] = useState<ReturnType<typeof waterEngine.getState> | null>(null);
  const [viewMode, setViewMode] = useState<'public' | 'app'>('public');
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'MANAGER' | 'USER'>('ADMIN');

  // Fetch initial telemetry state
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/iot/state', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchState();

    // Connect to Server-Sent Events (SSE) stream for real-time push updates
    const eventSource = new EventSource('/api/iot/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setData(payload);
      } catch {
        // Parse error or heartbeat
      }
    };

    eventSource.onerror = () => {
      // Reconnect automatically or fallback to polling every 2s
      setTimeout(fetchState, 2000);
    };

    return () => {
      eventSource.close();
    };
  }, [fetchState]);

  // Handler: Manual Remote Pump Control
  const handlePumpCommand = async (action: 'ON' | 'OFF') => {
    if (!data) return;
    const primaryPump = data.pumps[0];
    const res = await fetch(`/api/pumps/${primaryPump.id}/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, initiatedBy: `${currentUserRole} (Web Console)` }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Pump command rejected');
    }
    fetchState();
  };

  // Handler: Toggle Mode (AUTO vs MANUAL)
  const handleToggleMode = async (mode: 'AUTO' | 'MANUAL') => {
    if (!data) return;
    const primaryPump = data.pumps[0];
    await fetch('/api/simulation/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TOGGLE_MODE', mode, pumpId: primaryPump.id }),
    });
    fetchState();
  };

  // Handler: Emergency Stop Trigger & Reset
  const handleTriggerEStop = async () => {
    await fetch('/api/safety/emergency-stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TRIGGER', initiatedBy: `${currentUserRole} (Web Header)` }),
    });
    fetchState();
  };

  const handleResetEStop = async () => {
    await fetch('/api/safety/emergency-stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESET', initiatedBy: `${currentUserRole} (Web Header)` }),
    });
    fetchState();
  };

  // Handler: Safety settings update
  const handleUpdateSafety = async (settings: {
    lowThreshold?: number;
    fullThreshold?: number;
    minSafeLevel?: number;
    maxRuntime?: number;
    overheadCapacity?: number;
    sourceCapacity?: number;
  }) => {
    await fetch('/api/safety/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, initiatedBy: currentUserRole }),
    });
    fetchState();
  };

  // Handler: Schedules
  const handleToggleSchedule = async (id: string) => {
    await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TOGGLE', id }),
    });
    fetchState();
  };

  const handleDeleteSchedule = async (id: string) => {
    await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE', id }),
    });
    fetchState();
  };

  const handleAddSchedule = async (schedule: { name: string; startTime: string; durationMinutes: number; daysOfWeek: string[]; enabled: boolean }) => {
    await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule),
    });
    fetchState();
  };

  // Handler: Alerts
  const handleResolveAlert = async (id: string) => {
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESOLVE', id }),
    });
    fetchState();
  };

  const handleMarkAlertRead = async (id: string) => {
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'MARK_READ', id }),
    });
    fetchState();
  };

  // Handler: Simulation Control Action
  const handleSimulationAction = async (action: string, payload?: Record<string, unknown>) => {
    await fetch('/api/simulation/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });
    fetchState();
  };

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-space)', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid var(--border-accent)', borderTopColor: 'var(--cyan-400)', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: '1rem', color: 'var(--cyan-400)', fontWeight: 600 }}>
          Connecting to AquaGuard AI Controller...
        </div>
      </div>
    );
  }

  const primaryOverhead = data.tanks[0];
  const primarySource = data.tanks[1];
  const primaryPump = data.pumps[0];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Either Public Website or Authenticated App View */}
      {viewMode === 'public' ? (
        <PublicWebsite
          overheadTank={primaryOverhead}
          sourceTank={primarySource}
          pump={primaryPump}
          aiInsights={data.aiInsights}
          onEnterApp={(role) => {
            if (role) setCurrentUserRole(role);
            setViewMode('app');
          }}
        />
      ) : (
        <AuthenticatedApp
          data={data}
          currentUserRole={currentUserRole}
          onSwitchRole={setCurrentUserRole}
          onExitApp={() => setViewMode('public')}
          onPumpCommand={handlePumpCommand}
          onToggleMode={handleToggleMode}
          onTriggerEStop={handleTriggerEStop}
          onResetEStop={handleResetEStop}
          onUpdateSafety={handleUpdateSafety}
          onToggleSchedule={handleToggleSchedule}
          onDeleteSchedule={handleDeleteSchedule}
          onAddSchedule={handleAddSchedule}
          onResolveAlert={handleResolveAlert}
          onMarkAlertRead={handleMarkAlertRead}
        />
      )}

      {/* Floating Demo Simulation Dock */}
      <SimulationDock
        simControls={data.simControls}
        onAction={handleSimulationAction}
      />
    </div>
  );
}
