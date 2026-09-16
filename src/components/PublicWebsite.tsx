'use client';

import React, { useState } from 'react';
import {
  Droplets,
  Cpu,
  ShieldCheck,
  Zap,
  BarChart3,
  Calendar,
  AlertTriangle,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  Globe2,
  Phone,
  Mail,
  UserCheck,
  Layers,
  Activity,
  ChevronRight
} from 'lucide-react';
import { TankState, PumpState, AIInsightsState } from '@/lib/waterEngine';

interface Props {
  overheadTank: TankState;
  sourceTank: TankState;
  pump: PumpState;
  aiInsights: AIInsightsState;
  onEnterApp: (role?: 'ADMIN' | 'MANAGER' | 'USER') => void;
}

export const PublicWebsite: React.FC<Props> = ({
  overheadTank,
  sourceTank,
  pump,
  aiInsights,
  onEnterApp,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'how-it-works' | 'features' | 'ai' | 'sustainability' | 'solutions' | 'tech' | 'security' | 'about' | 'contact' | 'login' | 'register'>('home');
  const [selectedSolution, setSelectedSolution] = useState<string>('apartments');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-space)' }}>
      {/* Top Marketing Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 80,
          background: 'rgba(6, 11, 24, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.85rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div
            onClick={() => setActiveTab('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '0.6rem',
                background: 'linear-gradient(135deg, var(--cyan-500), #0369a1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px var(--cyan-glow)',
              }}
            >
              <Droplets size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                AquaGuard <span style={{ color: 'var(--cyan-400)' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Smart Water Controller
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[
              { id: 'home', label: 'Home' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'features', label: 'Features' },
              { id: 'ai', label: 'AI & Analytics' },
              { id: 'sustainability', label: 'Sustainability' },
              { id: 'solutions', label: 'Solutions' },
              { id: 'tech', label: 'Technology' },
              { id: 'security', label: 'Security' },
              { id: 'about', label: 'About' },
              { id: 'contact', label: 'Contact' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  background: activeTab === item.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: activeTab === item.id ? 'var(--cyan-400)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => setActiveTab('login')}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            >
              Sign In
            </button>
            <button
              onClick={() => onEnterApp('ADMIN')}
              className="btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              View Live App
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>

        {/* ===================== TAB: HOME ===================== */}
        {activeTab === 'home' && (
          <div>
            {/* HERO SECTION */}
            <section style={{ textAlign: 'center', padding: '2rem 0 3.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '0.35rem 0.9rem', borderRadius: '9999px', fontSize: '0.8rem', color: 'var(--cyan-400)', fontWeight: 600, marginBottom: '1.25rem' }}>
                <Sparkles size={14} />
                Commercial-Grade AI + IoT Water Management Platform
              </div>

              <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: '#ffffff', lineHeight: '1.15', maxWidth: '900px', margin: '0 auto 1.25rem' }}>
                Smart Water Management. <br />
                <span style={{ background: 'linear-gradient(135deg, var(--cyan-400), #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Powered by AI.
                </span>
              </h1>

              <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '720px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
                AquaGuard AI monitors your water tanks in real time, automatically controls pumps, prevents overflow and dry running, detects abnormal consumption, and predicts future water requirements.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                <button
                  onClick={() => onEnterApp('ADMIN')}
                  className="btn-primary"
                  style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
                >
                  <Activity size={18} />
                  View Live Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('how-it-works')}
                  className="btn-secondary"
                  style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
                >
                  How It Works
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Sample Live Status Card (Master Prompt Spec) */}
              <div
                className="glass-panel"
                style={{
                  maxWidth: '700px',
                  margin: '0 auto 4rem',
                  padding: '1.5rem',
                  border: '1px solid var(--border-accent)',
                  boxShadow: '0 0 35px -10px var(--cyan-glow)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="led-indicator led-green" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>LIVE TELEMETRY SNAPSHOT</span>
                  </div>
                  <span className="badge badge-cyan">ESP32 Connected</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'left' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Overhead Tank</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--cyan-400)' }}>{overheadTank.currentLevelPct.toFixed(0)}%</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{Math.round(overheadTank.currentLiters).toLocaleString()} / {overheadTank.capacityLiters} L</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Source Tank</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-400)' }}>{sourceTank.currentLevelPct.toFixed(0)}%</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{Math.round(sourceTank.currentLiters).toLocaleString()} / {sourceTank.capacityLiters} L</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Pump Status</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: pump.status === 'ON' ? 'var(--emerald-400)' : 'var(--text-dim)' }}>
                      {pump.status}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mode: {pump.mode}</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Today&apos;s Usage</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {Math.round(aiInsights.todayUsageLiters).toLocaleString()} L
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--emerald-400)' }}>
                      Avg: {aiInsights.dailyUsageAverageLiters} L ({aiInsights.usageDifferencePct >= 0 ? '+' : ''}{aiInsights.usageDifferencePct}%)
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>System Safety</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: pump.isEmergencyStop || pump.dryRunLocked ? 'var(--rose-400)' : 'var(--emerald-400)' }}>
                      {pump.isEmergencyStop ? 'E-STOP' : pump.dryRunLocked ? 'DRY-RUN' : 'NORMAL'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>5-Tier Chain OK</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>AI Prediction</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber-400)' }}>{aiInsights.overheadTimeToEmpty}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Conf: {aiInsights.confidencePct}%</div>
                  </div>
                </div>
              </div>
            </section>

            {/* ANIMATED INTERACTIVE SYSTEM ARCHITECTURE DIAGRAM */}
            <section style={{ marginBottom: '5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--cyan-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  End-to-End IoT Pipeline
                </span>
                <h2 style={{ fontSize: '2rem', color: '#ffffff', marginTop: '0.25rem' }}>
                  Physical Hardware Connected to Cloud AI
                </h2>
              </div>

              <div
                className="glass-panel"
                style={{
                  padding: '2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(180deg, rgba(15,28,63,0.8), rgba(6,11,24,0.95))',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', alignItems: 'center', position: 'relative', zIndex: 5 }}>
                  {/* Step 1: Source */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <Droplets size={28} color="var(--cyan-400)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>Source Sump</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>10,000L Underground</div>
                  </div>

                  {/* Step 2: Sensors */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <Activity size={28} color="var(--emerald-400)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>Sensors</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Level / Flow / Temp</div>
                  </div>

                  {/* Step 3: ESP32 */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <Cpu size={28} color="var(--amber-400)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>ESP32 IoT Hub</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Wi-Fi & Fail-Safe</div>
                  </div>

                  {/* Step 4: Cloud API */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <Globe2 size={28} color="var(--cyan-400)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>Cloud Backend</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Next.js + Prisma</div>
                  </div>

                  {/* Step 5: AI Engine */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <Sparkles size={28} color="#c084fc" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>AI Analytics</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Predictions & Leaks</div>
                  </div>

                  {/* Step 6: Overhead Tank */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <Building2 size={28} color="var(--emerald-400)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>Overhead Tank</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>5,000L Rooftop</div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  Continuous telemetry updates synced with Server-Sent Events (SSE) in sub-second intervals.
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ===================== TAB: HOW IT WORKS ===================== */}
        {activeTab === 'how-it-works' && (
          <section>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--cyan-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                System Workflow
              </span>
              <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginTop: '0.3rem' }}>How AquaGuard AI Works</h1>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
                From physical hydrostatic level sensors to autonomous cloud actuation in 6 deterministic stages.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {[
                { step: '1', title: 'Sense', desc: 'Sensors measure water level (ultrasonic/hydrostatic), water flow (pulse meter in L/min), temperature, and motor electrical current draw.', icon: Activity, color: 'var(--cyan-400)' },
                { step: '2', title: 'Connect', desc: 'The onboard ESP32 microcontroller securely transmits validated telemetry payloads via Wi-Fi/HTTPS with token authentication and unique event IDs.', icon: Cpu, color: 'var(--emerald-400)' },
                { step: '3', title: 'Store', desc: 'The backend ingests readings, enforces idempotency deduplication to prevent double-counting, and logs to PostgreSQL via Prisma ORM.', icon: Layers, color: 'var(--amber-400)' },
                { step: '4', title: 'Analyze', desc: 'The automation safety engine verifies the 5-Tier Priority chain (E-Stop, Dry-Run, Overfill, Schedules). AI models analyze consumption patterns.', icon: Sparkles, color: '#c084fc' },
                { step: '5', title: 'Act', desc: 'If safe conditions are met, the system energizes the heavy-duty pump relay, starting or stopping water transfer with zero human intervention required.', icon: Zap, color: 'var(--rose-400)' },
                { step: '6', title: 'Monitor', desc: 'Web and mobile dashboards update dynamically via Server-Sent Events (SSE), delivering live gauges, instant push alerts, and audit logs.', icon: Globe2, color: 'var(--cyan-400)' },
              ].map((item) => (
                <div key={item.step} className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: item.color, fontSize: '1rem', border: `1px solid ${item.color}` }}>
                      {item.step}
                    </div>
                    <item.icon size={24} color={item.color} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== TAB: FEATURES ===================== */}
        {activeTab === 'features' && (
          <section>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--cyan-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Engineering Specifications
              </span>
              <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginTop: '0.3rem' }}>Enterprise Water Features</h1>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
                Every real-world industrial and residential protection mechanism engineered to perfection.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {[
                { title: 'Automatic Level Control', desc: 'Starts pump when overhead tank drops below configured low threshold (e.g. 25%) and cuts off smoothly at full threshold (e.g. 95%).' },
                { title: 'Dry-Run Mechanical Lock', desc: 'Permanently protects pump impellers. If source sump drops below 20%, pump is instantly locked until water is restored.' },
                { title: '🚨 Emergency Stop (E-Stop)', desc: 'Global hardware & software latch that cuts pump contactor in <100ms. Requires authorized admin clearance to reset.' },
                { title: '5-Tier Priority Hierarchy', desc: 'Strict arbitration: 1. E-Stop > 2. Critical Safety > 3. Auto Rules > 4. Schedules > 5. Manual remote overrides.' },
                { title: 'Smart Pump Scheduling', desc: 'Create daily/weekly recurring filling routines. Automatically checks pre-flight safety before starting scheduled runs.' },
                { title: 'Continuous Runtime Cap', desc: 'Configurable runtime watchdog (e.g. 45 min). Automatically shuts down motor if continuous pumping exceeds safe limit.' },
                { title: 'Pulse Flow Sensor Support', desc: 'Real-time Hall effect flow rate in L/min, cumulative volume tracking, and pump-running vs pump-idle flow disparity checks.' },
                { title: 'Nighttime Leakage Detector', desc: 'Identifies unauthorized continuous water draw between 01:00 AM and 04:30 AM, warning facility managers with delta %.' },
                { title: 'Offline Local Autonomy', desc: 'If Wi-Fi or internet connection drops, the local ESP32 controller continues safe water management without cloud dependence.' },
                { title: 'Power-Failure Safe Restart', desc: 'After electrical blackout restoration, system safely verifies levels rather than blindly energizing motors simultaneously.' },
                { title: 'Multi-Tenant Architecture', desc: 'Manage Multiple Organizations → Multiple Buildings → Multiple Tanks → Multiple Pumps from a single glasspane.' },
                { title: 'Tamper-Evident Audit Trail', desc: 'Every user login, manual pump start, threshold edit, and emergency stop is recorded with IP, timestamp, and actor identity.' },
              ].map((f, i) => (
                <div key={i} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CheckCircle2 size={18} color="var(--emerald-400)" />
                    <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>{f.title}</h3>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== TAB: AI & ANALYTICS ===================== */}
        {activeTab === 'ai' && (
          <section>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--cyan-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Machine Learning
              </span>
              <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginTop: '0.3rem' }}>AI-Powered Predictive Analytics</h1>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
                Real-time consumption models trained on historical usage curves, weather forecasts, and flow dynamics.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--cyan-400)', marginBottom: '0.75rem' }}>
                  <Sparkles size={22} />
                  <h3 style={{ fontSize: '1.3rem', color: '#ffffff' }}>Time-to-Empty Forecaster</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Predicts the exact hour and minute when water in the overhead tank will reach low threshold based on rolling 14-day diurnal consumption patterns.
                </p>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-accent)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Current Tank Forecast</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--cyan-400)', margin: '0.2rem 0' }}>
                    {aiInsights.overheadTimeToEmpty}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Confidence: <strong>{aiInsights.confidencePct}%</strong></span>
                    <span>Model: <code>{aiInsights.modelVersion}</code></span>
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--amber-400)', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={22} />
                  <h3 style={{ fontSize: '1.3rem', color: '#ffffff' }}>AI Leakage Detection Engine</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Cross-references pump output volume against overhead tank level delta and nighttime flow sensor readings to detect hidden pipe ruptures or running valves.
                </p>

                <div style={{ background: aiInsights.leakageStatus === 'POSSIBLE_LEAKAGE' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)', padding: '1.25rem', borderRadius: '0.75rem', border: aiInsights.leakageStatus === 'POSSIBLE_LEAKAGE' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: aiInsights.leakageStatus === 'POSSIBLE_LEAKAGE' ? 'var(--amber-400)' : 'var(--emerald-400)', fontSize: '0.9rem' }}>
                      {aiInsights.leakageStatus === 'POSSIBLE_LEAKAGE' ? '⚠️ Possible Leakage Detected' : '✓ No Leakage Detected'}
                    </span>
                    <span className={`badge ${aiInsights.leakageStatus === 'POSSIBLE_LEAKAGE' ? 'badge-amber' : 'badge-emerald'}`}>
                      {aiInsights.leakageStatus === 'POSSIBLE_LEAKAGE' ? `+${aiInsights.leakageDifferencePct}% Deviation` : 'Optimal Baseline'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                    Current Usage: <strong>{Math.round(aiInsights.todayUsageLiters).toLocaleString()} L/day</strong> vs Baseline Normal: <strong>{aiInsights.dailyUsageAverageLiters} L/day</strong>.
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                    {aiInsights.leakageStatus === 'POSSIBLE_LEAKAGE' ? 'Unusual continuous flow detected without pump activity.' : 'All pipeline flow meters within expected nominal parameters.'}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================== TAB: SUSTAINABILITY ===================== */}
        {activeTab === 'sustainability' && (
          <section>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Conservation Metrics
              </span>
              <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginTop: '0.3rem' }}>Save Water. Save Energy.</h1>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
                AquaGuard AI eliminates overflow wastage, optimizes pump electrical duty cycles, and cuts carbon footprint.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <Droplets size={32} color="var(--cyan-400)" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>
                  {Math.round(overheadTank.capacityLiters * 0.425)} L
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--cyan-400)' }}>Water Saved Daily</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Zero tank overflow incidents</div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <Zap size={32} color="var(--amber-400)" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>28.5%</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--amber-400)' }}>Electricity Reduction</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Elimination of dry/idle motor spinning</div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <TrendingDown size={32} color="var(--emerald-400)" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>184 kg</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--emerald-400)' }}>Monthly CO₂ Avoided</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Clean energy efficiency calculation</div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <ShieldCheck size={32} color="#c084fc" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>3.2x</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#c084fc' }}>Motor Lifespan Extension</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Thermal protection & scheduled maintenance</div>
              </div>
            </div>
          </section>
        )}

        {/* ===================== TAB: SOLUTIONS / USE CASES ===================== */}
        {activeTab === 'solutions' && (
          <section>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--cyan-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Industry Verticals
              </span>
              <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginTop: '0.3rem' }}>Tailored for Every Infrastructure</h1>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {[
                { id: 'homes', label: 'Homes & Villas' },
                { id: 'apartments', label: 'Apartments & Gated Communities' },
                { id: 'hostels', label: 'Hostels & Colleges' },
                { id: 'hospitals', label: 'Hospitals & Healthcare' },
                { id: 'hotels', label: 'Hotels & Resorts' },
                { id: 'industries', label: 'Industries & Commercial' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSolution(s.id)}
                  style={{
                    background: selectedSolution === s.id ? 'var(--cyan-500)' : 'rgba(255,255,255,0.06)',
                    color: selectedSolution === s.id ? '#ffffff' : 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '850px', margin: '0 auto' }}>
              {selectedSolution === 'apartments' && (
                <div>
                  <h3 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '1rem' }}>Apartments & High-Rise Societies</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Multi-tank coordination between municipal ground storage sumps and overhead distribution tanks across multiple wings (Tower A, Tower B). Automated schedules refill overhead tanks ahead of morning (06:00) and evening peak hours with zero water outages for residents.
                  </p>
                  <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--emerald-400)" /> Multi-building multi-pump routing</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--emerald-400)" /> Nighttime burst pipe detection</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--emerald-400)" /> Resident mobile app & PWA access</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--emerald-400)" /> Automatic maintenance reminder logs</li>
                  </ul>
                </div>
              )}

              {selectedSolution === 'homes' && (
                <div>
                  <h3 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '1rem' }}>Independent Homes & Villas</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Say goodbye to manual switches and flooded terraces. AquaGuard AI silently monitors your sump and rooftop tank, automatically refilling only when sump water is verified safe.
                  </p>
                </div>
              )}

              {selectedSolution === 'hostels' && (
                <div>
                  <h3 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '1rem' }}>Hostels, Schools & Universities</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Handle immense surges during student wake-up hours (06:30 - 08:30 AM). AI predictive refill schedules guarantee overhead tanks are at 100% capacity before bells ring.
                  </p>
                </div>
              )}

              {selectedSolution === 'hospitals' && (
                <div>
                  <h3 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '1rem' }}>Hospitals & Critical Healthcare</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Zero water downtime is mandatory for dialysis and sterilizing units. Redundant dual-pump priority fail-over automatically engages standby backup pumps if primary pump fails.
                  </p>
                </div>
              )}

              {selectedSolution === 'hotels' && (
                <div>
                  <h3 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '1rem' }}>Hotels & Luxury Resorts</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Flawless guest water pressure, continuous flow tracking, water temperature monitoring, and central maintenance analytics across multiple hospitality villas.
                  </p>
                </div>
              )}

              {selectedSolution === 'industries' && (
                <div>
                  <h3 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '1rem' }}>Industrial Plants & Commercial Complexes</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Cooling tower sumps, effluent treatment plants, raw water filtration cycles, heavy 3-phase pump contactor integration, and complete SCADA/API telemetry exports.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================== TAB: TECHNOLOGY ===================== */}
        {activeTab === 'tech' && (
          <section>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--cyan-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Hardware & Software Stack
              </span>
              <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginTop: '0.3rem' }}>Built with Robust Standards</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <Cpu size={28} color="var(--cyan-400)" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>Edge IoT Controller</h3>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.7', paddingLeft: '1.2rem' }}>
                  <li>ESP32 Dual-Core Tensilica Xtensa 240 MHz</li>
                  <li>Ultrasonic Non-Contact Level (2cm - 450cm)</li>
                  <li>Pulse Hall Effect Water Flow Meter</li>
                  <li>DS18B20 Digital 1-Wire Temperature Sensor</li>
                  <li>Optocoupled 30A Heavy Motor Relays</li>
                  <li>Local Fail-Safe State Machine (runs even without internet)</li>
                </ul>
              </div>

              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <Layers size={28} color="var(--emerald-400)" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>Full-Stack Cloud Core</h3>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.7', paddingLeft: '1.2rem' }}>
                  <li>Next.js 16 App Router & Server Actions</li>
                  <li>TypeScript Strict Type Safety</li>
                  <li>Prisma ORM with PostgreSQL & SQLite</li>
                  <li>Server-Sent Events (SSE) Live Telemetry Stream</li>
                  <li>Idempotent Deduplication Ingestion Pipeline</li>
                  <li>Responsive PWA with Standalone App Manifest</li>
                </ul>
              </div>

              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <Lock size={28} color="var(--amber-400)" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>Cybersecurity & Auth</h3>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.7', paddingLeft: '1.2rem' }}>
                  <li>Granular Role-Based Access Control (Admin/Manager/User)</li>
                  <li>Tokenized Device Authentication Secret Keys</li>
                  <li>Cryptographic Event ID Deduplication</li>
                  <li>Tamper-Evident Immutable Audit Logging</li>
                  <li>Strict 5-Tier Hardware/Software Safety Interlocks</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* ===================== TAB: SECURITY ===================== */}
        {activeTab === 'security' && (
          <section>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--rose-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Cybersecurity & Safety Guardrails
              </span>
              <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginTop: '0.3rem' }}>Zero Compromise on Water Safety</h1>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '850px', margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ color: 'var(--cyan-400)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Unauthenticated Actuation</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    All pump-control REST APIs require authenticated sessions with validated operator tokens. Unauthorized commands are rejected with 403 Forbidden and logged as security events.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--emerald-400)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Hardware Relay Interlock</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    The emergency stop circuit and float switch interlock directly at the relay contactor coil, guaranteeing immediate pump shutdown regardless of cloud server availability.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--amber-400)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Data Quality Rejection</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Sensor readings outside 0-100% or sudden impossible deltas (&gt;40% in 1 sec) are rejected by server filters to prevent erratic automation loops.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--rose-400)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Audit Log Immutability</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    All operator interactions, threshold alterations, and pump starts are captured in chronological audit records that cannot be overwritten by standard users.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================== TAB: ABOUT ===================== */}
        {activeTab === 'about' && (
          <section style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--cyan-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Our Mission
              </span>
              <h1 style={{ fontSize: '2.5rem', color: '#ffffff', marginTop: '0.3rem' }}>About AquaGuard AI</h1>
            </div>

            <div className="glass-panel" style={{ padding: '2.5rem', lineHeight: '1.7', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: '1.25rem' }}>
                Water is the world's most vital resource, yet billions of liters are lost every single day due to overflowing rooftop tanks, undetected underground pipe fractures, and dry-running pumps that burn out motor coils.
              </p>
              <p style={{ marginBottom: '1.25rem' }}>
                <strong>AquaGuard AI</strong> was architected to bridge the gap between heavy industrial reliability and modern AI intelligence. By connecting ultrasonic sensors, high-precision Hall pulse flow meters, and dual-core edge microcontrollers to an intelligent automation engine, we empower buildings, campuses, hospitals, and communities to conserve water and power automatically.
              </p>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>100%</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Overflow Elimination</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--cyan-400)' }}>10M+ Liters</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Water Protected</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-400)' }}>99.98%</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Uptime Reliability</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================== TAB: CONTACT ===================== */}
        {activeTab === 'contact' && (
          <section style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--cyan-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Get In Touch
              </span>
              <h1 style={{ fontSize: '2.2rem', color: '#ffffff', marginTop: '0.3rem' }}>Contact Sales & Engineering</h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Request an IoT hardware pilot deployment or commercial building proposal.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              {contactSubmitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <CheckCircle2 size={48} color="var(--emerald-400)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '0.5rem' }}>Inquiry Received!</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    An AquaGuard AI engineering specialist will contact you within 4 business hours.
                  </p>
                  <button onClick={() => setContactSubmitted(false)} className="btn-secondary" style={{ marginTop: '1.5rem' }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>Your Name</label>
                    <input required type="text" placeholder="e.g. Charan" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.75rem', borderRadius: '0.5rem', color: '#fff' }} />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>Email Address</label>
                    <input required type="email" placeholder="charan@example.com" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.75rem', borderRadius: '0.5rem', color: '#fff' }} />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>Facility Type</label>
                    <select style={{ width: '100%', background: '#0a1128', border: '1px solid var(--border-subtle)', padding: '0.75rem', borderRadius: '0.5rem', color: '#fff' }}>
                      <option>Apartment Complex / Gated Community</option>
                      <option>Hostel / College Campus</option>
                      <option>Hospital / Medical Center</option>
                      <option>Hotel / Resort</option>
                      <option>Commercial / Industrial Building</option>
                      <option>Residential Villa</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>Estimated Number of Tanks & Pumps</label>
                    <textarea rows={3} placeholder="e.g. 4 overhead tanks (5,000L each), 2 sumps (20,000L), 3 pumps..." style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.75rem', borderRadius: '0.5rem', color: '#fff' }} />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                    Request Pilot Proposal & Quote
                  </button>
                </form>
              )}
            </div>
          </section>
        )}

        {/* ===================== TAB: LOGIN ===================== */}
        {activeTab === 'login' && (
          <section style={{ maxWidth: '440px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--cyan-500), #0369a1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 0 20px var(--cyan-glow)',
                }}
              >
                <Lock size={22} color="#ffffff" />
              </div>
              <h1 style={{ fontSize: '2rem', color: '#ffffff' }}>Sign In to AquaGuard</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Select a demo persona or log in with credentials
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚡ Quick Demo Login (Select Role)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.6rem' }}>
                  <button
                    onClick={() => onEnterApp('ADMIN')}
                    className="btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '0.75rem', background: 'rgba(14, 165, 233, 0.15)', borderColor: 'var(--cyan-500)' }}
                  >
                    <UserCheck size={18} color="var(--cyan-400)" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>Super Administrator</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Full system access, E-Stop reset, safety thresholds</div>
                    </div>
                  </button>

                  <button
                    onClick={() => onEnterApp('MANAGER')}
                    className="btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '0.75rem' }}
                  >
                    <UserCheck size={18} color="var(--emerald-400)" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>Facility Manager</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Pump control, scheduling, maintenance, alerts</div>
                    </div>
                  </button>

                  <button
                    onClick={() => onEnterApp('USER')}
                    className="btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '0.75rem' }}
                  >
                    <UserCheck size={18} color="var(--amber-400)" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff' }}>Resident / Operator</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>View tank levels, usage metrics, read-only safety</div>
                    </div>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.25rem 0', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                <span>OR SIGN IN WITH EMAIL</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              </div>

              <form onSubmit={(e) => { e.preventDefault(); onEnterApp('ADMIN'); }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>Email</label>
                  <input defaultValue="admin@aquaguard.ai" type="email" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.65rem', borderRadius: '0.5rem', color: '#fff' }} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>Password</label>
                  <input defaultValue="••••••••••••" type="password" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.65rem', borderRadius: '0.5rem', color: '#fff' }} />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                  Sign In
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ===================== TAB: REGISTER ===================== */}
        {activeTab === 'register' && (
          <section style={{ maxWidth: '520px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2rem', color: '#ffffff' }}>Create New Organization</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Deploy AquaGuard AI for your commercial or residential property
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <form onSubmit={(e) => { e.preventDefault(); onEnterApp('ADMIN'); }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>Organization / Society Name</label>
                  <input required placeholder="e.g. Horizon Heights RWA" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.65rem', borderRadius: '0.5rem', color: '#fff' }} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>Primary Admin Email</label>
                  <input required type="email" placeholder="facility.head@horizon.com" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.65rem', borderRadius: '0.5rem', color: '#fff' }} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>First Building Name</label>
                  <input required placeholder="e.g. Block A (East Wing)" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', padding: '0.65rem', borderRadius: '0.5rem', color: '#fff' }} />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>
                  Complete Setup & Open Dashboard
                </button>
              </form>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '2.5rem 1.5rem', background: 'rgba(6,11,24,0.95)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Droplets size={20} color="var(--cyan-400)" />
            <span style={{ fontWeight: 700, color: '#ffffff' }}>AquaGuard AI</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>— Save Water. Save Energy. Manage Smarter.</span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            © 2026 AquaGuard AI Inc. Enterprise IoT Water Automation Engine.
          </div>
        </div>
      </footer>
    </div>
  );
};
