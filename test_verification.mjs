// Automated verification script for AquaGuard AI
// Tests 2000L default, step-by-step filling, flow rate, auto-start, auto-cutoff, dry-run lock, and capacity updates.

const BASE_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('🧪 Starting AquaGuard AI Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 0. Reset Simulation
    console.log('--- Step 0: Reset System State ---');
    await fetch(`${BASE_URL}/api/simulation/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESET' }),
    });
    await sleep(500);

    // 1. Check Initial State & 2000 Litres Default
    console.log('\n--- Step 1: Verify 2000L Default Capacities ---');
    const res1 = await fetch(`${BASE_URL}/api/iot/state`);
    const state1 = await res1.json();
    const overhead1 = state1.tanks[0];
    const source1 = state1.tanks[1];
    const pump1 = state1.pumps[0];

    assert(overhead1.capacityLiters === 2000, `Overhead tank capacity is 2000 L (found: ${overhead1.capacityLiters} L)`);
    assert(source1.capacityLiters === 2000, `Source tank capacity is 2000 L (found: ${source1.capacityLiters} L)`);
    assert(pump1.status === 'OFF', `Initial pump status is OFF (found: ${pump1.status})`);
    assert(pump1.flowRateLpm === 0, `Initial pump flow rate is 0 L/min (found: ${pump1.flowRateLpm} L/min)`);

    // 2. Manual Pump ON -> Test 20 L/tick step-by-step filling and 20 L/min flow rate
    console.log('\n--- Step 2: Test Manual Pump ON & Real-Time Step Filling ---');
    const startLiters = overhead1.currentLiters;
    const startSourceLiters = source1.currentLiters;

    const onRes = await fetch(`${BASE_URL}/api/pumps/pump-alpha-1/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ON', initiatedBy: 'Verification Test' }),
    });
    const onData = await onRes.json();
    assert(onData.success === true, `Manual pump ON command accepted (${onData.message || ''})`);

    // Wait 2.2 seconds (approx 2 ticks = +40 L)
    console.log('Waiting 2.2 seconds to observe live filling physics...');
    await sleep(2200);

    const res2 = await fetch(`${BASE_URL}/api/iot/state`);
    const state2 = await res2.json();
    const overhead2 = state2.tanks[0];
    const source2 = state2.tanks[1];
    const pump2 = state2.pumps[0];

    assert(pump2.status === 'ON', `Pump status is ON (found: ${pump2.status})`);
    assert(pump2.flowRateLpm === 20, `Pump flow rate is exactly 20 L/min when ON (found: ${pump2.flowRateLpm} L/min)`);
    assert(overhead2.currentLiters > startLiters, `Overhead level increased: ${startLiters.toFixed(1)} L -> ${overhead2.currentLiters.toFixed(1)} L (+${(overhead2.currentLiters - startLiters).toFixed(1)} L)`);
    assert(source2.currentLiters < startSourceLiters, `Source level decreased: ${startSourceLiters.toFixed(1)} L -> ${source2.currentLiters.toFixed(1)} L`);

    // 3. Manual Pump OFF -> Test Immediate Stop and 0 L/min
    console.log('\n--- Step 3: Test Manual Pump OFF & Immediate Flow Halting ---');
    const offRes = await fetch(`${BASE_URL}/api/pumps/pump-alpha-1/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'OFF', initiatedBy: 'Verification Test' }),
    });
    const offData = await offRes.json();
    assert(offData.success === true, `Manual pump OFF command accepted (${offData.message || ''})`);

    await sleep(500);
    const res3a = await fetch(`${BASE_URL}/api/iot/state`);
    const state3a = await res3a.json();
    const frozenLiters = state3a.tanks[0].currentLiters;
    const pump3a = state3a.pumps[0];

    assert(pump3a.status === 'OFF', `Pump status is OFF (found: ${pump3a.status})`);
    assert(pump3a.flowRateLpm === 0, `Pump flow rate immediately drops to 0 L/min (found: ${pump3a.flowRateLpm} L/min)`);

    console.log('Waiting 1.5 seconds to ensure level remains fixed when OFF...');
    await sleep(1500);
    const res3b = await fetch(`${BASE_URL}/api/iot/state`);
    const state3b = await res3b.json();
    assert(Math.abs(state3b.tanks[0].currentLiters - frozenLiters) < 0.5, `Overhead tank level stopped completely at ${state3b.tanks[0].currentLiters.toFixed(1)} L`);

    // 4. Test Real Automatic Control: Low Level (<= 30% / 600 L) Auto-Starts Pump
    console.log('\n--- Step 4: Test Auto-Start on Low Tank (<= 30% / 600 L) ---');
    // Ensure pump is in AUTO mode
    await fetch(`${BASE_URL}/api/pumps/pump-alpha-1/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'AUTO' }),
    });

    // Drain overhead water to 500 L (25%)
    const drainAmount = state3b.tanks[0].currentLiters - 500;
    await fetch(`${BASE_URL}/api/simulation/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DRAIN_WATER', liters: drainAmount }),
    });
    await sleep(1000);

    const res4 = await fetch(`${BASE_URL}/api/iot/state`);
    const state4 = await res4.json();
    const overhead4 = state4.tanks[0];
    const pump4 = state4.pumps[0];

    assert(overhead4.currentLiters <= 600, `Overhead level dropped below 30% threshold (${overhead4.currentLiters.toFixed(1)} L / ${overhead4.currentLevelPct.toFixed(1)}%)`);
    assert(pump4.status === 'ON', `Automation automatically started pump on low water level (status: ${pump4.status})`);

    // 5. Test Dry-Run Protection: Source Tank <= 20% (400 L)
    console.log('\n--- Step 5: Test Dry-Run Protection (Source Tank <= 20% / 400 L) ---');
    // Drain source sump below 400 L
    await fetch(`${BASE_URL}/api/simulation/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DRAIN_SOURCE', liters: 1500 }),
    });
    await sleep(1000);

    const res5 = await fetch(`${BASE_URL}/api/iot/state`);
    const state5 = await res5.json();
    const source5 = state5.tanks[1];
    const pump5 = state5.pumps[0];

    assert(source5.currentLiters <= 400, `Source level dropped below 20% dry-run limit (${source5.currentLiters.toFixed(1)} L / ${source5.currentLevelPct.toFixed(1)}%)`);
    assert(pump5.status !== 'ON', `Dry-run protection forced pump OFF (status: ${pump5.status})`);
    assert(pump5.dryRunLocked === true, `Pump dry-run lock is ACTIVE (dryRunLocked: ${pump5.dryRunLocked})`);

    // Attempt manual start while dry-run locked: must be rejected
    const rejectRes = await fetch(`${BASE_URL}/api/pumps/pump-alpha-1/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ON' }),
    });
    const rejectData = await rejectRes.json();
    assert(rejectRes.status === 400 || rejectData.error !== undefined, `Manual start correctly rejected with safety reason (${rejectData.error || rejectData.message})`);

    // 6. Test Tank Full Automatic Cutoff (>= 95% / 1900 L)
    console.log('\n--- Step 6: Test Auto-Stop on Tank Full (>= 95% / 1900 L) ---');
    // Set overhead tank to 1880 L and turn pump ON
    await fetch(`${BASE_URL}/api/iot/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: `test-full-${Date.now()}`,
        deviceId: 'AQUA-IOT-001',
        waterLevel: 94.5, // 1890 L
        sourceLevel: 80,
        flowRate: 20,
      }),
    });
    // Turn pump ON in AUTO mode
    await fetch(`${BASE_URL}/api/pumps/pump-alpha-1/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'AUTO', action: 'ON' }),
    });
    await sleep(1500); // 1 tick: 1890 + 20 = 1910 L (>= 95% / 1900 L)

    const res6 = await fetch(`${BASE_URL}/api/iot/state`);
    const state6 = await res6.json();
    const overhead6 = state6.tanks[0];
    const pump6 = state6.pumps[0];

    assert(overhead6.currentLevelPct >= 95, `Overhead tank reached full threshold: ${overhead6.currentLevelPct.toFixed(1)}% (${Math.round(overhead6.currentLiters)} L)`);
    assert(pump6.status === 'OFF', `Pump automatically stopped upon reaching 95% full (status: ${pump6.status})`);
    assert(pump6.flowRateLpm === 0, `Flow rate returned to 0 L/min (flowRate: ${pump6.flowRateLpm})`);

    // 7. Test Emergency Stop (Tier 1 Priority)
    console.log('\n--- Step 7: Test Emergency Stop (Tier 1 Priority) ---');
    await fetch(`${BASE_URL}/api/safety/emergency-stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TRIGGER', initiatedBy: 'Emergency Test' }),
    });

    const res7 = await fetch(`${BASE_URL}/api/iot/state`);
    const state7 = await res7.json();
    assert(state7.pumps[0].isEmergencyStop === true, `Emergency Stop flag active (isEmergencyStop: ${state7.pumps[0].isEmergencyStop})`);
    assert(state7.pumps[0].status === 'LOCKED', `Pump status physically locked (status: ${state7.pumps[0].status})`);

    // Attempt start during E-Stop: must be rejected
    const estopReject = await fetch(`${BASE_URL}/api/pumps/pump-alpha-1/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ON' }),
    });
    const estopData = await estopReject.json();
    assert(estopReject.status === 400 || !estopData.success, `Manual ON command rejected during E-Stop (${estopData.message || estopData.error})`);

    // Reset E-Stop
    await fetch(`${BASE_URL}/api/safety/emergency-stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESET', initiatedBy: 'Lead Admin' }),
    });
    const res7b = await fetch(`${BASE_URL}/api/iot/state`);
    const state7b = await res7b.json();
    assert(state7b.pumps[0].isEmergencyStop === false, 'Emergency Stop reset verified');

    // 8. Test Settings & Configurable Capacity
    console.log('\n--- Step 8: Test User-Configurable Capacity in Settings ---');
    const settingsRes = await fetch(`${BASE_URL}/api/safety/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        overheadCapacity: 2000,
        sourceCapacity: 2000,
        lowThreshold: 30,
        fullThreshold: 95,
        minSafeLevel: 20,
        maxRuntime: 45,
      }),
    });
    const settingsData = await settingsRes.json();
    assert(settingsData.success === true, `Settings update endpoint accepted config (${settingsData.message})`);

    // Reset back to clean demo state
    await fetch(`${BASE_URL}/api/simulation/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESET' }),
    });

    console.log('\n===========================================');
    console.log(`📊 Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('===========================================');
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error running verification tests:', err);
    process.exit(1);
  }
}

runTests();
