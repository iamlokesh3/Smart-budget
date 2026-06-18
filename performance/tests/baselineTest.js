/**
 * BASELINE LOAD TEST — Smart Budget
 * ===================================
 * Exactly: 100 Virtual Users × 1 Minute
 * Trigger: GitHub Actions Performance Baseline Scan
 *
 * APIs tested per iteration:
 *   1. POST /api/auth/login        (Authentication)
 *   2. GET  /api/transactions      (Dashboard - Transaction History)
 *   3. POST /api/transactions      (Add Expense)
 *   4. PUT  /api/transactions/:id  (Edit Expense)
 *   5. DELETE /api/transactions/:id (Delete Expense)
 *   6. GET  /api/budgets           (Budget Management)
 *   7. POST /api/budgets           (Create Budget)
 *   8. GET  /api/goals             (Savings Goals)
 *   9. POST /api/ai/chat           (AI Financial Advisor)
 *
 * Metrics collected:
 *   ✓ Requests per second (RPS)
 *   ✓ Average response time (ms)
 *   ✓ Min response time (ms)
 *   ✓ Max response time (ms)
 *   ✓ P95 response time (ms)
 *   ✓ P99 response time (ms)
 *   ✓ Success rate (%)
 *   ✓ Error rate (%)
 *
 * Run:
 *   k6 run --out json=reports/baseline_raw.json tests/baselineTest.js
 */

import http   from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

// ============================================================
// CONFIGURATION
// ============================================================
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

const SEEDED_USER = {
  email:  'lokeshmk436@gmail.com',
  userId: '1781096350731',
};

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'x-user-id':   SEEDED_USER.userId,
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// ============================================================
// LOAD PROFILE — Exactly 100 VUs for 1 minute
// ============================================================
export const options = {
  vus:      100,      // 100 concurrent virtual users
  duration: '1m',     // running for exactly 1 minute

  // ── SLA Thresholds (Pass/Fail criteria) ──
  thresholds: {
    // Overall API response time
    http_req_duration: [
      'p(95)<2000',    // 95% of requests must complete in < 2s
      'p(99)<5000',    // 99% of requests must complete in < 5s
      'avg<1000',      // Average must be under 1s
    ],
    // Error rate must stay under 5%
    http_req_failed: ['rate<0.05'],

    // Per-API thresholds
    login_duration_ms:       ['p(95)<500'],
    dashboard_duration_ms:   ['p(95)<1000'],
    add_expense_duration_ms: ['p(95)<1000'],
    budget_duration_ms:      ['p(95)<1000'],
    ai_chat_duration_ms:     ['p(95)<3000'],
  },

  // Detailed percentile stats in summary
  summaryTrendStats: ['min', 'med', 'avg', 'max', 'p(90)', 'p(95)', 'p(99)', 'count'],
};

// ============================================================
// CUSTOM METRICS — one per API endpoint
// ============================================================
const loginDuration      = new Trend('login_duration_ms',       true);
const dashboardDuration  = new Trend('dashboard_duration_ms',   true);
const addExpenseDuration = new Trend('add_expense_duration_ms', true);
const editExpenseDuration= new Trend('edit_expense_duration_ms',true);
const delExpenseDuration = new Trend('del_expense_duration_ms', true);
const budgetDuration     = new Trend('budget_duration_ms',      true);
const goalDuration       = new Trend('goal_duration_ms',        true);
const aiChatDuration     = new Trend('ai_chat_duration_ms',     true);

const totalRequests   = new Counter('total_requests_sent');
const successCount    = new Counter('successful_requests');
const failureCount    = new Counter('failed_requests');
const errorRate       = new Rate('overall_error_rate');

// ============================================================
// UTILITY
// ============================================================
function uniqueId() {
  return `${Date.now()}${Math.floor(Math.random() * 100000)}`;
}

function makeExpense() {
  const cats  = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment'];
  const icons = ['🍔', '🚌', '🛍️', '💊', '🎬'];
  const cols  = ['#ef4444', '#3b82f6', '#a855f7', '#10b981', '#f59e0b'];
  const i     = Math.floor(Math.random() * cats.length);
  return {
    id:            uniqueId(),
    userId:        SEEDED_USER.userId,
    raw:           'Baseline load test transaction',
    title:         `${cats[i]} Expense`,
    amount:        Math.floor(Math.random() * 2000) + 50,
    category:      cats[i],
    categoryIcon:  icons[i],
    categoryColor: cols[i],
    date:          new Date().toISOString(),
    dateLabel:     'Today',
    type:          'expense',
  };
}

