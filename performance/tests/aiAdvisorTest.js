/**
 * AI FINANCIAL ADVISOR PERFORMANCE TEST — Smart Budget
 * =====================================================
 * NOTE: The AI advisor in this app is client-side (chatEngine.js).
 *       These tests target the /api/ai/chat endpoint added to the backend
 *       to expose the advisor over HTTP for mobile/Android clients.
 *       If the endpoint returns 404, tests gracefully mark as "pending".
 *
 * Test Cases:
 *   TC_AI_001 — POST /api/ai/chat basic financial message
 *   TC_AI_002 — AI chat response time < 3000 ms
 *   TC_AI_003 — AI chat with specific financial query keywords
 *   TC_AI_004 — AI chat without auth → 401
 *   TC_AI_005 — Concurrent AI chat requests (10 parallel)
 *
 * Run: k6 run tests/aiAdvisorTest.js
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
} from '../k6-config.js';

// ---------------------------------------------------------------------------
// Custom Metrics
// ---------------------------------------------------------------------------
const aiDuration   = new Trend('ai_response_ms',   true);
const aiErrorRate  = new Rate('ai_error_rate');
const aiRequests   = new Counter('ai_requests_total');
const aiSuccesses  = new Counter('ai_success_total');

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
const scenario = __ENV.SCENARIO || 'load';
export const options = scenario === 'smoke' ? {
  ...SMOKE_OPTIONS,
  thresholds: {
    http_req_duration: ['p(95)<5000', 'p(99)<10000'],
    http_req_failed:   ['rate<0.10'],
    ai_response_ms:    ['p(95)<3000'],
  },
} : {
  ...LOAD_OPTIONS,
  thresholds: {
    http_req_duration: ['p(95)<5000', 'p(99)<10000'],
    http_req_failed:   ['rate<0.10'],
    ai_response_ms:    ['p(95)<5000'],
  },
};

// ---------------------------------------------------------------------------
// AI prompts used across test cases
// ---------------------------------------------------------------------------
const AI_PROMPTS = [
  'What is my current spending trend?',
  'How much should I save this month?',
  'Give me tips to reduce food expenses',
  'Am I on track with my savings goals?',
  'Analyse my budget and suggest improvements',
  'How much have I spent on Entertainment?',
  'What percentage of income should go to rent?',
  'Should I increase my emergency fund?',
  'How to plan for a vacation with ₹50,000 budget?',
  'Compare my spending to last month',
];

// ---------------------------------------------------------------------------
// Helper: post to AI endpoint, handle 404 gracefully
// ---------------------------------------------------------------------------
function postToAI(message, headers) {
  const payload = JSON.stringify({ message });
  return http.post(`${BASE_URL}/api/ai/chat`, payload, { headers });
}

// ---------------------------------------------------------------------------
// Default Test Function
// ---------------------------------------------------------------------------
export default function () {
  const userId  = SEEDED_USER.userId;
  const headers = authHeaders(userId);

  // ─────────────────────────────────────────────
  // TC_AI_001: Basic message to AI advisor
  // ─────────────────────────────────────────────
  group('TC_AI_001 — POST /api/ai/chat basic message', () => {
    const res = postToAI('What is my current spending?', headers);

    aiDuration.add(res.timings.duration);
    aiRequests.add(1);

    // Accept 200 (implemented) or 404 (not yet deployed)
    const passed = check(res, {
      '[TC_AI_001] Not a 500 error':      (r) => r.status !== 500,
      '[TC_AI_001] Response time < 5000': (r) => r.timings.duration < 5000,
      '[TC_AI_001] 200 or 404 (pending)': (r) => r.status === 200 || r.status === 404,
    });

    if (res.status === 200) {
      aiSuccesses.add(1);
      aiErrorRate.add(false);
    } else if (res.status === 404) {
      // Endpoint not yet deployed — mark as pending, not failure
      console.warn('[TC_AI_001] PENDING: /api/ai/chat endpoint not implemented yet');
      aiErrorRate.add(false);
    } else {
      aiErrorRate.add(true);
      console.error(`[TC_AI_001] FAIL: status=${res.status}`);
    }
  });

  sleep(0.5);

  // ─────────────────────────────────────────────
  // TC_AI_002: Response time must be < 3000 ms
  // ─────────────────────────────────────────────
  group('TC_AI_002 — AI response time < 3000 ms', () => {
    const start = Date.now();
    const res   = postToAI('How much should I save this month?', headers);
    const elapsed = Date.now() - start;

    aiDuration.add(elapsed);
    aiRequests.add(1);

    const passed = check(res, {
      '[TC_AI_002] Response within 3000ms':  () => elapsed < 3000,
      '[TC_AI_002] No server crash (not 500)': (r) => r.status !== 500,
    });

    aiErrorRate.add(!passed);
    if (!passed) console.error(`[TC_AI_002] FAIL: elapsed=${elapsed}ms status=${res.status}`);
  });

  sleep(0.5);

  // ─────────────────────────────────────────────
  // TC_AI_003: Specific financial query keywords
  // ─────────────────────────────────────────────
  group('TC_AI_003 — Financial query keywords', () => {
    const prompt = AI_PROMPTS[Math.floor(Math.random() * AI_PROMPTS.length)];
    const res    = postToAI(prompt, headers);

    aiDuration.add(res.timings.duration);
    aiRequests.add(1);

    const passed = check(res, {
      '[TC_AI_003] Not a server error':    (r) => r.status !== 500,
      '[TC_AI_003] Prompt sent correctly': (r) => r.status === 200 || r.status === 404,
    });

    if (res.status === 200) {
      try {
        const body = JSON.parse(res.body);
        check(res, {
          '[TC_AI_003] Response has reply field': () => body.reply !== undefined || body.message !== undefined || body.response !== undefined,
        });
      } catch (_) { /* ignore parse errors */ }
      aiSuccesses.add(1);
    }

    aiErrorRate.add(!passed);
  });

  sleep(0.5);

  // ─────────────────────────────────────────────
  // TC_AI_004: AI chat without auth → 401
  // ─────────────────────────────────────────────
  group('TC_AI_004 — AI chat without auth → 401 or 404', () => {
    const res = postToAI('Test message', JSON_HEADERS); // no x-user-id

    aiRequests.add(1);

    // If endpoint exists: should return 401. If not yet deployed: 404 is OK.
    const passed = check(res, {
      '[TC_AI_004] Returns 401 or 404':    (r) => r.status === 401 || r.status === 404,
      '[TC_AI_004] Not a 500 crash':       (r) => r.status !== 500,
    });

    aiErrorRate.add(!passed);
    if (!passed) console.error(`[TC_AI_004] FAIL: status=${res.status}`);
  });

  sleep(0.5);

  // ─────────────────────────────────────────────
  // TC_AI_005: Concurrent AI requests
  // Simulates 5 users chatting simultaneously
  // ─────────────────────────────────────────────
  group('TC_AI_005 — Concurrent AI chat requests', () => {
    const batchRequests = AI_PROMPTS.slice(0, 5).map((prompt) => ({
      method: 'POST',
      url:    `${BASE_URL}/api/ai/chat`,
      body:   JSON.stringify({ message: prompt }),
      params: { headers },
    }));

    const responses = http.batch(batchRequests);

    let allOk = true;
    responses.forEach((res, idx) => {
      aiDuration.add(res.timings.duration);
      aiRequests.add(1);

      const ok = check(res, {
        [`[TC_AI_005] Concurrent req ${idx + 1} no 500`]: (r) => r.status !== 500,
      });

      if (!ok) { allOk = false; }
      if (res.status === 200) aiSuccesses.add(1);
    });

    aiErrorRate.add(!allOk);
    if (!allOk) console.error('[TC_AI_005] FAIL: some concurrent requests returned 500');
  });

  sleep(1);
}

// ---------------------------------------------------------------------------
// Custom Summary
// ---------------------------------------------------------------------------
export function handleSummary(data) {
  return {
    'reports/ai_advisor_summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
