/**
 * REGISTRATION PERFORMANCE TEST — Smart Budget
 * =============================================
 * Test Cases:
 *   TC_REG_001 — Valid new user registration succeeds
 *   TC_REG_002 — Duplicate email returns 400
 *   TC_REG_003 — Missing required fields returns error
 *   TC_REG_004 — Registration response time < 1000 ms
 *   TC_REG_005 — Name with special characters registers OK
 *   TC_REG_006 — Concurrent registrations don't cause race conditions
 *
 * Run: k6 run tests/registrationTest.js
 * Run smoke: k6 run --env SCENARIO=smoke tests/registrationTest.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

import {
  BASE_URL,
  JSON_HEADERS,
  SMOKE_OPTIONS,
  LOAD_OPTIONS,
  THRESHOLDS,
  uniqueId,
} from '../k6-config.js';

// ---------------------------------------------------------------------------
// Custom Metrics
// ---------------------------------------------------------------------------
const regDuration  = new Trend('registration_duration_ms', true);
const regErrors    = new Rate('registration_error_rate');
const regSuccesses = new Counter('registration_success_count');

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
const scenario = __ENV.SCENARIO || 'load';

export const options = scenario === 'smoke' ? {
  ...SMOKE_OPTIONS,
  thresholds: { ...THRESHOLDS, registration_duration_ms: ['p(95)<1000'] },
} : {
  ...LOAD_OPTIONS,
  thresholds: { ...THRESHOLDS, registration_duration_ms: ['p(95)<1500'] },
};

// ---------------------------------------------------------------------------
// Default Test Function
// ---------------------------------------------------------------------------
export default function () {
  const vuId = __VU;        // virtual user number (unique per VU)
  const iter = __ITER;      // iteration count

  // ─────────────────────────────────────────────
  // TC_REG_001: Valid new user registration
  // Each VU registers a unique email to avoid conflicts
  // ─────────────────────────────────────────────
  group('TC_REG_001 — Valid new user registration', () => {
    const newUser = {
      id:       uniqueId(),
      name:     `Test User ${vuId}_${iter}`,
      email:    `perf_${vuId}_${iter}_${uniqueId()}@loadtest.com`,
      joinedAt: new Date().toISOString(),
    };

    const res = http.post(
      `${BASE_URL}/api/auth/register`,
      JSON.stringify(newUser),
      { headers: JSON_HEADERS }
    );

    regDuration.add(res.timings.duration);

    const passed = check(res, {
      '[TC_REG_001] Status 200':         (r) => r.status === 200,
      '[TC_REG_001] Returns success:true': (r) => {
        try { return JSON.parse(r.body).success === true; } catch (_) { return false; }
      },
    });

    if (passed) {
      regSuccesses.add(1);
      regErrors.add(false);
    } else {
      regErrors.add(true);
      console.error(`[TC_REG_001] FAIL: status=${res.status} body=${res.body}`);
    }
  });

  sleep(0.5);

  // ─────────────────────────────────────────────
  // TC_REG_002: Duplicate email → 400
  // ─────────────────────────────────────────────
  group('TC_REG_002 — Duplicate email returns 400', () => {
    const duplicateUser = {
      id:       uniqueId(),
      name:     'Lokesh Duplicate',
      email:    'lokeshmk436@gmail.com', // always exists (seeded)
      joinedAt: new Date().toISOString(),
    };

    const res = http.post(
      `${BASE_URL}/api/auth/register`,
      JSON.stringify(duplicateUser),
      { headers: JSON_HEADERS }
    );

    const passed = check(res, {
      '[TC_REG_002] Status 400 for duplicate': (r) => r.status === 400,
      '[TC_REG_002] Error message present':    (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.error !== undefined;
        } catch (_) { return false; }
      },
    });

    regErrors.add(!passed);
    if (!passed) console.error(`[TC_REG_002] FAIL: status=${res.status}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_REG_003: Missing required fields
  // ─────────────────────────────────────────────
  group('TC_REG_003 — Missing required fields handled gracefully', () => {
    // Send only partial payload (no email)
    const partialUser = {
      id:   uniqueId(),
      name: 'Missing Email User',
      // email intentionally omitted
      joinedAt: new Date().toISOString(),
    };

    const res = http.post(
      `${BASE_URL}/api/auth/register`,
      JSON.stringify(partialUser),
      { headers: JSON_HEADERS }
    );

    const passed = check(res, {
      '[TC_REG_003] No 500 crash on missing fields': (r) => r.status !== 500,
      '[TC_REG_003] Response is valid JSON':          (r) => {
        try { JSON.parse(r.body); return true; } catch (_) { return false; }
      },
    });

    regErrors.add(!passed);
    if (!passed) console.error(`[TC_REG_003] FAIL: status=${res.status}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_REG_004: Registration response time < 1000 ms
  // ─────────────────────────────────────────────
  group('TC_REG_004 — Registration response time', () => {
    const newUser = {
      id:       uniqueId(),
      name:     `SpeedTest User ${vuId}`,
      email:    `speed_${vuId}_${Date.now()}@loadtest.com`,
      joinedAt: new Date().toISOString(),
    };

    const start = Date.now();
    const res   = http.post(
      `${BASE_URL}/api/auth/register`,
      JSON.stringify(newUser),
      { headers: JSON_HEADERS }
    );
    const elapsed = Date.now() - start;

    regDuration.add(elapsed);

    const passed = check(res, {
      '[TC_REG_004] Response within 1000ms': () => elapsed < 1000,
      '[TC_REG_004] Status 200':             (r) => r.status === 200,
    });

    regErrors.add(!passed);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_REG_005: Name with special characters
  // ─────────────────────────────────────────────
  group('TC_REG_005 — Special characters in name', () => {
    const specialNames = [
      'Rénée Müller',
      'José García',
      'Zhang Wei 张伟',
      "O'Brien Patrick",
    ];
    const name = specialNames[Math.floor(Math.random() * specialNames.length)];

    const specialUser = {
      id:       uniqueId(),
      name,
      email:    `special_${vuId}_${Date.now()}@loadtest.com`,
      joinedAt: new Date().toISOString(),
    };

    const res = http.post(
      `${BASE_URL}/api/auth/register`,
      JSON.stringify(specialUser),
      { headers: JSON_HEADERS }
    );

    const passed = check(res, {
      '[TC_REG_005] Status 200 with special name': (r) => r.status === 200,
      '[TC_REG_005] No encoding errors':           (r) => r.status !== 400,
    });

    regErrors.add(!passed);
    if (!passed) console.error(`[TC_REG_005] FAIL name="${name}" status=${res.status}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_REG_006: Concurrent registrations
  // Fires 3 parallel requests to check race conditions
  // ─────────────────────────────────────────────
  group('TC_REG_006 — Concurrent registrations', () => {
    const requests = [0, 1, 2].map((n) => ({
      method: 'POST',
      url:    `${BASE_URL}/api/auth/register`,
      body:   JSON.stringify({
        id:       uniqueId(),
        name:     `Concurrent User ${vuId}_${n}`,
        email:    `concurrent_${vuId}_${n}_${Date.now()}@loadtest.com`,
        joinedAt: new Date().toISOString(),
      }),
      params: { headers: JSON_HEADERS },
    }));

    const responses = http.batch(requests);

    let allPassed = true;
    responses.forEach((res, idx) => {
      const ok = check(res, {
        [`[TC_REG_006] Concurrent req ${idx + 1} status 200`]: (r) => r.status === 200,
      });
      if (!ok) { allPassed = false; }
    });

    regErrors.add(!allPassed);
  });

  sleep(1);
}

// ---------------------------------------------------------------------------
// Custom Summary
// ---------------------------------------------------------------------------
export function handleSummary(data) {
  return {
    'reports/registration_summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