// ============================================================
// SETUP — called once before VUs start
// ============================================================
export function setup() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Smart Budget — Baseline Load Test       ║');
  console.log('║  100 Virtual Users × 1 Minute            ║');
  console.log(`║  Target: ${BASE_URL.padEnd(32)}║`);
  console.log('╚══════════════════════════════════════════╝');

  // Quick health check
  const r = http.get(`${BASE_URL}/api/transactions`, { headers: AUTH_HEADERS });
  if (r.status !== 200) {
    console.error(`[SETUP] ⚠ Backend returned ${r.status} — tests may fail`);
  } else {
    console.log('[SETUP] ✓ Backend is ready');
  }
  return { baseUrl: BASE_URL };
}

// ============================================================
// MAIN TEST FUNCTION — runs by each of the 100 VUs
// ============================================================
export default function (data) {

  // ── 1. LOGIN ──────────────────────────────────────────────
  group('1. User Login', () => {
    const res = http.post(
      `${data.baseUrl}/api/auth/login`,
      JSON.stringify({ email: SEEDED_USER.email }),
      { headers: JSON_HEADERS }
    );

    loginDuration.add(res.timings.duration);
    totalRequests.add(1);

    const ok = check(res, {
      'Login: status 200':         (r) => r.status === 200,
      'Login: has user object':    (r) => {
        try { return JSON.parse(r.body).id !== undefined; }
        catch (_) { return false; }
      },
      'Login: response < 2000ms':  (r) => r.timings.duration < 2000,
    });

    if (ok) { successCount.add(1); errorRate.add(false); }
    else    { failureCount.add(1); errorRate.add(true);  }
  });

  sleep(0.1);

  // ── 2. TRANSACTION HISTORY (Dashboard) ───────────────────
  group('2. Transaction History', () => {
    const res = http.get(
      `${data.baseUrl}/api/transactions`,
      { headers: AUTH_HEADERS }
    );

    dashboardDuration.add(res.timings.duration);
    totalRequests.add(1);

    const ok = check(res, {
      'Transactions: status 200':   (r) => r.status === 200,
      'Transactions: is array':     (r) => {
        try { return Array.isArray(JSON.parse(r.body)); }
        catch (_) { return false; }
      },
      'Transactions: < 2000ms':     (r) => r.timings.duration < 2000,
    });

    if (ok) { successCount.add(1); errorRate.add(false); }
    else    { failureCount.add(1); errorRate.add(true);  }
  });

  sleep(0.1);

  // ── 3. ADD EXPENSE ────────────────────────────────────────
  const expense = makeExpense();
  let expenseId = expense.id;

  group('3. Add Expense', () => {
    const res = http.post(
      `${data.baseUrl}/api/transactions`,
      JSON.stringify(expense),
      { headers: AUTH_HEADERS }
    );

    addExpenseDuration.add(res.timings.duration);
    totalRequests.add(1);

    const ok = check(res, {
      'Add Expense: status 200':    (r) => r.status === 200,
      'Add Expense: success=true':  (r) => {
        try { return JSON.parse(r.body).success === true; }
        catch (_) { return false; }
      },
      'Add Expense: < 2000ms':      (r) => r.timings.duration < 2000,
    });

    if (ok) { successCount.add(1); errorRate.add(false); }
    else    { failureCount.add(1); errorRate.add(true); expenseId = null; }
  });

  sleep(0.1);

  // ── 4. EDIT EXPENSE ───────────────────────────────────────
  group('4. Edit Expense', () => {
    if (!expenseId) return;

    const res = http.put(
      `${data.baseUrl}/api/transactions/${expenseId}`,
      JSON.stringify({ title: `Updated @ ${Date.now()}` }),
      { headers: AUTH_HEADERS }
    );

    editExpenseDuration.add(res.timings.duration);
    totalRequests.add(1);

    const ok = check(res, {
      'Edit Expense: status 200':  (r) => r.status === 200,
      'Edit Expense: < 2000ms':    (r) => r.timings.duration < 2000,
    });

    if (ok) { successCount.add(1); errorRate.add(false); }
    else    { failureCount.add(1); errorRate.add(true);  }
  });

  sleep(0.1);

  // ── 5. DELETE EXPENSE ─────────────────────────────────────
  group('5. Delete Expense', () => {
    if (!expenseId) return;

    const res = http.del(
      `${data.baseUrl}/api/transactions/${expenseId}`,
      null,
      { headers: AUTH_HEADERS }
    );

    delExpenseDuration.add(res.timings.duration);
    totalRequests.add(1);

    const ok = check(res, {
      'Delete Expense: status 200': (r) => r.status === 200,
      'Delete Expense: < 2000ms':   (r) => r.timings.duration < 2000,
    });

    if (ok) { successCount.add(1); errorRate.add(false); }
    else    { failureCount.add(1); errorRate.add(true);  }
  });

  sleep(0.1);

  // ── 6 & 7. BUDGET MANAGEMENT ─────────────────────────────
  group('6. Budget Management', () => {
    // GET budgets
    const getRes = http.get(
      `${data.baseUrl}/api/budgets`,
      { headers: AUTH_HEADERS }
    );

    budgetDuration.add(getRes.timings.duration);
    totalRequests.add(1);

    check(getRes, {
      'Get Budgets: status 200': (r) => r.status === 200,
    });

    // POST create budget
    const budget = {
      id:        uniqueId(),
      userId:    SEEDED_USER.userId,
      type:      `baseline_${__VU}_${Date.now()}`,
      amount:    Math.floor(Math.random() * 20000) + 5000,
      createdAt: new Date().toISOString(),
    };

    const postRes = http.post(
      `${data.baseUrl}/api/budgets`,
      JSON.stringify(budget),
      { headers: AUTH_HEADERS }
    );

    budgetDuration.add(postRes.timings.duration);
    totalRequests.add(1);

    const ok = check(postRes, {
      'Create Budget: status 200':  (r) => r.status === 200,
      'Create Budget: < 2000ms':    (r) => r.timings.duration < 2000,
    });

    if (ok) { successCount.add(1); errorRate.add(false); }
    else    { failureCount.add(1); errorRate.add(true);  }

    // Cleanup
    if (postRes.status === 200) {
      http.del(`${data.baseUrl}/api/budgets/${budget.id}`, null, { headers: AUTH_HEADERS });
    }
  });

  sleep(0.1);

  // ── 8. SAVINGS GOALS ──────────────────────────────────────
  group('7. Savings Goal', () => {
    const res = http.get(
      `${data.baseUrl}/api/goals`,
      { headers: AUTH_HEADERS }
    );

    goalDuration.add(res.timings.duration);
    totalRequests.add(1);

    const ok = check(res, {
      'Goals: status 200':   (r) => r.status === 200,
      'Goals: is array':     (r) => {
        try { return Array.isArray(JSON.parse(r.body)); }
        catch (_) { return false; }
      },
    });

    if (ok) { successCount.add(1); errorRate.add(false); }
    else    { failureCount.add(1); errorRate.add(true);  }
  });

  sleep(0.1);

  // ── 9. AI FINANCIAL ADVISOR ───────────────────────────────
  group('8. AI Financial Advisor Chat', () => {
    const prompts = [
      'How can I reduce my monthly expenses?',
      'What is my spending trend this month?',
      'Should I increase my savings goal?',
      'Give me budgeting tips',
      'How do I manage debt effectively?',
    ];
    const msg = prompts[__VU % prompts.length];

    const res = http.post(
      `${data.baseUrl}/api/ai/chat`,
      JSON.stringify({ message: msg }),
      { headers: AUTH_HEADERS }
    );

    aiChatDuration.add(res.timings.duration);
    totalRequests.add(1);

    const ok = check(res, {
      'AI Chat: no server error':  (r) => r.status !== 500,
      'AI Chat: response < 5000ms':(r) => r.timings.duration < 5000,
      'AI Chat: has reply':        (r) => {
        try {
          const b = JSON.parse(r.body);
          return b.reply !== undefined;
        } catch (_) { return false; }
      },
    });

    if (ok) { successCount.add(1); errorRate.add(false); }
    else    { failureCount.add(1); errorRate.add(true);  }
  });

  // Small pause between iterations to simulate real user think-time
  sleep(0.5);
}

// ============================================================
// TEARDOWN
// ============================================================
export function teardown() {
  console.log('\n✅ Baseline load test complete!');
  console.log('   Run: node scripts/generateBaselineReport.js');
}

// ============================================================
// HANDLE SUMMARY — writes JSON for the Excel report generator
// ============================================================
export function handleSummary(data) {
  // Write the summary JSON that the report generator reads
  return {
    'reports/baseline_summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
