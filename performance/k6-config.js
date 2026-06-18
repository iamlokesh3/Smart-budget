/**
 * k6 Shared Configuration
 * Smart Budget - Performance & Load Testing Framework
 * =====================================================
 * Central config for all k6 test scripts.
 * Import from this file to keep test configs consistent.
 */

// ---------------------------------------------------------------------------
// Base URL — override with: k6 run --env BASE_URL=https://yourserver.com tests/...
// ---------------------------------------------------------------------------
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// ---------------------------------------------------------------------------
// Test Users
// ---------------------------------------------------------------------------
export const SEEDED_USER = {
  email: 'lokeshmk436@gmail.com',
  userId: '1781096350731',
  name: 'Lokesh',
};

export const TEST_USERS = [
  { email: 'perf_user1@test.com', name: 'Perf User 1' },
  { email: 'perf_user2@test.com', name: 'Perf User 2' },
  { email: 'perf_user3@test.com', name: 'Perf User 3' },
  { email: 'perf_user4@test.com', name: 'Perf User 4' },
  { email: 'perf_user5@test.com', name: 'Perf User 5' },
];

// ---------------------------------------------------------------------------
// Common HTTP Headers
// ---------------------------------------------------------------------------
export function authHeaders(userId) {
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId,
  };
}

export const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

// ---------------------------------------------------------------------------
// SLA Thresholds (Pass/Fail Criteria)
// ---------------------------------------------------------------------------
export const THRESHOLDS = {
  // 95th percentile under 2s; 99th percentile under 5s
  http_req_duration: ['p(95)<2000', 'p(99)<5000'],
  // Error rate must stay below 5 %
  http_req_failed: ['rate<0.05'],
};

export const STRICT_THRESHOLDS = {
  http_req_duration: ['p(95)<1000', 'p(99)<3000'],
  http_req_failed: ['rate<0.01'],
};

// ---------------------------------------------------------------------------
// Ramp-Up / Ramp-Down Stages (Full Load Test)
// ---------------------------------------------------------------------------
export const FULL_RAMP_STAGES = [
  { duration: '1m',  target: 100  }, // ramp up to 100 users
  { duration: '2m',  target: 100  }, // hold 100 users
  { duration: '1m',  target: 300  }, // ramp up to 300 users
  { duration: '2m',  target: 300  }, // hold 300 users
  { duration: '1m',  target: 500  }, // ramp up to 500 users
  { duration: '2m',  target: 500  }, // hold 500 users
  { duration: '1m',  target: 1000 }, // ramp up to 1000 (spike)
  { duration: '2m',  target: 1000 }, // hold peak
  { duration: '2m',  target: 0   }, // ramp down to 0
];

// ---------------------------------------------------------------------------
// Individual Test Scenarios
// ---------------------------------------------------------------------------
export const SMOKE_OPTIONS = {
  vus: 10,
  duration: '1m',
  thresholds: STRICT_THRESHOLDS,
};

export const LOAD_OPTIONS = {
  vus: 100,
  duration: '5m',
  thresholds: THRESHOLDS,
};

export const STRESS_OPTIONS = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '3m', target: 0   },
  ],
  thresholds: THRESHOLDS,
};

export const SPIKE_OPTIONS = {
  stages: [
    { duration: '30s', target: 1000 },
    { duration: '1m',  target: 1000 },
    { duration: '30s', target: 0    },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.10'],
  },
};

// ---------------------------------------------------------------------------
// Utility: generate a unique transaction ID
// ---------------------------------------------------------------------------
export function uniqueId() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

// ---------------------------------------------------------------------------
// Utility: pick a random element from an array
// ---------------------------------------------------------------------------
export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Sample Expense Payload
// ---------------------------------------------------------------------------
export function sampleExpense(userId) {
  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health'];
  const icons      = ['🍔', '🚌', '🛍️', '🎬', '💊'];
  const colors     = ['#ef4444', '#3b82f6', '#a855f7', '#f59e0b', '#10b981'];
  const idx        = Math.floor(Math.random() * categories.length);
  return {
    id:            uniqueId(),
    userId,
    raw:           'Test purchase for load testing',
    title:         `${categories[idx]} Expense`,
    amount:        Math.floor(Math.random() * 5000) + 100,
    category:      categories[idx],
    categoryIcon:  icons[idx],
    categoryColor: colors[idx],
    date:          new Date().toISOString(),
    dateLabel:     'Today',
    type:          'expense',
  };
}

// ---------------------------------------------------------------------------
// Sample Budget Payload
// ---------------------------------------------------------------------------
export function sampleBudget(userId) {
  const types = ['monthly', 'weekly', 'daily'];
  return {
    id:        uniqueId(),
    userId,
    type:      randomPick(types),
    amount:    Math.floor(Math.random() * 50000) + 5000,
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Sample Goal Payload
// ---------------------------------------------------------------------------
export function sampleGoal(userId) {
  const names = ['Emergency Fund', 'Vacation', 'New Laptop', 'Car', 'Home'];
  return {
    id:        uniqueId(),
    userId,
    name:      randomPick(names),
    target:    Math.floor(Math.random() * 100000) + 10000,
    current:   Math.floor(Math.random() * 5000),
    createdAt: new Date().toISOString(),
  };
}
