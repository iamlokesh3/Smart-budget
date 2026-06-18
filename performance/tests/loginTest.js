/**
 * LOGIN PERFORMANCE TEST — Smart Budget
 * ======================================
 * Test Cases:
 *   TC_LOGIN_001 — Valid login with seeded user
 *   TC_LOGIN_002 — Login returns all required user fields
 *   TC_LOGIN_003 — Login with non-existent email → 404
 *   TC_LOGIN_004 — Login with empty email body → 404
 *   TC_LOGIN_005 — Response time P95 < 500 ms under load
 *   TC_LOGIN_006 — Multiple sequential logins (session simulation)
 *   TC_LOGIN_007 — SQL injection attempt is rejected gracefully
 *
 * Run: k6 run tests/loginTest.js
 * Run smoke: k6 run --env SCENARIO=smoke tests/loginTest.js
 */

import http  from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

import {
  BASE_URL,
  SEEDED_USER,
  JSON_HEADERS,
  SMOKE_OPTIONS,
  LOAD_OPTIONS,
  THRESHOLDS,
} from '../k6-config.js';

// ---------------------------------------------------------------------------
// Custom Metrics
// ---------------------------------------------------------------------------
const loginDuration   = new Trend('login_duration_ms',   true);
const loginErrors     = new Rate('login_error_rate');
const loginSuccesses  = new Counter('login_success_count');
const loginFailures   = new Counter('login_failure_count');

// ---------------------------------------------------------------------------
// Test Options — switch with: --env SCENARIO=smoke|load
// ---------------------------------------------------------------------------
const scenario = __ENV.SCENARIO || 'load';

export const options = scenario === 'smoke' ? {
  ...SMOKE_OPTIONS,
  thresholds: {
    ...THRESHOLDS,
    login_duration_ms: ['p(95)<500'],
    login_error_rate:  ['rate<0.01'],
  },
} : {
  ...LOAD_OPTIONS,
  thresholds: {
    ...THRESHOLDS,
    login_duration_ms: ['p(95)<800'],
    login_error_rate:  ['rate<0.05'],
  },
};

// ---------------------------------------------------------------------------
// Setup — called once before VUs start
// ---------------------------------------------------------------------------
export function setup() {
  console.log(`[LOGIN TEST] Base URL: ${BASE_URL} | Scenario: ${scenario}`);
  return { baseUrl: BASE_URL };
}

