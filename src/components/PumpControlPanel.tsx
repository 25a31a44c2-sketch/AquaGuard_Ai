'use client';

import React, { useState } from 'react';
import { Power, ShieldAlert, Clock, RefreshCw, AlertTriangle, CheckCircle2, Gauge, ArrowUpRight } from 'lucide-react';
import { PumpState, TankState } from '@/lib/waterEngine';

interface Props {
  pump: PumpState;
  sourceTank: TankState;
  destTank: TankState;
  activePriorityLevel: number;
  activePriorityReason: string;
  onCommand: (action: 'ON' | 'OFF') => Promise<void>;
  onToggleMode: (mode: 'AUTO' | 'MANUAL') => Promise<void>;
}

export const PumpControlPanel: React.FC<Props> = ({
  pump,
  sourceTank,
  destTank,
  activePriorityLevel,
  activePriorityReason,
  onCommand,
  onToggleMode,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState<null | 'ON' | 'OFF'>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleConfirmAction = async () => {
    if (!showConfirmModal) return;
    const action = showConfirmModal;
    setShowConfirmModal(null);
    setIsProcessing(true);

    try {
      await onCommand(action);
      setFeedbackMessage(`Pump ${action} command confirmed. Tank ${action === 'ON' ? 'filling started' : 'filling stopped'}.`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      setFeedbackMessage(err.message || `Command rejected by safety policies.`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format runtime
  const mins = Math.floor(pump.currentRuntimeSeconds / 60);
  const secs = pump.currentRuntimeSeconds % 60;
  const runtimeFormatted = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {pump.building}
          </span>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)', marginTop: '0.15rem' }}>{pump.name}</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => onToggleMode('AUTO')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: pump.mode === 'AUTO' ? 'var(--cyan-500)' : 'transparent',
                color: pump.mode === 'AUTO' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              AUTO
            </button>
            <button
              onClick={() => onToggleMode('MANUAL')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: pump.mode === 'MANUAL' ? 'var(--cyan-500)' : 'transparent',
                color: pump.mode === 'MANUAL' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              MANUAL
            </button>
          </div>

          {/* Status Badge */}
          <div
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background:
                pump.status === 'ON'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : pump.status === 'LOCKED'
                  ? 'rgba(239, 68, 68, 0.25)'
                  : 'rgba(255, 255, 255, 0.08)',
              color:
                pump.status === 'ON'
                  ? 'var(--emerald-400)'
                  : pump.status === 'LOCKED'
                  ? 'var(--rose-400)'
                  : 'var(--text-muted)',
              border: `1px solid ${
                pump.status === 'ON'
                  ? 'var(--emerald-500)'
                  : pump.status === 'LOCKED'
                  ? 'var(--rose-500)'
                  : 'var(--border-subtle)'
              }`,
            }}
          >
            <span
              className={`led-indicator ${
                pump.status === 'ON' ? 'led-green' : pump.status === 'LOCKED' ? 'led-red' : ''
              }`}
              style={{ background: pump.status === 'OFF' ? '#64748b' : undefined }}
            />
            {pump.status === 'ON' ? 'PUMP RUNNING' : pump.status === 'LOCKED' ? 'PUMP LOCKED' : 'PUMP OFF'}
          </div>
        </div>
      </div>

      {/* Safety Alert Banner if Dry Run or Emergency */}
      {pump.dryRunLocked && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--rose-500)',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--rose-400)',
          }}
        >
          <ShieldAlert size={20} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Dry-Run Protection: ACTIVE</div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-main)', opacity: 0.9 }}>
              Source Sump is at {sourceTank.currentLevelPct.toFixed(1)}% ({Math.round(sourceTank.currentLiters)} L). Pump locked to protect impellers.
            </div>
          </div>
        </div>
      )}

      {/* Primary Action Buttons: PUMP ON / PUMP OFF */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setShowConfirmModal('ON')}
          disabled={pump.status === 'ON' || pump.isEmergencyStop || pump.dryRunLocked || isProcessing}
          className="btn-success"
          style={{
            padding: '1rem',
            fontSize: '1.05rem',
            fontWeight: 700,
            opacity: pump.status === 'ON' || pump.isEmergencyStop || pump.dryRunLocked ? 0.4 : 1,
            cursor: pump.status === 'ON' || pump.isEmergencyStop || pump.dryRunLocked ? 'not-allowed' : 'pointer',
          }}
        >
          <Power size={20} />
          TURN PUMP ON
        </button>

        <button
          onClick={() => setShowConfirmModal('OFF')}
          disabled={pump.status === 'OFF' || isProcessing}
          className="btn-danger"
          style={{
            padding: '1rem',
            fontSize: '1.05rem',
            fontWeight: 700,
            opacity: pump.status === 'OFF' ? 0.4 : 1,
            cursor: pump.status === 'OFF' ? 'not-allowed' : 'pointer',
          }}
        >
          <Power size={20} />
          TURN PUMP OFF
        </button>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          style={{
            background: feedbackMessage.includes('rejected') || feedbackMessage.includes('cannot') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            border: `1px solid ${feedbackMessage.includes('rejected') || feedbackMessage.includes('cannot') ? 'var(--rose-500)' : 'var(--emerald-500)'}`,
            padding: '0.65rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: '#ffffff',
          }}
        >
          {feedbackMessage.includes('rejected') || feedbackMessage.includes('cannot') ? (
            <AlertTriangle size={16} color="var(--rose-400)" />
          ) : (
            <CheckCircle2 size={16} color="var(--emerald-400)" />
          )}
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Telemetry Grid (Flow Rate: 20 L/min when ON, 0 L/min when OFF) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Pump Flow</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: pump.status === 'ON' ? 'var(--emerald-400)' : 'var(--text-dim)', marginTop: '0.15rem' }}>
            {pump.status === 'ON' ? '20.0' : '0.0'} <span style={{ fontSize: '0.75rem' }}>L/min</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            {pump.status === 'ON' ? 'Active Transfer' : 'Standby'}
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Current Runtime</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: pump.status === 'ON' ? 'var(--emerald-400)' : 'var(--text-main)', marginTop: '0.15rem' }}>
            {runtimeFormatted}
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Max: {pump.maxRuntimeMinutes}m</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Water Transferred</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--cyan-400)', marginTop: '0.15rem' }}>
            {Math.round(pump.totalWaterTransferredLiters).toLocaleString()} <span style={{ fontSize: '0.75rem' }}>L</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>This session</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Power Draw</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: pump.status === 'ON' ? 'var(--amber-400)' : 'var(--text-dim)', marginTop: '0.15rem' }}>
            {pump.status === 'ON' ? `${pump.powerKw.toFixed(1)} kW` : '0.0 kW'}
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Total: {pump.totalHoursRun.toFixed(1)} hrs</span>
        </div>
      </div>

      {/* 5-Tier Priority Controller Chain Visualizer */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            5-Tier Safety Priority Controller Chain
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--cyan-400)', fontWeight: 600 }}>Active: Tier {activePriorityLevel}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem', marginBottom: '0.5rem' }}>
          {[
            { level: 1, name: '1. E-Stop', active: activePriorityLevel === 1, color: 'var(--rose-500)' },
            { level: 2, name: '2. Crit Safety', active: activePriorityLevel === 2, color: 'var(--rose-400)' },
            { level: 3, name: '3. Auto Rules', active: activePriorityLevel === 3, color: 'var(--emerald-500)' },
            { level: 4, name: '4. Schedules', active: activePriorityLevel === 4, color: 'var(--amber-400)' },
            { level: 5, name: '5. Manual', active: activePriorityLevel === 5, color: 'var(--cyan-400)' },
          ].map((tier) => (
            <div
              key={tier.level}
              style={{
                background: tier.active ? tier.color : 'rgba(255,255,255,0.04)',
                color: tier.active ? '#ffffff' : 'var(--text-dim)',
                padding: '0.35rem 0.25rem',
                borderRadius: '0.25rem',
                textAlign: 'center',
                fontSize: '0.65rem',
                fontWeight: 700,
                border: tier.active ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              {tier.name}
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {activePriorityReason}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '1.75rem', border: '1px solid var(--cyan-400)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#ffffff' }}>
              Confirm Remote Pump Operation
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Are you sure you want to turn <strong style={{ color: showConfirmModal === 'ON' ? 'var(--emerald-400)' : 'var(--rose-400)' }}>PUMP {showConfirmModal}</strong>?
              {showConfirmModal === 'ON' && (
                <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--emerald-400)', fontSize: '0.8rem' }}>
                  Safety Check: Source Sump has {Math.round(sourceTank.currentLiters)} L ({sourceTank.currentLevelPct.toFixed(0)}%) and destination tank has space.
                </span>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowConfirmModal(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={showConfirmModal === 'ON' ? 'btn-success' : 'btn-danger'}
              >
                Confirm Turn {showConfirmModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
