/**
 * EXPENSE (TRANSACTION) PERFORMANCE TEST — Smart Budget
 * ======================================================
 * Test Cases:
 *   TC_EXP_001 — Add new expense (POST /transactions)
 *   TC_EXP_002 — Edit existing transaction (PUT /transactions/:id)
 *   TC_EXP_003 — Delete transaction (DELETE /transactions/:id)
 *   TC_EXP_004 — Add expense without auth → 401
 *   TC_EXP_005 — Transaction appears in list after adding
 *   TC_EXP_006 — Full CRUD lifecycle in one iteration
 *
 * Run: k6 run tests/expenseTest.js
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
  sampleExpense,
  uniqueId,
} from '../k6-config.js';

// ---------------------------------------------------------------------------
// Custom Metrics
// ---------------------------------------------------------------------------
const addExpenseDuration    = new Trend('add_expense_ms',    true);
const editExpenseDuration   = new Trend('edit_expense_ms',   true);
const deleteExpenseDuration = new Trend('delete_expense_ms', true);
const expenseErrorRate      = new Rate('expense_error_rate');
const crudSuccesses         = new Counter('expense_crud_success');

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
const scenario = __ENV.SCENARIO || 'load';
export const options = scenario === 'smoke' ? {
  ...SMOKE_OPTIONS,
  thresholds: { ...THRESHOLDS, add_expense_ms: ['p(95)<1000'] },
} : {
  ...LOAD_OPTIONS,
  thresholds: { ...THRESHOLDS, add_expense_ms: ['p(95)<2000'] },
};

// ---------------------------------------------------------------------------
// Default Test Function
// ---------------------------------------------------------------------------
export default function () {
  const userId  = SEEDED_USER.userId;
  const headers = authHeaders(userId);

  // ─────────────────────────────────────────────
  // TC_EXP_001: Add new expense transaction
  // ─────────────────────────────────────────────
  let createdTxId = null;

  group('TC_EXP_001 — Add new expense transaction', () => {
    const expense = sampleExpense(userId);
    createdTxId   = expense.id;

    const res = http.post(
      `${BASE_URL}/api/transactions`,
      JSON.stringify(expense),
      { headers }
    );

    addExpenseDuration.add(res.timings.duration);

    const passed = check(res, {
      '[TC_EXP_001] Status 200':          (r) => r.status === 200,
      '[TC_EXP_001] Returns success':      (r) => {
        try { return JSON.parse(r.body).success === true; } catch (_) { return false; }
      },
      '[TC_EXP_001] Response < 2000ms':   (r) => r.timings.duration < 2000,
    });

    expenseErrorRate.add(!passed);
    if (passed) {
      crudSuccesses.add(1);
    } else {
      console.error(`[TC_EXP_001] FAIL: status=${res.status} body=${res.body}`);
    }
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_EXP_002: Edit existing transaction title
  // ─────────────────────────────────────────────
  group('TC_EXP_002 — Edit transaction (PUT)', () => {
    if (!createdTxId) {
      console.warn('[TC_EXP_002] Skipped — no transaction to edit (TC_EXP_001 may have failed)');
      return;
    }

    const updatePayload = { title: `Updated Expense ${Date.now()}` };
    const res = http.put(
      `${BASE_URL}/api/transactions/${createdTxId}`,
      JSON.stringify(updatePayload),
      { headers }
    );

    editExpenseDuration.add(res.timings.duration);

    const passed = check(res, {
      '[TC_EXP_002] Status 200':        (r) => r.status === 200,
      '[TC_EXP_002] Returns success':   (r) => {
        try { return JSON.parse(r.body).success === true; } catch (_) { return false; }
      },
      '[TC_EXP_002] Edit < 2000ms':     (r) => r.timings.duration < 2000,
    });

    expenseErrorRate.add(!passed);
    if (!passed) console.error(`[TC_EXP_002] FAIL: status=${res.status}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_EXP_003: Delete transaction
  // ─────────────────────────────────────────────
  group('TC_EXP_003 — Delete transaction (DELETE)', () => {
    if (!createdTxId) {
      console.warn('[TC_EXP_003] Skipped — no transaction to delete');
      return;
    }

    const res = http.del(
      `${BASE_URL}/api/transactions/${createdTxId}`,
      null,
      { headers }
    );

    deleteExpenseDuration.add(res.timings.duration);

    const passed = check(res, {
      '[TC_EXP_003] Status 200':       (r) => r.status === 200,
      '[TC_EXP_003] Returns success':  (r) => {
        try { return JSON.parse(r.body).success === true; } catch (_) { return false; }
      },
      '[TC_EXP_003] Delete < 1500ms':  (r) => r.timings.duration < 1500,
    });

    expenseErrorRate.add(!passed);
    if (!passed) console.error(`[TC_EXP_003] FAIL: status=${res.status}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_EXP_004: Add expense without auth → 401
  // ─────────────────────────────────────────────
  group('TC_EXP_004 — Add expense without auth → 401', () => {
    const expense = sampleExpense(userId);
    const res = http.post(
      `${BASE_URL}/api/transactions`,
      JSON.stringify(expense),
      { headers: JSON_HEADERS } // no x-user-id
    );

    const passed = check(res, {
      '[TC_EXP_004] Status 401': (r) => r.status === 401,
    });

    expenseErrorRate.add(!passed);
    if (!passed) console.error(`[TC_EXP_004] FAIL: expected 401 got ${res.status}`);
  });

  sleep(0.3);

  // ─────────────────────────────────────────────
  // TC_EXP_005: Transaction appears in list after adding
  // ─────────────────────────────────────────────
  group('TC_EXP_005 — Transaction visible in list after add', () => {
    // Step 1: add a transaction
    const expense = sampleExpense(userId);
    const addRes  = http.post(
      `${BASE_URL}/api/transactions`,
      JSON.stringify(expense),
      { headers }
    );

    if (addRes.status !== 200) {
      console.error(`[TC_EXP_005] Add step failed: status=${addRes.status}`);
      expenseErrorRate.add(true);
      return;
    }

    // Step 2: fetch the list and verify the ID is present
    const listRes = http.get(`${BASE_URL}/api/transactions`, { headers });

    const passed = check(listRes, {
      '[TC_EXP_005] List status 200': (r) => r.status === 200,
      '[TC_EXP_005] New tx in list':  (r) => {
        try {
          const list = JSON.parse(r.body);
          return Array.isArray(list) && list.some((t) => t.id === expense.id);
        } catch (_) { return false; }
      },
    });

    expenseErrorRate.add(!passed);

    // Cleanup: delete the test transaction
    http.del(`${BASE_URL}/api/transactions/${expense.id}`, null, { headers });

    if (!passed) console.error(`[TC_EXP_005] FAIL: tx ${expense.id} not in list`);
  });

  sleep(0.5);

  // ─────────────────────────────────────────────
  // TC_EXP_006: Full CRUD lifecycle
  // Create → Edit → Delete in one flow
  // ─────────────────────────────────────────────
  group('TC_EXP_006 — Full CRUD lifecycle', () => {
    const expense = sampleExpense(userId);
    let lifecyclePass = true;

    // CREATE
    const createRes = http.post(
      `${BASE_URL}/api/transactions`,
      JSON.stringify(expense),
      { headers }
    );
    if (!check(createRes, { '[TC_EXP_006] Create 200': (r) => r.status === 200 })) {
      lifecyclePass = false;
      console.error(`[TC_EXP_006] CREATE failed: ${createRes.status}`);
    }

    sleep(0.1);

    // EDIT
    const editRes = http.put(
      `${BASE_URL}/api/transactions/${expense.id}`,
      JSON.stringify({ title: 'CRUD Lifecycle Updated' }),
      { headers }
    );
    if (!check(editRes, { '[TC_EXP_006] Edit 200': (r) => r.status === 200 })) {
      lifecyclePass = false;
      console.error(`[TC_EXP_006] EDIT failed: ${editRes.status}`);
    }

    sleep(0.1);

    // DELETE
    const deleteRes = http.del(
      `${BASE_URL}/api/transactions/${expense.id}`,
      null,
      { headers }
    );
    if (!check(deleteRes, { '[TC_EXP_006] Delete 200': (r) => r.status === 200 })) {
      lifecyclePass = false;
      console.error(`[TC_EXP_006] DELETE failed: ${deleteRes.status}`);
    }

    expenseErrorRate.add(!lifecyclePass);
    if (lifecyclePass) crudSuccesses.add(1);
  });

  sleep(1);
}

// ---------------------------------------------------------------------------
// Custom Summary
// ---------------------------------------------------------------------------
export function handleSummary(data) {
  return {
    'reports/expense_summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
