/**
 * FULL LOAD TEST — Smart Budget
 * ==============================
 * Complete performance test covering all APIs with ramp-up/ramp-down stages:
 *   Stage 1: 0 → 100 users (1 min ramp-up)
 *   Stage 2: 100 users held (2 min)
 *   Stage 3: 100 → 300 users (1 min ramp-up)
 *   Stage 4: 300 users held (2 min)
 *   Stage 5: 300 → 500 users (1 min ramp-up)
 *   Stage 6: 500 users held (2 min)
 *   Stage 7: 500 → 1000 users spike (1 min)
 *   Stage 8: 1000 users held (2 min)
 *   Stage 9: 1000 → 0 ramp-down (2 min)
 *
 * Scenarios: smoke | load | stress | spike | full (default)
 * Run: k6 run --out csv=reports/results.csv tests/fullLoadTest.js
 * Run smoke: k6 run --env SCENARIO=smoke --out csv=reports/results.csv tests/fullLoadTest.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

import {
  BASE_URL,
  SEEDED_USER,
  JSON_HEADERS,
  authHeaders,
  FULL_RAMP_STAGES,
  SMOKE_OPTIONS,
  LOAD_OPTIONS,
  STRESS_OPTIONS,
  SPIKE_OPTIONS,
  sampleExpense,
  sampleBudget,
  sampleGoal,
  uniqueId,
} from '../k6-config.js';

// ============================================================================
// CUSTOM METRICS
// ============================================================================
const responseDuration  = new Trend('all_api_response_ms', true);
const globalErrorRate   = new Rate('global_error_rate');
const totalRequests     = new Counter('total_requests');
const successfulReqs    = new Counter('successful_requests');
const failedReqs        = new Counter('failed_requests');
const loginLatency      = new Trend('login_latency_ms',       true);
const transactionLatency= new Trend('transaction_latency_ms', true);
const budgetLatency     = new Trend('budget_latency_ms',      true);
const goalLatency       = new Trend('goal_latency_ms',        true);
const aiLatency         = new Trend('ai_latency_ms',          true);
const activeUsers       = new Gauge('active_users_gauge');

// ============================================================================
// OPTIONS — switch with: --env SCENARIO=smoke|load|stress|spike|full
// ============================================================================
const SCENARIO = __ENV.SCENARIO || 'full';

const SCENARIO_MAP = {
  smoke:  SMOKE_OPTIONS,
  load:   LOAD_OPTIONS,
  stress: STRESS_OPTIONS,
  spike:  SPIKE_OPTIONS,
  full: {
    stages: FULL_RAMP_STAGES,
    thresholds: {
      // Overall API thresholds
      http_req_duration:     ['p(95)<2000', 'p(99)<5000'],
      http_req_failed:       ['rate<0.05'],
      // Per-module thresholds
      login_latency_ms:      ['p(95)<800',  'p(99)<2000'],
      transaction_latency_ms:['p(95)<1500', 'p(99)<4000'],
      budget_latency_ms:     ['p(95)<1500', 'p(99)<4000'],
      goal_latency_ms:       ['p(95)<1500', 'p(99)<4000'],
      // Success rate
      global_error_rate:     ['rate<0.05'],
    },
  },
};

export const options = {
  ...(SCENARIO_MAP[SCENARIO] || SCENARIO_MAP.full),
  summaryTrendStats: ['min', 'med', 'avg', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// ============================================================================
// SETUP — runs once before test
// ============================================================================
export function setup() {
  console.log('================================================');
  console.log('  Smart Budget — Full Load Test');
  console.log(`  Scenario: ${SCENARIO.toUpperCase()}`);
  console.log(`  Base URL: ${BASE_URL}`);
  console.log('================================================');

  // Health check — verify backend is reachable
  const healthRes = http.get(`${BASE_URL}/api/transactions`, {
    headers: authHeaders(SEEDED_USER.userId),
  });

  if (healthRes.status !== 200) {
    console.error(`[SETUP] Backend not reachable! Status: ${healthRes.status}`);
    console.error('[SETUP] Make sure the backend server is running on port 5000');
  } else {
    console.log('[SETUP] Backend health check PASSED ✓');
  }

  return {
    baseUrl: BASE_URL,
    userId:  SEEDED_USER.userId,
  };
}

// ============================================================================
// DEFAULT FUNCTION — runs every iteration for every VU
// ============================================================================
export default function (data) {
  const { baseUrl, userId } = data;
  const headers = authHeaders(userId);

  activeUsers.add(1);
  totalRequests.add(1);

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 1: Authentication
  // ─────────────────────────────────────────────────────────────────────────
  group('Auth — Login', () => {
    const res = http.post(
      `${baseUrl}/api/auth/login`,
      JSON.stringify({ email: SEEDED_USER.email }),
      { headers: JSON_HEADERS }
    );

    loginLatency.add(res.timings.duration);
    responseDuration.add(res.timings.duration);

    const ok = check(res, {
      'Login: status 200':          (r) => r.status === 200,
      'Login: has user id':          (r) => {
        try { return JSON.parse(r.body).id !== undefined; } catch (_) { return false; }
      },
      'Login: response < 2000ms':   (r) => r.timings.duration < 2000,
    });

    globalErrorRate.add(!ok);
    if (ok) successfulReqs.add(1); else failedReqs.add(1);
  });

  sleep(0.2);

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 2: Dashboard (parallel fetch)
  // ─────────────────────────────────────────────────────────────────────────
  group('Dashboard — Parallel Data Fetch', () => {
    const start = Date.now();

    const [txRes, budgetRes, goalRes] = http.batch([
      { method: 'GET', url: `${baseUrl}/api/transactions`, params: { headers } },
      { method: 'GET', url: `${baseUrl}/api/budgets`,      params: { headers } },
      { method: 'GET', url: `${baseUrl}/api/goals`,        params: { headers } },
    ]);

    const elapsed = Date.now() - start;
    responseDuration.add(elapsed);

    const ok = check(txRes, {
      'Dashboard transactions: 200':     (r) => r.status === 200,
      'Dashboard load time < 2000ms':    () => elapsed < 2000,
    }) && check(budgetRes, {
      'Dashboard budgets: 200': (r) => r.status === 200,
    }) && check(goalRes, {
      'Dashboard goals: 200':   (r) => r.status === 200,
    });

    globalErrorRate.add(!ok);
    if (ok) successfulReqs.add(1); else failedReqs.add(1);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 3: Add Expense Transaction
  // ─────────────────────────────────────────────────────────────────────────
  let txId = null;

  group('Expense — Add Transaction', () => {
    const expense = sampleExpense(userId);
    txId = expense.id;

    const res = http.post(
      `${baseUrl}/api/transactions`,
      JSON.stringify(expense),
      { headers }
    );

    transactionLatency.add(res.timings.duration);
    responseDuration.add(res.timings.duration);

    const ok = check(res, {
      'Add expense: status 200':       (r) => r.status === 200,
      'Add expense: returns success':   (r) => {
        try { return JSON.parse(r.body).success === true; } catch (_) { return false; }
      },
      'Add expense: response < 2000ms': (r) => r.timings.duration < 2000,
    });

    globalErrorRate.add(!ok);
    if (ok) successfulReqs.add(1); else failedReqs.add(1);
  });

  sleep(0.2);

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 4: Edit Expense Transaction
  // ─────────────────────────────────────────────────────────────────────────
  group('Expense — Edit Transaction', () => {
    if (!txId) return;

    const res = http.put(
      `${baseUrl}/api/transactions/${txId}`,
      JSON.stringify({ title: `Load Test Updated ${Date.now()}` }),
      { headers }
    );

    transactionLatency.add(res.timings.duration);
    responseDuration.add(res.timings.duration);

    const ok = check(res, {
      'Edit expense: status 200':       (r) => r.status === 200,
      'Edit expense: response < 2000ms': (r) => r.timings.duration < 2000,
    });

    globalErrorRate.add(!ok);
    if (ok) successfulReqs.add(1); else failedReqs.add(1);
  });

  sleep(0.2);

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 5: Delete Expense Transaction
  // ─────────────────────────────────────────────────────────────────────────
  group('Expense — Delete Transaction', () => {
    if (!txId) return;

    const res = http.del(
      `${baseUrl}/api/transactions/${txId}`,
      null,
      { headers }
    );

    transactionLatency.add(res.timings.duration);
    responseDuration.add(res.timings.duration);

    const ok = check(res, {
      'Delete expense: status 200':       (r) => r.status === 200,
      'Delete expense: response < 1500ms': (r) => r.timings.duration < 1500,
    });

    globalErrorRate.add(!ok);
    if (ok) successfulReqs.add(1); else failedReqs.add(1);
  });

  sleep(0.2);

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 6: Budget Management
  // ─────────────────────────────────────────────────────────────────────────
  let budgetId = null;

  group('Budget — Create & Delete', () => {
    const budget = sampleBudget(userId);
    budget.type  = `load_${__VU}_${__ITER}`;
    budgetId     = budget.id;

    // Create
    const createRes = http.post(
      `${baseUrl}/api/budgets`,
      JSON.stringify(budget),
      { headers }
    );

    budgetLatency.add(createRes.timings.duration);
    responseDuration.add(createRes.timings.duration);

    const createOk = check(createRes, {
      'Budget create: status 200': (r) => r.status === 200,
    });

    // Delete immediately (cleanup)
    if (createOk && budgetId) {
      const deleteRes = http.del(
        `${baseUrl}/api/budgets/${budgetId}`,
        null,
        { headers }
      );
      budgetLatency.add(deleteRes.timings.duration);
      check(deleteRes, { 'Budget delete: status 200': (r) => r.status === 200 });
    }

    globalErrorRate.add(!createOk);
    if (createOk) successfulReqs.add(1); else failedReqs.add(1);
  });

  sleep(0.2);

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 7: Savings Goals
  // ─────────────────────────────────────────────────────────────────────────
  group('Goals — Create, Update & Delete', () => {
    const goal   = sampleGoal(userId);
    const goalId = goal.id;

    // Create
    const createRes = http.post(
      `${baseUrl}/api/goals`,
      JSON.stringify(goal),
      { headers }
    );
    goalLatency.add(createRes.timings.duration);
    responseDuration.add(createRes.timings.duration);

    const createOk = check(createRes, {
      'Goal create: status 200': (r) => r.status === 200,
    });

    if (createOk) {
      // Update
      const updateRes = http.put(
        `${baseUrl}/api/goals/${goalId}`,
        JSON.stringify({ current: goal.current + 1000 }),
        { headers }
      );
      goalLatency.add(updateRes.timings.duration);
      check(updateRes, { 'Goal update: status 200': (r) => r.status === 200 });

      // Delete (cleanup)
      const deleteRes = http.del(
        `${baseUrl}/api/goals/${goalId}`,
        null,
        { headers }
      );
      goalLatency.add(deleteRes.timings.duration);
      check(deleteRes, { 'Goal delete: status 200': (r) => r.status === 200 });

      successfulReqs.add(1);
    } else {
      failedReqs.add(1);
    }

    globalErrorRate.add(!createOk);
  });

  sleep(0.2);

  // ─────────────────────────────────────────────────────────────────────────
  // MODULE 8: AI Advisor (optional — graceful if endpoint missing)
  // ─────────────────────────────────────────────────────────────────────────
  group('AI Advisor — Chat Request', () => {
    const prompts = [
      'How can I save more money?',
      'Analyse my budget',
      'What is my spending trend?',
    ];
    const prompt = prompts[__VU % prompts.length];

    const res = http.post(
      `${baseUrl}/api/ai/chat`,
      JSON.stringify({ message: prompt }),
      { headers }
    );

    aiLatency.add(res.timings.duration);
    responseDuration.add(res.timings.duration);

    const ok = check(res, {
      'AI chat: not a 500 error': (r) => r.status !== 500,
    });

    globalErrorRate.add(!ok);
    if (ok) successfulReqs.add(1); else failedReqs.add(1);
  });

  sleep(1);
}

// ============================================================================
// TEARDOWN
// ============================================================================
export function teardown(data) {
  console.log('================================================');
  console.log('  Smart Budget — Full Load Test COMPLETE');
  console.log(`  Reports saved to reports/ directory`);
  console.log('================================================');
}

// ============================================================================
// CUSTOM SUMMARY — outputs JSON for report generator
// ============================================================================
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return {
    [`reports/full_load_summary_${timestamp}.json`]: JSON.stringify(data, null, 2),
    'reports/full_load_summary_latest.json':         JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
