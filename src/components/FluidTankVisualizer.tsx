'use client';

import React from 'react';
import { Droplets, Thermometer, Activity, Gauge, ArrowUpCircle } from 'lucide-react';
import { TankState } from '@/lib/waterEngine';

interface Props {
  tank: TankState;
  showDetails?: boolean;
  isFilling?: boolean;
}

export const FluidTankVisualizer: React.FC<Props> = ({ tank, showDetails = true, isFilling = false }) => {
  const pct = Math.min(100, Math.max(0, tank.currentLevelPct));

  // Determine status color theme
  let gradientColor1 = '#0ea5e9'; // Cyan
  let gradientColor2 = '#0284c7';
  let badgeClass = 'badge-cyan';

  if (pct <= 20) {
    gradientColor1 = '#ef4444'; // Red
    gradientColor2 = '#b91c1c';
    badgeClass = 'badge-rose';
  } else if (pct <= 40) {
    gradientColor1 = '#f59e0b'; // Amber
    gradientColor2 = '#d97706';
    badgeClass = 'badge-amber';
  } else if (pct >= 95) {
    gradientColor1 = '#10b981'; // Emerald (Full)
    gradientColor2 = '#047857';
    badgeClass = 'badge-emerald';
  }

  // Cylindrical body height
  const tankHeightPx = 240;
  const liquidHeightPx = (pct / 100) * tankHeightPx;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
      {/* Tank Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {tank.building}
          </span>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginTop: '0.15rem' }}>{tank.name}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isFilling && (
            <span className="badge badge-emerald" style={{ animation: 'pulseGlow 1s infinite' }}>
              <ArrowUpCircle size={12} /> FILLING
            </span>
          )}
          <span className={`badge ${badgeClass}`}>{tank.status}</span>
        </div>
      </div>

      {/* Visual Tank Body */}
      <div
        style={{
          position: 'relative',
          height: `${tankHeightPx}px`,
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto 1.25rem',
          borderRadius: '1.25rem',
          border: isFilling ? '3px solid var(--cyan-400)' : '3px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(6, 11, 24, 0.75)',
          overflow: 'hidden',
          boxShadow: isFilling
            ? 'inset 0 0 25px rgba(14, 165, 233, 0.3), 0 0 15px rgba(14, 165, 233, 0.2)'
            : 'inset 0 0 25px rgba(0, 0, 0, 0.7)',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Scale Tick Marks */}
        <div style={{ position: 'absolute', right: '10px', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 0', zIndex: 10, pointerEvents: 'none' }}>
          {[100, 75, 50, 25, 0].map((tick) => (
            <div key={tick} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>{tick}%</span>
              <div style={{ width: '6px', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
            </div>
          ))}
        </div>

        {/* Low Threshold Line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `${(tank.lowThreshold / 100) * tankHeightPx}px`,
            borderBottom: '1px dashed rgba(245, 158, 11, 0.7)',
            zIndex: 9,
            pointerEvents: 'none',
          }}
        >
          <span style={{ position: 'absolute', left: '8px', bottom: '2px', fontSize: '0.6rem', color: 'var(--amber-400)', fontWeight: 600 }}>
            LOW ({tank.lowThreshold}%) — {Math.round(tank.capacityLiters * (tank.lowThreshold / 100))}L
          </span>
        </div>

        {/* Full Threshold Line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `${(tank.fullThreshold / 100) * tankHeightPx}px`,
            borderBottom: '1px dashed rgba(16, 185, 129, 0.7)',
            zIndex: 9,
            pointerEvents: 'none',
          }}
        >
          <span style={{ position: 'absolute', left: '8px', bottom: '2px', fontSize: '0.6rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
            FULL ({tank.fullThreshold}%) — {Math.round(tank.capacityLiters * (tank.fullThreshold / 100))}L
          </span>
        </div>

        {/* Rising Liquid Body */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: `${liquidHeightPx}px`,
            transition: 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
          }}
        >
          {/* Animated SVG Wave Front */}
          <div
            style={{
              position: 'absolute',
              top: '-16px',
              left: 0,
              width: '200%',
              height: '24px',
              opacity: 0.85,
              animation: isFilling ? 'waveMove 2s linear infinite' : 'waveMove 5s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite',
            }}
          >
            <svg viewBox="0 0 500 24" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path d="M0,0 C150,20 350,-10 500,0 L500,24 L0,24 Z" fill={gradientColor1} />
            </svg>
          </div>

          {/* Animated SVG Wave Back */}
          <div
            style={{
              position: 'absolute',
              top: '-14px',
              left: 0,
              width: '200%',
              height: '24px',
              opacity: 0.55,
              animation: isFilling ? 'waveBackMove 1.8s linear infinite' : 'waveBackMove 4.5s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite',
            }}
          >
            <svg viewBox="0 0 500 24" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path d="M0,5 C120,-8 320,18 500,5 L500,24 L0,24 Z" fill={gradientColor2} />
            </svg>
          </div>

          {/* Gradient Liquid Fill */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(180deg, ${gradientColor1} 0%, ${gradientColor2} 100%)`,
              opacity: 0.88,
            }}
          />
        </div>

        {/* Real-time Central Text Display (Mandated: e.g. 1450 L / 2000 L, 72.5%) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 15,
            pointerEvents: 'none',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.85)',
          }}
        >
          <span style={{ fontSize: '2.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff', lineHeight: '1.1' }}>
            {pct.toFixed(1)}%
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', marginTop: '0.2rem' }}>
            {Math.round(tank.currentLiters).toLocaleString()} L / {tank.capacityLiters.toLocaleString()} L
          </span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.15rem' }}>
            {tank.status}
          </span>
        </div>
      </div>

      {/* Sensor Metrics Readout */}
      {showDetails && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
              <Gauge size={12} color="var(--cyan-400)" />
              <span>Flow</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: tank.flowRateLpm > 0 ? 'var(--emerald-400)' : 'var(--text-main)', marginTop: '0.15rem' }}>
              {tank.flowRateLpm.toFixed(1)} <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>L/min</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
              <Thermometer size={12} color="var(--amber-400)" />
              <span>Temp</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.15rem' }}>
              {tank.temperatureCelsius !== null ? (
                `${tank.temperatureCelsius.toFixed(1)}°C`
              ) : (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Not Conn</span>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
              <Activity size={12} color="var(--emerald-400)" />
              <span>Sensor</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: tank.sensorHealth === 'HEALTHY' ? 'var(--emerald-400)' : 'var(--rose-400)', marginTop: '0.15rem' }}>
              {tank.sensorHealth}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