// ---------------------------------------------------------------------------
// Default Function — executed by each VU each iteration
// ---------------------------------------------------------------------------
export default function (data) {

  // ─────────────────────────────────────────────
  // TC_LOGIN_001 & TC_LOGIN_002:
  // Valid login — check status + response fields
  // ─────────────────────────────────────────────
  group('TC_LOGIN_001 — Valid login with seeded user', () => {
    const payload = JSON.stringify({ email: SEEDED_USER.email });
    const res     = http.post(`${data.baseUrl}/api/auth/login`, payload, { headers: JSON_HEADERS });

    loginDuration.add(res.timings.duration);

    const passed = check(res, {
      '[TC_LOGIN_001] Status is 200':         (r) => r.status === 200,
      '[TC_LOGIN_001] Response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    if (passed) {
      loginSuccesses.add(1);
      loginErrors.add(false);
    } else {
      loginFailures.add(1);
      loginErrors.add(true);
      console.error(`[TC_LOGIN_001] FAIL: status=${res.status} body=${res.body}`);
    }
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_LOGIN_002: Response has required user fields
  // ─────────────────────────────────────────────
  group('TC_LOGIN_002 — Response contains required user fields', () => {
    const payload = JSON.stringify({ email: SEEDED_USER.email });
    const res     = http.post(`${data.baseUrl}/api/auth/login`, payload, { headers: JSON_HEADERS });

    let body;
    try { body = JSON.parse(res.body); } catch (_) { body = {}; }

    const passed = check(res, {
      '[TC_LOGIN_002] Has user id':    () => body.id !== undefined,
      '[TC_LOGIN_002] Has user email': () => body.email !== undefined,
      '[TC_LOGIN_002] Has user name':  () => body.name !== undefined,
    });

    loginErrors.add(!passed);
    if (!passed) console.error(`[TC_LOGIN_002] FAIL: body=${res.body}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_LOGIN_003: Non-existent email → 404
  // ─────────────────────────────────────────────
  group('TC_LOGIN_003 — Login with non-existent email', () => {
    const payload = JSON.stringify({ email: `nouser_${Date.now()}@test.com` });
    const res     = http.post(`${data.baseUrl}/api/auth/login`, payload, { headers: JSON_HEADERS });

    const passed = check(res, {
      '[TC_LOGIN_003] Status is 404': (r) => r.status === 404,
    });

    // Failure here means the API returned something unexpected — log it
    if (!passed) console.error(`[TC_LOGIN_003] FAIL: status=${res.status}`);
    loginErrors.add(!passed);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_LOGIN_004: Empty email body → handled gracefully
  // ─────────────────────────────────────────────
  group('TC_LOGIN_004 — Login with empty email body', () => {
    const payload = JSON.stringify({ email: '' });
    const res     = http.post(`${data.baseUrl}/api/auth/login`, payload, { headers: JSON_HEADERS });

    const passed = check(res, {
      '[TC_LOGIN_004] Returns error (4xx)': (r) => r.status >= 400 && r.status < 500,
      '[TC_LOGIN_004] No 500 server crash':  (r) => r.status !== 500,
    });

    loginErrors.add(!passed);
    if (!passed) console.error(`[TC_LOGIN_004] FAIL: status=${res.status}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_LOGIN_005: Response time under 500 ms
  // ─────────────────────────────────────────────
  group('TC_LOGIN_005 — Response time P95 < 500 ms', () => {
    const start   = Date.now();
    const payload = JSON.stringify({ email: SEEDED_USER.email });
    const res     = http.post(`${data.baseUrl}/api/auth/login`, payload, { headers: JSON_HEADERS });
    const elapsed = Date.now() - start;

    loginDuration.add(elapsed);

    const passed = check(res, {
      '[TC_LOGIN_005] Response within 500ms': () => elapsed < 500,
      '[TC_LOGIN_005] Status 200':            (r) => r.status === 200,
    });

    loginErrors.add(!passed);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_LOGIN_006: Sequential logins (session sim)
  // ─────────────────────────────────────────────
  group('TC_LOGIN_006 — Multiple sequential logins', () => {
    let allPassed = true;
    for (let i = 0; i < 3; i++) {
      const payload = JSON.stringify({ email: SEEDED_USER.email });
      const res     = http.post(`${data.baseUrl}/api/auth/login`, payload, { headers: JSON_HEADERS });
      loginDuration.add(res.timings.duration);

      const ok = check(res, {
        [`[TC_LOGIN_006] Sequential login ${i + 1} status 200`]: (r) => r.status === 200,
      });
      if (!ok) { allPassed = false; }
      sleep(0.1);
    }
    loginErrors.add(!allPassed);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_LOGIN_007: SQL injection → no 500 crash
  // ─────────────────────────────────────────────
  group('TC_LOGIN_007 — SQL injection attempt', () => {
    const injections = [
      "' OR '1'='1",
      "admin'--",
      "'; DROP TABLE users;--",
    ];
    const payload = JSON.stringify({ email: injections[Math.floor(Math.random() * injections.length)] });
    const res     = http.post(`${data.baseUrl}/api/auth/login`, payload, { headers: JSON_HEADERS });

    const passed = check(res, {
      '[TC_LOGIN_007] No 500 on SQL injection': (r) => r.status !== 500,
      '[TC_LOGIN_007] Returns error or empty':  (r) => r.status === 404 || r.status === 400,
    });

    loginErrors.add(!passed);
    if (!passed) console.error(`[TC_LOGIN_007] FAIL: status=${res.status}`);
  });

  sleep(1);
}

// ---------------------------------------------------------------------------
// Teardown — called once after all VUs finish
// ---------------------------------------------------------------------------
export function teardown() {
  console.log('[LOGIN TEST] Complete. Check reports/login_summary.json');
}

// ---------------------------------------------------------------------------
// Custom Summary — write JSON for the report generator
// ---------------------------------------------------------------------------
export function handleSummary(data) {
  return {
    'reports/login_summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
