// AquaGuard AI — Unified Core State, Automation Engine & Real-Time Physics
// Single Source of Truth for all Web Views, IoT Endpoints, and Persistence

import fs from 'fs';
import path from 'path';

export interface TankState {
  id: string;
  name: string;
  type: 'OVERHEAD' | 'SOURCE';
  building: string;
  capacityLiters: number;
  currentLiters: number;
  currentLevelPct: number;
  lowThreshold: number;       // e.g. 30% (600 L)
  fullThreshold: number;      // e.g. 95% (1900 L)
  minSafeLevel: number;       // e.g. 20% (400 L Source dry-run)
  status: 'CRITICAL' | 'LOW' | 'NORMAL' | 'HIGH' | 'FULL';
  flowRateLpm: number;
  temperatureCelsius: number | null;
  sensorHealth: 'HEALTHY' | 'WARNING' | 'FAULT';
  lastUpdated: string;
}

export interface PumpState {
  id: string;
  name: string;
  building: string;
  sourceTankId: string;
  destTankId: string;
  status: 'OFF' | 'ON' | 'LOCKED' | 'FAULT';
  mode: 'AUTO' | 'MANUAL';
  powerKw: number;
  flowRateLpm: number;        // Exactly 20 L/min when ON, 0 when OFF
  maxRuntimeMinutes: number;
  currentRuntimeSeconds: number;
  isEmergencyStop: boolean;
  dryRunLocked: boolean;
  totalHoursRun: number;
  totalWaterTransferredLiters: number;
  lastCommand: {
    action: 'ON' | 'OFF';
    status: 'PENDING' | 'SENT' | 'CONFIRMED' | 'FAILED';
    initiatedBy: string;
    timestamp: string;
    reason: string;
  };
}

export interface PumpHistoryEvent {
  id: string;
  pumpId: string;
  action: 'START' | 'STOP';
  startTime: string;
  stopTime?: string;
  runtimeMinutes: number;
  waterTransferredLiters: number;
  reason: 'Automatic' | 'Manual' | 'Scheduled' | 'Tank Full' | 'Source Tank Low' | 'Emergency Stop' | 'Max Runtime';
  initiatedBy: string;
  timestamp: string;
}

export interface PumpScheduleItem {
  id: string;
  name: string;
  startTime: string; // "06:00"
  durationMinutes: number;
  daysOfWeek: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  enabled: boolean;
  nextRun: string;
  status: 'IDLE' | 'ACTIVE' | 'BLOCKED_BY_SAFETY';
}

export interface AlertItem {
  id: string;
  code: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'RESOLVED';
  isRead: boolean;
  isResolved: boolean;
  timestamp: string;
  recommendedAction?: string;
}

export interface DeviceItem {
  id: string;
  deviceId: string;
  name: string;
  building: string;
  status: 'ONLINE' | 'UNSTABLE' | 'OFFLINE';
  firmware: string;
  rssi: number;
  ip: string;
  lastHeartbeat: string;
  sensorsCount: number;
  powerStatus: 'AC_MAINS' | 'BATTERY_BACKUP' | 'OUTAGE';
}

export interface AIInsightsState {
  overheadTimeToEmpty: string;      // Calculated dynamically e.g. "5h 12m" or "Filling in progress"
  confidencePct: number;
  dailyUsageAverageLiters: number;
  todayUsageLiters: number;         // Dynamically calculated from real usage
  usageDifferencePct: number;
  leakageStatus: 'NONE' | 'POSSIBLE_LEAKAGE';
  leakageDifferencePct: number;
  recommendedRefillsTomorrow: number;
  anomalyScore: number;
  modelVersion: string;
}

export interface SimulationControlState {
  isRunning: boolean;
  speed: number;                     // 1, 5, 10
  isDemoData: boolean;
  isPowerOutage: boolean;
  isInternetOffline: boolean;
  faultInjected: boolean;
  activePriorityLevel: number;       // 1-5
  activePriorityReason: string;
}

export interface AuditLogItem {
  id: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'SECURITY';
}

const PERSISTENCE_FILE = path.join((process as any).cwd ? (process as any).cwd() : '.', 'data', 'aquaguard_state.json');

class WaterEngine {
  private tanks: TankState[];
  private pumps: PumpState[];
  private pumpHistory: PumpHistoryEvent[];
  private schedules: PumpScheduleItem[];
  private alerts: AlertItem[];
  private devices: DeviceItem[];
  private auditLogs: AuditLogItem[];
  private aiInsights: AIInsightsState;
  private simControls: SimulationControlState;
  private processedEventIds: Set<string>;
  private hourlyHistory: { hour: string; usage: number; predicted: number; pumpOnMinutes: number }[];
  private listeners: Set<() => void>;
  private currentPumpCycleStartTime: number | null = null;
  private currentPumpCycleStartLiters: number = 0;

