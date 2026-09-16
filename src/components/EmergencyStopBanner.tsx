'use client';

import React, { useState } from 'react';
import { AlertOctagon, RotateCcw, ShieldAlert } from 'lucide-react';

interface Props {
  isActive: boolean;
  onTrigger: () => Promise<void>;
  onReset: () => Promise<void>;
  userRole: string; // 'ADMIN' | 'MANAGER' | 'USER'
}

export const EmergencyStopBanner: React.FC<Props> = ({ isActive, onTrigger, onReset, userRole }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleTrigger = async () => {
    setIsProcessing(true);
    try {
      await onTrigger();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setIsProcessing(true);
    try {
      await onReset();
      setShowConfirmReset(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isActive) {
    return (
      <button
        onClick={handleTrigger}
        disabled={isProcessing}
        className="btn-danger"
        style={{
          padding: '0.45rem 0.9rem',
          fontSize: '0.8rem',
          background: 'linear-gradient(135deg, #b91c1c, #991b1b)',
          border: '1px solid #ef4444',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
        title="Trigger Emergency Stop: Immediately halts all water pumps"
      >
        <AlertOctagon size={16} />
        <span>🚨 E-STOP</span>
      </button>
    );
  }

  return (
    <>
      <div
        className="glass-emergency"
        style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
          position: 'sticky',
          top: '1rem',
          zIndex: 90,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--rose-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 20px var(--rose-500)',
            }}
          >
            <AlertOctagon size={24} />
          </div>

          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff', letterSpacing: '0.02em' }}>
              🚨 EMERGENCY STOP ACTIVE
            </div>
            <div style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.85)', marginTop: '0.1rem' }}>
              All pump operation has been disabled. Automatic and scheduled routines are locked.
            </div>
          </div>
        </div>

        <div>
          {userRole === 'ADMIN' || userRole === 'MANAGER' ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              disabled={isProcessing}
              style={{
                background: '#ffffff',
                color: '#991b1b',
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              }}
            >
              <RotateCcw size={16} />
              RESET EMERGENCY STOP
            </button>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
              Admin/Manager clearance required to reset E-Stop.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showConfirmReset && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '1.75rem', border: '1px solid var(--amber-400)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--amber-400)', marginBottom: '0.75rem' }}>
              <ShieldAlert size={24} />
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Confirm Emergency Stop Reset</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Have you physically inspected the tanks, valves, and motor electrical panels to confirm the hazard has been cleared?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowConfirmReset(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleReset} disabled={isProcessing} className="btn-success">
                Verify & Reset Standby
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
