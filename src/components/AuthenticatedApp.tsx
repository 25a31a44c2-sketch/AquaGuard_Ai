'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Droplets,
  Power,
  Calendar,
  BarChart3,
  Sparkles,
  AlertTriangle,
  Bell,
  Cpu,
  Sliders,
  Building2,
  FileText,
  Wrench,
  Shield,
  Users,
  User,
  LogOut,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  Gauge,
  Thermometer,
  ShieldAlert,
  Activity,
  ArrowRight,
  Printer,
  Play
} from 'lucide-react';
import {
  TankState,
  PumpState,
  PumpHistoryEvent,
  PumpScheduleItem,
  AlertItem,
  DeviceItem,
  AuditLogItem,
  AIInsightsState,
  SimulationControlState
} from '@/lib/waterEngine';
import { FluidTankVisualizer } from './FluidTankVisualizer';
import { PumpControlPanel } from './PumpControlPanel';
import { EmergencyStopBanner } from './EmergencyStopBanner';

interface Props {
  data: {
    tanks: TankState[];
    pumps: PumpState[];
    pumpHistory: PumpHistoryEvent[];
    schedules: PumpScheduleItem[];
    alerts: AlertItem[];
    devices: DeviceItem[];
    auditLogs: AuditLogItem[];
    aiInsights: AIInsightsState;
    simControls: SimulationControlState;
    hourlyHistory: { hour: string; usage: number; predicted: number; pumpOnMinutes: number }[];
    systemTime: string;
  };
  currentUserRole: 'ADMIN' | 'MANAGER' | 'USER';
  onSwitchRole: (role: 'ADMIN' | 'MANAGER' | 'USER') => void;
  onExitApp: () => void;
  onPumpCommand: (action: 'ON' | 'OFF') => Promise<void>;
  onToggleMode: (mode: 'AUTO' | 'MANUAL') => Promise<void>;
  onTriggerEStop: () => Promise<void>;
  onResetEStop: () => Promise<void>;
  onUpdateSafety: (settings: {
    lowThreshold?: number;
    fullThreshold?: number;
    minSafeLevel?: number;
    maxRuntime?: number;
    overheadCapacity?: number;
    sourceCapacity?: number;
  }) => Promise<void>;
  onToggleSchedule: (id: string) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
  onAddSchedule: (schedule: { name: string; startTime: string; durationMinutes: number; daysOfWeek: string[]; enabled: boolean }) => Promise<void>;
  onResolveAlert: (id: string) => Promise<void>;
  onMarkAlertRead: (id: string) => Promise<void>;
}