  constructor() {
    this.processedEventIds = new Set();
    this.listeners = new Set();

    // Default 2000 Litres Overhead Tank and 2000 Litres Source Sump as mandated
    this.tanks = [
      {
        id: 'tank-overhead-1',
        name: 'Overhead Tank (Building A)',
        type: 'OVERHEAD',
        building: 'Building A — Horizon Heights',
        capacityLiters: 2000,
        currentLiters: 1450,
        currentLevelPct: 72.5,
        lowThreshold: 30,           // 30% = 600 L
        fullThreshold: 95,          // 95% = 1900 L
        minSafeLevel: 20,
        status: 'NORMAL',
        flowRateLpm: 0,             // 0 L/min when OFF
        temperatureCelsius: 27.4,
        sensorHealth: 'HEALTHY',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'tank-source-1',
        name: 'Source Sump Tank (Building A)',
        type: 'SOURCE',
        building: 'Building A — Horizon Heights',
        capacityLiters: 2000,
        currentLiters: 1200,
        currentLevelPct: 60.0,
        lowThreshold: 20,
        fullThreshold: 95,
        minSafeLevel: 20,           // 20% = 400 L Dry-run limit
        status: 'NORMAL',
        flowRateLpm: 0,
        temperatureCelsius: 25.8,
        sensorHealth: 'HEALTHY',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'tank-overhead-2',
        name: 'Overhead Tank (Building B)',
        type: 'OVERHEAD',
        building: 'Building B — Palm Residency',
        capacityLiters: 2000,
        currentLiters: 560,
        currentLevelPct: 28.0,
        lowThreshold: 30,
        fullThreshold: 95,
        minSafeLevel: 20,
        status: 'LOW',
        flowRateLpm: 0,
        temperatureCelsius: null,
        sensorHealth: 'HEALTHY',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'tank-source-2',
        name: 'Source Sump Tank (Building B)',
        type: 'SOURCE',
        building: 'Building B — Palm Residency',
        capacityLiters: 2000,
        currentLiters: 1100,
        currentLevelPct: 55.0,
        lowThreshold: 20,
        fullThreshold: 95,
        minSafeLevel: 20,
        status: 'NORMAL',
        flowRateLpm: 0,
        temperatureCelsius: 26.2,
        sensorHealth: 'HEALTHY',
        lastUpdated: new Date().toISOString(),
      }
    ];

    // Primary Pump with exactly 20 L/min flow rate
    this.pumps = [
      {
        id: 'pump-alpha-1',
        name: 'Main Transfer Pump Alpha-1 (1.5 kW)',
        building: 'Building A — Horizon Heights',
        sourceTankId: 'tank-source-1',
        destTankId: 'tank-overhead-1',
        status: 'OFF',
        mode: 'AUTO',
        powerKw: 1.5,
        flowRateLpm: 0, // 0 when OFF, 20 L/min when ON
        maxRuntimeMinutes: 45,
        currentRuntimeSeconds: 0,
        isEmergencyStop: false,
        dryRunLocked: false,
        totalHoursRun: 142.5,
        totalWaterTransferredLiters: 0,
        lastCommand: {
          action: 'OFF',
          status: 'CONFIRMED',
          initiatedBy: 'SYSTEM',
          timestamp: new Date().toISOString(),
          reason: 'Initial system standby',
        }
      },
      {
        id: 'pump-beta-2',
        name: 'Transfer Pump Beta-2 (1.0 kW)',
        building: 'Building B — Palm Residency',
        sourceTankId: 'tank-source-2',
        destTankId: 'tank-overhead-2',
        status: 'OFF',
        mode: 'AUTO',
        powerKw: 1.0,
        flowRateLpm: 0,
        maxRuntimeMinutes: 30,
        currentRuntimeSeconds: 0,
        isEmergencyStop: false,
        dryRunLocked: false,
        totalHoursRun: 88.2,
        totalWaterTransferredLiters: 0,
        lastCommand: {
          action: 'OFF',
          status: 'CONFIRMED',
          initiatedBy: 'SYSTEM',
          timestamp: new Date().toISOString(),
          reason: 'Initial system standby',
        }
      }
    ];

    this.pumpHistory = [
      {
        id: 'hist-init-1',
        pumpId: 'pump-alpha-1',
        action: 'STOP',
        startTime: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stopTime: new Date(Date.now() - 2700000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        runtimeMinutes: 15,
        waterTransferredLiters: 300,
        reason: 'Tank Full',
        initiatedBy: 'Automatic',
        timestamp: new Date(Date.now() - 2700000).toISOString(),
      }
    ];

    this.schedules = [
      {
        id: 'sched-1',
        name: 'Morning Fill Routine',
        startTime: '06:00',
        durationMinutes: 20,
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        enabled: true,
        nextRun: 'Tomorrow at 06:00 AM',
        status: 'IDLE',
      },
      {
        id: 'sched-2',
        name: 'Evening Top-Up Window',
        startTime: '18:30',
        durationMinutes: 15,
        daysOfWeek: ['Mon', 'Wed', 'Fri'],
        enabled: true,
        nextRun: 'Today at 06:30 PM',
        status: 'IDLE',
      }
    ];

    this.alerts = [
      {
        id: 'alt-001',
        code: 'SYSTEM_ONLINE',
        title: 'AquaGuard AI Engine Activated',
        message: 'All sensors and controller heartbeats validated. Safety priority logic active.',
        severity: 'INFO',
        isRead: true,
        isResolved: true,
        timestamp: new Date().toISOString(),
      }
    ];

    this.devices = [
      {
        id: 'dev-1',
        deviceId: 'AQUA-IOT-001',
        name: 'ESP32 Dual-Relay Controller A',
        building: 'Building A — Horizon Heights',
        status: 'ONLINE',
        firmware: 'v2.4.1-prod',
        rssi: -54,
        ip: '192.168.1.142',
        lastHeartbeat: new Date().toISOString(),
        sensorsCount: 3,
        powerStatus: 'AC_MAINS',
      },
      {
        id: 'dev-2',
        deviceId: 'AQUA-IOT-002',
        name: 'ESP32 Sump Controller B',
        building: 'Building B — Palm Residency',
        status: 'ONLINE',
        firmware: 'v2.4.0',
        rssi: -68,
        ip: '192.168.1.189',
        lastHeartbeat: new Date().toISOString(),
        sensorsCount: 2,
        powerStatus: 'AC_MAINS',
      }
    ];

    this.auditLogs = [
      {
        id: 'aud-001',
        actor: 'Charan (Lead Admin)',
        role: 'ADMIN',
        action: 'SYSTEM_BOOT',
        details: 'AquaGuard AI controller initialized with 2000L Overhead Tank capacity',
        timestamp: new Date().toISOString(),
        severity: 'INFO',
      }
    ];

    this.aiInsights = {
      overheadTimeToEmpty: '5h 12m',
      confidencePct: 88,
      dailyUsageAverageLiters: 480,
      todayUsageLiters: 0,
      usageDifferencePct: 0.0,
      leakageStatus: 'NONE',
      leakageDifferencePct: 0.0,
      recommendedRefillsTomorrow: 2,
      anomalyScore: 0.05,
      modelVersion: 'v3.4.2-neural',
    };

    this.simControls = {
      isRunning: true,
      speed: 1,
      isDemoData: true,
      isPowerOutage: false,
      isInternetOffline: false,
      faultInjected: false,
      activePriorityLevel: 3,
      activePriorityReason: 'System operating normally under Automated Safety Logic (Tier 3)',
    };

    this.hourlyHistory = [
      { hour: '00:00', usage: 10, predicted: 12, pumpOnMinutes: 0 },
      { hour: '02:00', usage: 8, predicted: 10, pumpOnMinutes: 0 },
      { hour: '04:00', usage: 15, predicted: 15, pumpOnMinutes: 0 },
      { hour: '06:00', usage: 120, predicted: 110, pumpOnMinutes: 10 },
      { hour: '08:00', usage: 140, predicted: 130, pumpOnMinutes: 8 },
      { hour: '10:00', usage: 60, predicted: 65, pumpOnMinutes: 0 },
      { hour: '12:00', usage: 80, predicted: 75, pumpOnMinutes: 6 },
      { hour: '14:00', usage: 45, predicted: 50, pumpOnMinutes: 0 },
      { hour: '16:00', usage: 70, predicted: 65, pumpOnMinutes: 0 },
      { hour: '18:00', usage: 130, predicted: 125, pumpOnMinutes: 10 },
      { hour: '20:00', usage: 90, predicted: 85, pumpOnMinutes: 5 },
      { hour: '22:00', usage: 30, predicted: 35, pumpOnMinutes: 0 },
    ];

    // Attempt to restore persistent state from disk if available
    this.loadStateFromDisk();
  }

  private loadStateFromDisk() {
    try {
      if (fs.existsSync(PERSISTENCE_FILE)) {
        const raw = fs.readFileSync(PERSISTENCE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.tanks && parsed.pumps) {
          this.tanks = parsed.tanks;
          this.pumps = parsed.pumps;
          if (parsed.pumpHistory) this.pumpHistory = parsed.pumpHistory;
          if (parsed.schedules) this.schedules = parsed.schedules;
          if (parsed.alerts) this.alerts = parsed.alerts;
          if (parsed.auditLogs) this.auditLogs = parsed.auditLogs;
          if (parsed.aiInsights) this.aiInsights = parsed.aiInsights;
        }
      }
    } catch {
      // Use defaults if load fails
    }
  }

  private saveStateToDisk() {
    try {
      const dataDir = path.dirname(PERSISTENCE_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const snapshot = {
        tanks: this.tanks,
        pumps: this.pumps,
        pumpHistory: this.pumpHistory,
        schedules: this.schedules,
        alerts: this.alerts,
        auditLogs: this.auditLogs,
        aiInsights: this.aiInsights,
      };
      fs.writeFileSync(PERSISTENCE_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch {
      // Non-critical persistence failure
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.saveStateToDisk();
    this.listeners.forEach((fn) => fn());
  }

  // Evaluate the 5-Tier Priority Hierarchy
  public evaluateSafetyLogic() {
    const pump = this.pumps[0];
    const overhead = this.tanks.find((t) => t.id === pump.destTankId)!;
    const source = this.tanks.find((t) => t.id === pump.sourceTankId)!;

    // TIER 1: EMERGENCY STOP (Immediate Pump Cut)
    if (pump.isEmergencyStop) {
      if (pump.status === 'ON') {
        this.recordPumpStop('Emergency Stop', 'System Safety');
      }
      pump.status = 'LOCKED';
      pump.flowRateLpm = 0;
      this.simControls.activePriorityLevel = 1;
      this.simControls.activePriorityReason = '🚨 TIER 1: EMERGENCY STOP ACTIVE — Pump physically locked.';
      return;
    }

    // TIER 2: CRITICAL SAFETY (Dry-Run, Power Outage, Sensor Failure)
    if (this.simControls.isPowerOutage) {
      if (pump.status === 'ON') {
        this.recordPumpStop('Source Tank Low', 'Power Grid Failure');
      }
      pump.status = 'OFF';
      pump.flowRateLpm = 0;
      this.simControls.activePriorityLevel = 2;
      this.simControls.activePriorityReason = '⚠️ TIER 2: POWER OUTAGE — Motor unlatched. Awaiting safe restoration.';
      return;
    }

    // DRY-RUN PROTECTION: Source tank <= minSafeLevel (e.g. 20% / 400 L)
    if (source.currentLevelPct <= source.minSafeLevel) {
      pump.dryRunLocked = true;
      if (pump.status === 'ON') {
        this.recordPumpStop('Source Tank Low', 'Dry-Run Sensor');
        this.addAlert('SOURCE_TANK_LOW', '🚨 Pump Stopped: Source Tank Too Low', `Pump stopped because the source tank level (${source.currentLevelPct.toFixed(1)}%) is below the minimum safe level (${source.minSafeLevel}%). Pump locked to prevent dry running.`, 'CRITICAL');
        this.addAuditLog('SAFETY_ENGINE', 'SYSTEM', 'DRY_RUN_LOCK', `Source tank dropped to ${source.currentLevelPct.toFixed(1)}% (${Math.round(source.currentLiters)} L). Pump shut down.`, 'WARN');
      }
      pump.status = 'LOCKED';
      pump.flowRateLpm = 0;
      this.simControls.activePriorityLevel = 2;
      this.simControls.activePriorityReason = '🛡️ TIER 2: DRY-RUN PROTECTION ACTIVE — Source tank level is too low. Pump locked.';
      return;
    } else {
      pump.dryRunLocked = false;
      if (pump.status === 'LOCKED' && !pump.isEmergencyStop) {
        pump.status = 'OFF';
      }
    }

    if (overhead.sensorHealth === 'FAULT' || this.simControls.faultInjected) {
      if (pump.status === 'ON') {
        this.recordPumpStop('Emergency Stop', 'Sensor Fault');
      }
      pump.status = 'FAULT';
      pump.flowRateLpm = 0;
      this.simControls.activePriorityLevel = 2;
      this.simControls.activePriorityReason = '⚠️ TIER 2: SENSOR FAULT DETECTED — Automation paused until calibration verified.';
      return;
    }

    // TIER 3: AUTOMATIC SAFETY (Full Threshold, Max Continuous Runtime)
    // When tank reaches full threshold (e.g. 95% = 1900 L in 2000L tank) -> PUMP OFF
    if (overhead.currentLevelPct >= overhead.fullThreshold) {
      if (pump.status === 'ON') {
        this.recordPumpStop('Tank Full', 'Full Level Sensor');
        pump.status = 'OFF';
        pump.flowRateLpm = 0;
        pump.currentRuntimeSeconds = 0;
        overhead.flowRateLpm = 0;
        source.flowRateLpm = 0;
        this.addAlert('TANK_FULL_STOP', '✓ Pump Automatically Stopped', `Overhead tank reached ${overhead.fullThreshold}% capacity (${Math.round(overhead.currentLiters)} / ${overhead.capacityLiters} L). Water transfer stopped.`, 'INFO');
        this.addAuditLog('AUTO_ENGINE', 'SYSTEM', 'AUTO_STOP_FULL', `Overhead tank full at ${overhead.currentLevelPct.toFixed(1)}%. Pump stopped automatically.`, 'INFO');
      }
      this.simControls.activePriorityLevel = 3;
      this.simControls.activePriorityReason = '✓ TIER 3: FULL LEVEL REACHED — Overhead tank full. Pump stopped.';
      return;
    }

    // Max runtime check (watchdog)
    const maxRuntimeSec = pump.maxRuntimeMinutes * 60;
    if (pump.status === 'ON' && pump.currentRuntimeSeconds >= maxRuntimeSec) {
      this.recordPumpStop('Max Runtime', 'Watchdog Timer');
      pump.status = 'OFF';
      pump.flowRateLpm = 0;
      pump.currentRuntimeSeconds = 0;
      this.addAlert('MAX_RUNTIME_EXCEEDED', 'Pump Safety Shutdown: Max Runtime', `Pump ran continuously for ${pump.maxRuntimeMinutes} minutes. Shut down automatically.`, 'WARNING');
      this.addAuditLog('SAFETY_ENGINE', 'SYSTEM', 'MAX_RUNTIME_STOP', `Pump runtime exceeded ${pump.maxRuntimeMinutes}m limit.`, 'WARN');
      this.simControls.activePriorityLevel = 3;
      this.simControls.activePriorityReason = '⏱️ TIER 3: MAX RUNTIME REACHED — Thermal motor protection shutdown enforced.';
      return;
    }

    // AUTOMATIC CONTROL ENGINE: If Overhead <= lowThreshold (30% = 600L) and Source has water -> PUMP ON
    if (pump.mode === 'AUTO') {
      if (overhead.currentLevelPct <= overhead.lowThreshold && source.currentLevelPct > source.minSafeLevel) {
        if (pump.status === 'OFF') {
          pump.status = 'ON';
          pump.flowRateLpm = 20.0;
          this.recordPumpStart('Automatic', 'Automated Control');
          pump.lastCommand = {
            action: 'ON',
            status: 'CONFIRMED',
            initiatedBy: 'AUTOMATION_ENGINE',
            timestamp: new Date().toISOString(),
            reason: `Overhead level (${overhead.currentLevelPct.toFixed(1)}%) dropped below low threshold (${overhead.lowThreshold}% / ${overhead.capacityLiters * (overhead.lowThreshold/100)} L). Refilling.`
          };
          this.addAlert('AUTO_PUMP_ON', '⚠️ Tank Level Low — Automatic Pump Started', `Overhead tank level is ${overhead.currentLevelPct.toFixed(1)}% (${Math.round(overhead.currentLiters)} L). Pump automatically started to refill.`, 'INFO');
          this.addAuditLog('AUTO_ENGINE', 'SYSTEM', 'AUTO_START', `Started pump automatically to refill Overhead Tank.`, 'INFO');
        }
        this.simControls.activePriorityLevel = 3;
        this.simControls.activePriorityReason = '⚡ TIER 3: AUTOMATIC FILLING RUNNING — Pumping water at 20 L/min.';
        return;
      }
    }

    // TIER 4: SCHEDULED COMMANDS
    const activeSchedule = this.schedules.find((s) => s.enabled && s.status === 'ACTIVE');
    if (activeSchedule && pump.status === 'ON') {
      this.simControls.activePriorityLevel = 4;
      this.simControls.activePriorityReason = `📅 TIER 4: SCHEDULED OPERATION ACTIVE — ${activeSchedule.name}`;
      return;
    }

    // TIER 5: MANUAL COMMANDS / STANDBY
    if (pump.mode === 'MANUAL' && pump.status === 'ON') {
      this.simControls.activePriorityLevel = 5;
      this.simControls.activePriorityReason = '🕹️ TIER 5: REMOTE MANUAL OVERRIDE — Pump running at 20 L/min.';
    } else {
      this.simControls.activePriorityLevel = 3;
      this.simControls.activePriorityReason = '🟢 TIER 3: AUTOMATED SAFETY STANDBY — Monitoring levels, flow, and temperature.';
    }
  }

  // Simulation tick (called every 1s)
  public tick() {
    if (!this.simControls.isRunning) return;

    const pump = this.pumps[0];
    const overhead = this.tanks.find((t) => t.id === 'tank-overhead-1')!;
    const source = this.tanks.find((t) => t.id === 'tank-source-1')!;
    const speed = this.simControls.speed;

    // Check schedules against current time
    this.evaluateSchedules();

    // IF PUMP IS ON: TANK MUST ACTUALLY AND VISIBLY FILL STEP-BY-STEP!
    if (pump.status === 'ON' && !this.simControls.isPowerOutage && !pump.isEmergencyStop && !pump.dryRunLocked) {
      pump.flowRateLpm = 20.0;
      pump.currentRuntimeSeconds += 1 * speed;
      pump.totalHoursRun += (speed / 3600);

      // In simulation mode, transfer water at a satisfying, observable rate:
      // (e.g., exactly 20 L per simulation tick step so user sees: 1200 -> 1220 -> 1240 -> 1260 -> 1280...)
      const stepLiters = 20 * speed;

      // Source tank decreases
      const actualTransfer = Math.min(stepLiters, source.currentLiters);
      source.currentLiters = Math.max(0, source.currentLiters - actualTransfer);
      source.currentLevelPct = (source.currentLiters / source.capacityLiters) * 100;
      source.flowRateLpm = 20.0;

      // Overhead tank increases
      overhead.currentLiters = Math.min(overhead.capacityLiters, overhead.currentLiters + actualTransfer);
      overhead.currentLevelPct = (overhead.currentLiters / overhead.capacityLiters) * 100;
      overhead.flowRateLpm = 20.0;

      pump.totalWaterTransferredLiters += actualTransfer;
      this.aiInsights.todayUsageLiters += Math.round(actualTransfer * 0.1); // Small fractional consumer activity
    } else {
      // PUMP IS OFF: Flow rate is strictly 0 L/min, and filling immediately stops!
      pump.flowRateLpm = 0;
      overhead.flowRateLpm = 0;
      source.flowRateLpm = 0;
      if (pump.status === 'OFF') {
        pump.currentRuntimeSeconds = 0;
      }
    }

    // Update tank statuses
    this.updateTankStatus(overhead);
    this.updateTankStatus(source);

    // Dynamic temperature
    if (overhead.temperatureCelsius !== null) {
      overhead.temperatureCelsius = +(27.2 + Math.sin(Date.now() / 60000) * 0.3).toFixed(1);
    }
    if (source.temperatureCelsius !== null) {
      source.temperatureCelsius = +(25.8 + Math.cos(Date.now() / 70000) * 0.2).toFixed(1);
    }

    // Run Safety & Priority Engine
    this.evaluateSafetyLogic();

    // AI Prediction: Time-to-Empty
    if (pump.status === 'ON') {
      this.aiInsights.overheadTimeToEmpty = 'Filling in progress';
    } else {
      const litersToLow = overhead.currentLiters - (overhead.capacityLiters * (overhead.lowThreshold / 100));
      if (litersToLow > 0) {
        // Assume nominal household drain rate of 3.5 L/min
        const minsRemaining = Math.round(litersToLow / 3.5);
        const hrs = Math.floor(minsRemaining / 60);
        const mins = minsRemaining % 60;
        this.aiInsights.overheadTimeToEmpty = `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
      } else {
        this.aiInsights.overheadTimeToEmpty = '< 15 mins (CRITICAL LOW)';
      }
    }

    overhead.lastUpdated = new Date().toISOString();
    source.lastUpdated = new Date().toISOString();

    this.notify();
  }

  private evaluateSchedules() {
    const pump = this.pumps[0];
    const now = new Date();
    const currentHourMin = now.toTimeString().substring(0, 5); // "HH:MM"

    for (const sched of this.schedules) {
      if (!sched.enabled) continue;

      if (sched.startTime === currentHourMin && sched.status === 'IDLE') {
        // Pre-flight check
        const source = this.tanks[1];
        const overhead = this.tanks[0];
        if (source.currentLevelPct > source.minSafeLevel && !pump.isEmergencyStop && overhead.currentLevelPct < overhead.fullThreshold) {
          sched.status = 'ACTIVE';
          pump.status = 'ON';
          pump.flowRateLpm = 20.0;
          this.recordPumpStart('Scheduled', sched.name);
          this.addAlert('SCHEDULE_START', `Pump Started: ${sched.name}`, `Scheduled operation commenced for ${sched.durationMinutes} minutes.`, 'INFO');
          this.addAuditLog(sched.name, 'SCHEDULE', 'SCHEDULE_START', `Pump started on schedule (${sched.durationMinutes}m)`, 'INFO');
        } else {
          sched.status = 'BLOCKED_BY_SAFETY';
          this.addAlert('SCHEDULE_BLOCKED', `Schedule Blocked: ${sched.name}`, `Pump could not start on schedule due to safety interlock (Source too low or tank full).`, 'WARNING');
        }
      }
    }
  }

  private updateTankStatus(tank: TankState) {
    if (tank.currentLevelPct <= 20) {
      tank.status = 'CRITICAL';
    } else if (tank.currentLevelPct <= 40) {
      tank.status = 'LOW';
    } else if (tank.currentLevelPct <= 80) {
      tank.status = 'NORMAL';
    } else if (tank.currentLevelPct < 95) {
      tank.status = 'HIGH';
    } else {
      tank.status = 'FULL';
    }
  }

  // Record Pump Start Event
  private recordPumpStart(reason: PumpHistoryEvent['reason'], initiatedBy: string) {
    this.currentPumpCycleStartTime = Date.now();
    this.currentPumpCycleStartLiters = this.tanks[0].currentLiters;

    const event: PumpHistoryEvent = {
      id: `hist-${Date.now()}`,
      pumpId: this.pumps[0].id,
      action: 'START',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      runtimeMinutes: 0,
      waterTransferredLiters: 0,
      reason,
      initiatedBy,
      timestamp: new Date().toISOString(),
    };
    this.pumpHistory.unshift(event);
    if (this.pumpHistory.length > 50) this.pumpHistory.pop();
  }

  // Record Pump Stop Event
  private recordPumpStop(reason: PumpHistoryEvent['reason'], initiatedBy: string) {
    const runtimeMs = this.currentPumpCycleStartTime ? Date.now() - this.currentPumpCycleStartTime : 0;
    const runtimeMins = Math.max(1, Math.round(runtimeMs / 60000));
    const transferred = Math.max(0, Math.round(this.tanks[0].currentLiters - this.currentPumpCycleStartLiters));

    const event: PumpHistoryEvent = {
      id: `hist-${Date.now()}`,
      pumpId: this.pumps[0].id,
      action: 'STOP',
      startTime: this.currentPumpCycleStartTime
        ? new Date(this.currentPumpCycleStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stopTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      runtimeMinutes: runtimeMins,
      waterTransferredLiters: transferred > 0 ? transferred : 20 * runtimeMins,
      reason,
      initiatedBy,
      timestamp: new Date().toISOString(),
    };
    this.pumpHistory.unshift(event);
    if (this.pumpHistory.length > 50) this.pumpHistory.pop();

    this.currentPumpCycleStartTime = null;
  }

  // Remote Manual Pump Control with pre-flight safety validation
  public setPumpState(pumpId: string, action: 'ON' | 'OFF', initiatedBy = 'Authorized User') {
    const pump = this.pumps.find((p) => p.id === pumpId);
    if (!pump) return { success: false, message: 'Pump not found.' };

    const overhead = this.tanks.find((t) => t.id === pump.destTankId)!;
    const source = this.tanks.find((t) => t.id === pump.sourceTankId)!;

    if (action === 'ON') {
      // PRE-FLIGHT SAFETY CHECKS (Section 10 Requirement)
      if (pump.isEmergencyStop) {
        return { success: false, message: 'Pump cannot start because Emergency Stop is active.' };
      }
      if (this.simControls.isPowerOutage) {
        return { success: false, message: 'Pump cannot start because power outage is active.' };
      }
      if (source.currentLevelPct <= source.minSafeLevel) {
        return { success: false, message: 'Pump cannot start because the source tank level is too low.' };
      }
      if (overhead.currentLevelPct >= overhead.fullThreshold) {
        return { success: false, message: 'Pump cannot start because the overhead tank is already full.' };
      }
      if (overhead.sensorHealth === 'FAULT' || this.simControls.faultInjected) {
        return { success: false, message: 'Pump cannot start because a sensor failure is detected.' };
      }

      pump.mode = 'MANUAL';
      pump.status = 'ON';
      pump.flowRateLpm = 20.0;
      this.recordPumpStart('Manual', initiatedBy);

      pump.lastCommand = {
        action: 'ON',
        status: 'CONFIRMED',
        initiatedBy,
        timestamp: new Date().toISOString(),
        reason: 'Manual remote ON command confirmed by IoT controller.'
      };
      this.addAuditLog(initiatedBy, 'USER', 'MANUAL_PUMP_ON', 'Turned pump ON manually via web dashboard (Flow: 20 L/min)', 'INFO');
      this.addAlert('MANUAL_PUMP_ON', 'Manual Pump Started', `${initiatedBy} turned Pump ON. Filling overhead tank.`, 'INFO');
    } else {
      if (pump.status === 'ON') {
        this.recordPumpStop('Manual', initiatedBy);
      }
      pump.status = 'OFF';
      pump.flowRateLpm = 0;
      pump.currentRuntimeSeconds = 0;
      overhead.flowRateLpm = 0;
      source.flowRateLpm = 0;

      pump.lastCommand = {
        action: 'OFF',
        status: 'CONFIRMED',
        initiatedBy,
        timestamp: new Date().toISOString(),
        reason: 'Manual remote OFF command executed. Tank filling halted.'
      };
      this.addAuditLog(initiatedBy, 'USER', 'MANUAL_PUMP_OFF', 'Turned pump OFF manually via web dashboard', 'INFO');
      this.addAlert('MANUAL_PUMP_OFF', 'Manual Pump Stopped', `${initiatedBy} turned Pump OFF. Filling stopped.`, 'INFO');
    }

    this.evaluateSafetyLogic();
    this.notify();
    return { success: true, message: `Pump ${action} command confirmed. Tank filling ${action === 'ON' ? 'started' : 'stopped'}.` };
  }

  // Emergency Stop Trigger
  public triggerEmergencyStop(initiatedBy = 'Operator') {
    const pump = this.pumps[0];
    if (pump.status === 'ON') {
      this.recordPumpStop('Emergency Stop', initiatedBy);
    }
    pump.isEmergencyStop = true;
    pump.status = 'LOCKED';
    pump.flowRateLpm = 0;
    pump.currentRuntimeSeconds = 0;

    this.addAlert('EMERGENCY_STOP_TRIGGERED', '🚨 EMERGENCY STOP ENGAGED', 'Immediate pump shutdown executed. All automated and manual pump starts locked.', 'CRITICAL');
    this.addAuditLog(initiatedBy, 'ADMIN', 'EMERGENCY_STOP_ACTIVATED', 'Global Emergency Stop button pressed. Pump hardware contactor opened.', 'SECURITY');

    this.evaluateSafetyLogic();
    this.notify();
  }

  // Reset Emergency Stop
  public resetEmergencyStop(initiatedBy = 'Lead Admin') {
    const pump = this.pumps[0];
    pump.isEmergencyStop = false;
    pump.status = 'OFF';
    pump.flowRateLpm = 0;

    this.addAlert('EMERGENCY_STOP_RESET', 'Emergency Stop Disengaged', 'System returned to safe standby. Normal automated control resumed.', 'INFO');
    this.addAuditLog(initiatedBy, 'ADMIN', 'EMERGENCY_STOP_RESET', 'Emergency Stop reset verified. System safety state restored.', 'SECURITY');

    this.evaluateSafetyLogic();
    this.notify();
  }

  // Toggle Mode (AUTO vs MANUAL)
  public setPumpMode(pumpId: string, mode: 'AUTO' | 'MANUAL', initiatedBy = 'Facility Manager') {
    const pump = this.pumps.find((p) => p.id === pumpId);
    if (!pump) return;
    pump.mode = mode;
    this.addAuditLog(initiatedBy, 'MANAGER', 'PUMP_MODE_CHANGE', `Pump control mode switched to ${mode}`, 'INFO');
    this.evaluateSafetyLogic();
    this.notify();
  }

  // Update Safety Thresholds & Tank Capacities
  public updateSafetySettings(settings: {
    lowThreshold?: number;
    fullThreshold?: number;
    minSafeLevel?: number;
    maxRuntime?: number;
    overheadCapacity?: number;
    sourceCapacity?: number;
  }, initiatedBy = 'Lead Admin') {
    const overhead = this.tanks[0];
    const source = this.tanks[1];
    const pump = this.pumps[0];

    if (settings.overheadCapacity && settings.overheadCapacity > 0) {
      overhead.capacityLiters = settings.overheadCapacity;
      overhead.currentLevelPct = (overhead.currentLiters / overhead.capacityLiters) * 100;
      this.updateTankStatus(overhead);
    }
    if (settings.sourceCapacity && settings.sourceCapacity > 0) {
      source.capacityLiters = settings.sourceCapacity;
      source.currentLevelPct = (source.currentLiters / source.capacityLiters) * 100;
      this.updateTankStatus(source);
    }
    if (settings.lowThreshold !== undefined) overhead.lowThreshold = settings.lowThreshold;
    if (settings.fullThreshold !== undefined) overhead.fullThreshold = settings.fullThreshold;
    if (settings.minSafeLevel !== undefined) source.minSafeLevel = settings.minSafeLevel;
    if (settings.maxRuntime !== undefined) pump.maxRuntimeMinutes = settings.maxRuntime;

    this.addAuditLog(initiatedBy, 'ADMIN', 'SAFETY_SETTINGS_UPDATED', `Settings: Low=${overhead.lowThreshold}%, Full=${overhead.fullThreshold}%, MinSource=${source.minSafeLevel}%, MaxRun=${pump.maxRuntimeMinutes}m, OverheadCap=${overhead.capacityLiters}L, SourceCap=${source.capacityLiters}L`, 'WARN');
    this.evaluateSafetyLogic();
    this.notify();
    return { success: true, message: 'Safety thresholds and tank capacities updated successfully.' };
  }

  // Add a pump schedule
  public addSchedule(schedule: Omit<PumpScheduleItem, 'id' | 'status' | 'nextRun'>) {
    const newItem: PumpScheduleItem = {
      id: `sched-${Date.now()}`,
      ...schedule,
      nextRun: `Configured for ${schedule.startTime}`,
      status: 'IDLE',
    };
    this.schedules.push(newItem);
    this.addAuditLog('Facility Manager', 'MANAGER', 'SCHEDULE_CREATED', `Created schedule: ${schedule.name} at ${schedule.startTime} (${schedule.durationMinutes}m)`, 'INFO');
    this.notify();
  }

  public toggleSchedule(id: string) {
    const s = this.schedules.find((item) => item.id === id);
    if (s) {
      s.enabled = !s.enabled;
      this.notify();
    }
  }

  public deleteSchedule(id: string) {
    this.schedules = this.schedules.filter((s) => s.id !== id);
    this.notify();
  }

  // Trigger Schedule manually for verification testing
  public testRunSchedule(id: string) {
    const s = this.schedules.find((item) => item.id === id);
    const pump = this.pumps[0];
    const source = this.tanks[1];
    const overhead = this.tanks[0];

    if (!s) return { success: false, message: 'Schedule not found' };
    if (source.currentLevelPct <= source.minSafeLevel) {
      return { success: false, message: 'Pump cannot start on schedule because the source tank level is too low.' };
    }
    if (overhead.currentLevelPct >= overhead.fullThreshold) {
      return { success: false, message: 'Pump cannot start on schedule because the overhead tank is already full.' };
    }
    if (pump.isEmergencyStop) {
      return { success: false, message: 'Pump cannot start on schedule because Emergency Stop is active.' };
    }

    s.status = 'ACTIVE';
    pump.status = 'ON';
    pump.flowRateLpm = 20.0;
    this.recordPumpStart('Scheduled', s.name);
    this.addAlert('SCHEDULE_START', `Scheduled Operation Started: ${s.name}`, `Pump started by schedule for ${s.durationMinutes} mins.`, 'INFO');
    this.notify();
    return { success: true, message: `Schedule ${s.name} triggered successfully.` };
  }

  // IoT Hardware Ingestion Endpoint Handler (ESP32/ESP8266)
  public ingestIoTReading(payload: {
    eventId: string;
    deviceId: string;
    tankId?: string;
    waterLevel: number;
    sourceLevel?: number;
    flowRate?: number;
    temperature?: number;
    pumpStatus?: boolean;
    timestamp?: string;
  }) {
    // 1. Idempotency check: prevent duplicate ingestion (Section 15, 31 Requirement)
    if (this.processedEventIds.has(payload.eventId)) {
      return { success: false, duplicate: true, message: `Duplicate event ID ${payload.eventId} rejected.` };
    }
    this.processedEventIds.add(payload.eventId);
    if (this.processedEventIds.size > 2000) {
      const first = this.processedEventIds.values().next().value;
      if (first) this.processedEventIds.delete(first);
    }

    // 2. Data Quality Validation (Section 24 Requirement)
    if (payload.waterLevel < 0 || payload.waterLevel > 100) {
      this.addAlert('DATA_QUALITY_ERROR', '⚠️ Sensor Data Out of Range Rejected', `Received water level: ${payload.waterLevel}%. Expected range: 0–100%. Reading rejected.`, 'WARNING');
      return { success: false, error: 'DATA_QUALITY_ERROR', message: `Invalid water level ${payload.waterLevel}%. Must be 0-100%.` };
    }

    // 3. Update device heartbeat
    const dev = this.devices.find((d) => d.deviceId === payload.deviceId);
    if (dev) {
      dev.lastHeartbeat = new Date().toISOString();
      dev.status = 'ONLINE';
    }

    // 4. Update overhead tank state
    const overhead = this.tanks[0];
    overhead.currentLevelPct = payload.waterLevel;
    overhead.currentLiters = (payload.waterLevel / 100) * overhead.capacityLiters;
    this.updateTankStatus(overhead);

    // Update source tank if present
    if (payload.sourceLevel !== undefined) {
      const source = this.tanks[1];
      source.currentLevelPct = payload.sourceLevel;
      source.currentLiters = (payload.sourceLevel / 100) * source.capacityLiters;
      this.updateTankStatus(source);
    }

    if (payload.flowRate !== undefined) {
      overhead.flowRateLpm = payload.flowRate;
    }
    if (payload.temperature !== undefined) {
      overhead.temperatureCelsius = payload.temperature;
    }

    this.evaluateSafetyLogic();
    this.notify();

    return {
      success: true,
      message: 'Telemetry processed and automation rules evaluated.',
      pumpState: this.pumps[0].status,
      emergencyStop: this.pumps[0].isEmergencyStop
    };
  }

  // Simulation Controls
  public toggleSimulation() {
    this.simControls.isRunning = !this.simControls.isRunning;
    this.notify();
  }

  public setSimulationSpeed(speed: number) {
    this.simControls.speed = speed;
    this.notify();
  }

  // Drain water (simulates household taps)
  public drainWater(liters: number) {
    const overhead = this.tanks[0];
    overhead.currentLiters = Math.max(0, overhead.currentLiters - liters);
    overhead.currentLevelPct = (overhead.currentLiters / overhead.capacityLiters) * 100;
    this.updateTankStatus(overhead);
    this.aiInsights.todayUsageLiters += liters;
    this.evaluateSafetyLogic();
    this.notify();
  }

  // Refill source sump (municipal supply or rainwater)
  public refillSource(liters: number) {
    const source = this.tanks[1];
    source.currentLiters = Math.min(source.capacityLiters, source.currentLiters + liters);
    source.currentLevelPct = (source.currentLiters / source.capacityLiters) * 100;
    this.updateTankStatus(source);
    this.evaluateSafetyLogic();
    this.notify();
  }

  // Drain source tank to test Dry-Run Protection
  public drainSource(liters: number) {
    const source = this.tanks[1];
    source.currentLiters = Math.max(0, source.currentLiters - liters);
    source.currentLevelPct = (source.currentLiters / source.capacityLiters) * 100;
    this.updateTankStatus(source);
    this.evaluateSafetyLogic();
    this.notify();
  }

  public toggleFaultInjection() {
    this.simControls.faultInjected = !this.simControls.faultInjected;
    const overhead = this.tanks[0];
    if (this.simControls.faultInjected) {
      overhead.sensorHealth = 'FAULT';
      this.addAlert('SENSOR_FAULT_INJECTED', '⚠️ Sensor Glitch Injected', 'Water level sensor reporting invalid readings (145%). Reading rejected.', 'WARNING');
    } else {
      overhead.sensorHealth = 'HEALTHY';
      this.addAlert('SENSOR_RESTORED', 'Sensor Health Restored', 'Sensor calibration verified. Normal telemetry resumed.', 'INFO');
    }
    this.evaluateSafetyLogic();
    this.notify();
  }

  public togglePowerOutage() {
    this.simControls.isPowerOutage = !this.simControls.isPowerOutage;
    const dev = this.devices[0];
    if (this.simControls.isPowerOutage) {
      dev.powerStatus = 'OUTAGE';
      this.pumps[0].status = 'OFF';
      this.pumps[0].flowRateLpm = 0;
      this.addAlert('POWER_FAILURE', '⚡ AC Mains Power Failure Detected', 'Pump powered down. IoT controller operating on battery backup.', 'CRITICAL');
      this.addAuditLog('SYSTEM', 'SYSTEM', 'POWER_FAIL', 'Grid power outage recorded.', 'WARN');
    } else {
      dev.powerStatus = 'AC_MAINS';
      this.addAlert('POWER_RESTORED', 'Electricity Restored', 'Grid power back online. Running pre-flight safety audit before resuming schedules.', 'INFO');
      this.addAuditLog('SYSTEM', 'SYSTEM', 'POWER_RESTORE', 'Mains power restored. Pump safely held in standby until level verification.', 'INFO');
    }
    this.evaluateSafetyLogic();
    this.notify();
  }

  public toggleInternetOffline() {
    this.simControls.isInternetOffline = !this.simControls.isInternetOffline;
    const dev = this.devices[0];
    dev.status = this.simControls.isInternetOffline ? 'OFFLINE' : 'ONLINE';
    if (this.simControls.isInternetOffline) {
      this.addAlert('DEVICE_OFFLINE', 'IoT Controller Offline', 'Cloud lost connection to ESP32. Controller continuing autonomous local safety mode.', 'WARNING');
    } else {
      this.addAlert('DEVICE_ONLINE', 'IoT Controller Reconnected', 'Cloud link re-established. Synchronized telemetry buffer without duplicate events.', 'INFO');
    }
    this.notify();
  }

  public resetSimulation() {
    const overhead = this.tanks[0];
    const source = this.tanks[1];
    overhead.capacityLiters = 2000;
    overhead.currentLiters = 1450;
    overhead.currentLevelPct = 72.5;
    overhead.flowRateLpm = 0;

    source.capacityLiters = 2000;
    source.currentLiters = 1200;
    source.currentLevelPct = 60.0;
    source.flowRateLpm = 0;

    this.pumps[0].status = 'OFF';
    this.pumps[0].flowRateLpm = 0;
    this.pumps[0].isEmergencyStop = false;
    this.pumps[0].dryRunLocked = false;
    this.simControls.isPowerOutage = false;
    this.simControls.isInternetOffline = false;
    this.simControls.faultInjected = false;
    this.updateTankStatus(overhead);
    this.updateTankStatus(source);
    this.evaluateSafetyLogic();
    this.notify();
  }

  public resolveAlert(id: string) {
    const a = this.alerts.find((alt) => alt.id === id);
    if (a) {
      a.isResolved = true;
      a.isRead = true;
      this.notify();
    }
  }

  public markAlertRead(id: string) {
    const a = this.alerts.find((alt) => alt.id === id);
    if (a) {
      a.isRead = true;
      this.notify();
    }
  }

  private addAlert(code: string, title: string, message: string, severity: 'CRITICAL' | 'WARNING' | 'INFO', recommendedAction?: string) {
    // Check if an identical active alert already exists to prevent duplicate spam
    const existing = this.alerts.find((a) => a.code === code && !a.isResolved);
    if (existing) return;

    const alert: AlertItem = {
      id: `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code,
      title,
      message,
      severity,
      isRead: false,
      isResolved: false,
      timestamp: new Date().toISOString(),
      recommendedAction,
    };
    this.alerts.unshift(alert);
    if (this.alerts.length > 50) this.alerts.pop();
  }

  public addAuditLog(actor: string, role: string, action: string, details: string, severity: 'INFO' | 'WARN' | 'SECURITY' = 'INFO') {
    const log: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actor,
      role,
      action,
      details,
      timestamp: new Date().toISOString(),
      severity,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
  }

  // Current system snapshot (Single Source of Truth)
  public getState() {
    return {
      tanks: this.tanks,
      pumps: this.pumps,
      pumpHistory: this.pumpHistory,
      schedules: this.schedules,
      alerts: this.alerts,
      devices: this.devices,
      auditLogs: this.auditLogs,
      aiInsights: this.aiInsights,
      simControls: this.simControls,
      hourlyHistory: this.hourlyHistory,
      systemTime: new Date().toISOString(),
    };
  }
}

// Global Singleton for in-memory persistence across Next.js API requests
const globalForWater = globalThis as unknown as {
  waterEngine?: WaterEngine;
  waterTickInterval?: ReturnType<typeof setInterval>;
};

export const waterEngine = globalForWater.waterEngine || new WaterEngine();

if (typeof process !== 'undefined' && (process as any).env && (process as any).env.NODE_ENV !== 'production') {
  globalForWater.waterEngine = waterEngine;
}

// Continuous physics simulation tick running every 1000ms
if (typeof setInterval !== 'undefined') {
  if (!globalForWater.waterTickInterval) {
    globalForWater.waterTickInterval = setInterval(() => {
      waterEngine.tick();
    }, 1000);
  }
}
