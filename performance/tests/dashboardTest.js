/**
 * DASHBOARD PERFORMANCE TEST — Smart Budget
 * ==========================================
 * Test Cases:
 *   TC_DASH_001 — Get transactions with valid auth header
 *   TC_DASH_002 — Get transactions without auth → 401
 *   TC_DASH_003 — Transaction list response is a JSON array
 *   TC_DASH_004 — Dashboard (transactions + budgets + goals) loads < 1500 ms
 *   TC_DASH_005 — Get goals with valid auth
 *   TC_DASH_006 — Get budgets with valid auth
 *
 * Run: k6 run tests/dashboardTest.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

import {
  BASE_URL,
  SEEDED_USER,
  JSON_HEADERS,
  authHeaders,
  LOAD_OPTIONS,
  SMOKE_OPTIONS,
  THRESHOLDS,
} from '../k6-config.js';

// ---------------------------------------------------------------------------
// Custom Metrics
// ---------------------------------------------------------------------------
const dashDuration   = new Trend('dashboard_load_ms', true);
const dashErrorRate  = new Rate('dashboard_error_rate');
const txDuration     = new Trend('transactions_fetch_ms', true);

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
const scenario = __ENV.SCENARIO || 'load';
export const options = scenario === 'smoke' ? {
  ...SMOKE_OPTIONS,
  thresholds: { ...THRESHOLDS, dashboard_load_ms: ['p(95)<1500'] },
} : {
  ...LOAD_OPTIONS,
  thresholds: { ...THRESHOLDS, dashboard_load_ms: ['p(95)<2000'] },
};

// ---------------------------------------------------------------------------
// Default Test Function
// ---------------------------------------------------------------------------
export default function () {
  const userId  = SEEDED_USER.userId;
  const headers = authHeaders(userId);

  // ─────────────────────────────────────────────
  // TC_DASH_001: Get transactions with valid auth
  // ─────────────────────────────────────────────
  group('TC_DASH_001 — GET /transactions with valid auth', () => {
    const res = http.get(`${BASE_URL}/api/transactions`, { headers });

    txDuration.add(res.timings.duration);

    const passed = check(res, {
      '[TC_DASH_001] Status 200':              (r) => r.status === 200,
      '[TC_DASH_001] Response time < 2000ms':  (r) => r.timings.duration < 2000,
      '[TC_DASH_001] Has Content-Type header': (r) => r.headers['Content-Type'] !== undefined,
    });

    dashErrorRate.add(!passed);
    if (!passed) console.error(`[TC_DASH_001] FAIL: status=${res.status}`);
  });

  sleep(0.5);

  // ─────────────────────────────────────────────
  // TC_DASH_002: Without auth header → 401
  // ─────────────────────────────────────────────
  group('TC_DASH_002 — GET /transactions without auth → 401', () => {
    const res = http.get(`${BASE_URL}/api/transactions`, {
      headers: { 'Content-Type': 'application/json' }, // no x-user-id
    });

    const passed = check(res, {
      '[TC_DASH_002] Status 401': (r) => r.status === 401,
    });

    dashErrorRate.add(!passed);
    if (!passed) console.error(`[TC_DASH_002] FAIL: expected 401 got ${res.status}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_DASH_003: Response body is a JSON array
  // ─────────────────────────────────────────────
  group('TC_DASH_003 — Transaction list is a valid JSON array', () => {
    const res = http.get(`${BASE_URL}/api/transactions`, { headers });

    const passed = check(res, {
      '[TC_DASH_003] Body is JSON array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch (_) { return false; }
      },
    });

    dashErrorRate.add(!passed);
    if (!passed) console.error(`[TC_DASH_003] FAIL: body=${res.body.substring(0, 100)}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_DASH_004: Full dashboard parallel load
  // Simulates React app loading all three endpoints
  // ─────────────────────────────────────────────
  group('TC_DASH_004 — Full dashboard parallel load < 1500ms', () => {
    const start = Date.now();

    const responses = http.batch([
      { method: 'GET', url: `${BASE_URL}/api/transactions`, params: { headers } },
      { method: 'GET', url: `${BASE_URL}/api/budgets`,      params: { headers } },
      { method: 'GET', url: `${BASE_URL}/api/goals`,        params: { headers } },
    ]);

    const elapsed = Date.now() - start;
    dashDuration.add(elapsed);

    const [txRes, budgetRes, goalRes] = responses;

    const passed = check(txRes, {
      '[TC_DASH_004] Transactions OK':     (r) => r.status === 200,
      '[TC_DASH_004] Dashboard load<1500': () => elapsed < 1500,
    }) && check(budgetRes, {
      '[TC_DASH_004] Budgets OK': (r) => r.status === 200,
    }) && check(goalRes, {
      '[TC_DASH_004] Goals OK':   (r) => r.status === 200,
    });

    dashErrorRate.add(!passed);
    if (!passed) {
      console.error(`[TC_DASH_004] FAIL: elapsed=${elapsed}ms ` +
        `tx=${txRes.status} budget=${budgetRes.status} goal=${goalRes.status}`);
    }
  });

  sleep(0.5);

  // ─────────────────────────────────────────────
  // TC_DASH_005: Get goals with valid auth
  // ─────────────────────────────────────────────
  group('TC_DASH_005 — GET /goals with valid auth', () => {
    const res = http.get(`${BASE_URL}/api/goals`, { headers });

    const passed = check(res, {
      '[TC_DASH_005] Status 200':          (r) => r.status === 200,
      '[TC_DASH_005] Body is JSON array':  (r) => {
        try { return Array.isArray(JSON.parse(r.body)); } catch (_) { return false; }
      },
      '[TC_DASH_005] Response < 2000ms':  (r) => r.timings.duration < 2000,
    });

    dashErrorRate.add(!passed);
    if (!passed) console.error(`[TC_DASH_005] FAIL: status=${res.status}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_DASH_006: Get budgets with valid auth
  // ─────────────────────────────────────────────
  group('TC_DASH_006 — GET /budgets with valid auth', () => {
    const res = http.get(`${BASE_URL}/api/budgets`, { headers });

    const passed = check(res, {
      '[TC_DASH_006] Status 200':         (r) => r.status === 200,
      '[TC_DASH_006] Body is JSON array': (r) => {
        try { return Array.isArray(JSON.parse(r.body)); } catch (_) { return false; }
      },
      '[TC_DASH_006] Response < 2000ms': (r) => r.timings.duration < 2000,
    });

    dashErrorRate.add(!passed);
    if (!passed) console.error(`[TC_DASH_006] FAIL: status=${res.status}`);
  });

  sleep(1);
}

// ---------------------------------------------------------------------------
// Custom Summary
// ---------------------------------------------------------------------------
export function handleSummary(data) {
  return {
    'reports/dashboard_summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
