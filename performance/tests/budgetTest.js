/**
 * BUDGET MANAGEMENT PERFORMANCE TEST — Smart Budget
 * ==================================================
 * Test Cases:
 *   TC_BUD_001 — GET /budgets with valid auth
 *   TC_BUD_002 — POST /budgets create a new budget
 *   TC_BUD_003 — DELETE /budgets/:id delete a budget
 *   TC_BUD_004 — Budget upsert (same type overwrites previous)
 *   TC_BUD_005 — Budget operations without auth → 401
 *
 * Run: k6 run tests/budgetTest.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

import {
  BASE_URL,
  SEEDED_USER,
  JSON_HEADERS,
  authHeaders,
  LOAD_OPTIONS,
  SMOKE_OPTIONS,
  THRESHOLDS,
  sampleBudget,
  uniqueId,
} from '../k6-config.js';

// ---------------------------------------------------------------------------
// Custom Metrics
// ---------------------------------------------------------------------------
const budgetDuration  = new Trend('budget_op_ms', true);
const budgetErrorRate = new Rate('budget_error_rate');
const budgetOps       = new Counter('budget_ops_total');

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
const scenario = __ENV.SCENARIO || 'load';
export const options = scenario === 'smoke' ? {
  ...SMOKE_OPTIONS,
  thresholds: { ...THRESHOLDS, budget_op_ms: ['p(95)<1000'] },
} : {
  ...LOAD_OPTIONS,
  thresholds: { ...THRESHOLDS, budget_op_ms: ['p(95)<2000'] },
};

// ---------------------------------------------------------------------------
// Default Test Function
// ---------------------------------------------------------------------------
export default function () {
  const userId  = SEEDED_USER.userId;
  const headers = authHeaders(userId);

  // ─────────────────────────────────────────────
  // TC_BUD_001: GET /budgets with valid auth
  // ─────────────────────────────────────────────
  group('TC_BUD_001 — GET /budgets with valid auth', () => {
    const res = http.get(`${BASE_URL}/api/budgets`, { headers });

    budgetDuration.add(res.timings.duration);

    const passed = check(res, {
      '[TC_BUD_001] Status 200':          (r) => r.status === 200,
      '[TC_BUD_001] Response is array':   (r) => {
        try { return Array.isArray(JSON.parse(r.body)); } catch (_) { return false; }
      },
      '[TC_BUD_001] Response < 2000ms':   (r) => r.timings.duration < 2000,
    });

    budgetErrorRate.add(!passed);
    budgetOps.add(1);
    if (!passed) console.error(`[TC_BUD_001] FAIL: status=${res.status}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_BUD_002: POST /budgets create new budget
  // ─────────────────────────────────────────────
  let createdBudgetId = null;

  group('TC_BUD_002 — POST /budgets create budget', () => {
    const budget    = sampleBudget(userId);
    budget.type     = `test_type_${__VU}_${Date.now()}`; // unique type per VU
    createdBudgetId = budget.id;

    const res = http.post(
      `${BASE_URL}/api/budgets`,
      JSON.stringify(budget),
      { headers }
    );

    budgetDuration.add(res.timings.duration);

    const passed = check(res, {
      '[TC_BUD_002] Status 200':         (r) => r.status === 200,
      '[TC_BUD_002] Returns success':    (r) => {
        try { return JSON.parse(r.body).success === true; } catch (_) { return false; }
      },
      '[TC_BUD_002] Response < 2000ms':  (r) => r.timings.duration < 2000,
    });

    budgetErrorRate.add(!passed);
    budgetOps.add(1);
    if (!passed) console.error(`[TC_BUD_002] FAIL: status=${res.status} body=${res.body}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_BUD_003: DELETE /budgets/:id
  // ─────────────────────────────────────────────
  group('TC_BUD_003 — DELETE /budgets/:id', () => {
    if (!createdBudgetId) {
      console.warn('[TC_BUD_003] Skipped — no budget to delete');
      return;
    }

    const res = http.del(
      `${BASE_URL}/api/budgets/${createdBudgetId}`,
      null,
      { headers }
    );

    budgetDuration.add(res.timings.duration);

    const passed = check(res, {
      '[TC_BUD_003] Status 200':        (r) => r.status === 200,
      '[TC_BUD_003] Returns success':   (r) => {
        try { return JSON.parse(r.body).success === true; } catch (_) { return false; }
      },
      '[TC_BUD_003] Delete < 1500ms':   (r) => r.timings.duration < 1500,
    });

    budgetErrorRate.add(!passed);
    budgetOps.add(1);
    if (!passed) console.error(`[TC_BUD_003] FAIL: status=${res.status}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_BUD_004: Budget upsert (same type = overwrite)
  // The API deletes+inserts when type already exists
  // ─────────────────────────────────────────────
  group('TC_BUD_004 — Budget upsert (same type overwrites)', () => {
    const FIXED_TYPE = `monthly_${__VU}`; // per-VU fixed type

    // First insert
    const budget1 = {
      id:        uniqueId(),
      userId,
      type:      FIXED_TYPE,
      amount:    10000,
      createdAt: new Date().toISOString(),
    };
    const res1 = http.post(`${BASE_URL}/api/budgets`, JSON.stringify(budget1), { headers });

    // Second insert with same type → should overwrite
    const budget2 = {
      id:        uniqueId(),
      userId,
      type:      FIXED_TYPE,
      amount:    20000,
      createdAt: new Date().toISOString(),
    };
    const res2 = http.post(`${BASE_URL}/api/budgets`, JSON.stringify(budget2), { headers });

    // Fetch and verify only one budget of this type exists
    const listRes = http.get(`${BASE_URL}/api/budgets`, { headers });

    const passed = check(listRes, {
      '[TC_BUD_004] Upsert list status 200': (r) => r.status === 200,
      '[TC_BUD_004] Only one entry for type': (r) => {
        try {
          const list = JSON.parse(r.body);
          const matching = list.filter((b) => b.type === FIXED_TYPE);
          return matching.length <= 1;
        } catch (_) { return false; }
      },
      '[TC_BUD_004] Second insert succeeded': () => res2.status === 200,
    });

    budgetErrorRate.add(!passed);
    budgetOps.add(1);

    // Cleanup
    try {
      const list = JSON.parse(listRes.body);
      const entry = list.find((b) => b.type === FIXED_TYPE);
      if (entry) http.del(`${BASE_URL}/api/budgets/${entry.id}`, null, { headers });
    } catch (_) { /* ignore cleanup errors */ }

    if (!passed) console.error(`[TC_BUD_004] FAIL`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_BUD_005: Budget operations without auth → 401
  // ─────────────────────────────────────────────
  group('TC_BUD_005 — Budget operations without auth → 401', () => {
    const getRes  = http.get(`${BASE_URL}/api/budgets`, { headers: JSON_HEADERS });
    const postRes = http.post(
      `${BASE_URL}/api/budgets`,
      JSON.stringify(sampleBudget('invalid')),
      { headers: JSON_HEADERS }
    );

    const passed = check(getRes, {
      '[TC_BUD_005] GET without auth → 401':  (r) => r.status === 401,
    }) && check(postRes, {
      '[TC_BUD_005] POST without auth → 401': (r) => r.status === 401,
    });

    budgetErrorRate.add(!passed);
    if (!passed) {
      console.error(`[TC_BUD_005] FAIL: GET=${getRes.status} POST=${postRes.status}`);
    }
  });

  sleep(1);
}

// ---------------------------------------------------------------------------
// Custom Summary
// ---------------------------------------------------------------------------
export function handleSummary(data) {
  return {
    'reports/budget_summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