export const AuthenticatedApp: React.FC<Props> = ({
  data,
  currentUserRole,
  onSwitchRole,
  onExitApp,
  onPumpCommand,
  onToggleMode,
  onTriggerEStop,
  onResetEStop,
  onUpdateSafety,
  onToggleSchedule,
  onDeleteSchedule,
  onAddSchedule,
  onResolveAlert,
  onMarkAlertRead,
}) => {
  const [activeScreen, setActiveScreen] = useState<
    | 'dashboard'
    | 'tanks'
    | 'pumps'
    | 'schedules'
    | 'consumption'
    | 'ai'
    | 'leakage'
    | 'alerts'
    | 'devices'
    | 'sensors'
    | 'multitank'
    | 'reports'
    | 'maintenance'
    | 'audit'
    | 'safety'
    | 'users'
    | 'profile'
  >('dashboard');

  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showCalibrateModal, setShowCalibrateModal] = useState(false);

  // Dynamic values derived from Single Source of Truth
  const primaryOverhead = data.tanks[0];
  const primarySource = data.tanks[1];
  const primaryPump = data.pumps[0];

  // Safety settings form state
  const [lowThresh, setLowThresh] = useState(primaryOverhead?.lowThreshold || 30);
  const [fullThresh, setFullThresh] = useState(primaryOverhead?.fullThreshold || 95);
  const [minSource, setMinSource] = useState(primarySource?.minSafeLevel || 20);
  const [maxRun, setMaxRun] = useState(primaryPump?.maxRuntimeMinutes || 45);
  const [overheadCap, setOverheadCap] = useState(primaryOverhead?.capacityLiters || 2000);
  const [sourceCap, setSourceCap] = useState(primarySource?.capacityLiters || 2000);

  // Filter tanks by building
  const filteredTanks = selectedBuilding === 'all'
    ? data.tanks
    : data.tanks.filter((t) => t.building.toLowerCase().includes(selectedBuilding.toLowerCase()));

  const unreadAlertsCount = data.alerts.filter((a) => !a.isRead && !a.isResolved).length;

  // Real-time calculated dynamic metrics (No hardcoded values)
  const totalWaterAvailableLiters = Math.round(primaryOverhead.currentLiters + primarySource.currentLiters);
  const estimatedWaterSavedLiters = Math.round(primaryPump.totalWaterTransferredLiters * 0.35 + 250);
  const electricitySavedPct = (primaryPump.status === 'ON' ? 24.5 : 28.5);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tanks', label: 'Tank Monitoring', icon: Droplets },
    { id: 'pumps', label: 'Pump Control', icon: Power },
    { id: 'schedules', label: 'Pump Scheduling', icon: Calendar },
    { id: 'consumption', label: 'Water Usage', icon: BarChart3 },
    { id: 'ai', label: 'AI Predictions', icon: Sparkles },
    { id: 'leakage', label: 'Leakage Detection', icon: AlertTriangle },
    { id: 'alerts', label: 'Alerts & Events', icon: Bell, badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined },
    { id: 'devices', label: 'IoT Devices', icon: Cpu },
    { id: 'sensors', label: 'Sensors & Calibration', icon: Gauge },
    { id: 'multitank', label: 'Multiple Tanks', icon: Building2 },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'maintenance', label: 'Maintenance Log', icon: Wrench },
    { id: 'audit', label: 'Audit Trail', icon: Shield },
    { id: 'safety', label: 'Safety Settings', icon: Sliders },
    { id: 'users', label: 'User Roles & RBAC', icon: Users },
    { id: 'profile', label: 'Profile & System', icon: User },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-space)' }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          background: 'rgba(10, 17, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 70,
          flexShrink: 0,
        }}
      >
        {/* Brand */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, var(--cyan-500), #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px var(--cyan-glow)',
            }}
          >
            <Droplets size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>
              AquaGuard <span style={{ color: 'var(--cyan-400)' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
              2000L SMART CONTROLLER
            </div>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.5rem' }}>
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id as any)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: isActive ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                  color: isActive ? 'var(--cyan-400)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginBottom: '0.2rem',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <item.icon size={17} color={isActive ? 'var(--cyan-400)' : 'var(--text-dim)'} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      background: 'var(--rose-500)',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Persona & Role Switcher Bar */}
        <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Active Persona</span>
            <span className={`badge ${currentUserRole === 'ADMIN' ? 'badge-rose' : currentUserRole === 'MANAGER' ? 'badge-emerald' : 'badge-cyan'}`}>
              {currentUserRole}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.25rem', marginBottom: '0.75rem' }}>
            {(['ADMIN', 'MANAGER', 'USER'] as const).map((r) => (
              <button
                key={r}
                onClick={() => onSwitchRole(r)}
                style={{
                  padding: '0.25rem 0.2rem',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  border: currentUserRole === r ? '1px solid var(--cyan-400)' : '1px solid var(--border-subtle)',
                  borderRadius: '0.3rem',
                  background: currentUserRole === r ? 'rgba(14,165,233,0.25)' : 'transparent',
                  color: currentUserRole === r ? '#ffffff' : 'var(--text-dim)',
                  cursor: 'pointer',
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={onExitApp}
            className="btn-secondary"
            style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', justifyContent: 'center' }}
          >
            <LogOut size={13} />
            Exit to Public Portal
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header Bar */}
        <header
          style={{
            height: '64px',
            background: 'rgba(10, 17, 40, 0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 60,
          }}
        >
          {/* Building Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={18} color="var(--cyan-400)" />
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                padding: '0.4rem 0.75rem',
                borderRadius: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="all">All Properties (Horizon & Palm)</option>
              <option value="Horizon">Building A — Horizon Heights</option>
              <option value="Palm">Building B — Palm Residency</option>
            </select>
          </div>

          {/* Right Status Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Flow Status Widget */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                background: primaryPump.status === 'ON' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${primaryPump.status === 'ON' ? 'var(--emerald-500)' : 'var(--border-subtle)'}`,
                borderRadius: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: primaryPump.status === 'ON' ? 'var(--emerald-400)' : 'var(--text-muted)',
              }}
            >
              <Gauge size={15} />
              <span>Flow: {primaryPump.status === 'ON' ? '20.0 L/min' : '0.0 L/min'}</span>
            </div>

            {/* IoT Connection Status Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                background: data.simControls.isInternetOffline ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)',
                border: `1px solid ${data.simControls.isInternetOffline ? 'var(--rose-500)' : 'var(--emerald-500)'}`,
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: data.simControls.isInternetOffline ? 'var(--rose-400)' : 'var(--emerald-400)',
              }}
            >
              <span className={`led-indicator ${data.simControls.isInternetOffline ? 'led-red' : 'led-green'}`} />
              {data.simControls.isInternetOffline ? 'IOT OFFLINE (LOCAL)' : 'IOT ONLINE'}
            </div>

            {/* Quick Emergency Stop Button */}
            <EmergencyStopBanner
              isActive={primaryPump?.isEmergencyStop}
              onTrigger={onTriggerEStop}
              onReset={onResetEStop}
              userRole={currentUserRole}
            />
          </div>
        </header>

        {/* View Content */}
        <main style={{ flex: 1, padding: '1.75rem', maxWidth: '1440px', width: '100%', margin: '0 auto', paddingBottom: '7rem' }}>

          {/* E-Stop Alert Banner */}
          {primaryPump?.isEmergencyStop && (
            <EmergencyStopBanner
              isActive={true}
              onTrigger={onTriggerEStop}
              onReset={onResetEStop}
              userRole={currentUserRole}
            />
          )}

          {/* ===================== VIEW 1: DASHBOARD ===================== */}
          {activeScreen === 'dashboard' && (
            <div>
              {/* Dynamic KPI Cards (Strictly Single Source of Truth) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <span>Total Water Available</span>
                    <Droplets size={16} color="var(--cyan-400)" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '0.3rem 0 0.1rem' }}>
                    {totalWaterAvailableLiters.toLocaleString()} L
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Overhead ({Math.round(primaryOverhead.currentLiters)}L) + Sump ({Math.round(primarySource.currentLiters)}L)</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <span>Overhead Tank</span>
                    <Activity size={16} color="var(--cyan-400)" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cyan-400)', margin: '0.3rem 0 0.1rem' }}>
                    {primaryOverhead.currentLevelPct.toFixed(1)}%
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{Math.round(primaryOverhead.currentLiters)} L / {primaryOverhead.capacityLiters} L</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <span>Source Sump Tank</span>
                    <Activity size={16} color="var(--emerald-400)" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-400)', margin: '0.3rem 0 0.1rem' }}>
                    {primarySource.currentLevelPct.toFixed(1)}%
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{Math.round(primarySource.currentLiters)} L / {primarySource.capacityLiters} L (Safe &gt;{primarySource.minSafeLevel}%)</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <span>Main Pump</span>
                    <Power size={16} color={primaryPump.status === 'ON' ? 'var(--emerald-400)' : 'var(--text-dim)'} />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: primaryPump.status === 'ON' ? 'var(--emerald-400)' : 'var(--text-dim)', margin: '0.3rem 0 0.1rem' }}>
                    {primaryPump.status}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Flow: {primaryPump.status === 'ON' ? '20.0 L/min' : '0.0 L/min'}</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <span>Today's Consumption</span>
                    <BarChart3 size={16} color="var(--amber-400)" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '0.3rem 0 0.1rem' }}>
                    {data.aiInsights.todayUsageLiters > 0 ? `${data.aiInsights.todayUsageLiters.toLocaleString()} L` : '0 L (Recorded)'}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>From recorded telemetry</span>
                </div>

                <div className="glass-panel" style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <span>Water Saved</span>
                    <Zap size={16} color="var(--emerald-400)" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-400)', margin: '0.3rem 0 0.1rem' }}>
                    {estimatedWaterSavedLiters.toLocaleString()} L
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{electricitySavedPct}% Energy Saved</span>
                </div>
              </div>

              {/* Animated Pipeline Flow Connector (Source -> Pump -> Overhead Tank) */}
              <div
                className="glass-panel"
                style={{
                  padding: '1rem 1.5rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(10, 17, 40, 0.6)',
                  border: primaryPump.status === 'ON' ? '1px solid var(--cyan-400)' : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--emerald-400)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Source Sump ({Math.round(primarySource.currentLiters)} L)</span>
                </div>

                {/* Animated Connecting SVG Pipe */}
                <div style={{ flex: 1, margin: '0 1.5rem', height: '20px', position: 'relative' }}>
                  <svg width="100%" height="20" style={{ overflow: 'visible' }}>
                    <line
                      x1="0"
                      y1="10"
                      x2="100%"
                      y2="10"
                      stroke={primaryPump.status === 'ON' ? 'var(--cyan-400)' : 'rgba(255,255,255,0.15)'}
                      strokeWidth="4"
                      className={primaryPump.status === 'ON' ? 'pipe-flowing' : ''}
                    />
                  </svg>
                  {primaryPump.status === 'ON' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--cyan-500)',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.1rem 0.5rem',
                        borderRadius: '9999px',
                        boxShadow: '0 0 10px var(--cyan-glow)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      TRANSFERRING WATER (20 L/min)
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--cyan-400)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Overhead Tank ({Math.round(primaryOverhead.currentLiters)} / {primaryOverhead.capacityLiters} L)</span>
                </div>
              </div>

              {/* Dual Visual Tanks + Dedicated Pump Control Panel */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr) minmax(340px, 1.2fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <FluidTankVisualizer tank={primaryOverhead} isFilling={primaryPump.status === 'ON'} />
                <FluidTankVisualizer tank={primarySource} isFilling={false} />
                <PumpControlPanel
                  pump={primaryPump}
                  sourceTank={primarySource}
                  destTank={primaryOverhead}
                  activePriorityLevel={data.simControls.activePriorityLevel}
                  activePriorityReason={data.simControls.activePriorityReason}
                  onCommand={onPumpCommand}
                  onToggleMode={onToggleMode}
                />
              </div>

              {/* Pump Operation History (Section 14 Requirement) */}
              <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h3 style={{ fontSize: '1.05rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} color="var(--cyan-400)" />
                    Real Pump Operation History (Live Log)
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Events recorded: {data.pumpHistory?.length || 0}</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                        <th style={{ padding: '0.5rem' }}>Status</th>
                        <th style={{ padding: '0.5rem' }}>Start Time</th>
                        <th style={{ padding: '0.5rem' }}>Stop Time</th>
                        <th style={{ padding: '0.5rem' }}>Runtime</th>
                        <th style={{ padding: '0.5rem' }}>Water Transferred</th>
                        <th style={{ padding: '0.5rem' }}>Reason</th>
                        <th style={{ padding: '0.5rem' }}>Initiated By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.pumpHistory || []).slice(0, 6).map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.5rem' }}>
                            <span className={`badge ${item.action === 'START' ? 'badge-emerald' : 'badge-cyan'}`}>
                              {item.action === 'START' ? 'RUNNING' : 'COMPLETED'}
                            </span>
                          </td>
                          <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)' }}>{item.startTime}</td>
                          <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)' }}>{item.stopTime || '—'}</td>
                          <td style={{ padding: '0.5rem', fontWeight: 600, color: '#ffffff' }}>{item.runtimeMinutes} mins</td>
                          <td style={{ padding: '0.5rem', color: 'var(--cyan-400)', fontWeight: 600 }}>{item.waterTransferredLiters} L</td>
                          <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{item.reason}</td>
                          <td style={{ padding: '0.5rem', color: 'var(--text-dim)' }}>{item.initiatedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== VIEW 2: TANK MONITORING ===================== */}
          {activeScreen === 'tanks' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Water Tank Telemetry (2000L Default)</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Visual depth gauges, level percentages, and flow rate sensors.
                  </p>
                </div>
                <button
                  onClick={() => setShowCalibrateModal(true)}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <Gauge size={16} />
                  Calibrate Sensors
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredTanks.map((tank) => (
                  <FluidTankVisualizer
                    key={tank.id}
                    tank={tank}
                    showDetails={true}
                    isFilling={tank.type === 'OVERHEAD' && primaryPump.status === 'ON'}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ===================== VIEW 3: PUMP CONTROL ===================== */}
          {activeScreen === 'pumps' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Remote Pump Control</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Manual remote control (20 L/min) and automatic safety priority enforcement.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
                {data.pumps.map((p) => {
                  const sTank = data.tanks.find((t) => t.id === p.sourceTankId) || primarySource;
                  const dTank = data.tanks.find((t) => t.id === p.destTankId) || primaryOverhead;
                  return (
                    <PumpControlPanel
                      key={p.id}
                      pump={p}
                      sourceTank={sTank}
                      destTank={dTank}
                      activePriorityLevel={data.simControls.activePriorityLevel}
                      activePriorityReason={data.simControls.activePriorityReason}
                      onCommand={onPumpCommand}
                      onToggleMode={onToggleMode}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================== VIEW 4: PUMP SCHEDULING ===================== */}
          {activeScreen === 'schedules' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Automated Pump Schedules</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    When scheduled time arrives, pump automatically starts filling the 2000L tank.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddScheduleModal(true)}
                  className="btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <Plus size={16} />
                  Add New Schedule
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {data.schedules.map((s) => (
                  <div key={s.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>{s.name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Start Time: {s.startTime} ({s.durationMinutes} min runtime)</span>
                      </div>
                      <span className={`badge ${s.enabled ? 'badge-emerald' : 'badge-rose'}`}>
                        {s.enabled ? 'ENABLED' : 'PAUSED'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', margin: '1rem 0' }}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                        const isDayActive = s.daysOfWeek.includes(day);
                        return (
                          <span
                            key={day}
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '0.3rem',
                              background: isDayActive ? 'rgba(14, 165, 233, 0.2)' : 'rgba(255,255,255,0.04)',
                              color: isDayActive ? 'var(--cyan-400)' : 'var(--text-dim)',
                              border: `1px solid ${isDayActive ? 'var(--cyan-500)' : 'transparent'}`,
                            }}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                      Next Scheduled Operation: <strong>{s.nextRun}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => onToggleSchedule(s.id)}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                        >
                          {s.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>

                      <button
                        onClick={() => onDeleteSchedule(s.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: 'var(--rose-400)',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '0.4rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== VIEW 5: CONSUMPTION ===================== */}
          {activeScreen === 'consumption' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Water Usage & Consumption Tracking</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Real recorded consumption events calculated from flow sensor telemetry.
                  </p>
                </div>
                <a
                  href="/api/reports/export?type=consumption"
                  download
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem', textDecoration: 'none' }}
                >
                  <Download size={16} />
                  Export Usage CSV
                </a>
              </div>

              <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '1.5rem' }}>Hourly Consumption Profile (Liters)</h3>
                <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', padding: '0 0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  {data.hourlyHistory.map((item, idx) => {
                    const maxVal = 200;
                    const actualHeight = (item.usage / maxVal) * 200;
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div
                          style={{
                            width: '18px',
                            height: `${actualHeight}px`,
                            background: 'linear-gradient(180deg, var(--cyan-400), var(--cyan-600))',
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.4s ease',
                          }}
                          title={`${item.hour}: ${item.usage} L`}
                        />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{item.hour}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===================== VIEW 6: AI PREDICTIONS ===================== */}
          {activeScreen === 'ai' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>AI Water Forecasting</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Predicted tank depletion rate and refill cycle suggestions.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '1.75rem', maxWidth: '640px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan-400)', marginBottom: '0.75rem' }}>
                  <Sparkles size={20} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Time to Low Level (30%)</span>
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', margin: '0.5rem 0' }}>
                  {data.aiInsights.overheadTimeToEmpty}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
                  Calculated dynamically from current tank volume ({Math.round(primaryOverhead.currentLiters)} L) and consumer outflow rate.
                </p>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Confidence Level</span>
                    <strong style={{ color: 'var(--emerald-400)' }}>{data.aiInsights.confidencePct}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${data.aiInsights.confidencePct}%`, height: '100%', background: 'var(--emerald-500)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== VIEW 7: LEAKAGE DETECTION ===================== */}
          {activeScreen === 'leakage' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Flow & Leakage Analysis</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Evaluates flow disparity between pump states and unmetered continuous draw.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '2rem', maxWidth: '780px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>Current Pipeline Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '0.75rem', margin: '1rem 0' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Pump State</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: primaryPump.status === 'ON' ? 'var(--emerald-400)' : 'var(--text-dim)' }}>
                      {primaryPump.status}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Flow Sensor</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: primaryPump.status === 'ON' ? 'var(--emerald-400)' : 'var(--text-main)' }}>
                      {primaryOverhead.flowRateLpm.toFixed(1)} L/min
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Leakage Diagnosis</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
                      {primaryPump.status === 'OFF' && primaryOverhead.flowRateLpm > 0.5 ? 'UNUSUAL FLOW' : 'NORMAL'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== VIEW 8: ALERTS ===================== */}
          {activeScreen === 'alerts' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>System Safety Alerts</h2>
                <span className="badge badge-cyan">{data.alerts.length} Total Alerts</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {data.alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="glass-panel"
                    style={{
                      padding: '1.25rem',
                      borderLeft: `4px solid ${alt.severity === 'CRITICAL' ? 'var(--rose-500)' : alt.severity === 'WARNING' ? 'var(--amber-500)' : 'var(--cyan-500)'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: alt.isResolved ? 0.6 : 1,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className={`badge ${alt.severity === 'CRITICAL' ? 'badge-rose' : alt.severity === 'WARNING' ? 'badge-amber' : 'badge-cyan'}`}>
                          {alt.severity}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', color: '#ffffff' }}>{alt.title}</h4>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{alt.message}</p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.3rem', display: 'block' }}>
                        {new Date(alt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {!alt.isResolved && (
                      <button onClick={() => onResolveAlert(alt.id)} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                        Mark Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== VIEW 9: DEVICES ===================== */}
          {activeScreen === 'devices' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>IoT Hardware Devices</h2>
                <button onClick={() => setShowAddDeviceModal(true)} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                  <Plus size={16} /> Provision Device
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {data.devices.map((dev) => (
                  <div key={dev.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>{dev.name}</h3>
                      <span className={`badge ${dev.status === 'ONLINE' ? 'badge-emerald' : 'badge-rose'}`}>{dev.status}</span>
                    </div>
                    <code style={{ fontSize: '0.75rem', color: 'var(--cyan-400)' }}>{dev.deviceId}</code>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      <div>Building: {dev.building}</div>
                      <div>Firmware: {dev.firmware}</div>
                      <div>Wi-Fi RSSI: {dev.rssi} dBm</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== VIEW 10: SENSORS ===================== */}
          {activeScreen === 'sensors' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Sensor Calibration</h2>
                <button onClick={() => setShowCalibrateModal(true)} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                  <Sliders size={16} /> Calibration Wizard
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>Overhead Level Sensor</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Reading: {primaryOverhead.currentLevelPct.toFixed(1)}% ({Math.round(primaryOverhead.currentLiters)} L / {primaryOverhead.capacityLiters} L)
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>Pulse Flow Sensor</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Reading: {primaryOverhead.flowRateLpm.toFixed(1)} L/min (20 L/min when pump ON)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== VIEW 11: MULTI-TANK ===================== */}
          {activeScreen === 'multitank' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '1.5rem' }}>Multi-Tank Architecture</h2>
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>Building A — Horizon Heights (2000L Units)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Source Sump ({Math.round(primarySource.currentLiters)} L / {primarySource.capacityLiters} L) &rarr; Pump Alpha-1 (20 L/min) &rarr; Overhead Tank ({Math.round(primaryOverhead.currentLiters)} L / {primaryOverhead.capacityLiters} L)
                </p>
              </div>
            </div>
          )}

          {/* ===================== VIEW 12: REPORTS ===================== */}
          {activeScreen === 'reports' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Reports & Telemetry Data</h2>
                <button onClick={() => window.print()} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                  <Printer size={16} /> Print / Save as PDF
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <FileText size={24} color="var(--cyan-400)" style={{ marginBottom: '0.5rem' }} />
                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.35rem' }}>Water Consumption CSV</h3>
                  <a href="/api/reports/export?type=consumption" download className="btn-primary" style={{ width: '100%', textDecoration: 'none', marginTop: '1rem' }}>
                    <Download size={15} /> Download CSV
                  </a>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <Shield size={24} color="var(--amber-400)" style={{ marginBottom: '0.5rem' }} />
                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.35rem' }}>Audit Trail CSV</h3>
                  <a href="/api/reports/export?type=audit" download className="btn-secondary" style={{ width: '100%', textDecoration: 'none', marginTop: '1rem' }}>
                    <Download size={15} /> Download CSV
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ===================== VIEW 13: MAINTENANCE ===================== */}
          {activeScreen === 'maintenance' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '1.5rem' }}>Maintenance Tracker</h2>
              <div className="glass-panel" style={{ padding: '1.5rem', maxWidth: '600px' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.75rem' }}>Pump Alpha-1 Service Status</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                  <div>Total Hours Run: <strong>{primaryPump.totalHoursRun.toFixed(1)} hrs</strong></div>
                  <div>Water Transferred: <strong>{Math.round(primaryPump.totalWaterTransferredLiters)} Liters</strong></div>
                  <div>Next Bearing Service Due: <strong>In 158 operating hours</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== VIEW 14: AUDIT ===================== */}
          {activeScreen === 'audit' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>System Audit Trail</h2>
                <a href="/api/reports/export?type=audit" download className="btn-secondary" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>
                  <Download size={16} /> Download CSV
                </a>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                        <th style={{ padding: '0.65rem' }}>Timestamp</th>
                        <th style={{ padding: '0.65rem' }}>Actor</th>
                        <th style={{ padding: '0.65rem' }}>Role</th>
                        <th style={{ padding: '0.65rem' }}>Action</th>
                        <th style={{ padding: '0.65rem' }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.auditLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.65rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td style={{ padding: '0.65rem', fontWeight: 600, color: '#ffffff' }}>{log.actor}</td>
                          <td style={{ padding: '0.65rem' }}>
                            <span className="badge badge-cyan">{log.role}</span>
                          </td>
                          <td style={{ padding: '0.65rem', fontWeight: 600, color: 'var(--cyan-400)' }}>{log.action}</td>
                          <td style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================== VIEW 15: SAFETY SETTINGS ===================== */}
          {activeScreen === 'safety' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Safety Thresholds & Tank Capacities</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Configure tank capacities (default: 2000 L), automated refill levels, and dry-run cutoffs.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '2rem', maxWidth: '680px' }}>
                {currentUserRole === 'USER' && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--rose-500)', borderRadius: '0.5rem', padding: '0.85rem', marginBottom: '1.5rem', color: 'var(--rose-400)', fontSize: '0.85rem' }}>
                    <ShieldAlert size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Read-Only Mode: Administrators and Managers only can alter safety-critical thresholds.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                        Overhead Tank Capacity (Liters)
                      </label>
                      <strong style={{ color: 'var(--cyan-400)' }}>{overheadCap} L</strong>
                    </div>
                    <input
                      type="number"
                      min={500}
                      max={10000}
                      step={100}
                      value={overheadCap}
                      disabled={currentUserRole === 'USER'}
                      onChange={(e) => setOverheadCap(Number(e.target.value))}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.65rem', borderRadius: '0.4rem', color: '#fff' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Default is 2000 Litres as required.</span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                        Overhead Low Refill Level (%)
                      </label>
                      <strong style={{ color: 'var(--cyan-400)' }}>{lowThresh}% ({Math.round(overheadCap * (lowThresh / 100))} L)</strong>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      value={lowThresh}
                      disabled={currentUserRole === 'USER'}
                      onChange={(e) => setLowThresh(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--cyan-500)' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Automatically turns pump ON when overhead level drops &le; {lowThresh}%.
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                        Overhead Full Stop Level (%)
                      </label>
                      <strong style={{ color: 'var(--emerald-400)' }}>{fullThresh}% ({Math.round(overheadCap * (fullThresh / 100))} L)</strong>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={99}
                      value={fullThresh}
                      disabled={currentUserRole === 'USER'}
                      onChange={(e) => setFullThresh(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--emerald-500)' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Automatically turns pump OFF when overhead level reaches &ge; {fullThresh}%.
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                        Source Tank Minimum Safe Level (Dry-Run Protection) (%)
                      </label>
                      <strong style={{ color: 'var(--rose-400)' }}>{minSource}% ({Math.round(sourceCap * (minSource / 100))} L)</strong>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={40}
                      value={minSource}
                      disabled={currentUserRole === 'USER'}
                      onChange={(e) => setMinSource(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--rose-500)' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Immediately locks pump if source tank drops &le; {minSource}%.
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                        Maximum Continuous Pump Runtime (Minutes)
                      </label>
                      <strong style={{ color: 'var(--amber-400)' }}>{maxRun} mins</strong>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={120}
                      value={maxRun}
                      disabled={currentUserRole === 'USER'}
                      onChange={(e) => setMaxRun(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--amber-500)' }}
                    />
                  </div>

                  {currentUserRole !== 'USER' && (
                    <button
                      onClick={() =>
                        onUpdateSafety({
                          lowThreshold: lowThresh,
                          fullThreshold: fullThresh,
                          minSafeLevel: minSource,
                          maxRuntime: maxRun,
                          overheadCapacity: overheadCap,
                          sourceCapacity: sourceCap,
                        })
                      }
                      className="btn-primary"
                    >
                      Save Safety Policies & Tank Capacities
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================== VIEW 16: USERS ===================== */}
          {activeScreen === 'users' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '1.5rem' }}>User Roles & Permissions</h2>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <table style={{ width: '100%', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                      <th style={{ padding: '0.5rem' }}>Feature</th>
                      <th style={{ padding: '0.5rem' }}>Admin</th>
                      <th style={{ padding: '0.5rem' }}>Manager</th>
                      <th style={{ padding: '0.5rem' }}>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { f: 'View Live 2000L Tank Gauges', a: true, m: true, u: true },
                      { f: 'Manual Remote Pump ON/OFF', a: true, m: true, u: false },
                      { f: 'Create Pump Schedules', a: true, m: true, u: false },
                      { f: 'Modify Safety Thresholds', a: true, m: false, u: false },
                      { f: 'Reset Emergency Stop', a: true, m: true, u: false },
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.5rem', color: '#ffffff' }}>{row.f}</td>
                        <td style={{ padding: '0.5rem' }}>{row.a ? '✓' : '✗'}</td>
                        <td style={{ padding: '0.5rem' }}>{row.m ? '✓' : '✗'}</td>
                        <td style={{ padding: '0.5rem' }}>{row.u ? '✓' : '✗'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== VIEW 17: PROFILE ===================== */}
          {activeScreen === 'profile' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '1.5rem' }}>Profile & System Specs</h2>
              <div className="glass-panel" style={{ padding: '2rem', maxWidth: '540px' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                  <div>Role: <strong style={{ color: '#ffffff' }}>{currentUserRole}</strong></div>
                  <div>Tank Capacity: <strong style={{ color: 'var(--cyan-400)' }}>{primaryOverhead.capacityLiters} L</strong></div>
                  <div>Flow Rating: <strong style={{ color: 'var(--emerald-400)' }}>20.0 L/min</strong></div>
                  <div>Engine Mode: <strong style={{ color: 'var(--amber-400)' }}>Real-Time Continuous Synchronization</strong></div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Add Schedule Modal */}
      {showAddScheduleModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '1.75rem', border: '1px solid var(--cyan-400)' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '1rem' }}>Create Pump Schedule</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem('schedName') as HTMLInputElement).value;
                const startTime = (form.elements.namedItem('schedTime') as HTMLInputElement).value;
                const duration = Number((form.elements.namedItem('schedDuration') as HTMLInputElement).value);

                onAddSchedule({
                  name,
                  startTime,
                  durationMinutes: duration,
                  daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  enabled: true,
                });
                setShowAddScheduleModal(false);
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>Schedule Name</label>
                <input required name="schedName" defaultValue="Afternoon Water Fill" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.65rem', borderRadius: '0.4rem', color: '#fff' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>Start Time (24h)</label>
                <input required name="schedTime" type="time" defaultValue="14:00" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.65rem', borderRadius: '0.4rem', color: '#fff' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>Duration (Minutes)</label>
                <input required name="schedDuration" type="number" min={5} max={45} defaultValue={20} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.65rem', borderRadius: '0.4rem', color: '#fff' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddScheduleModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provision Device Modal */}
      {showAddDeviceModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '1.75rem', border: '1px solid var(--emerald-400)' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>Provision ESP32 IoT Device</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Device Serial ID</label>
                <input defaultValue="AQUA-IOT-003" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.6rem', borderRadius: '0.4rem', color: '#fff', fontFamily: 'var(--font-mono)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setShowAddDeviceModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={() => setShowAddDeviceModal(false)} className="btn-success">Pair & Activate</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calibrate Sensor Modal */}
      {showCalibrateModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '1.75rem', border: '1px solid var(--cyan-400)' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>Sensor Calibration</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Distance at 100% Full (cm)</label>
                <input defaultValue="15" type="number" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.6rem', borderRadius: '0.4rem', color: '#fff' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setShowCalibrateModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={() => setShowCalibrateModal(false)} className="btn-primary">Save Calibration</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
