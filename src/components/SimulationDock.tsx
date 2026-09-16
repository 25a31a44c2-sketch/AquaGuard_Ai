'use client';

import React, { useState } from 'react';
import { Play, Pause, FastForward, RotateCcw, Droplet, CloudRain, Zap, WifiOff, AlertTriangle, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { SimulationControlState } from '@/lib/waterEngine';

interface Props {
  simControls: SimulationControlState;
  onAction: (action: string, payload?: Record<string, unknown>) => Promise<void>;
}

export const SimulationDock: React.FC<Props> = ({ simControls, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  const handleRunAction = async (action: string, payload?: Record<string, unknown>) => {
    setIsBusy(true);
    try {
      await onAction(action, payload);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        maxWidth: '960px',
        width: 'calc(100% - 2rem)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: isExpanded ? '0.85rem 1.25rem' : '0.4rem 0.85rem',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 15px rgba(245, 158, 11, 0.2)',
          background: 'rgba(10, 17, 40, 0.92)',
        }}
      >
        {/* Top bar of dock */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="demo-banner">
              <Sparkles size={13} />
              DEMO SIMULATION ACTIVE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Hardware-in-the-loop emulation engine
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => handleRunAction('TOGGLE_RUN')}
              disabled={isBusy}
              style={{
                background: simControls.isRunning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: simControls.isRunning ? 'var(--rose-400)' : 'var(--emerald-400)',
                border: `1px solid ${simControls.isRunning ? 'var(--rose-500)' : 'var(--emerald-500)'}`,
                padding: '0.35rem 0.75rem',
                borderRadius: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {simControls.isRunning ? <Pause size={13} /> : <Play size={13} />}
              {simControls.isRunning ? 'PAUSE SIM' : 'START SIM'}
            </button>

            {/* Speed Buttons */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '0.15rem', borderRadius: '0.35rem', border: '1px solid var(--border-subtle)' }}>
              {[1, 5, 10, 30].map((s) => (
                <button
                  key={s}
                  onClick={() => handleRunAction('SET_SPEED', { speed: s })}
                  style={{
                    border: 'none',
                    background: simControls.speed === s ? 'var(--amber-500)' : 'transparent',
                    color: simControls.speed === s ? '#ffffff' : 'var(--text-dim)',
                    padding: '0.2rem 0.45rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem',
              }}
              title={isExpanded ? 'Collapse Dock' : 'Expand Dock'}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>

        {/* Action Triggers Row (when expanded) */}
        {isExpanded && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              overflowX: 'auto',
              paddingBottom: '0.25rem',
            }}
          >
            <button
              onClick={() => handleRunAction('DRAIN_WATER', { liters: 400 })}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              title="Simulate household tap water consumption (-400 L)"
            >
              <Droplet size={13} color="var(--cyan-400)" />
              Use Water (-400L)
            </button>

            <button
              onClick={() => handleRunAction('REFILL_SOURCE', { liters: 1500 })}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              title="Simulate municipal inlet or rainwater replenish (+1,500 L to source)"
            >
              <CloudRain size={13} color="var(--emerald-400)" />
              Refill Sump (+1500L)
            </button>

            <button
              onClick={() => handleRunAction('TOGGLE_POWER')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                background: simControls.isPowerOutage ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.06)',
                color: simControls.isPowerOutage ? 'var(--rose-400)' : 'var(--text-main)',
                border: `1px solid ${simControls.isPowerOutage ? 'var(--rose-500)' : 'var(--border-subtle)'}`,
                borderRadius: '0.4rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Simulate grid blackout or electricity restoration"
            >
              <Zap size={13} color={simControls.isPowerOutage ? 'var(--rose-400)' : 'var(--amber-400)'} />
              {simControls.isPowerOutage ? 'Restore Power' : 'Simulate Blackout'}
            </button>

            <button
              onClick={() => handleRunAction('TOGGLE_INTERNET')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                background: simControls.isInternetOffline ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.06)',
                color: simControls.isInternetOffline ? 'var(--amber-400)' : 'var(--text-main)',
                border: `1px solid ${simControls.isInternetOffline ? 'var(--amber-500)' : 'var(--border-subtle)'}`,
                borderRadius: '0.4rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Test offline local safety logic when internet cuts out"
            >
              <WifiOff size={13} />
              {simControls.isInternetOffline ? 'Reconnect IoT' : 'Cut Internet'}
            </button>

            <button
              onClick={() => handleRunAction('TOGGLE_FAULT')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                background: simControls.faultInjected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.06)',
                color: simControls.faultInjected ? 'var(--rose-400)' : 'var(--text-main)',
                border: `1px solid ${simControls.faultInjected ? 'var(--rose-500)' : 'var(--border-subtle)'}`,
                borderRadius: '0.4rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Inject erratic impossible reading (145%) to test Data Quality rejection"
            >
              <AlertTriangle size={13} />
              {simControls.faultInjected ? 'Clear Sensor Glitch' : 'Inject Sensor Glitch'}
            </button>

            <button
              onClick={() => handleRunAction('RESET')}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap', marginLeft: 'auto' }}
              title="Reset simulation to default baseline state"
            >
              <RotateCcw size={13} />
              Reset State
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
